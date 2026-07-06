import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, TrendingUp, ShieldAlert, CheckCircle2, ChevronRight, BarChart3, AlertCircle, Sparkles, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import TajLogo from '../components/TajLogo';
import { useProfile } from '../components/ProfileContext';
import { useProjects } from '../components/ProjectContext';
import { YStack, XStack, Heading, Text, Card, Button } from '../components/Tamagui';
import RotatingText from '../components/RotatingText';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const navigate = useNavigate();
  const [filterMode, setFilterMode] = useState<'track' | 'analyze' | 'overview'>('analyze');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { profilePic, name, role, isAvailable, theme, setIsSettingsOpen } = useProfile();
  const isLight = theme === 'light';

  const { projects, addProject, addExpense } = useProjects();

  // Inline forms state
  const [showDashAddProj, setShowDashAddProj] = useState(false);
  const [showDashAddExp, setShowDashAddExp] = useState(false);
  const [dashProjName, setDashProjName] = useState('');
  const [dashProjLocation, setDashProjLocation] = useState('Dubai');
  const [dashProjBudget, setDashProjBudget] = useState('');

  const [dashSelectedProj, setDashSelectedProj] = useState(projects[0]?.id || '');
  const [dashExpTitle, setDashExpTitle] = useState('');
  const [dashExpAmount, setDashExpAmount] = useState('');
  const [dashExpCat, setDashExpCat] = useState<'Materials' | 'Labor' | 'Permits' | 'Logistics' | 'Repairs' | 'Maintenance' | 'Other'>('Materials');

  // Firestore computed stats
  const [leads, setLeads] = useState<any[]>([]);
  const [pmSlots, setPmSlots] = useState<any[]>([]);
  const [breakdowns, setBreakdowns] = useState<any[]>([]);

  useEffect(() => {
    const unsubLeads = onSnapshot(collection(db, "leads"), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push(d.data()));
      setLeads(list);
    });
    const unsubPm = onSnapshot(collection(db, "pm_slots"), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push(d.data()));
      setPmSlots(list);
    });
    const unsubBd = onSnapshot(collection(db, "breakdowns"), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push(d.data()));
      setBreakdowns(list);
    });
    return () => { unsubLeads(); unsubPm(); unsubBd(); };
  }, []);

  const handleDashCreateProj = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashProjName || !dashProjBudget) return;
    const b = parseFloat(dashProjBudget);
    if (isNaN(b) || b <= 0) return;
    const newProj = addProject(dashProjName, dashProjLocation, b);
    setDashProjName('');
    setDashProjBudget('');
    setShowDashAddProj(false);
    setDashSelectedProj(newProj.id);
  };

  const handleDashCreateExp = (e: React.FormEvent) => {
    e.preventDefault();
    const projId = dashSelectedProj || (projects[0]?.id || '');
    if (!projId || !dashExpTitle || !dashExpAmount) return;
    const a = parseFloat(dashExpAmount);
    if (isNaN(a) || a <= 0) return;
    addExpense(projId, dashExpTitle, a, dashExpCat, new Date().toISOString().split('T')[0]);
    setDashExpTitle('');
    setDashExpAmount('');
    setShowDashAddExp(false);
  };

  // Computed stats from Firestore data
  const leadsDone = leads.filter(l => l.status === 'Finalized' || l.status === 'Won').length;
  const leadsPending = leads.filter(l => l.status === 'Pending' || l.status === 'New').length;
  const leadsCancelled = leads.filter(l => l.status === 'Cancelled' || l.status === 'Lost').length;
  const leadsQuotation = leads.filter(l => l.status === 'Quotation Raised' || l.status === 'Quotation').length;
  const leadsTotal = leads.length;

  const enquiriesStats = {
    total: leadsTotal || 0,
    categories: [
      { name: 'Quotation Raised', value: leadsQuotation, color: '#38bdf8' },
      { name: 'Finalized', value: leadsDone, color: '#10b981' },
      { name: 'Pending', value: leadsPending, color: '#f59e0b' },
      { name: 'Cancelled', value: leadsCancelled, color: '#ef4444' },
      { name: 'Closed By Others', value: 0, color: '#94a3b8' }
    ],
    percentage: leadsTotal > 0 ? Math.round((leadsDone / leadsTotal) * 100) : 0,
  };

  const jobsDone = projects.filter(p => p.status === 'completed').length;
  const jobsInProgress = projects.filter(p => p.status === 'ongoing').length;
  const jobsPending = projects.filter(p => p.status === 'pending').length;
  const jobsTotal = projects.length;

  const jobsStats = {
    total: jobsTotal || 0,
    categories: [
      { name: 'Work in progress', value: jobsInProgress, color: '#38bdf8' },
      { name: 'Pending', value: jobsPending, color: '#f59e0b' },
      { name: 'Completed', value: jobsDone, color: '#10b981' },
      { name: 'On hold', value: 0, color: '#a855f7' }
    ],
    percentage: jobsTotal > 0 ? Math.round((jobsDone / jobsTotal) * 100) : 0,
  };

  const pmConfirmed = pmSlots.filter(s => s.status === 'confirmed' || s.status === 'Completed').length;
  const pmPending = pmSlots.filter(s => s.status === 'pending').length;
  const pmTotal = pmSlots.length;

  const pmStats = {
    total: pmTotal || 0,
    categories: [
      { name: 'Sent', value: 0, color: '#38bdf8' },
      { name: 'Under Discussion', value: 0, color: '#a855f7' },
      { name: 'Pending', value: pmPending, color: '#f59e0b' },
      { name: 'Confirmed', value: pmConfirmed, color: '#10b981' },
      { name: 'Cancelled', value: 0, color: '#ef4444' },
      { name: 'Expired', value: 0, color: '#ec4899' }
    ],
    percentage: pmTotal > 0 ? Math.round((pmConfirmed / pmTotal) * 100) : 0,
  };

  const bdShutdown = breakdowns.filter(b => b.status === 'Shutdown' || b.status === 'emergency').length;
  const bdResolved = breakdowns.filter(b => b.status === 'Resolved' || b.status === 'Elevator Started').length;
  const bdOnHold = breakdowns.filter(b => b.status === 'On Hold').length;
  const bdTotal = breakdowns.length;

  const breakdownStats = {
    total: bdTotal || 0,
    categories: [
      { name: 'Shutdown', value: bdShutdown, color: '#ef4444' },
      { name: 'On Hold', value: bdOnHold, color: '#a855f7' },
      { name: 'Pause', value: 0, color: '#94a3b8' },
      { name: 'Live Emergency', value: 0, color: '#ec4899' },
      { name: 'Elevator Started', value: bdResolved, color: '#10b981' }
    ],
    percentage: bdTotal > 0 ? Math.round((bdResolved / bdTotal) * 100) : 0,
  };

  return (
    <YStack className={`relative w-full h-full overflow-hidden transition-colors duration-300 ${isLight ? 'text-slate-800' : 'text-white'}`}>
      
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Header Block with Taj Lift brand logo */}
        <YStack className={`pt-4 pb-4 px-5 rounded-b-3xl border-b relative transition-colors duration-300 ${
          isLight ? 'bg-white/75 backdrop-blur-md border-slate-200/60 shadow-sm' : 'bg-white/5 backdrop-blur-md border-white/10'
        }`}>
          <XStack ai="center" className="gap-3">
            <TajLogo size="sm" />
            <YStack className="flex-1">
              {/* Brand label removed */}
              <Heading level={3} className={`text-base font-black tracking-tight flex items-center gap-1.5 transition-colors duration-300 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span className="leading-none">Taj</span>
                <RotatingText
                  texts={['Lift', 'Management', 'Dashboard']}
                  mainClassName="text-sky-500 overflow-hidden font-black leading-none"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2500}
                />
              </Heading>
              <Text size="caption" className={`font-medium transition-colors duration-300 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                360° Management Dashboard
              </Text>
            </YStack>
            <div 
              onClick={() => setIsSettingsOpen(true)}
              className="relative group cursor-pointer flex-none transform active:scale-95 transition-transform"
            >
              <img
                src={profilePic}
                alt="Manager Avatar"
                className="w-10 h-10 rounded-full border-2 border-sky-400 object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border transition-colors duration-300 ${
                isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
              } ${isLight ? 'border-white' : 'border-slate-900'}`}></span>
            </div>
          </XStack>

          {/* Executive Live Ticker */}
          <XStack ai="center" jc="space-between" className={`mt-3.5 rounded-xl p-2 border transition-colors duration-300 ${
            isLight ? 'bg-slate-100 border-slate-200/60' : 'bg-white/5 border-white/5'
          }`}>
            <XStack ai="center" className="gap-2">
              <span className="flex h-1.5 w-1.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAvailable ? 'bg-emerald-400' : 'bg-slate-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                }`}></span>
              </span>
              <Text size="caption" fontWeight="semibold" className={`uppercase tracking-wider transition-colors duration-300 ${
                isLight ? 'text-slate-700' : 'text-sky-100'
              }`}>
                {isAvailable ? 'BirdEye Control Live' : 'Duty Status Offline'}
              </Text>
            </XStack>
            <Text size="caption" className={`font-mono transition-colors duration-300 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>July 4, 2026 · Active</Text>
          </XStack>
        </YStack>

        {/* Main Container */}
        <YStack className="px-4 mt-4 gap-4">
          
          {/* Dynamic Analytics Summary Badge */}
          <Card className={`p-3.5 border flex items-center justify-between shadow-xl transition-colors duration-300 ${
            isLight ? 'bg-white border-slate-200/80' : ''
          }`}>
            <XStack ai="center" className="gap-3">
              <div className={`p-2 rounded-xl border ${
                isLight ? 'bg-sky-50 text-sky-500 border-sky-200/80' : 'bg-sky-500/15 text-sky-300 border-sky-500/25'
              }`}>
                <TrendingUp className="w-5 h-5 text-sky-500" />
              </div>
              <YStack>
                <Text size="caption" fontWeight="bold" className={`uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Active Portfolio</Text>
                <Text size="xs" fontWeight="black" className={`mt-0.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>385 Operational Elevators</Text>
              </YStack>
            </XStack>
            <StatusBadge type="success" text="98.2% SLA Speed" />
          </Card>

        {/* Interactive 2x2 Grid Layout based on PDF Page 11 */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Card 1: Enquiries */}
          <button
            onClick={() => setExpandedCard(expandedCard === 'enquiries' ? null : 'enquiries')}
            className={`rounded-2xl p-3.5 border text-left shadow-lg relative overflow-hidden flex flex-col justify-between h-[160px] transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200/80 text-slate-800'
                : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
            } ${
              expandedCard === 'enquiries' 
                ? `ring-2 ring-sky-400 ${isLight ? 'bg-sky-50/50' : 'bg-white/15'}` 
                : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/15'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Enquiries</p>
                <h3 className={`text-xl font-black mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{enquiriesStats.total}</h3>
              </div>
              <span className="bg-sky-500/20 text-sky-500 dark:text-sky-300 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                CRM
              </span>
            </div>

            <div className="flex items-center justify-center py-1.5 relative w-full">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className={`fill-none ${isLight ? 'stroke-slate-100' : 'stroke-white/10'}`} strokeWidth="4" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-sky-400 fill-none transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - enquiriesStats.percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-[10px] font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>{enquiriesStats.percentage}%</span>
                <span className={`text-[7px] font-bold uppercase ${isLight ? 'text-slate-400' : 'text-white/50'}`}>Won</span>
              </div>
            </div>

            <div className={`flex items-center justify-between w-full text-[8px] border-t pt-1 ${isLight ? 'text-slate-500 border-slate-100' : 'text-white/60 border-white/5'}`}>
              <span>{enquiriesStats.categories[1].value} Finalized</span>
              <ChevronRight className={`w-2.5 h-2.5 ${isLight ? 'text-slate-300' : 'text-white/40'}`} />
            </div>
          </button>

          {/* Card 2: Jobs */}
          <button
            onClick={() => setExpandedCard(expandedCard === 'jobs' ? null : 'jobs')}
            className={`rounded-2xl p-3.5 border text-left shadow-lg relative overflow-hidden flex flex-col justify-between h-[160px] transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200/80 text-slate-800'
                : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
            } ${
              expandedCard === 'jobs' 
                ? `ring-2 ring-emerald-400 ${isLight ? 'bg-emerald-50/50' : 'bg-white/15'}` 
                : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/15'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Jobs</p>
                <h3 className={`text-xl font-black mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{jobsStats.total}</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-500 dark:text-emerald-300 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                Active
              </span>
            </div>

            <div className="flex items-center justify-center py-1.5 relative w-full">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className={`fill-none ${isLight ? 'stroke-slate-100' : 'stroke-white/10'}`} strokeWidth="4" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-emerald-400 fill-none transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - jobsStats.percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-[10px] font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>{jobsStats.percentage}%</span>
                <span className={`text-[7px] font-bold uppercase ${isLight ? 'text-slate-400' : 'text-white/50'}`}>Done</span>
              </div>
            </div>

            <div className={`flex items-center justify-between w-full text-[8px] border-t pt-1 ${isLight ? 'text-slate-500 border-slate-100' : 'text-white/60 border-white/5'}`}>
              <span>{jobsStats.categories[2].value} Completed</span>
              <ChevronRight className={`w-2.5 h-2.5 ${isLight ? 'text-slate-300' : 'text-white/40'}`} />
            </div>
          </button>

          {/* Card 3: PM / AMC */}
          <button
            onClick={() => setExpandedCard(expandedCard === 'pm' ? null : 'pm')}
            className={`rounded-2xl p-3.5 border text-left shadow-lg relative overflow-hidden flex flex-col justify-between h-[160px] transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200/80 text-slate-800'
                : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
            } ${
              expandedCard === 'pm' 
                ? `ring-2 ring-amber-400 ${isLight ? 'bg-amber-50/50' : 'bg-white/15'}` 
                : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/15'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>PM / AMC</p>
                <h3 className={`text-xl font-black mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{pmStats.total}</h3>
              </div>
              <span className="bg-amber-500/20 text-amber-500 dark:text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                SLA
              </span>
            </div>

            <div className="flex items-center justify-center py-1.5 relative w-full">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className={`fill-none ${isLight ? 'stroke-slate-100' : 'stroke-white/10'}`} strokeWidth="4" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-amber-400 fill-none transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - pmStats.percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-[10px] font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>{pmStats.percentage}%</span>
                <span className={`text-[7px] font-bold uppercase ${isLight ? 'text-slate-400' : 'text-white/50'}`}>Ready</span>
              </div>
            </div>

            <div className={`flex items-center justify-between w-full text-[8px] border-t pt-1 ${isLight ? 'text-slate-500 border-slate-100' : 'text-white/60 border-white/5'}`}>
              <span>{pmStats.categories[3].value} Confirmed</span>
              <ChevronRight className={`w-2.5 h-2.5 ${isLight ? 'text-slate-300' : 'text-white/40'}`} />
            </div>
          </button>

          {/* Card 4: Breakdowns */}
          <button
            onClick={() => setExpandedCard(expandedCard === 'breakdown' ? null : 'breakdown')}
            className={`rounded-2xl p-3.5 border text-left shadow-lg relative overflow-hidden flex flex-col justify-between h-[160px] transition-all cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200/80 text-slate-800'
                : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
            } ${
              expandedCard === 'breakdown' 
                ? `ring-2 ring-rose-400 ${isLight ? 'bg-rose-50/50' : 'bg-white/15'}` 
                : isLight ? 'hover:bg-slate-50' : 'hover:bg-white/15'
            }`}
          >
            <div className="flex justify-between items-start w-full">
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Breakdowns</p>
                <h3 className="text-xl font-black mt-0.5 text-rose-500 dark:text-rose-400">{breakdownStats.total}</h3>
              </div>
              <span className="bg-rose-500/20 text-rose-500 dark:text-rose-300 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
                SLA Alert
              </span>
            </div>

            <div className="flex items-center justify-center py-1.5 relative w-full">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className={`fill-none ${isLight ? 'stroke-slate-100' : 'stroke-white/10'}`} strokeWidth="4" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  className="stroke-rose-400 fill-none transition-all duration-1000"
                  strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - breakdownStats.percentage / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-[10px] font-black ${isLight ? 'text-rose-600' : 'text-rose-400'}`}>{breakdownStats.percentage}%</span>
                <span className={`text-[7px] font-bold uppercase ${isLight ? 'text-slate-400' : 'text-white/50'}`}>Fixed</span>
              </div>
            </div>

            <div className={`flex items-center justify-between w-full text-[8px] border-t pt-1 ${isLight ? 'text-slate-500 border-slate-100' : 'text-white/60 border-white/5'}`}>
              <span>{breakdownStats.categories[0].value} Emergency</span>
              <ChevronRight className={`w-2.5 h-2.5 ${isLight ? 'text-slate-300' : 'text-white/40'}`} />
            </div>
          </button>

        </div>

        {/* Expandable Breakdown of Selected Card - Exact Details from PDF */}
        {expandedCard && (
          <div className={`rounded-2xl p-4 shadow-xl animate-[slideDown_0.2s_ease-out_forwards] space-y-3 border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-950/80 backdrop-blur-xl border-white/15 text-white'
          }`}>
            <div className={`flex justify-between items-center border-b pb-2 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
              <h4 className="text-xs font-black uppercase tracking-widest text-sky-500 dark:text-sky-300">
                {expandedCard === 'enquiries' && 'Enquiries Detailed Sub-Metrics'}
                {expandedCard === 'jobs' && 'Active Jobs Detailed Sub-Metrics'}
                {expandedCard === 'pm' && 'PM / AMC Detailed Sub-Metrics'}
                {expandedCard === 'breakdown' && 'Breakdown Detailed Sub-Metrics'}
              </h4>
              <button
                onClick={() => setExpandedCard(null)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer border ${
                  isLight
                    ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    : 'bg-white/5 text-white/50 hover:text-white border-white/10'
                }`}
              >
                Close
              </button>
            </div>

            {/* Render Category rows matching PDF Page 11 */}
            <div className="space-y-2">
              {expandedCard === 'enquiries' && enquiriesStats.categories.map((cat, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isLight ? 'text-slate-600 bg-slate-100' : 'text-white bg-white/5'}`}>{cat.value}</span>
                </div>
              ))}

              {expandedCard === 'jobs' && jobsStats.categories.map((cat, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isLight ? 'text-slate-600 bg-slate-100' : 'text-white bg-white/5'}`}>{cat.value}</span>
                </div>
              ))}

              {expandedCard === 'pm' && pmStats.categories.map((cat, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isLight ? 'text-slate-600 bg-slate-100' : 'text-white bg-white/5'}`}>{cat.value}</span>
                </div>
              ))}

              {expandedCard === 'breakdown' && breakdownStats.categories.map((cat, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                    <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-white/80'}`}>{cat.name}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isLight ? 'text-slate-600 bg-slate-100' : 'text-white bg-white/5'}`}>{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Budget & Expenses Widget */}
        <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>Project Expenses</h4>
            </div>
            <button 
              onClick={() => navigate('/finance')}
              className="text-[9px] text-sky-500 font-extrabold flex items-center gap-1 uppercase hover:underline cursor-pointer"
            >
              Manage <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Quick projects overview bar */}
          <div className="space-y-2.5">
            {projects.slice(0, 3).map((proj) => {
              const totalSpent = proj.expenses ? proj.expenses.reduce((s, e) => s + e.amount, 0) : 0;
              const spendRate = proj.budget > 0 ? Math.round((totalSpent / proj.budget) * 100) : 0;
              return (
                <div key={proj.id} className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="truncate max-w-[140px]">{proj.name}</span>
                    <span className="font-mono text-emerald-500">AED {totalSpent.toLocaleString()} / AED {proj.budget.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${spendRate > proj.completed ? 'bg-rose-500 animate-pulse' : 'bg-sky-500'}`} 
                      style={{ width: `${spendRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct dashboard operations */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <button 
              type="button"
              onClick={() => {
                setShowDashAddProj(!showDashAddProj);
                setShowDashAddExp(false);
              }}
              className="py-2 px-1.5 rounded-xl border border-dashed border-sky-400/30 text-sky-500 font-extrabold text-[9px] uppercase tracking-wide text-center cursor-pointer"
            >
              + Add Project
            </button>
            <button 
              type="button"
              onClick={() => {
                setShowDashAddExp(!showDashAddExp);
                setShowDashAddProj(false);
              }}
              className="py-2 px-1.5 rounded-xl bg-sky-500 text-white font-extrabold text-[9px] uppercase tracking-wide text-center cursor-pointer shadow-md"
            >
              + Log Expense
            </button>
          </div>

          {/* Inline Form: Add Project */}
          {showDashAddProj && (
            <form onSubmit={handleDashCreateProj} className={`p-3 rounded-xl border space-y-2.5 text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-sky-500">Add Project</span>
                <button type="button" onClick={() => setShowDashAddProj(false)} className="text-[9px] opacity-60">Close</button>
              </div>
              <input 
                type="text" 
                placeholder="Project / Client Name" 
                required
                value={dashProjName}
                onChange={(e) => setDashProjName(e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 border text-[11px] outline-none ${isLight ? 'bg-white text-slate-800' : 'bg-slate-950/50 text-white border-white/10'}`}
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={dashProjLocation} 
                  onChange={(e) => setDashProjLocation(e.target.value)}
                  className={`rounded-lg px-1.5 py-1.5 border text-[11px] outline-none ${isLight ? 'bg-white text-slate-800' : 'bg-slate-950/50 text-white border-white/10'}`}
                >
                  <option value="Dubai">Dubai</option>
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Sharjah">Sharjah</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Budget (AED)" 
                  required
                  value={dashProjBudget}
                  onChange={(e) => setDashProjBudget(e.target.value)}
                  className={`rounded-lg px-2.5 py-1.5 border text-[11px] outline-none font-mono ${isLight ? 'bg-white text-slate-800' : 'bg-slate-950/50 text-white border-white/10'}`}
                />
              </div>
              <button type="submit" className="w-full py-1.5 bg-sky-500 text-white text-[10px] uppercase font-black rounded-lg cursor-pointer">Create</button>
            </form>
          )}

          {/* Inline Form: Add Expense */}
          {showDashAddExp && (
            <form onSubmit={handleDashCreateExp} className={`p-3 rounded-xl border space-y-2.5 text-xs ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-sky-500">Log Expense</span>
                <button type="button" onClick={() => setShowDashAddExp(false)} className="text-[9px] opacity-60">Close</button>
              </div>
              <select 
                value={dashSelectedProj}
                onChange={(e) => setDashSelectedProj(e.target.value)}
                className={`w-full rounded-lg px-2 py-1.5 border text-[11px] outline-none ${isLight ? 'bg-white text-slate-800' : 'bg-slate-950/50 text-white border-white/10'}`}
              >
                <option value="">-- Select Project --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Expense Description" 
                required
                value={dashExpTitle}
                onChange={(e) => setDashExpTitle(e.target.value)}
                className={`w-full rounded-lg px-2.5 py-1.5 border text-[11px] outline-none ${isLight ? 'bg-white text-slate-800' : 'bg-slate-950/50 text-white border-white/10'}`}
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={dashExpCat} 
                  onChange={(e) => setDashExpCat(e.target.value as any)}
                  className={`rounded-lg px-1 py-1.5 border text-[11px] outline-none ${isLight ? 'bg-white text-slate-800' : 'bg-slate-950/50 text-white border-white/10'}`}
                >
                  <option value="Materials">Materials</option>
                  <option value="Labor">Labor</option>
                  <option value="Permits">Permits</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
                <input 
                  type="number" 
                  placeholder="Cost (AED)" 
                  required
                  value={dashExpAmount}
                  onChange={(e) => setDashExpAmount(e.target.value)}
                  className={`rounded-lg px-2.5 py-1.5 border text-[11px] outline-none font-mono ${isLight ? 'bg-white text-slate-800' : 'bg-slate-950/50 text-white border-white/10'}`}
                />
              </div>
              <button type="submit" className="w-full py-1.5 bg-sky-500 text-white text-[10px] uppercase font-black rounded-lg cursor-pointer">Save Charge</button>
            </form>
          )}

          {/* AI Home Assistant recommendation banner */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-400/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <p className="text-[10px] font-bold text-sky-400">Consult Gemini Advisor</p>
            </div>
            <button 
              type="button"
              onClick={() => navigate('/finance')}
              className="text-[9px] bg-sky-500 text-white px-2.5 py-1 rounded uppercase font-black cursor-pointer shadow-sm"
            >
              Go
            </button>
          </div>
        </div>

        {/* Live Active Incident Ticket Feed */}
        <div className={`rounded-2xl p-4 border shadow-lg space-y-3 ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
        }`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h4 className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>Active Field Logs</h4>
            </div>
            <span className="text-[8px] bg-sky-500/20 text-sky-500 dark:text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-400/20 uppercase">Live Feed</span>
          </div>

          <div className="space-y-3">
            <div className={`flex items-start gap-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
              <div className="p-1.5 bg-rose-500/20 rounded text-rose-500 dark:text-rose-400 mt-0.5">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Breakdown Escalation</p>
                  <span className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-white/40'}`}>10m ago</span>
                </div>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-white/70'}`}>ARD system error reported at Creation Plaza Tower A.</p>
                <p className="text-[10px] text-sky-500 dark:text-sky-300 font-bold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
                  Representative dispatched via live tracking.
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
              <div className="p-1.5 bg-emerald-500/20 rounded text-emerald-500 dark:text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>PM Inspection Finished</p>
                  <span className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-white/40'}`}>1h ago</span>
                </div>
                <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-600' : 'text-white/70'}`}>Routine AMC check finalized at Patil Industries Lift B.</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge type="success" text="QC Certified" />
                  <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-white/50'}`}>ID: SLA-9022</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </YStack>
    </div>

      {/* Global Filter Component fixed at bottom center of central viewport */}
      <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-1.5 py-1.5 rounded-full flex gap-1 shadow-2xl z-40 max-w-[340px] w-11/12 justify-around border ${
        isLight
          ? 'bg-white/90 backdrop-blur-md border-slate-200 shadow-slate-300/40'
          : 'bg-slate-950/80 backdrop-blur-lg border-white/15 shadow-black/80'
      }`}>
        <button
          onClick={() => setFilterMode('track')}
          className={`flex-1 py-1.5 px-3.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
            filterMode === 'track'
              ? 'bg-sky-500 text-white shadow-md'
              : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/60 hover:text-white'
          }`}
        >
          Track
        </button>
        <button
          onClick={() => setFilterMode('analyze')}
          className={`flex-1 py-1.5 px-3.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
            filterMode === 'analyze'
              ? 'bg-sky-500 text-white shadow-md'
              : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/60 hover:text-white'
          }`}
        >
          Analyze
        </button>
        <button
          onClick={() => setFilterMode('overview')}
          className={`flex-1 py-1.5 px-3.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
            filterMode === 'overview'
              ? 'bg-sky-500 text-white shadow-md'
              : isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/60 hover:text-white'
          }`}
        >
          Overview
        </button>
      </div>
    </YStack>
  );
}
