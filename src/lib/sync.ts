import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Initializes the local database storage if needed.
 */
export async function initDatabase(): Promise<void> {
  return Promise.resolve();
}

/**
 * Caches a query snapshot from Firestore to local storage for instant offline viewing.
 */
export function cacheSnapshot(collectionName: string, docs: any[]): void {
  try {
    const list = docs.map((doc: any) => {
      // Handle both Firestore DocumentSnapshot and raw objects
      const data = typeof doc.data === 'function' ? doc.data() : doc;
      return { id: doc.id, ...data };
    });
    localStorage.setItem(`taj_cache_${collectionName}`, JSON.stringify(list));
  } catch (err) {
    console.error(`[Sync] Error caching snapshot for ${collectionName}:`, err);
  }
}

/**
 * Adds a document to Firestore, or queues it if offline.
 */
export async function addDocWithFallback(collectionName: string, data: any): Promise<string> {
  const tempId = 'local_' + Math.random().toString(36).substring(2, 11);
  
  // Optimistically add to the local cache so it appears immediately in the UI
  try {
    const cached = JSON.parse(localStorage.getItem(`taj_cache_${collectionName}`) || '[]');
    // Add the local document at the top
    cached.unshift({ id: tempId, ...data });
    localStorage.setItem(`taj_cache_${collectionName}`, JSON.stringify(cached));
  } catch (err) {
    console.warn(`[Sync] Local cache write failed for ${collectionName}:`, err);
  }

  if (navigator.onLine) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      
      // Update local cache to replace the temporary ID with the real Firestore ID
      try {
        const cached = JSON.parse(localStorage.getItem(`taj_cache_${collectionName}`) || '[]');
        const updated = cached.map((item: any) => item.id === tempId ? { ...item, id: docRef.id } : item);
        localStorage.setItem(`taj_cache_${collectionName}`, JSON.stringify(updated));
      } catch (err) {
        console.warn(`[Sync] Local cache ID swap failed:`, err);
      }
      
      return docRef.id;
    } catch (err) {
      console.warn(`[Sync] Online addDoc failed, queueing offline for ${collectionName}:`, err);
    }
  }

  // Queue the write for later synchronization
  try {
    const pending = JSON.parse(localStorage.getItem('taj_pending_writes') || '[]');
    pending.push({
      type: 'add',
      collectionName,
      tempId,
      data
    });
    localStorage.setItem('taj_pending_writes', JSON.stringify(pending));
  } catch (err) {
    console.error(`[Sync] Failed to queue pending write:`, err);
  }

  return tempId;
}

/**
 * Updates a document in Firestore, or queues the update if offline.
 */
export async function updateDocWithFallback(collectionName: string, id: string, data: any): Promise<void> {
  // Optimistically update the local cache
  try {
    const cached = JSON.parse(localStorage.getItem(`taj_cache_${collectionName}`) || '[]');
    const updated = cached.map((item: any) => item.id === id ? { ...item, ...data } : item);
    localStorage.setItem(`taj_cache_${collectionName}`, JSON.stringify(updated));
  } catch (err) {
    console.warn(`[Sync] Local cache update failed for ${collectionName}:`, err);
  }

  if (navigator.onLine && !id.startsWith('local_')) {
    try {
      await updateDoc(doc(db, collectionName, id), data);
      return;
    } catch (err) {
      console.warn(`[Sync] Online updateDoc failed, queueing offline for ${collectionName}:`, err);
    }
  }

  // Queue the update for later synchronization
  try {
    const pending = JSON.parse(localStorage.getItem('taj_pending_writes') || '[]');
    pending.push({
      type: 'update',
      collectionName,
      id,
      data
    });
    localStorage.setItem('taj_pending_writes', JSON.stringify(pending));
  } catch (err) {
    console.error(`[Sync] Failed to queue pending update:`, err);
  }
}

/**
 * Synchronizes any pending offline writes/updates with Firestore.
 */
export async function flushPendingWrites(): Promise<void> {
  if (!navigator.onLine) return;

  let pending: any[] = [];
  try {
    pending = JSON.parse(localStorage.getItem('taj_pending_writes') || '[]');
  } catch (err) {
    console.error('[Sync] Error parsing pending writes:', err);
    return;
  }

  if (pending.length === 0) return;

  const remaining: any[] = [];
  const idMap: { [key: string]: string } = {};

  console.log(`[Sync] Starting flush of ${pending.length} pending operations...`);

  for (const op of pending) {
    try {
      if (op.type === 'add') {
        const docRef = await addDoc(collection(db, op.collectionName), op.data);
        idMap[op.tempId] = docRef.id;
        
        // Update local cache to map temp ID to real ID
        try {
          const cached = JSON.parse(localStorage.getItem(`taj_cache_${op.collectionName}`) || '[]');
          const updated = cached.map((item: any) => item.id === op.tempId ? { ...item, id: docRef.id } : item);
          localStorage.setItem(`taj_cache_${op.collectionName}`, JSON.stringify(updated));
        } catch (err) {
          console.warn('[Sync] Local cache sync update error:', err);
        }
      } else if (op.type === 'update') {
        const targetId = idMap[op.id] || op.id;
        if (targetId.startsWith('local_')) {
          // The parent 'add' operation might have failed, keep this update in the queue
          remaining.push({ ...op, id: targetId });
        } else {
          await updateDoc(doc(db, op.collectionName, targetId), op.data);
        }
      }
    } catch (err) {
      console.error('[Sync] Failed to flush pending operation:', op, err);
      remaining.push(op);
    }
  }

  try {
    localStorage.setItem('taj_pending_writes', JSON.stringify(remaining));
    console.log(`[Sync] Flush completed. ${remaining.length} operations remaining in queue.`);
  } catch (err) {
    console.error('[Sync] Failed to save remaining operations queue:', err);
  }
}
