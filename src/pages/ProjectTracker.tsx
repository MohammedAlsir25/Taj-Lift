import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Calendar, AlertTriangle, Play, CheckCircle, ChevronRight, 
  Calculator, Download, ExternalLink, Mail, Phone, Globe, CreditCard, 
  FileCheck, DollarSign, Activity, FileText, CheckCircle2, Search, Filter, 
  TrendingUp, RefreshCw, Building, Layers, Send, User, ShieldCheck, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { YStack, XStack, Heading, Text, Card, Button } from '../components/Tamagui';
import { useProfile } from '../components/ProfileContext';
import { useProjects } from '../components/ProjectContext';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cacheSnapshot, addDocWithFallback } from '../lib/sync';

interface PaymentEntry {
  id?: string;
  terms: string;
  scope: string;
  amount: string;
  createdAt?: any;
}

export default function ProjectTracker() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'gantt' | 'estimation' | 'payments' | 'repair' | 'mis' | 'strategy'>('gantt');
  const { theme } = useProfile();
  const { projects } = useProjects();
  const activeProject = projects[0];
  const isLight = theme === 'light';

  const [trackerAlert, setTrackerAlert] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [bomDocDownloading, setBomDocDownloading] = useState<string | null>(null);
  const [bomCategory, setBomCategory] = useState<'all' | 'po' | 'grn' | 'dc'>('all');

  const [paymentHistory, setPaymentHistory] = useState<PaymentEntry[]>([]);

  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: PaymentEntry[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as PaymentEntry));
      cacheSnapshot('payments', snap.docs);
      setPaymentHistory(list);
    });
    return () => unsub();
  }, []);

  const triggerAlert = (msg: string) => {
    setTrackerAlert(msg);
    setTimeout(() => {
      setTrackerAlert(null);
    }, 4000);
  };

  // State for dynamic estimation matching PDF Page 4
  const [city, setCity] = useState('Dubai');
  const [liftType, setLiftType] = useState('Abcd');
  const [machineType, setMachineType] = useState('Gearless');
  const [motorType, setMotorType] = useState('Premium');
  const [passengers, setPassengers] = useState(6);
  const [floors, setFloors] = useState(8);
  const [isQuotationGenerated, setIsQuotationGenerated] = useState(true);

  // Estimation pricing math engine
  const baseCost = liftType === 'Abcd' ? 850000 : 1200000;
  const premiumAddon = motorType === 'Premium' ? 120000 : 0;
  const subTotal = baseCost + (passengers * 35000) + (floors * 45000) + premiumAddon;
  const vat = Math.round(subTotal * 0.05);
  const grossTotal = subTotal + vat;

  // Payments log section matching PDF Page 7
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Advance');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentPhotos, setPaymentPhotos] = useState<string[]>([]);

  const handleAddPaymentPhoto = () => {
    triggerAlert("Photo capture will be available in the mobile app.");
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    try {
      const refId = await addDocWithFallback('payments', {
        terms: `${paymentType} logged`,
        scope: paymentNote || 'Direct bank clearance transaction record',
        amount: `AED ${parseInt(paymentAmount).toLocaleString()}`,
        createdAt: serverTimestamp(),
      });
      setPaymentAmount('');
      setPaymentNote('');
      triggerAlert(`Payment of AED ${parseInt(paymentAmount).toLocaleString()} logged into ledger successfully!`);
    } catch {
      triggerAlert("Failed to log payment.");
    }
  };

  // Tab 4: BOM & Repair documents list (Page 10 Center)
  const [searchDoc, setSearchDoc] = useState('');
  const bomDocs: { id: string; type: string; supplier: string; warehouse: string; date: string; amount: string }[] = [];

  const filteredDocs = bomDocs.filter(doc =>
    doc.id.toLowerCase().includes(searchDoc.toLowerCase()) ||
    doc.supplier.toLowerCase().includes(searchDoc.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchDoc.toLowerCase())
  );

  return (
    <YStack className={`h-full flex flex-col overflow-hidden relative ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0f1524] text-white'}`}>
      {/* Header */}
      <XStack jc="space-between" ai="center" className={`px-4 py-3.5 sticky top-0 z-10 border-b transition-colors duration-300 flex-none ${
        isLight ? 'bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm' : 'bg-[#0f1524]/85 backdrop-blur-md border-white/10'
      }`}>
        <XStack ai="center" className="gap-3">
          <button
            id="btn-tracker-back"
            onClick={() => navigate('/')}
            className={`p-1 cursor-pointer transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Heading level={4} className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Project Operations</Heading>
        </XStack>
        <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold px-2.5 py-0.5 rounded-full border border-sky-400/20">
          Field Live
        </span>
      </XStack>

      {/* Dispatch Action Notification Banner Toast */}
      {trackerAlert && (
        <div className={`absolute top-16 left-4 right-4 z-30 border p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideDown_0.2s_ease-out_forwards] ${
          isLight ? 'bg-slate-900/95 border-slate-950/20 text-white' : 'bg-slate-950/95 border-emerald-500/25 text-white'
        }`}>
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold">{trackerAlert}</p>
        </div>
      )}

      {/* Unified Card Container that fills up to the header of the app */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isLight ? 'bg-white' : 'bg-[#131b2e]/60 backdrop-blur-xl'
      }`}>
        {/* Horizontal Sub-Tabs Switcher on top of the card container */}
        <XStack className={`px-4 py-3 border-b flex gap-1.5 overflow-x-auto no-scrollbar flex-none bg-transparent ${
          isLight ? 'border-slate-200/60 shadow-sm' : 'border-white/10'
        }`}>
          <Button variant={activeSubTab === 'gantt' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('gantt')} className="flex-none px-4 py-2">
            Gantt / Timeline
          </Button>
          <Button variant={activeSubTab === 'estimation' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('estimation')} className="flex-none px-4 py-2">
            Quotation Builder
          </Button>
          <Button variant={activeSubTab === 'payments' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('payments')} className="flex-none px-4 py-2">
            Payments Ledger
          </Button>
          <Button variant={activeSubTab === 'repair' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('repair')} className="flex-none px-4 py-2">
            BOM Documents
          </Button>
          <Button variant={activeSubTab === 'mis' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('mis')} className="flex-none px-4 py-2">
            Structured MIS
          </Button>

          <Button variant={activeSubTab === 'strategy' ? 'primary' : 'secondary'} onClick={() => setActiveSubTab('strategy')} className="flex-none px-4 py-2">
            Strategy Call
          </Button>
        </XStack>

        {/* Scrollable Main Content Areas */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-4"
          >
            
            {/* 1. GANTT TIMELINE SUB-TAB */}
            {activeSubTab === 'gantt' && (
              <div className="space-y-4">
                
                {activeProject && (
                  <div className={`rounded-2xl p-4 border shadow-xl relative overflow-hidden transition-all duration-300 ${
                    isLight 
                      ? 'bg-white border-slate-200/80 shadow-slate-100' 
                      : 'bg-slate-900/40 backdrop-blur-xl border-sky-500/10 shadow-black/40'
                  }`}>
                    <div className="absolute right-[-12px] bottom-[-12px] opacity-10 pointer-events-none">
                      <Activity className={`w-28 h-28 ${isLight ? 'text-slate-400' : 'text-sky-400'}`} />
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[8px] bg-sky-500/15 text-sky-600 dark:text-sky-400 font-extrabold px-2.5 py-1 rounded-md border border-sky-500/20 uppercase tracking-widest block w-max mb-1.5">
                          Active Project
                        </span>
                        <p className={`text-[9px] uppercase font-mono font-bold tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                          ID: {activeProject.id}
                        </p>
                        <h3 className={`text-base font-black tracking-tight mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {activeProject.name}
                        </h3>
                        <p className="text-[11px] font-extrabold mt-1 text-emerald-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          {activeProject.status} · {activeProject.completed}% Completed
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold block opacity-60 uppercase">Completion</span>
                        <span className="text-lg font-black font-mono text-sky-500">{activeProject.completed}%</span>
                      </div>
                    </div>

                    <div className={`grid grid-cols-3 gap-2.5 pt-3 mt-3 border-t text-center ${
                      isLight ? 'border-slate-100' : 'border-white/5'
                    }`}>
                      <div className="space-y-0.5">
                        <span className={`text-[8px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Location</span>
                        <p className={`text-[10px] font-black flex items-center justify-center gap-1 ${isLight ? 'text-slate-800' : 'text-white/95'}`}>
                          <User className="w-3 h-3 text-sky-500" />
                          {activeProject.location || 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className={`text-[8px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Budget</span>
                        <p className={`text-[10px] font-black flex items-center justify-center gap-1 ${isLight ? 'text-slate-800' : 'text-white/95'}`}>
                          <Clock className="w-3 h-3 text-sky-500" />
                          AED {activeProject.budget?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className={`text-[8px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Status</span>
                        <p className={`text-[10px] font-black flex items-center justify-center gap-1 text-emerald-500`}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {activeProject.status}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Structured Project Timeline thread */}
                <div className="space-y-3 pt-1">
                  <p className={`text-[10px] font-black uppercase tracking-widest px-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    Gantt Task Milestones
                  </p>
                  <div className={`rounded-2xl p-6 border text-center ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-white/50'}`}>No milestones yet.</p>
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Add project milestones to track progress.</p>
                  </div>
                </div>

              </div>
            )}

            {/* 2. QUOTATION BUILDER SUB-TAB */}
            {activeSubTab === 'estimation' && (
              <div className="space-y-4">
                
                {/* Dynamic calculator header */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-sky-50 border-sky-200/60 text-sky-800' : 'bg-gradient-to-r from-sky-500/15 to-blue-500/5 border-sky-500/15'
                }`}>
                  <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-sky-800' : 'text-white'}`}>
                    <Calculator className="w-4 h-4 text-sky-500 animate-bounce" /> Quotation Proposal Builder
                  </h4>
                  <p className={`text-[11px] leading-relaxed mt-1.5 ${isLight ? 'text-sky-700/80' : 'text-white/70'}`}>
                    Adjust variable lift models, floors, finishing grade, and passenger options. Our pricing engine generates statutory 18% GST proposals instantly.
                  </p>
                </div>

                {/* Config inputs form */}
                <div className={`rounded-2xl p-4.5 border shadow-lg space-y-4 text-xs ${
                  isLight ? 'bg-white border-slate-200/80' : 'bg-[#131b2e]/70 backdrop-blur-md border-white/10'
                }`}>
                  <div className="flex justify-between items-center border-b pb-2.5 dark:border-white/5">
                    <h5 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Specifications Inputs
                    </h5>
                    <span className="text-[9px] text-sky-500 font-bold uppercase tracking-wider">Parameters</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Target City</label>
                      <select value={city} onChange={(e) => setCity(e.target.value)} className={`w-full rounded-xl px-3 py-2 outline-none border transition-all ${
                        isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-500' : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500/50'
                      }`}>
                        <option value="Dubai" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Dubai (HQ)</option>
                        <option value="Abu Dhabi" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Abu Dhabi</option>
                        <option value="Sharjah" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Sharjah</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Lift Model Series</label>
                      <select value={liftType} onChange={(e) => setLiftType(e.target.value)} className={`w-full rounded-xl px-3 py-2 outline-none border transition-all ${
                        isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-500' : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500/50'
                      }`}>
                        <option value="Abcd" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Abcd Pro (Gearless)</option>
                        <option value="Xylo" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Xylo Heavy Duty</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Machine Motor</label>
                      <select value={machineType} onChange={(e) => setMachineType(e.target.value)} className={`w-full rounded-xl px-3 py-2 outline-none border transition-all ${
                        isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-500' : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500/50'
                      }`}>
                        <option value="Gearless" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Gearless (Fast)</option>
                        <option value="Geared" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Geared (Standard)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Finishing & Steel</label>
                      <select value={motorType} onChange={(e) => setMotorType(e.target.value)} className={`w-full rounded-xl px-3 py-2 outline-none border transition-all ${
                        isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-500' : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500/50'
                      }`}>
                        <option value="Premium" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Premium Hairline</option>
                        <option value="Standard" className={isLight ? 'text-slate-800' : 'bg-slate-900'}>Satin standard</option>
                      </select>
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={`font-bold uppercase ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Passengers Cabin:</span>
                        <span className="font-extrabold text-sky-500 font-mono bg-sky-500/10 px-2 py-0.5 rounded">{passengers} Passengers</span>
                      </div>
                      <input
                        type="range"
                        min="4"
                        max="15"
                        value={passengers}
                        onChange={(e) => setPassengers(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className={`font-bold uppercase ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Number of Floors:</span>
                        <span className="font-extrabold text-sky-500 font-mono bg-sky-500/10 px-2 py-0.5 rounded">{floors} Floors</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={floors}
                        onChange={(e) => setFloors(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                  </div>

                  {/* Physical Shaft Dimensions Spec Cards */}
                  <div className={`grid grid-cols-3 gap-2 pt-2 border-t text-center ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                    <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/20 border-white/5'}`}>
                      <span className={`text-[8px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Shaft Dimensions</span>
                      <span className={`text-[11px] font-black font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>1800 x 1800</span>
                    </div>
                    <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/20 border-white/5'}`}>
                      <span className={`text-[8px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Clear Opening</span>
                      <span className={`text-[11px] font-black font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>100.0 mm</span>
                    </div>
                    <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/20 border-white/5'}`}>
                      <span className={`text-[8px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Pit Depth Rec</span>
                      <span className={`text-[11px] font-black font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>1500 mm</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsQuotationGenerated(true);
                      triggerAlert("Recalculated bill of materials and pricing structures!");
                    }}
                    className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 active:scale-98 transition-all text-white rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer shadow-md shadow-sky-500/10 animate-pulse"
                  >
                    Recalculate Specifications
                  </button>
                </div>

                {/* Interactive Cost Table styled like an elegant financial invoice sheet */}
                {isQuotationGenerated && (
                  <div className={`rounded-2xl p-4.5 border shadow-2xl space-y-4 animate-[slideUp_0.2s_ease-out_forwards] text-xs relative overflow-hidden ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#121824]/90 backdrop-blur-xl border-sky-500/15'
                  }`}>
                    {/* Visual paper cutout ribbon effect */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

                    <div className={`flex justify-between items-center border-b pb-3 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                      <div>
                        <h5 className="font-black text-sky-500 dark:text-sky-300 uppercase tracking-widest text-[10px]">Proposal Billing ledger</h5>
                        <p className={`text-[8px] mt-0.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>REVENUE COMPLIANCE VERIFIED</p>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 px-2.5 py-1 rounded-full font-bold">
                        Valid 30 Days
                      </span>
                    </div>

                    <div className="space-y-2.5 divide-y divide-dashed dark:divide-white/5">
                      <div className="flex justify-between items-center pt-1 text-slate-500 dark:text-white/55">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-slate-400" />
                          Base elevator motor unit:
                        </span>
                        <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                          AED {baseCost.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 text-slate-500 dark:text-white/55">
                        <span>Capacity additions ({passengers} Pax):</span>
                        <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                          AED {(passengers * 35000).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 text-slate-500 dark:text-white/55">
                        <span>Shaft wiring ({floors} Floors):</span>
                        <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                          AED {(floors * 45000).toLocaleString()}
                        </span>
                      </div>

                      {premiumAddon > 0 && (
                        <div className="flex justify-between items-center pt-2.5 text-slate-500 dark:text-white/55">
                          <span>Premium hairline finishes:</span>
                          <span className={`font-mono font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white/90'}`}>
                            AED {premiumAddon.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className={`flex justify-between items-center pt-3 font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        <span>Sub-Total Net Value:</span>
                        <span className="font-mono text-sm">AED {subTotal.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2.5 text-amber-500 font-semibold text-[11px]">
                        <span className="flex items-center gap-1">
                          VAT (5% UAE Tax):
                        </span>
                        <span className="font-mono font-extrabold">AED {vat.toLocaleString()}</span>
                      </div>

                      <div className={`flex justify-between items-center pt-3 text-sm font-black border-t-2 border-double ${
                        isLight ? 'border-slate-200 text-slate-900' : 'border-white/10 text-emerald-400'
                      }`}>
                        <span className="uppercase tracking-wider">Gross Total Price:</span>
                        <span className="font-mono text-base font-extrabold">AED {grossTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => triggerAlert("Quotation proposal shared to client via WhatsApp!")}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-98 transition-all text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer text-center font-sans"
                      >
                        Send via WhatsApp
                      </button>

                      <button
                        type="button"
                        disabled={isGeneratingPdf}
                        onClick={() => {
                          setIsGeneratingPdf(true);
                          setTimeout(() => {
                            setIsGeneratingPdf(false);
                            triggerAlert("Quotation PDF generated and downloaded to device!");
                          }, 1800);
                        }}
                        className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer text-center transition-all border flex items-center justify-center gap-1.5 font-sans ${
                          isLight 
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                            : 'bg-white/5 hover:bg-white/10 border-white/15 text-white'
                        }`}
                      >
                        {isGeneratingPdf ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-sky-500" />
                            <span>Compiling...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5 text-sky-500" />
                            <span>Download PDF</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. PAYMENTS LEDGER SUB-TAB */}
            {activeSubTab === 'payments' && (
              <div className="space-y-4">
                
                {/* Total Billing Alert with Progress Gauge Meter */}
                <div className={`rounded-2xl p-4 border shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-white/10'
                }`}>
                  <div className="absolute right-[-15px] bottom-[-15px] opacity-10 pointer-events-none">
                    <CreditCard className={`w-28 h-28 ${isLight ? 'text-slate-300' : 'text-sky-400'}`} />
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] bg-sky-500/15 text-sky-600 dark:text-sky-400 font-extrabold px-2 py-0.5 rounded border border-sky-400/25 uppercase tracking-widest block w-max mb-1.5">
                        Payments Ledger
                      </span>
                      <p className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                        Total Contract Value
                      </p>
                      <h3 className={`text-xl font-black font-mono tracking-tight ${isLight ? 'text-slate-800' : 'text-white'}`}>
                        AED 2,549,000
                      </h3>
                    </div>
                    <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2.5 py-1 rounded-md border border-amber-500/20 uppercase tracking-widest">
                      PENDING CLEARANCE
                    </span>
                  </div>

                  {/* Dual Allocation Status Progress Bar */}
                  <div className="mt-4 space-y-1.5 relative z-10">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-emerald-500">Collected: AED 1,245,000 (48.8%)</span>
                      <span className={isLight ? 'text-slate-500' : 'text-white/40'}>Balance: AED 1,304,000</span>
                    </div>

                    <div className="h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden flex border dark:border-white/5">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: '48.8%' }} />
                    </div>
                  </div>
                </div>

                {/* Record Payment Form */}
                <form onSubmit={handleCollectPayment} className={`rounded-2xl p-4 border shadow-lg space-y-4 text-xs ${
                  isLight ? 'bg-white border-slate-200/80' : 'bg-[#131b2e]/70 backdrop-blur-md border-white/10'
                }`}>
                  <div className="flex justify-between items-center border-b pb-2.5 dark:border-white/5">
                    <h5 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <FileCheck className="w-4.5 h-4.5 text-emerald-500 animate-pulse" /> Record Field Collection
                    </h5>
                    <span className="text-[9px] text-emerald-500 font-extrabold uppercase">Terminal</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                        Amount Collected (AED)
                      </label>
                      <input
                        type="number"
                        required
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="e.g. 500000"
                        className={`w-full rounded-xl px-3 py-2.5 outline-none transition-all border font-mono font-bold text-xs ${
                          isLight 
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-500' 
                            : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Collection Date</label>
                        <input 
                          type="date" 
                          required 
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className={`w-full rounded-xl px-3 py-2 outline-none border text-[11px] font-mono ${
                            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950/40 border-white/10 text-white'
                          }`} 
                        />
                      </div>

                      <div>
                        <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Ledger Stage</label>
                        <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)} className={`w-full rounded-xl px-2.5 py-2 outline-none border transition-all text-[11px] ${
                          isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-500' : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500/50'
                        }`}>
                          <option value="Advance">Advance (50%)</option>
                          <option value="Before Material">Material dispatch (40%)</option>
                          <option value="Handover">Final handover (10%)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[9px] uppercase font-bold tracking-wider mb-1 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                        Reference Slip Details
                      </label>
                      <input
                        type="text"
                        value={paymentNote}
                        onChange={(e) => setPaymentNote(e.target.value)}
                        placeholder="Reference RTGS / Bank wire ID number..."
                        className={`w-full rounded-xl px-3 py-2.5 outline-none transition-all border ${
                          isLight 
                            ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-500' 
                            : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500'
                        }`}
                      />
                    </div>

                    {/* Photo attachment logger */}
                    <div className="space-y-1.5">
                      <label className={`block text-[9px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                        Transaction Slip Receipts
                      </label>
                      <div className="flex gap-2.5 items-center">
                        {paymentPhotos.map((url, idx) => (
                          <div 
                            key={idx} 
                            className={`w-12 h-12 rounded-xl overflow-hidden border relative group shadow-sm transition-transform duration-200 hover:scale-105 ${
                              isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-950/20'
                            }`}
                          >
                            <img src={url} alt="slip" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={handleAddPaymentPhoto}
                          className={`w-12 h-12 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                            isLight 
                              ? 'border-slate-300 hover:border-sky-500 hover:text-sky-500 bg-slate-50 text-slate-400' 
                              : 'border-white/15 hover:border-sky-500/50 hover:text-sky-400 bg-slate-950/25 text-white/40'
                          }`}
                        >
                          <span className="text-sm font-extrabold">+</span>
                          <span className="text-[7px] uppercase font-black tracking-tighter">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white rounded-xl text-xs uppercase tracking-widest font-black shadow-md transition-all cursor-pointer font-sans"
                  >
                    Post Collected Payment
                  </button>
                </form>

                {/* Payment Terms Table */}
                <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-white/10'
                }`}>
                  <div className="flex justify-between items-center border-b pb-2 dark:border-white/5">
                    <h5 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Payment Stages & Logs
                    </h5>
                    <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">History</span>
                  </div>

                  <div className={`divide-y text-[11px] ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-white/5 text-white/70'}`}>
                    {paymentHistory.map((term, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between group">
                        <div className="space-y-0.5">
                          <p className={`font-black flex items-center gap-1 text-[11px] ${isLight ? 'text-slate-800' : 'text-white'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {term.terms}
                          </p>
                          <p className={`text-[9px] pl-2.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`}>
                            {term.scope}
                          </p>
                        </div>
                        <span className="font-mono font-black text-xs text-sky-500 dark:text-sky-300">
                          {term.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. BOM DOCUMENTS SUB-TAB */}
            {activeSubTab === 'repair' && (
              <div className="space-y-4">
                
                {/* Search inputs */}
                <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e]/80 backdrop-blur-md border-white/10'
                }`}>
                  <div className="flex justify-between items-center pb-1">
                    <h5 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      BOM & Parts Inventory Docs
                    </h5>
                    <span className="text-[9px] font-bold text-sky-500 uppercase tracking-wider">Inventory</span>
                  </div>
                  
                  {/* Search box with prefix icon */}
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
                    <input
                      type="text"
                      placeholder="Search PO, GRN, Delivery Chalan..."
                      value={searchDoc}
                      onChange={(e) => setSearchDoc(e.target.value)}
                      className={`w-full rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none transition-all border ${
                        isLight 
                          ? 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white' 
                          : 'bg-slate-950/40 border-white/10 text-white focus:border-sky-500/50'
                      }`}
                    />
                  </div>

                  {/* High Fidelity filter pills */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
                    {[
                      { id: 'all', label: 'All Docs' },
                      { id: 'po', label: 'PO Sheets' },
                      { id: 'grn', label: 'GRN Slips' },
                      { id: 'dc', label: 'Chalans' }
                    ].map((pill) => {
                      const isActive = bomCategory === pill.id;
                      return (
                        <button
                          key={pill.id}
                          type="button"
                          onClick={() => {
                            setBomCategory(pill.id as any);
                            triggerAlert(`Filtered documents inventory list by: ${pill.label}`);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                            isActive
                              ? 'bg-sky-500 text-white'
                              : isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                : 'bg-white/5 hover:bg-white/10 text-white/70'
                          }`}
                        >
                          {pill.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Document list */}
                <div className="space-y-3.5 text-xs">
                  {filteredDocs
                    .filter((doc) => {
                      if (bomCategory === 'po') return doc.type === 'Purchase Order';
                      if (bomCategory === 'grn') return doc.type === 'Goods Receipt Note';
                      if (bomCategory === 'dc') return doc.type === 'Delivery Chalan';
                      return true;
                    })
                    .map((doc) => {
                      const isDownloading = bomDocDownloading === doc.id;
                      
                      // Custom items summary for realistic document experience
                      const partsSummary = 
                        doc.id.includes('1105') ? 'Steel Channels x12, Anchor Bolts x48, Header Rails x6' :
                        doc.id.includes('0841') ? 'Traction motor unit 3.5kW, Controller circuit board x1' :
                        'Passenger cabin steel panels (Wakad high speed spec)';

                      return (
                        <div key={doc.id} className={`rounded-2xl p-4 border shadow-xl space-y-3 relative overflow-hidden transition-all duration-200 hover:shadow-2xl ${
                          isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e]/60 backdrop-blur-md border-white/10'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider block w-max ${
                                isLight 
                                  ? 'bg-slate-100 border-slate-200 text-sky-600' 
                                  : 'bg-sky-500/10 text-sky-400 border-sky-500/15'
                              }`}>
                                {doc.type}
                              </span>
                              <h6 className={`text-xs font-black mt-2 flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                <FileText className="w-3.5 h-3.5 text-sky-500" />
                                {doc.id}
                              </h6>
                              <p className={`text-[9px] font-bold mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                                Supplier: {doc.supplier} · Wh: {doc.warehouse}
                              </p>
                            </div>
                            <span className={`text-xs font-mono font-black px-2 py-1 rounded border ${
                              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/30 border-white/5 text-white/90'
                            }`}>{doc.amount}</span>
                          </div>

                          {/* Parts/Components listing */}
                          <div className={`p-2.5 rounded-xl text-[9px] border leading-relaxed ${
                            isLight ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-slate-950/40 border-white/5 text-white/50'
                          }`}>
                            <span className="font-extrabold uppercase tracking-wider block mb-0.5 text-sky-500 text-[8px]">Enclosed Parts Manifest</span>
                            {partsSummary}
                          </div>

                          <div className={`border-t pt-2.5 flex justify-between items-center text-[10px] ${
                            isLight ? 'border-slate-100 text-slate-500' : 'border-white/5 text-white/50'
                          }`}>
                            <span className="font-mono font-bold">Logged: {doc.date}</span>
                            <button
                              disabled={isDownloading}
                              type="button"
                              onClick={() => {
                                setBomDocDownloading(doc.id);
                                setTimeout(() => {
                                  setBomDocDownloading(null);
                                  triggerAlert(`Downloaded document file ${doc.id} successfully!`);
                                }, 1500);
                              }}
                              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer font-sans text-[9px] uppercase tracking-wider shadow-md shadow-sky-500/10"
                            >
                              {isDownloading ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin text-white" />
                                  <span>Syncing...</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  
                  {filteredDocs.length === 0 && (
                    <div className="text-center py-8">
                      <p className={`text-xs ${isLight ? 'text-slate-400' : 'text-white/40'}`}>No matching BOM documents found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. STRUCTURED MIS TAB */}
            {activeSubTab === 'mis' && (
              <div className="space-y-4">
                
                {/* Structured reports banner card */}
                <div className={`rounded-2xl p-4.5 border shadow-lg space-y-2 relative overflow-hidden ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-white/10'
                }`}>
                  <div className="absolute right-[-15px] bottom-[-15px] opacity-10 pointer-events-none">
                    <FileText className={`w-24 h-24 ${isLight ? 'text-slate-300' : 'text-sky-400'}`} />
                  </div>
                  
                  <span className="text-[8px] bg-sky-500/15 text-sky-600 dark:text-sky-400 font-black px-2.5 py-0.5 rounded border border-sky-400/20 uppercase tracking-widest block w-max">
                    STRUCTURED DATA EXPORTER
                  </span>
                  <h4 className={`text-sm font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Management Information Sheets (MIS)
                  </h4>
                  <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                    Generate, compile and download beautifully structured field operations records, sales dashboards, and breakdown audits directly as spreadsheet templates.
                  </p>
                </div>

                {/* Grid of Categorized Reports */}
                <div className="space-y-3">
                  <p className={`text-[10px] font-black uppercase tracking-wider px-1 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    Available Export Databases
                  </p>

                  <div className={`rounded-2xl p-6 border text-center ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-white/50'}`}>No MIS reports generated yet.</p>
                    <p className={`text-[10px] mt-1 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>Reports will appear here once you export data.</p>
                  </div>
                </div>

              </div>
            )}

            {/* 6. STRATEGY CALL SUB-TAB */}
            {activeSubTab === 'strategy' && (
              <div className="space-y-4">
                
                {/* Book Strategy Call Card */}
                <div className={`rounded-2xl p-5 border shadow-xl text-center space-y-4.5 relative overflow-hidden ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-white/10'
                }`}>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-sky-500 dark:text-sky-300 uppercase tracking-widest block">
                      Elevate Operations
                    </span>
                    <h4 className={`text-base font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Book Product Strategy Call
                    </h4>
                    <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/70'}`}>
                      Need a complete workflow audit? Scan this QR code or trigger below to request a live, dedicated setup demonstration.
                    </p>
                  </div>

                  {/* High Tech Glowing QR Code Viewfinder Scanner */}
                  <div className="relative mx-auto w-40 h-40 flex items-center justify-center p-3">
                    
                    {/* Viewfinder corner sights */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sky-500 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sky-500 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sky-500 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sky-500 rounded-br-md" />

                    {/* Continuous horizontal pulsing scanning laser beam */}
                    <div className="absolute left-1 right-1 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] z-10 animate-[bounce_3s_infinite_ease-in-out]" />

                    {/* QR Code Container */}
                    <div className={`w-full h-full p-2.5 rounded-xl shadow-inner border flex items-center justify-center transition-colors ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-white border-white/10'
                    }`}>
                      <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                        {/* Elegant QR matrix representation */}
                        <rect x="0" y="0" width="25" height="25" />
                        <rect x="5" y="5" width="15" height="15" fill="white" />
                        <rect x="8" y="8" width="9" height="9" />

                        <rect x="75" y="0" width="25" height="25" />
                        <rect x="80" y="5" width="15" height="15" fill="white" />
                        <rect x="83" y="8" width="9" height="9" />

                        <rect x="0" y="75" width="25" height="25" />
                        <rect x="5" y="80" width="15" height="15" fill="white" />
                        <rect x="8" y="83" width="9" height="9" />

                        <rect x="35" y="35" width="30" height="30" />
                        <rect x="40" y="40" width="20" height="20" fill="white" />

                        {/* Custom digital dots */}
                        <rect x="35" y="10" width="5" height="10" />
                        <rect x="45" y="5" width="10" height="5" />
                        <rect x="60" y="15" width="5" height="15" />
                        <rect x="10" y="35" width="15" height="5" />
                        <rect x="15" y="45" width="5" height="10" />
                        <rect x="35" y="75" width="15" height="5" />
                        <rect x="45" y="85" width="15" height="10" />
                        <rect x="75" y="35" width="10" height="15" />
                        <rect x="85" y="45" width="10" height="10" />
                        <rect x="75" y="75" width="20" height="5" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <a
                      href="https://elevatorplus.app/demo-request"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-500 dark:text-sky-400 font-extrabold hover:underline"
                    >
                      <span>elevatorplus.app/demo-request</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Team dispatch live status indicator cards */}
                <div className={`p-3.5 rounded-xl border text-[10px] flex justify-between items-center shadow-sm ${
                  isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <p className="font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Customer Support Dispatch Live
                  </p>
                  <span className="font-mono font-black">Online (Wait time &lt; 3m)</span>
                </div>

                {/* Quick Support contact buttons */}
                <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 text-xs ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#131b2e] border-white/10'
                }`}>
                  <h5 className={`text-xs font-black uppercase text-left ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Contact Support & Dispatch Desk
                  </h5>
                  
                  <div className="space-y-2.5">
                    <a href="tel:+918883832222" className={`flex items-center justify-between p-2.5 rounded-xl border transition-all font-semibold hover:translate-x-0.5 ${
                      isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950/20 hover:bg-slate-950/40 border-white/5 text-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-sky-500 dark:text-sky-400 animate-pulse" />
                        <span>+91 888 383 2222</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
                    </a>

                    <a href="mailto:hello@elevatorplus.app" className={`flex items-center justify-between p-2.5 rounded-xl border transition-all font-semibold hover:translate-x-0.5 ${
                      isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950/20 hover:bg-slate-950/40 border-white/5 text-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                        <span>hello@elevatorplus.app</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
                    </a>

                    <a href="https://elevatorplus.app" target="_blank" rel="noreferrer" className={`flex items-center justify-between p-2.5 rounded-xl border transition-all font-semibold hover:translate-x-0.5 ${
                      isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950/20 hover:bg-slate-950/40 border-white/5 text-white'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                        <span>elevatorplus.app</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
                    </a>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </YStack>
  );
}
