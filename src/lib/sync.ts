import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { collection, addDoc, updateDoc, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

const DB_NAME = 'taj_lift_cache';
let sqliteConn: SQLiteConnection | null = null;
let dbConn: SQLiteDBConnection | null = null;

const isNative = Capacitor.isNativePlatform();

type SyncRow = Record<string, unknown>;

const SCHEMAS: Record<string, string> = {
  projects: 'id TEXT PRIMARY KEY, name TEXT, location TEXT, budget REAL, completed REAL, status TEXT, data JSON',
  leads: 'id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, siteName TEXT, firmName TEXT, assignedTo TEXT, requirements TEXT, status TEXT, statusLabel TEXT, data JSON',
  pm_slots: 'id TEXT PRIMARY KEY, started TEXT, due TEXT, status TEXT, site TEXT, firm TEXT, lift TEXT, wing TEXT, contact TEXT, invoice TEXT, data JSON',
  inspections: 'id TEXT PRIMARY KEY, submittedAt TEXT, status TEXT, data JSON',
  payments: 'id TEXT PRIMARY KEY, terms TEXT, scope TEXT, amount TEXT, createdAt TEXT, data JSON',
  followups: 'id TEXT PRIMARY KEY, with TEXT, time TEXT, status TEXT, type TEXT, notes TEXT, completed INTEGER, data JSON',
  breakdowns: 'id TEXT PRIMARY KEY, liftName TEXT, siteLocation TEXT, urgency TEXT, status TEXT, assignedTo TEXT, data JSON',
  users: 'id TEXT PRIMARY KEY, name TEXT, email TEXT, role TEXT, phone TEXT, region TEXT, profilePic TEXT, data JSON',
};

export async function initDatabase(): Promise<void> {
  if (!isNative) return;
  try {
    const plugin = CapacitorSQLite as any;
    sqliteConn = new SQLiteConnection(plugin);
    await sqliteConn.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    dbConn = await sqliteConn.retrieveConnection(DB_NAME, false);
    await dbConn.open();
    for (const [table, schema] of Object.entries(SCHEMAS)) {
      await dbConn.execute(`CREATE TABLE IF NOT EXISTS ${table} (${schema})`);
    }
    await dbConn.execute('CREATE TABLE IF NOT EXISTS pending_writes (id TEXT PRIMARY KEY, collection TEXT, docId TEXT, operation TEXT, data JSON, createdAt TEXT)');
  } catch (e) {
    console.warn('SQLite init failed:', e);
  }
}

export async function cacheCollection(table: string, documents: { id: string; data: SyncRow }[]): Promise<void> {
  if (!dbConn) return;
  const cols = Object.keys(SCHEMAS[table]).map(c => c.split(' ')[0]).filter(c => c !== 'data');
  for (const doc of documents) {
    const vals = cols.map(c => doc.data[c] ?? null);
    const dataStr = JSON.stringify(doc.data);
    try {
      const placeholders = vals.map(() => '?').join(', ');
      await dbConn.run(`INSERT OR REPLACE INTO ${table} (id, ${cols.join(', ')}, data) VALUES (${placeholders})`, [doc.id, ...vals, dataStr]);
    } catch (e) {
      console.warn(`SQLite cache error for ${table}/${doc.id}:`, e);
    }
  }
}

export async function readCollection(table: string): Promise<{ id: string; data: SyncRow }[]> {
  if (!dbConn) return [];
  const res = await dbConn.query(`SELECT id, data FROM ${table}`);
  return (res.values || []).map((r: any) => ({ id: r.id, data: JSON.parse(r.data) }));
}

export async function writeOffline(table: string, docId: string | null, operation: 'add' | 'update' | 'set', data: SyncRow): Promise<void> {
  if (!dbConn) return;
  const wid = `${table}_${docId || Date.now()}_${Date.now()}`;
  try {
    await dbConn.run(
      'INSERT INTO pending_writes (id, collection, docId, operation, data, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
      [wid, table, docId || '', operation, JSON.stringify(data), new Date().toISOString()]
    );
  } catch (e) {
    console.warn('SQLite writeOffline error:', e);
  }
}

export async function flushPendingWrites(): Promise<void> {
  if (!dbConn) return;
  try {
    const res = await dbConn.query('SELECT * FROM pending_writes ORDER BY createdAt ASC');
    const writes: any[] = (res.values || []) as any[];
    for (const w of writes) {
      try {
        const data = JSON.parse(w.data);
        if (w.operation === 'add') {
          await addDoc(collection(db, w.collection), data);
        } else if (w.operation === 'update') {
          await updateDoc(doc(db, w.collection, w.docId), data);
        } else if (w.operation === 'set') {
          await setDoc(doc(db, w.collection, w.docId), data, { merge: true } as any);
        }
        await dbConn.run('DELETE FROM pending_writes WHERE id = ?', [w.id]);
      } catch (e) {
        console.warn(`Failed to flush write ${w.id}:`, e);
      }
    }
  } catch (e) {
    console.warn('SQLite flushPendingWrites error:', e);
  }
}

export async function addDocWithFallback(coll: string, data: SyncRow): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, coll), data);
    return ref.id;
  } catch (e) {
    if (!navigator.onLine) {
      await writeOffline(coll, null, 'add', data);
    }
    throw e;
  }
}

export async function updateDocWithFallback(coll: string, docId: string, data: SyncRow): Promise<void> {
  try {
    await updateDoc(doc(db, coll, docId), data);
  } catch (e) {
    if (!navigator.onLine) {
      await writeOffline(coll, docId, 'update', data);
    }
    throw e;
  }
}

export async function cacheSnapshot<T extends Record<string, any>>(collectionName: string, snapshot: { forEach: (fn: (d: { id: string; data: () => T }) => void) => void }): Promise<void> {
  if (!isNative) return;
  const docs: { id: string; data: SyncRow }[] = [];
  snapshot.forEach((d) => docs.push({ id: d.id, data: d.data() as SyncRow }));
  await cacheCollection(collectionName, docs);
}

export async function closeDatabase(): Promise<void> {
  if (dbConn) {
    await dbConn.close();
    dbConn = null;
  }
}
