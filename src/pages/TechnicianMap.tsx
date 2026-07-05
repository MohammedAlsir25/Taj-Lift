import React, { useState } from 'react';
import { ArrowLeft, CheckSquare, Plus, Phone, Navigation, Clock, Hammer, AlertCircle, X, ShieldAlert, CheckCircle2, Battery, User, MapPin, ChevronRight, Activity, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from '../components/ProfileContext';

export default function TechnicianMap() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'map' | 'report' | 'resolve'>('map');
  const { theme } = useProfile();
  const isLight = theme === 'light';

  const [mapAlert, setMapAlert] = useState<string | null>(null);

  const triggerAlert = (msg: string) => {
    setMapAlert(msg);
    setTimeout(() => {
      setMapAlert(null);
    }, 4000);
  };

  // State for dispatch list from PDF Page 12
  const [selectedTechId, setSelectedTechId] = useState('tech-1');
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const technicians = [
    {
      id: 'tech-1',
      name: 'Shrutika Patil',
      status: 'Moving',
      distance: '2.4 km away',
      batteryLevel: 84,
      phone: '+919988331122',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'tech-2',
      name: 'Amol Shinde',
      status: 'On Location',
      distance: '0.2 km away',
      batteryLevel: 32,
      phone: '+919988334455',
      avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: 'tech-3',
      name: 'Suhas Kadam',
      status: 'On Duty',
      distance: '4.8 km away',
      batteryLevel: 92,
      phone: '+919988337788',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80'
    }
  ];

  const currentTech = technicians.find(t => t.id === selectedTechId) || technicians[0];

  const handleDispatch = () => {
    triggerAlert(`SLA Ticket dispatched! ${currentTech.name} has been notified and is on route via GPS navigation.`);
  };

  // Declare Breakdown Incident state (Page 12 Center/Right)
  const [liftName, setLiftName] = useState('Passenger Lift T-A');
  const [siteLocation, setSiteLocation] = useState('Creation Plaza Tower B');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Very High'>('High');
  const [reportedIssues, setReportedIssues] = useState('Safety ARD not functioning properly. Lift display shows abnormal tripped sign.');

  const handleCreateBreakdown = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert(`Created breakdown incident for ${liftName} at ${siteLocation}. Escalation Priority: ${urgency}`);
  };

  // Resolution section state from PDF Page 9
  const [selectedIssueCategory, setSelectedIssueCategory] = useState<number>(0);
  const [faultChecks, setFaultChecks] = useState({
    ardCard: true,
    upsFaulty: false,
    batteryFaulty: true,
    repairRequired: false
  });
  const [repairRemarks, setRepairRemarks] = useState('Inspected safety card. Cleaned the backup relays and replaced dual lead batteries to restore automatic level operations.');

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert(`Successfully submitted and archived diagnostic resolution ticket.`);
  };

  return (
    <div className={`h-full flex flex-col relative ${isLight ? 'text-slate-800' : 'text-white'}`}>
      
      {/* Header */}
      <div className={`relative z-30 px-4 py-3.5 flex justify-between items-center border-b transition-colors duration-300 ${
        isLight ? 'bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm' : 'bg-[#0f1524]/85 backdrop-blur-md border-white/10'
      }`}>
        <div className="flex items-center gap-3">
          <button
            id="btn-tech-back"
            onClick={() => navigate('/')}
            className={`p-1 cursor-pointer transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Field Dispatch Hub</h1>
        </div>
        <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold px-2.5 py-0.5 rounded-full border border-sky-400/20">
          GPS Active
        </span>
      </div>



      {/* Dispatch Action Notification Banner Toast */}
      {mapAlert && (
        <div className={`absolute top-28 left-4 right-4 z-20 border p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideDown_0.2s_ease-out_forwards] ${
          isLight ? 'bg-slate-900 border-slate-950/20 text-white' : 'bg-slate-950/95 border-emerald-500/25 text-white'
        }`}>
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-[11px] font-black uppercase">Operations Alert</h4>
            <p className="text-[10px] opacity-90 mt-0.5">{mapAlert}</p>
          </div>
        </div>
      )}

      {/* Dynamic View Panel */}
      <div className="flex-1 min-h-0 relative overflow-y-auto no-scrollbar pb-24">
        
        {activeSubTab === 'map' && (
          <div className="absolute inset-0 z-0 flex flex-col justify-between h-full">
            {/* Map Segment (SVG Schematic Streets Map Visual - Page 12) */}
            <div className="absolute inset-0 z-0">
              <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke={isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)"} strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Simulated Primary Roads */}
                <path d="M -10 150 L 500 220" stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)"} strokeWidth="14" fill="none" strokeLinecap="round" />
                <path d="M -10 150 L 500 220" stroke={isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.5)"} strokeWidth="1" fill="none" strokeDasharray="5,5" />

                <path d="M 120 -20 L 160 800" stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)"} strokeWidth="12" fill="none" strokeLinecap="round" />
                <path d="M 310 -20 L 250 800" stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)"} strokeWidth="16" fill="none" />
                <path d="M 310 -20 L 250 800" stroke={isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.5)"} strokeWidth="1" fill="none" strokeDasharray="8,6" />

                {/* Minor Lanes */}
                <path d="M 20 420 Q 180 380 400 480" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)"} strokeWidth="6" fill="none" />

                {/* Active critical breakdown marker: Creation Plaza */}
                <g>
                  <circle cx="210" cy="180" r="24" fill="#ef4444" className="animate-ping opacity-25" />
                  <circle cx="210" cy="180" r="12" fill="#ef4444" className="opacity-30" />
                  <circle cx="210" cy="180" r="6" fill="#ef4444" />
                </g>

                {/* Secondary breakdown marker */}
                <g>
                  <circle cx="90" cy="420" r="16" fill="#f59e0b" className="animate-pulse opacity-20" />
                  <circle cx="90" cy="420" r="4" fill="#f59e0b" />
                </g>

                {/* Technician Positions */}
                <g className="transition-all duration-1000">
                  {selectedTechId === 'tech-1' && (
                    <>
                      <circle cx="140" cy="280" r="20" fill="#38bdf8" className="animate-ping opacity-25" />
                      <circle cx="140" cy="280" r="10" fill="#38bdf8" className="opacity-40" />
                      <polygon points="140,274 144,282 140,280 136,282" fill="#38bdf8" className="origin-center rotate-45" />
                    </>
                  )}

                  {selectedTechId === 'tech-2' && (
                    <>
                      <circle cx="270" cy="200" r="20" fill="#10b981" className="animate-ping opacity-25" />
                      <circle cx="270" cy="200" r="10" fill="#10b981" className="opacity-40" />
                      <polygon points="270,194 274,202 270,200 266,202" fill="#10b981" className="origin-center rotate-[120deg]" />
                    </>
                  )}

                  {selectedTechId === 'tech-3' && (
                    <>
                      <circle cx="70" cy="120" r="20" fill="#818cf8" className="animate-ping opacity-25" />
                      <circle cx="70" cy="120" r="10" fill="#818cf8" className="opacity-40" />
                      <polygon points="70,114 74,122 70,120 66,122" fill="#818cf8" className="origin-center rotate-[-30deg]" />
                    </>
                  )}
                </g>
              </svg>

              {/* Landmark floating labels */}
              <div className={`absolute top-[135px] left-[130px] backdrop-blur-md text-[9px] font-bold px-2 py-1 rounded-xl border flex items-center gap-1 shadow-lg ${
                isLight ? 'bg-white border-rose-300 text-rose-600' : 'bg-slate-950/90 border-rose-500/25 text-rose-300'
              }`}>
                <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                <span>Creation Plaza T-A (Breakdown)</span>
              </div>

              <div className={`absolute top-[295px] left-[110px] backdrop-blur-md text-[9px] font-bold px-1.5 py-0.5 rounded-md border shadow-sm ${
                isLight ? 'bg-white border-sky-200 text-sky-600' : 'bg-slate-950/85 border-sky-500/20 text-sky-300'
              }`}>
                <span>{currentTech.name.split(' ')[0]} ({currentTech.status})</span>
              </div>
            </div>

            {/* Bottom floating horizontal scroll of technicans & details profile card */}
            <div className="absolute bottom-20 left-0 right-0 z-10 p-4 space-y-3 pointer-events-none">
              
              {/* Horizontal scroll select (Page 12) */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
                {technicians.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={`flex-none flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-bold transition-all shadow-md cursor-pointer ${
                      selectedTechId === tech.id
                        ? 'bg-sky-500 text-white border-sky-400/20 shadow-lg'
                        : isLight ? 'bg-white/95 backdrop-blur-md text-slate-700 border-slate-200 hover:bg-white' : 'bg-white/10 backdrop-blur-md text-white/70 border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <img src={tech.avatarUrl} alt={tech.name} className="w-5 h-5 rounded-full object-cover" />
                    <span>{tech.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Detailed selected tech profile card (Page 12) */}
              <div className={`backdrop-blur-xl rounded-2xl p-4 border pointer-events-auto shadow-2xl space-y-3.5 ${
                isLight ? 'bg-white/95 border-slate-200/80' : 'bg-slate-950/90 border-white/10'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <img
                      src={currentTech.avatarUrl}
                      alt={currentTech.name}
                      className={`w-10 h-10 rounded-full object-cover border-2 ${isLight ? 'border-sky-200' : 'border-white/15'}`}
                    />
                    <div>
                      <h3 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentTech.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                          currentTech.status === 'Moving' ? 'bg-sky-500' : 'bg-emerald-500'
                        }`}></span>
                        <span className={`text-[10px] font-semibold uppercase ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                          {currentTech.status} · {currentTech.distance}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white/70'
                  }`}>
                    <Battery className={`w-3 h-3 ${currentTech.batteryLevel < 40 ? 'text-amber-500' : 'text-emerald-500'}`} />
                    <span className="text-[9px] font-mono font-bold">{currentTech.batteryLevel}%</span>
                  </div>
                </div>

                {/* Operations quick contact row */}
                <div className="grid grid-cols-4 gap-2 pt-0.5">
                  <button
                    onClick={handleDispatch}
                    className="col-span-2 py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer font-sans"
                  >
                    <Navigation className="w-3.5 h-3.5 animate-[bounce_1.5s_infinite]" />
                    <span>Dispatch Now</span>
                  </button>

                  <a
                    href={`tel:${currentTech.phone}`}
                    className={`py-2.5 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center cursor-pointer transition-all border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-500" />
                  </a>

                  <button
                    onClick={() => setIsTimelineOpen(true)}
                    className={`py-2.5 px-3 rounded-xl text-[10px] font-bold flex items-center justify-center cursor-pointer transition-all border ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'report' && (
          <div className="p-4 space-y-4 pt-24">
            <div className={`p-3.5 rounded-2xl border ${
              isLight ? 'bg-rose-50 border-rose-200/60 text-rose-800' : 'bg-gradient-to-r from-rose-500/10 to-amber-500/10 border-rose-500/15'
            }`}>
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-rose-900' : 'text-white'}`}>
                <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                Declare Breakdown Incident
              </h4>
              <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? 'text-rose-700/90' : 'text-rose-200'}`}>
                Filing an active breakdown logs the location on GPS map instantly and alerts all nearby available field engineers on standby.
              </p>
            </div>

            <form onSubmit={handleCreateBreakdown} className="space-y-4 text-xs">
              <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'
              }`}>
                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Lift Identifier Name</label>
                  <input
                    type="text"
                    required
                    value={liftName}
                    onChange={(e) => setLiftName(e.target.value)}
                    placeholder="e.g. Passenger Lift T-A"
                    className={`w-full rounded-xl px-3 py-2.5 outline-none transition-all border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Incident Site Location</label>
                  <input
                    type="text"
                    required
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                    placeholder="e.g. Creation Plaza Tower B"
                    className={`w-full rounded-xl px-3 py-2.5 outline-none transition-all border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Urgency Escalation Level</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Low', 'Medium', 'High', 'Very High'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                          urgency === level
                            ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/25'
                            : isLight ? 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100' : 'bg-white/5 text-white/60 border-white/5'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Escalation Breakdown Remarks</label>
                  <textarea
                    required
                    value={reportedIssues}
                    onChange={(e) => setReportedIssues(e.target.value)}
                    placeholder="Describe specific fault details..."
                    className={`w-full rounded-xl px-3 py-2 outline-none h-20 resize-none transition-all border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs uppercase tracking-wider font-black shadow-lg transition-all cursor-pointer font-sans"
              >
                + Create Breakdown Incident
              </button>
            </form>
          </div>
        )}

        {activeSubTab === 'resolve' && (
          <div className="p-4 space-y-4 pt-24">
            {/* Quick selector of issues category (Page 9 Center) */}
            <div className={`rounded-2xl p-4 border shadow-lg space-y-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'
            }`}>
              <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Hammer className="w-4 h-4 text-sky-500" /> Choose Breakdown Issue
              </h4>

              <div className="space-y-1.5 text-xs">
                {[
                  '1. Fan or blower Not working',
                  '2. Lift ARD not Working',
                  '3. UPS Found tripped',
                  '4. Lift Display Show - C'
                ].map((category, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIssueCategory(idx)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      selectedIssueCategory === idx
                        ? 'bg-sky-500/20 border-sky-500/30 text-sky-600 dark:text-sky-300'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span>{category}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedIssueCategory === idx ? 'bg-sky-500 animate-pulse' : 'bg-white/20'}`}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic resolution form (Page 9 Right) */}
            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${
                isLight ? 'bg-white border-slate-200' : 'bg-white/10 backdrop-blur-md border-white/10'
              }`}>
                <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Diagnostic Root Cause</h4>

                <div className="space-y-2">
                  <label className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <input
                      type="checkbox"
                      checked={faultChecks.ardCard}
                      onChange={(e) => setFaultChecks({ ...faultChecks, ardCard: e.target.checked })}
                      className="accent-sky-500 w-4 h-4"
                    />
                    <div>
                      <p className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>ARD card faulty</p>
                      <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Automatic rescue device printed board malfunction</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <input
                      type="checkbox"
                      checked={faultChecks.upsFaulty}
                      onChange={(e) => setFaultChecks({ ...faultChecks, upsFaulty: e.target.checked })}
                      className="accent-sky-500 w-4 h-4"
                    />
                    <div>
                      <p className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>UPS system faulty</p>
                      <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Uninterruptible power supply logic failure</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <input
                      type="checkbox"
                      checked={faultChecks.batteryFaulty}
                      onChange={(e) => setFaultChecks({ ...faultChecks, batteryFaulty: e.target.checked })}
                      className="accent-sky-500 w-4 h-4"
                    />
                    <div>
                      <p className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Battery bank faulty</p>
                      <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>DC power cell voltage drop / needs replacement</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/5'}`}>
                    <input
                      type="checkbox"
                      checked={faultChecks.repairRequired}
                      onChange={(e) => setFaultChecks({ ...faultChecks, repairRequired: e.target.checked })}
                      className="accent-sky-500 w-4 h-4"
                    />
                    <div>
                      <p className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>ARD system Repairing require</p>
                      <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Full service dispatch needed</p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-black mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Diagnostic Details & Action Logs</label>
                  <textarea
                    required
                    value={repairRemarks}
                    onChange={(e) => setRepairRemarks(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 outline-none h-16 resize-none transition-all border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-slate-950/40 border-white/15 text-white focus:border-sky-400'
                    }`}
                  />
                </div>
              </div>

              {/* Auxiliary Diagnostic buttons (Page 9 right) */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                {[
                  { text: 'PM History', alert: 'Loading PM installation contract history...' },
                  { text: 'Breakdown History', alert: 'Generating historical breakdown logs report...' },
                  { text: 'Repair Order', alert: 'Routing to active repair orders portal...' },
                  { text: 'Lift Summary Report', alert: 'Downloading Lift SLA Summary PDF report...' }
                ].map((aux) => (
                  <button
                    key={aux.text}
                    type="button"
                    onClick={() => triggerAlert(aux.alert)}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-colors ${
                      isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                    }`}
                  >
                    {aux.text}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs uppercase tracking-wider font-black shadow-lg transition-all cursor-pointer font-sans"
              >
                Archive Repair & Resolve Ticket
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Segmented sub-navigation links - Placed after Dynamic View Panel to ensure correct stacking order on top of other content cards/map */}
      <div className="absolute top-[62px] left-3 right-3 z-40 pointer-events-auto">
        <div className={`w-full p-1 rounded-2xl flex gap-1.5 shadow-xl backdrop-blur-md border ${
          isLight ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-white/10'
        }`}>
          <button
            onClick={() => setActiveSubTab('map')}
            className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer pointer-events-auto whitespace-nowrap ${
              activeSubTab === 'map'
                ? isLight 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'bg-sky-500 text-white shadow-lg'
                : isLight 
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Track Engineers
          </button>
          <button
            onClick={() => setActiveSubTab('report')}
            className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer pointer-events-auto whitespace-nowrap ${
              activeSubTab === 'report'
                ? isLight 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'bg-sky-500 text-white shadow-lg'
                : isLight 
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Declare Breakdown
          </button>
          <button
            onClick={() => setActiveSubTab('resolve')}
            className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer pointer-events-auto whitespace-nowrap ${
              activeSubTab === 'resolve'
                ? isLight 
                  ? 'bg-sky-600 text-white shadow-md' 
                  : 'bg-sky-500 text-white shadow-lg'
                : isLight 
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Resolve & Repair
          </button>
        </div>
      </div>

      {/* Chronological Activity Timeline Bottom-Sheet Overlay (Page 12 Right) */}
      <AnimatePresence>
        {isTimelineOpen && (
          <>
            {/* Backdrop Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTimelineOpen(false)}
              className="absolute inset-0 bg-slate-950 z-30"
            ></motion.div>

            {/* Bottom sliding Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`absolute bottom-0 left-0 right-0 rounded-t-3xl z-40 max-h-[460px] flex flex-col shadow-2xl border-t ${
                isLight ? 'bg-white border-slate-200' : 'bg-[#002060]/95 backdrop-blur-lg border-white/15'
              }`}
            >
              {/* Virtual Drag-Handle */}
              <div className="flex flex-col items-center py-3.5 cursor-pointer" onClick={() => setIsTimelineOpen(false)}>
                <div className={`w-12 h-1 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`}></div>
              </div>

              <div className="px-5 pb-5 overflow-y-auto no-scrollbar space-y-4">
                <div className={`flex justify-between items-center border-b pb-3 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                  <div>
                    <span className="text-[10px] text-sky-500 dark:text-sky-300 font-bold uppercase tracking-widest block">Technician History log</span>
                    <h3 className={`text-sm font-extrabold uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentTech.name}&apos;s Logbook</h3>
                  </div>
                  <button
                    onClick={() => setIsTimelineOpen(false)}
                    className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                      isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Vertical Timeline logs (Page 12 right screenshot) */}
                <div className="relative pl-6 space-y-5 pt-2">
                  <div className={`absolute left-[7px] top-2.5 bottom-2.5 w-0.5 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}></div>

                  <div className="relative">
                    <span className="absolute left-[-23px] top-0.5 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs shadow-md text-emerald-500 font-bold">✓</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-400' : 'text-white/50'}`}>09:00 AM</span>
                        <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/25 uppercase">Clock In</span>
                      </div>
                      <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-slate-700' : 'text-white/95'}`}>Logged active presence on Wakad site coordinates.</p>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-[-23px] top-0.5 w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-xs shadow-md text-rose-500">⚠️</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-400' : 'text-white/50'}`}>10:00 AM</span>
                        <span className="bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-rose-500/25 uppercase">Breakdown on Location</span>
                      </div>
                      <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-slate-700' : 'text-white/95'}`}>Site Visit: Alpha Tech (Breakdown Issue Filed, door sensor replaced)</p>
                    </div>
                  </div>

                  <div className="relative animate-pulse">
                    <span className="absolute left-[-23px] top-0.5 w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xs shadow-md text-sky-500">⚡</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-slate-400' : 'text-white/50'}`}>11:30 AM</span>
                        <span className="bg-sky-500/20 text-sky-600 dark:text-sky-300 text-[8px] font-bold px-1.5 py-0.5 rounded border border-sky-500/25 uppercase">Out of Location</span>
                      </div>
                      <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-sky-600' : 'text-sky-300'}`}>Moving between sites. Distance: {currentTech.distance}</p>
                    </div>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
                }`}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white/90'}`}>Today Logged Session</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-500 dark:text-sky-300 font-sans">4h 30m logged</span>
                </div>

                <button
                  onClick={() => setIsTimelineOpen(false)}
                  className="w-full py-3 bg-sky-500 text-white rounded-xl text-xs uppercase tracking-wider font-extrabold cursor-pointer hover:bg-sky-600 transition-colors font-sans"
                >
                  Close Activities
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
