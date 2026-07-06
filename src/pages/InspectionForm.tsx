import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Check, X, AlertTriangle, Clipboard, Calendar, UserCheck, ShieldCheck, CheckSquare, Plus, RefreshCw, Mail, Phone, MapPin, Compass } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { YStack, XStack, Heading, Text, Card, Button } from '../components/Tamagui';
import { useProfile } from '../components/ProfileContext';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cacheSnapshot, addDocWithFallback } from '../lib/sync';

interface PmSlot {
  id: string;
  started: string;
  due: string;
  status: string;
  site: string;
  firm: string;
  lift: string;
  wing: string;
  contact: string;
  invoice: string;
}

export default function InspectionForm() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'checklist' | 'slots' | 'expiring'>('checklist');
  const { theme } = useProfile();
  const isLight = theme === 'light';

  const componentsList = [
    { id: 'ard', name: 'ARD System', desc: 'Automatic Rescue Device battery & backup response' },
    { id: 'alarm', name: 'Alarm System', desc: 'Emergency cabin alarm bell & intercom wiring' },
    { id: 'cabin', name: 'Lift Cartop and Cabin', desc: 'Car ceiling light, floor level alignments & door sensor' },
    { id: 'motor', name: 'Machine Room', desc: 'Motor oil level, brake pad clearance & hoist wiring' }
  ];

  const [matrixState, setMatrixState] = useState<Record<string, 'good' | 'avg' | 'bad'>>({});
  const [remarksState, setRemarksState] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [pmAlertMessage, setPmAlertMessage] = useState<string | null>(null);

  const [pmSlots, setPmSlots] = useState<PmSlot[]>([]);
  const [activeSlotType, setActiveSlotType] = useState<'services' | 'sales'>('services');

  useEffect(() => {
    const q = query(collection(db, "pm_slots"), orderBy("started", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: PmSlot[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as PmSlot);
      });
      cacheSnapshot('pm_slots', snapshot.docs);
      setPmSlots(list);
    });
    return () => unsubscribe();
  }, []);

  const triggerAlertMessage = (msg: string) => {
    setPmAlertMessage(msg);
    setTimeout(() => { setPmAlertMessage(null); }, 4000);
  };

  const handleToggle = (id: string, status: 'good' | 'avg' | 'bad') => {
    setMatrixState(prev => ({ ...prev, [id]: status }));
  };

  const handleRemarkChange = (id: string, text: string) => {
    setRemarksState(prev => ({ ...prev, [id]: text }));
  };

  const handleAddPhoto = () => {
    triggerAlertMessage("Camera capture will be available in the mobile app.");
  };

  const handleSubmitQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const refId = await addDocWithFallback('inspections', {
        matrixState,
        remarksState,
        photos,
        componentsList,
        submittedAt: new Date().toISOString(),
        status: 'quotation_created',
      });
      setIsSubmitted(true);
      triggerAlertMessage("PM Inspection Form submitted & AMC Quotation created!");
    } catch (err) {
      triggerAlertMessage("Failed to submit inspection.");
    }
  };

  const handleCreatePM = async () => {
    const site = prompt("Site name (e.g. Creation Plaza):");
    if (!site || !site.trim()) return;
    const firm = prompt("Firm / Client name:");
    if (!firm || !firm.trim()) return;
    try {
      const refId = await addDocWithFallback('pm_slots', {
        started: new Date().toLocaleDateString('en-GB'),
        due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
        status: 'pending',
        site: site.trim(),
        firm: firm.trim(),
        lift: '',
        wing: '',
        contact: '',
        invoice: `EVP-25-26/PM/${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
      });
      triggerAlertMessage("PM slot created!");
    } catch (err) {
      triggerAlertMessage("Failed to create PM slot.");
    }
  };

  const handleRenewAMC = (type: 'renew' | 'extend') => {
    triggerAlertMessage(`Successfully submitted request to ${type === 'renew' ? 'Renew' : 'Extend'} PM/AMC contract!`);
  };

  return (
    <YStack className={`h-full flex flex-col overflow-hidden relative ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0f1524] text-white'}`}>
      <XStack jc="space-between" ai="center" className={`px-4 py-3.5 sticky top-0 z-10 border-b transition-colors duration-300 flex-none ${isLight ? 'bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm' : 'bg-[#0f1524]/85 backdrop-blur-md border-white/10'}`}>
        <XStack ai="center" className="gap-3">
          <button id="btn-insp-back" onClick={() => navigate('/')} className={`p-1 cursor-pointer transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}><ArrowLeft className="w-5 h-5" /></button>
          <Heading level={4} className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>PM & AMC Operations</Heading>
        </XStack>
        <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold px-2.5 py-0.5 rounded-full border border-sky-400/20">SLA Live</span>
      </XStack>

      {pmAlertMessage && (
        <div className={`absolute top-16 left-4 right-4 z-30 border p-3 rounded-xl shadow-2xl flex items-center gap-2 animate-[slideDown_0.2s_ease-out_forwards] ${isLight ? 'bg-slate-900 border-slate-950/20 text-white' : 'bg-slate-950/95 border-amber-500/25 text-white'}`}>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <p className="text-[11px] font-semibold">{pmAlertMessage}</p>
        </div>
      )}

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isLight ? 'bg-white' : 'bg-[#131b2e]/60 backdrop-blur-xl'}`}>
        <XStack className={`px-4 py-3 border-b flex gap-1.5 overflow-x-auto no-scrollbar flex-none bg-transparent ${isLight ? 'border-slate-200/60 shadow-sm' : 'border-white/10'}`}>
          <Button variant={activeSubTab === 'checklist' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('checklist')} className="flex-none px-4 py-2">Checklist / Quote</Button>
          <Button variant={activeSubTab === 'slots' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('slots')} className="flex-none px-4 py-2">Track PM Slots</Button>
          <Button variant={activeSubTab === 'expiring' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('expiring')} className="flex-none px-4 py-2">Expiring AMC</Button>
        </XStack>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
          {activeSubTab === 'checklist' && (
            <YStack className="gap-4">
              <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-sky-50 border-sky-200/60 text-sky-800' : 'bg-gradient-to-r from-sky-500/20 to-blue-500/10 border-sky-500/15'}`}>
                <span className="text-[8px] bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold px-2 py-0.5 rounded border border-sky-400/20 uppercase tracking-widest block w-max mb-1">Specification Builder</span>
                <Text size="xs" fontWeight="medium" className={isLight ? 'text-sky-900' : 'text-white/80'}>Validate lift conditions, attach physical photo logs & auto-generate professional client AMC Quotations in minutes.</Text>
              </div>
              <form onSubmit={handleSubmitQuotation} className="space-y-4">
                <Card className={`p-4 flex flex-col gap-3.5 border ${isLight ? 'bg-white border-slate-200 shadow-sm' : ''}`}>
                  <Heading level={4} className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Lift Conditions Matrix</Heading>
                  <div className="space-y-3">
                    {componentsList.map((comp) => (
                      <div key={comp.id} className={`p-3 rounded-xl border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{comp.name}</h5>
                            <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{comp.desc}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          {(['good', 'avg', 'bad'] as const).map((status) => (
                            <button key={status} type="button" onClick={() => handleToggle(comp.id, status)} className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border cursor-pointer ${matrixState[comp.id] === status ? (status === 'good' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/25' : status === 'avg' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/25' : 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/25') : isLight ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-white/5 text-white/50 border-white/5'}`}>{status === 'good' ? 'Good' : status === 'avg' ? 'Avg' : 'Bad'}</button>
                          ))}
                        </div>
                        <input type="text" placeholder="Add specific inspection notes..." value={remarksState[comp.id] || ''} onChange={(e) => handleRemarkChange(comp.id, e.target.value)} className={`w-full rounded-lg px-2.5 py-1.5 text-[11px] outline-none transition-all border ${isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border border-white/15 text-white focus:border-sky-400'}`} />
                      </div>
                    ))}
                  </div>
                </Card>
                <div className={`rounded-2xl p-4 border shadow-lg space-y-3 ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Audit Photos log</h4>
                    <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{photos.length}/5 Captured</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {photos.map((url, index) => (
                      <div key={index} className={`relative h-14 rounded-xl overflow-hidden border group ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                        <img src={url} alt="Inspection" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setPhotos(photos.filter((_, i) => i !== index))} className="absolute top-1 right-1 p-0.5 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full cursor-pointer"><X className="w-2.5 h-2.5" /></button>
                      </div>
                    ))}
                    {photos.length < 5 && (
                      <button type="button" onClick={handleAddPhoto} className={`h-14 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${isLight ? 'border-slate-300 hover:border-slate-400 bg-slate-50 text-slate-500' : 'border-white/20 hover:border-white/40 bg-white/5 text-white/60'}`}>
                        <Camera className="w-4 h-4" /><span className="text-[8px] font-bold">Add Log</span>
                      </button>
                    )}
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs uppercase tracking-wider font-black shadow-md transition-all cursor-pointer font-sans">Submit & Create AMC Quotation</button>
              </form>
            </YStack>
          )}

          {activeSubTab === 'slots' && (
            <div className="space-y-4">
              <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[8px] bg-sky-500/20 text-sky-600 dark:text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-400/20 uppercase block w-max">Predictive Maintenance</span>
                    <h4 className={`text-sm font-black mt-1 uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Active PM Slots</h4>
                  </div>
                  <button onClick={handleCreatePM} className="py-1.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-extrabold uppercase flex items-center gap-1 shadow cursor-pointer transition-colors"><Plus className="w-3.5 h-3.5" /><span>Create PM</span></button>
                </div>
                <div className={`flex p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                  <button onClick={() => setActiveSlotType('services')} className={`flex-1 py-1.5 text-center text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${activeSlotType === 'services' ? 'bg-sky-500 text-white shadow' : isLight ? 'text-slate-600 hover:text-slate-800' : 'text-white/50 hover:text-white'}`}>Services</button>
                  <button onClick={() => setActiveSlotType('sales')} className={`flex-1 py-1.5 text-center text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${activeSlotType === 'sales' ? 'bg-sky-500 text-white shadow' : isLight ? 'text-slate-600 hover:text-slate-800' : 'text-white/50 hover:text-white'}`}>Sales</button>
                </div>
              </div>
              <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/5 border-white/5 text-white'}`}>
                <Calendar className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>01 May to 15 May Schedule</span>
                <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-white/50'}`}>{pmSlots.length} Active</span>
              </div>
              <div className="space-y-3">
                {pmSlots.map((slot) => (
                  <div key={slot.id} className={`rounded-2xl p-4 border shadow-lg space-y-3 relative overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-[9px] font-mono font-bold uppercase ${isLight ? 'text-slate-400' : 'text-white/45'}`}>Contract: {slot.invoice}</span>
                        <h5 className={`text-xs font-black mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{slot.firm} · <span className="text-sky-500 dark:text-sky-300">{slot.site}</span></h5>
                        <p className={`text-[10px] font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>{slot.lift} ({slot.wing})</p>
                      </div>
                      <span className="bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[8px] font-extrabold px-2 py-0.5 rounded border border-amber-500/25 uppercase">{slot.status}</span>
                    </div>
                    <div className={`border-t pt-2.5 flex justify-between items-center text-[10px] ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                      <div className="flex flex-col">
                        <span className={`uppercase font-bold text-[8px] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Started Date</span>
                        <span className={`font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>{slot.started}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`uppercase font-bold text-[8px] ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Due Date</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-300 font-mono">{slot.due}</span>
                      </div>
                    </div>
                    <div className={`pt-2 border-t flex gap-2 justify-end ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                      <a href={`tel:${slot.contact || '0000000000'}`} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border flex items-center gap-1 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/15 text-white'}`}><Phone className="w-3 h-3 text-sky-500 dark:text-sky-400" /> Call</a>
                      <button onClick={() => triggerAlertMessage(`Dispatched PM instructions for ${slot.firm}...`)} className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 rounded-lg text-[9px] font-bold text-white cursor-pointer">Dispatch Slot</button>
                    </div>
                  </div>
                ))}
                {pmSlots.length === 0 && (
                  <p className={`text-xs text-center ${isLight ? 'text-slate-400' : 'text-white/40'}`}>No PM slots yet. Create one to get started.</p>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'expiring' && (
            <div className="space-y-4">
              {(() => {
                const expired = pmSlots.filter(s => s.status === 'expired');
                const totalSlots = pmSlots.length;
                const completed = pmSlots.filter(s => s.status === 'completed').length;
                const pending = pmSlots.filter(s => s.status === 'pending').length;
                const live = pmSlots.filter(s => s.status !== 'expired' && s.status !== 'completed' && s.status !== 'pending').length;
                return (
                  <>
                    {expired.length > 0 && (
                      <div className="bg-rose-500/10 backdrop-blur-md rounded-2xl p-4 border border-rose-500/25 shadow-lg space-y-3 relative overflow-hidden">
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 pointer-events-none"><AlertTriangle className="w-24 h-24 text-rose-400" /></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] bg-rose-500/25 text-rose-500 dark:text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/20 uppercase tracking-widest block w-max">ALERT: EXPIRATION</span>
                          <span className="text-[10px] font-mono font-bold bg-rose-500 text-white px-2 py-0.5 rounded uppercase">Expired</span>
                        </div>
                        <div className="space-y-1">
                          <h4 className={`text-sm font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>PM Expired</h4>
                          <p className="text-[11px] text-rose-600 dark:text-rose-300 leading-normal font-bold">&ldquo;This PM is expired, please renew to continue PM services.&rdquo;</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1.5">
                          <button onClick={() => handleRenewAMC('renew')} className="py-2 px-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow active:scale-98 transition-all cursor-pointer">Renew PM</button>
                          <button onClick={() => handleRenewAMC('extend')} className={`py-2 px-3 border rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-98 transition-all cursor-pointer ${isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/5 border-white/15 text-white hover:bg-white/10'}`}>Extend PM</button>
                        </div>
                      </div>
                    )}
                    <div className={`rounded-2xl p-4 border shadow-lg space-y-3 ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Paid Services Timeline</h4>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}><p className={`text-[9px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Total</p><p className={`text-sm font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>{totalSlots}</p></div>
                        <div className={`p-2 rounded-xl border ${isLight ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/5 border-white/5'}`}><p className="text-[9px] text-emerald-500 uppercase font-bold">Done</p><p className="text-sm font-black text-emerald-500">{completed}</p></div>
                        <div className={`p-2 rounded-xl border ${isLight ? 'bg-amber-500/5 border-amber-500/10' : 'bg-white/5 border-white/5'}`}><p className="text-[9px] text-amber-500 uppercase font-bold">Pend</p><p className="text-sm font-black text-amber-500">{pending}</p></div>
                        <div className={`p-2 rounded-xl border ${isLight ? 'bg-sky-500/5 border-sky-500/10' : 'bg-white/5 border-white/5'}`}><p className="text-[9px] text-sky-500 dark:text-sky-400 uppercase font-bold">Live</p><p className="text-sm font-black text-sky-500 dark:text-sky-400">{live}</p></div>
                      </div>
                    </div>
                    {expired.slice(0, 1).map(slot => (
                      <div key={slot.id} className={`rounded-2xl p-4 border shadow-lg space-y-3 ${isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'}`}>
                        <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Site & Location Info</h4>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex gap-2.5 items-start">
                            <MapPin className="w-4.5 h-4.5 text-rose-500 mt-0.5" />
                            <div>
                              <h5 className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{slot.firm || 'Unknown Firm'}</h5>
                              <p className={`text-[11px] leading-normal mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/70'}`}>{slot.site || 'No site info'} — {slot.lift && `${slot.lift} `}{slot.wing && `(${slot.wing})`}</p>
                            </div>
                          </div>
                          <div className={`border-t pt-2.5 flex items-center justify-between ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                            <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-sky-500" /><span className={`text-[11px] font-bold ${isLight ? 'text-slate-800' : 'text-white/90'}`}>Contact: {slot.contact || 'N/A'}</span></div>
                            {slot.contact && (
                              <a href={`tel:${slot.contact}`} className="p-1.5 bg-sky-500 hover:bg-sky-600 rounded-lg text-white transition-colors cursor-pointer"><Phone className="w-3.5 h-3.5" /></a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {expired.length === 0 && (
                      <div className={`rounded-2xl p-8 border text-center ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
                        <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                        <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>No expiring contracts</p>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>All PM slots are up to date.</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </YStack>
  );
}
