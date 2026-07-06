import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckSquare, Plus, Phone, Navigation, Clock, Hammer, AlertCircle, X, ShieldAlert, CheckCircle2, Battery, User, MapPin, ChevronRight, Activity, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../components/ProfileContext';
import { collection, onSnapshot, addDoc, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getAuth } from 'firebase/auth';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function hashCoord(id: string, base: number, range: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) { h = ((h << 5) - h) + id.charCodeAt(i); h |= 0; }
  return base + (h % range) / 1000;
}

const techIcon = new L.DivIcon({ className: '', html: '<div class="w-5 h-5 rounded-full bg-sky-500 border-2 border-white shadow-md"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
const breakdownIcon = new L.DivIcon({ className: '', html: '<div class="w-5 h-5 rounded-full bg-rose-500 border-2 border-white shadow-md animate-ping"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });

function MapState({ selectedTechId }: { selectedTechId: string | null }) {
  const map = useMap();
  React.useEffect(() => {
    if (selectedTechId) {
      map.flyTo([hashCoord(selectedTechId, 18.514, 15), hashCoord(selectedTechId, 73.845, 20)], 15, { duration: 0.8 });
    }
  }, [selectedTechId, map]);
  return null;
}

interface TechUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  region: string;
  profilePic: string;
}

interface Breakdown {
  id: string;
  liftName: string;
  siteLocation: string;
  urgency: string;
  reportedIssues: string;
  status: string;
  assignedTo: string;
  createdAt: any;
}

export default function TechnicianMap() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'report' | 'resolve'>('map');
  const { theme } = useProfile();
  const isLight = theme === 'light';

  const [mapAlert, setMapAlert] = useState<string | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const [techUsers, setTechUsers] = useState<TechUser[]>([]);
  const [breakdowns, setBreakdowns] = useState<Breakdown[]>([]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "Field Technician"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: TechUser[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as TechUser);
      });
      setTechUsers(list);
      if (list.length > 0 && !selectedTechId) {
        setSelectedTechId(list[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "breakdowns"), (snapshot) => {
      const list: Breakdown[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Breakdown);
      });
      setBreakdowns(list);
    });
    return () => unsubscribe();
  }, []);

  const currentTech = techUsers.find(t => t.id === selectedTechId) || techUsers[0];

  const triggerAlert = (msg: string) => {
    setMapAlert(msg);
    setTimeout(() => { setMapAlert(null); }, 4000);
  };

  const handleDispatch = async () => {
    if (!currentTech) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/breakdown/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          liftName,
          siteLocation,
          urgency,
          reportedIssues,
          assignedTechUid: currentTech.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerAlert(`SLA Ticket dispatched! ${currentTech.name} has been notified.`);
      } else {
        triggerAlert(`Dispatch failed: ${data.error}`);
      }
    } catch (err: any) {
      triggerAlert(`Dispatch failed: ${err.message}`);
    }
  };

  const [liftName, setLiftName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Very High'>('Medium');
  const [reportedIssues, setReportedIssues] = useState('');

  const handleCreateBreakdown = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert(`Created breakdown incident for ${liftName} at ${siteLocation}. Escalation Priority: ${urgency}`);
  };

  const [selectedIssueCategory, setSelectedIssueCategory] = useState<number>(0);
  const [faultChecks, setFaultChecks] = useState({ ardCard: false, upsFaulty: false, batteryFaulty: false, repairRequired: false });
  const [repairRemarks, setRepairRemarks] = useState('');

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert(`Successfully submitted and archived diagnostic resolution ticket.`);
  };

  const techStatus = (tech: TechUser) => {
    const activeBreakdown = breakdowns.find(b => b.assignedTo === tech.id && b.status === 'dispatched');
    return activeBreakdown ? 'Moving' : 'On Duty';
  };

  return (
    <div className={`h-full flex flex-col relative ${isLight ? 'text-slate-800' : 'text-white'}`}>
      <div className={`relative z-30 px-4 py-3.5 flex justify-between items-center border-b transition-colors duration-300 ${
        isLight ? 'bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm' : 'bg-[#0f1524]/85 backdrop-blur-md border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <button id="btn-tech-back" onClick={() => navigate('/')} className={`p-1 cursor-pointer transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Field Dispatch Hub</h1>
        </div>
        <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold px-2.5 py-0.5 rounded-full border border-sky-400/20">GPS Active</span>
      </div>

      {mapAlert && (
        <div className={`absolute top-28 left-4 right-4 z-20 border p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideDown_0.2s_ease-out_forwards] ${isLight ? 'bg-slate-900 border-slate-950/20 text-white' : 'bg-slate-950/95 border-emerald-500/25 text-white'}`}>
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full"><CheckCircle2 className="w-4 h-4" /></div>
          <div className="flex-1">
            <h4 className="text-[11px] font-black uppercase">Operations Alert</h4>
            <p className="text-[10px] opacity-90 mt-0.5">{mapAlert}</p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 relative overflow-y-auto no-scrollbar pb-24">
        {activeSubTab === 'map' && (
          <div className="absolute inset-0 z-0 flex flex-col justify-between h-full">
            <div className="absolute inset-0 z-0">
              <MapContainer center={[18.5204, 73.8567]} zoom={13} className="w-full h-full" zoomControl={false} attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapState selectedTechId={selectedTechId} />
                {techUsers.map(tech => (
                  <Marker key={tech.id} position={[hashCoord(tech.id, 18.514, 15), hashCoord(tech.id, 73.845, 20)]} icon={techIcon}>
                    <Popup><div className="text-xs font-bold">{tech.name}<br /><span className="text-[10px] text-slate-500">{tech.region} · {tech.phone}</span></div></Popup>
                  </Marker>
                ))}
                {breakdowns.filter(b => b.status === 'dispatched' || b.status === 'open').map(b => (
                  <Marker key={b.id} position={[hashCoord(b.id, 18.527, 12), hashCoord(b.id, 73.87, 18)]} icon={breakdownIcon}>
                    <Popup><div className="text-xs font-bold">{b.liftName}<br /><span className="text-[10px] text-rose-500">{b.siteLocation}</span></div></Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="absolute bottom-20 left-0 right-0 z-10 p-4 space-y-3 pointer-events-none">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
                {techUsers.map((tech) => (
                  <button key={tech.id} onClick={() => setSelectedTechId(tech.id)} className={`flex-none flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-bold transition-all shadow-md cursor-pointer ${selectedTechId === tech.id ? 'bg-sky-500 text-white border-sky-400/20 shadow-lg' : isLight ? 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200 hover:bg-white' : 'bg-white/10 backdrop-blur-md text-white/70 border-white/10 hover:bg-white/15'}`}>
                    <img src={tech.profilePic} alt={tech.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{tech.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {currentTech && (
                <div className={`backdrop-blur-xl rounded-2xl p-4 border pointer-events-auto shadow-2xl space-y-3.5 ${isLight ? 'bg-white/95 border-slate-200/80' : 'bg-slate-950/90 border-white/10'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <img src={currentTech.profilePic} alt={currentTech.name} className={`w-10 h-10 rounded-full object-cover border-2 ${isLight ? 'border-sky-200' : 'border-white/15'}`} />
                      <div>
                        <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentTech.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${techStatus(currentTech) === 'Moving' ? 'bg-sky-500' : 'bg-emerald-500'}`}></span>
                          <span className={`text-[10px] font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{techStatus(currentTech)} · {currentTech.region}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white/70'}`}>
                      <Battery className="w-3 h-3 text-emerald-500" /><span className="text-[9px] font-mono font-bold">Online</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-0.5">
                    <button onClick={handleDispatch} className="col-span-2 py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer font-sans">
                      <Navigation className="w-3.5 h-3.5 animate-[bounce_1.5s_infinite]" /><span>Dispatch Now</span>
                    </button>
                    <a href={`tel:${currentTech.phone}`} className={`py-2.5 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center cursor-pointer transition-all border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                      <Phone className="w-3.5 h-3.5 text-sky-500" />
                    </a>
                    <button onClick={() => setIsTimelineOpen(true)} className={`py-2.5 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center cursor-pointer transition-all border ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'report' && (
          <div className="p-4 space-y-4 pt-24">
            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-rose-50 border-rose-200/60 text-rose-800' : 'bg-gradient-to-r from-rose-500/10 to-amber-500/10 border-rose-500/15'}`}>
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-rose-900' : 'text-white'}`}>
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />Declare Breakdown Incident
              </h4>
              <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? 'text-rose-700/90' : 'text-rose-200'}`}>Filing an active breakdown logs the location on GPS map instantly and alerts all nearby available field engineers on standby.</p>
            </div>

            <form onSubmit={handleCreateBreakdown} className="space-y-4 text-xs">
              <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Lift Identifier Name</label>
                  <input type="text" required value={liftName} onChange={(e) => setLiftName(e.target.value)} placeholder="e.g. Passenger Lift T-A" className={`w-full rounded-xl px-3 py-2.5 outline-none transition-all border ${isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'}`} />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Incident Site Location</label>
                  <input type="text" required value={siteLocation} onChange={(e) => setSiteLocation(e.target.value)} placeholder="e.g. Creation Plaza Tower B" className={`w-full rounded-xl px-3 py-2.5 outline-none transition-all border ${isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'}`} />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Urgency Escalation Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Low', 'Medium', 'High', 'Very High'] as const).map((level) => (
                      <button key={level} type="button" onClick={() => setUrgency(level)} className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${urgency === level ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/25' : isLight ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-white/5 text-white/60 border-white/5'}`}>{level}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Escalation Breakdown Remarks</label>
                  <textarea required value={reportedIssues} onChange={(e) => setReportedIssues(e.target.value)} placeholder="Describe specific fault details..." className={`w-full rounded-xl px-3 py-2 outline-none h-20 resize-none transition-all border ${isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'}`} />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs uppercase tracking-wider font-black shadow-lg transition-all cursor-pointer font-sans">+ Create Breakdown Incident</button>
            </form>
          </div>
        )}

        {activeSubTab === 'resolve' && (
          <div className="p-4 space-y-4 pt-24">
            <div className={`rounded-2xl p-4 border shadow-lg space-y-3 ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}><Hammer className="w-4 h-4 text-sky-500" /> Choose Breakdown Issue</h4>
              <div className="space-y-1.5 text-xs">
                {['1. Fan or blower Not working', '2. Lift ARD not Working', '3. UPS Found tripped', '4. Lift Display Show - C'].map((category, idx) => (
                  <button key={idx} type="button" onClick={() => setSelectedIssueCategory(idx)} className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${selectedIssueCategory === idx ? 'bg-sky-500/20 border-sky-500/30 text-sky-600 dark:text-sky-300' : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'}`}>
                    <span>{category}</span><span className={`w-1.5 h-1.5 rounded-full ${selectedIssueCategory === idx ? 'bg-sky-500 animate-pulse' : 'bg-white/20'}`}></span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
                <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Diagnostic Root Cause</h4>
                <div className="space-y-2">
                  {[
                    { key: 'ardCard', label: 'ARD card faulty', desc: 'Automatic rescue device printed board malfunction' },
                    { key: 'upsFaulty', label: 'UPS system faulty', desc: 'Uninterruptible power supply logic failure' },
                    { key: 'batteryFaulty', label: 'Battery bank faulty', desc: 'DC power cell voltage drop / needs replacement' },
                    { key: 'repairRequired', label: 'ARD system Repairing require', desc: 'Full service dispatch needed' },
                  ].map((item) => (
                    <label key={item.key} className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                      <input type="checkbox" checked={(faultChecks as any)[item.key]} onChange={(e) => setFaultChecks({ ...faultChecks, [item.key]: e.target.checked })} className="accent-sky-500 w-4 h-4" />
                      <div>
                        <p className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.label}</p>
                        <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Diagnostic Details & Action Logs</label>
                  <textarea required value={repairRemarks} onChange={(e) => setRepairRemarks(e.target.value)} className={`w-full rounded-xl px-3 py-2 outline-none h-16 resize-none transition-all border ${isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {[
                  { text: 'PM History', alert: 'Loading PM installation contract history...' },
                  { text: 'Breakdown History', alert: 'Generating historical breakdown logs report...' },
                  { text: 'Repair Order', alert: 'Routing to active repair orders portal...' },
                  { text: 'Lift Summary Report', alert: 'Downloading Lift SLA Summary PDF report...' },
                ].map((aux) => (
                  <button key={aux.text} type="button" onClick={() => triggerAlert(aux.alert)} className={`p-2.5 rounded-xl border text-center cursor-pointer transition-colors ${isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'}`}>{aux.text}</button>
                ))}
              </div>

              <button type="submit" className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs uppercase tracking-wider font-black shadow-lg transition-all cursor-pointer font-sans">Archive Repair & Resolve Ticket</button>
            </form>
          </div>
        )}
      </div>

      <div className="absolute top-[62px] left-3 right-3 z-40 pointer-events-auto">
        <div className={`w-full p-1 rounded-2xl flex gap-1.5 shadow-xl backdrop-blur-md border ${isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'}`}>
          <button onClick={() => setActiveSubTab('map')} className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer pointer-events-auto whitespace-nowrap ${activeSubTab === 'map' ? (isLight ? 'bg-sky-600 text-white shadow-md' : 'bg-sky-500 text-white shadow-lg') : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40' : 'text-slate-300 hover:text-white hover:bg-white/5')}`}>Track Engineers</button>
          <button onClick={() => setActiveSubTab('report')} className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer pointer-events-auto whitespace-nowrap ${activeSubTab === 'report' ? (isLight ? 'bg-sky-600 text-white shadow-md' : 'bg-sky-500 text-white shadow-lg') : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40' : 'text-slate-300 hover:text-white hover:bg-white/5')}`}>Declare Breakdown</button>
          <button onClick={() => setActiveSubTab('resolve')} className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer pointer-events-auto whitespace-nowrap ${activeSubTab === 'resolve' ? (isLight ? 'bg-sky-600 text-white shadow-md' : 'bg-sky-500 text-white shadow-lg') : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40' : 'text-slate-300 hover:text-white hover:bg-white/5')}`}>Resolve & Repair</button>
        </div>
      </div>

      <AnimatePresence>
        {isTimelineOpen && currentTech && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setIsTimelineOpen(false)} className="absolute inset-0 bg-slate-950 z-30"></motion.div>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className={`absolute bottom-0 left-0 right-0 rounded-t-3xl z-40 max-h-[460px] flex flex-col shadow-2xl border-t ${isLight ? 'bg-white border-slate-200' : 'bg-[#002060]/95 backdrop-blur-lg border-white/15'}`}>
              <div className="flex flex-col items-center py-3.5 cursor-pointer" onClick={() => setIsTimelineOpen(false)}>
                <div className={`w-12 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>
              </div>
              <div className="px-5 pb-5 overflow-y-auto no-scrollbar space-y-4">
                <div className={`flex justify-between items-center border-b pb-3 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                  <div>
                    <span className="text-[10px] text-sky-500 dark:text-sky-300 font-bold uppercase tracking-widest block">Technician History log</span>
                    <h3 className={`text-sm font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentTech.name}&apos;s Logbook</h3>
                  </div>
                  <button onClick={() => setIsTimelineOpen(false)} className={`p-1.5 rounded-full cursor-pointer transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-white/70'}`}><X className="w-4 h-4" /></button>
                </div>
                <div className="relative pl-6 space-y-5 pt-2">
                  <div className={`absolute left-[7px] top-2.5 bottom-2.5 w-0.5 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}></div>
                  {breakdowns.filter(b => b.assignedTo === currentTech.id).slice(0, 5).map((b, i) => (
                    <div key={b.id} className="relative">
                      <span className="absolute left-[-23px] top-0.5 w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xs shadow-md text-rose-500">⚠️</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-400' : 'text-white/50'}`}>{b.createdAt?.toDate?.()?.toLocaleTimeString() || 'N/A'}</span>
                          <span className="bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-rose-500/25 uppercase">{b.urgency}</span>
                        </div>
                        <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-slate-700' : 'text-white/95'}`}>{b.liftName} at {b.siteLocation}</p>
                      </div>
                    </div>
                  ))}
                  {breakdowns.filter(b => b.assignedTo === currentTech.id).length === 0 && (
                    <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-white/40'}`}>No breakdown history for this technician.</p>
                  )}
                </div>
                <button onClick={() => setIsTimelineOpen(false)} className="w-full py-3 bg-sky-500 text-white rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer hover:bg-sky-600 transition-colors font-sans">Close Activities</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
