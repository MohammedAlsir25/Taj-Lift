import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Calendar, MapPin, User, ChevronRight, CheckCircle2, PhoneCall, Mail, Clock, MessageSquare, Plus, BellRing, Sparkles, CheckSquare, Settings } from 'lucide-react';
import { Lead } from '../types';
import StatusBadge from '../components/StatusBadge';
import ActionBar from '../components/ActionBar';
import { useNavigate } from 'react-router-dom';
import { YStack, XStack, Heading, Text, Card, Button } from '../components/Tamagui';
import { useProfile } from '../components/ProfileContext';

export default function LeadProfile() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'followup'>('pipeline');
  const { theme } = useProfile();
  const isLight = theme === 'light';

  // Rich mock data for lead switching based on PDF Page 3
  const mockLeads: Lead[] = [
    {
      id: 'L-1024',
      name: 'Rahul Patil',
      firmName: 'Patil Industries',
      siteName: 'Creation Plaza',
      leadDate: '13/06/2025',
      assignedTo: 'Manisha Kadam',
      status: 'success',
      statusLabel: 'Won',
      phone: '+91 98230 45123',
      email: 'rahul.patil@patilind.com',
      requirements: 'Dual High-Speed Gearless 10-Passenger Elevators, premium slate interior accents with customized digital display panels.',
    },
    {
      id: 'L-1025',
      name: 'Suresh Mehta',
      firmName: 'Mehta Estates',
      siteName: 'Emerald Heights',
      leadDate: '18/06/2025',
      assignedTo: 'Ajay Shinde',
      status: 'info',
      statusLabel: 'Negotiation',
      phone: '+91 97654 32109',
      email: 'suresh@mehtagroup.in',
      requirements: 'Single MRL (Machine Room Less) Elevator, 8-Passenger capacity, standard stainless steel.',
    },
    {
      id: 'L-1026',
      name: 'Vikram Singhania',
      firmName: 'Singhania & Sons',
      siteName: 'Galaxy Towers B',
      leadDate: '22/06/2025',
      assignedTo: 'Neha Patil',
      status: 'warning',
      statusLabel: 'Follow-Up Due',
      phone: '+91 94220 88776',
      email: 'vikram.s@singhaniahousing.com',
      requirements: 'Stretcher / Bed Elevator with customized door closing speed and voice synthesizer.',
    },
    {
      id: 'L-1027',
      name: 'Priya Nair',
      firmName: 'Nair Co-Working',
      siteName: 'Vibe Square',
      leadDate: '25/06/2025',
      assignedTo: 'Rajesh Kulkarni',
      status: 'neutral',
      statusLabel: 'Draft Proposal',
      phone: '+91 95551 12233',
      email: 'p.nair@vibesquare.co',
      requirements: 'Hydraulic Freight Elevator, 2-Ton lift weight capacity, heavy-duty checker plate flooring.',
    }
  ];

  const [selectedLeadId, setSelectedLeadId] = useState<string>('L-1024');
  const currentLead = mockLeads.find(l => l.id === selectedLeadId) || mockLeads[0];

  // Follow-Up section state based on PDF Page 5
  const [followups, setFollowups] = useState([
    {
      id: 'fu-1',
      with: 'Dhananjay Mane',
      time: 'Today at 03:45 PM',
      status: 'Follow - Up for final Meeting',
      type: 'Meeting',
      notes: 'Discuss final core motor specifications, elevator car custom cabin layouts, and confirm bank letter of credit clearance details.',
      completed: false
    },
    {
      id: 'fu-2',
      with: 'Samantha Lee',
      time: 'Tomorrow at 10:00 AM',
      status: 'Pending Review',
      type: 'Proposal Review',
      notes: 'Review detailed estimation, custom quotation revisions, and discuss additional elevator speed alterations requested by structural engineers.',
      completed: false
    },
    {
      id: 'fu-3',
      with: 'Team Meeting',
      time: 'Friday at 11:00 AM',
      status: 'Scheduled',
      type: 'Internal Sync',
      notes: 'Review quarterly field delivery goals, technical checklist standards, and address urgent technician safety audit reports.',
      completed: false
    }
  ]);

  // Integrated connectors states based on PDF Page 3
  const [integrations, setIntegrations] = useState([
    { name: 'Facebook', connected: true, logo: '🌐' },
    { name: 'Google Form', connected: true, logo: '📝' },
    { name: 'Gmail', connected: true, logo: '✉️' },
    { name: 'India Mart', connected: false, logo: '🛒' },
    { name: 'Your Website', connected: true, logo: '💻' }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const toggleIntegration = (name: string) => {
    setIntegrations(prev =>
      prev.map(item =>
        item.name === name ? { ...item, connected: !item.connected } : item
      )
    );
    const item = integrations.find(i => i.name === name);
    if (item) {
      triggerNotification(`${name} is now ${!item?.connected ? 'Connected' : 'Disconnected'} successfully!`);
    }
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCompleteFollowup = (id: string) => {
    setFollowups(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    const item = followups.find(f => f.id === id);
    if (item) {
      triggerNotification(`${item.with} follow-up marked as ${!item.completed ? 'completed' : 'pending'}.`);
    }
  };

  // Simulated live countdown timer state for "Follow-Up in 2h 27m 03s"
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 27, s: 3 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) {
          return { ...prev, s: prev.s - 1 };
        } else if (prev.m > 0) {
          return { ...prev, m: prev.m - 1, s: 59 };
        } else if (prev.h > 0) {
          return { h: prev.h - 1, m: 59, s: 59 };
        } else {
          return { h: 2, m: 27, s: 3 }; // Reset loop for representation
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return `${timeLeft.h}h ${timeLeft.m}m ${timeLeft.s < 10 ? '0' + timeLeft.s : timeLeft.s}s`;
  };

  // Add Follow Up state form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWith, setNewWith] = useState('');
  const [newTime, setNewTime] = useState('Today at 05:00 PM');
  const [newNotes, setNewNotes] = useState('');

  const handleAddFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWith.trim()) return;

    const newFU = {
      id: `fu-${Date.now()}`,
      with: newWith,
      time: newTime,
      status: 'Scheduled',
      type: 'Meeting',
      notes: newNotes || 'No specific follow-up notes recorded.',
      completed: false
    };

    setFollowups([newFU, ...followups]);
    setNewWith('');
    setNewNotes('');
    setShowAddForm(false);
    triggerNotification(`New follow-up for ${newWith} scheduled successfully!`);
  };

  return (
    <YStack className={`h-full overflow-y-auto no-scrollbar pb-24 relative ${isLight ? 'text-slate-800' : 'text-white'}`}>
      {/* Header */}
      <XStack jc="space-between" ai="center" className={`px-4 py-3.5 sticky top-0 z-10 border-b transition-colors duration-300 ${
        isLight ? 'bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm' : 'bg-[#0f1524]/85 backdrop-blur-md border-white/10'
      }`}>
        <XStack ai="center" className="gap-3">
          <button
            id="btn-lead-back"
            onClick={() => navigate('/')}
            className={`p-1 cursor-pointer transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Heading level={4} className={`text-sm font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Lead Capture CRM</Heading>
        </XStack>
        <span className="text-[10px] bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold px-2.5 py-0.5 rounded-full border border-sky-400/20">
          Live Sync
        </span>
      </XStack>

      {/* Sub-Tab Switcher - Replicating beautiful Tamagui segments */}
      <XStack className={`px-4 pt-3 pb-1.5 border-b flex gap-2 ${
        isLight ? 'bg-slate-100 border-slate-200/60' : 'bg-white/5 border-white/10'
      }`}>
        <Button
          variant={activeSubTab === 'pipeline' ? 'primary' : 'secondary'}
          onClick={() => setActiveSubTab('pipeline')}
          className="flex-1 py-2"
        >
          Active Pipeline
        </Button>
        <Button
          variant={activeSubTab === 'followup' ? 'primary' : 'secondary'}
          onClick={() => setActiveSubTab('followup')}
          className="flex-1 py-2"
        >
          Follow-Up Logs
        </Button>
      </XStack>

      {/* Notification Toast */}
      {notification && (
        <div className={`absolute top-28 left-4 right-4 z-30 border p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideDown_0.2s_ease-out_forwards] ${
          isLight ? 'bg-slate-900 border-slate-950/20 text-white' : 'bg-slate-950/95 border-emerald-500/25 text-white'
        }`}>
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold">{notification}</p>
        </div>
      )}

      {activeSubTab === 'pipeline' ? (
        <div className="p-4 space-y-4">
          
          {/* Slogan Intro */}
          <div className={`p-3.5 rounded-2xl border text-center ${
            isLight ? 'bg-sky-50 border-sky-200/60 text-sky-800' : 'bg-gradient-to-r from-sky-500/20 to-blue-500/10 border-sky-500/15'
          }`}>
            <p className={`text-[11px] font-bold ${isLight ? 'text-sky-800' : 'text-sky-200'}`}>
              Capture potential clients instantly through QR scans & digital sheets.
            </p>
          </div>

          {/* Pipeline Lead Selector Scrollable list */}
          <div className="space-y-2">
            <p className={`text-[10px] font-bold uppercase tracking-widest px-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Active Leads Pipeline</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {mockLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`flex-none px-3.5 py-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedLeadId === lead.id
                      ? 'bg-sky-500 text-white border-sky-400/25 shadow-lg'
                      : isLight ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{lead.name}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    lead.status === 'success' ? 'bg-emerald-500' :
                    lead.status === 'warning' ? 'bg-amber-500' : 'bg-sky-500'
                  }`}></span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Lead details card */}
          <div className={`rounded-2xl p-4 shadow-lg space-y-3.5 relative overflow-hidden border ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
          }`}>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 to-blue-500"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-bold text-sky-500 dark:text-sky-400 uppercase tracking-widest font-mono">Lead ID: {currentLead.id}</span>
                <h3 className={`text-base font-extrabold mt-0.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentLead.name}</h3>
                <p className={`text-xs flex items-center gap-1 mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                  <Mail className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
                  {currentLead.email}
                </p>
              </div>
              <StatusBadge type={currentLead.status} text={currentLead.statusLabel} />
            </div>

            {/* Spec Table */}
            <div className={`rounded-xl border overflow-hidden ${
              isLight ? 'bg-slate-50 border-slate-200/80 divide-y divide-slate-200/60' : 'bg-white/5 border-white/10 divide-y divide-white/5'
            }`}>
              <div className="flex items-center gap-3 px-3 py-2.5">
                <MapPin className="w-4 h-4 text-sky-500 flex-none" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[9px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Site Location</p>
                  <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentLead.siteName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-3 py-2.5">
                <Building2 className="w-4 h-4 text-amber-500 flex-none" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[9px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Client / Firm Name</p>
                  <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentLead.firmName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-3 py-2.5">
                <User className="w-4 h-4 text-emerald-500 flex-none" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[9px] uppercase font-bold ${isLight ? 'text-slate-500' : 'text-white/40'}`}>Sales Owner</p>
                  <p className={`text-xs font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentLead.assignedTo}</p>
                </div>
              </div>
            </div>

            {/* Custom Notes */}
            <div className={`p-3 rounded-xl border space-y-1 ${
              isLight ? 'bg-sky-50/50 border-sky-100' : 'bg-white/5 border-white/5'
            }`}>
              <span className="text-[9px] font-bold text-sky-600 dark:text-sky-300 uppercase block tracking-wider">Project Needs</span>
              <p className={`text-xs leading-relaxed font-medium ${isLight ? 'text-slate-700' : 'text-white/85'}`}>
                {currentLead.requirements}
              </p>
            </div>

            {/* Real Action Bar */}
            <div className="pt-1.5 font-sans">
              <ActionBar
                phoneNumber={currentLead.phone}
                onCall={() => triggerNotification(`Simulating call to ${currentLead.name} (${currentLead.phone})...`)}
                onWhatsApp={() => triggerNotification(`Opening WhatsApp for ${currentLead.name}...`)}
              />
            </div>
          </div>

          {/* CRM AUTOMATIONS / INTEGRATIONS - Page 3 exact integrations list */}
          <div className={`rounded-2xl p-4 border shadow-lg space-y-3 ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>CRM Source Connectors</h4>
                <p className={`text-[9px] font-medium ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Sync inbound leads to live database</p>
              </div>
              <Settings className="w-4 h-4 text-sky-500 animate-[spin_10s_linear_infinite]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {integrations.map((item) => (
                <button
                  key={item.name}
                  onClick={() => toggleIntegration(item.name)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    item.connected
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/15'
                      : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{item.logo}</span>
                    <span>{item.name}</span>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.connected ? 'bg-emerald-500 animate-pulse' : isLight ? 'bg-slate-300' : 'bg-white/20'}`}></span>
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-4 space-y-4">
          
          {/* Organised Follow-ups Slogan with active Countdown */}
          <div className={`rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden border ${
            isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 border-white/10'
          }`}>
            <div className="absolute right-[-15px] bottom-[-15px] opacity-10 pointer-events-none">
              <Clock className={`w-24 h-24 ${isLight ? 'text-slate-300' : 'text-sky-400'}`} />
            </div>

            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest block flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                Upcoming Task Countdown
              </span>
              <h3 className={`text-xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatTime()}</h3>
              <p className={`text-[10px] font-semibold italic ${isLight ? 'text-sky-600' : 'text-sky-300'}`}>
                &ldquo;Every Lead has a Potential. Don&apos;t lose any with organized Followups&rdquo;
              </p>
            </div>
          </div>

          {/* Quick Add Follow-up button */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer font-sans"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Follow-up</span>
            </button>
          ) : (
            <form onSubmit={handleAddFollowup} className={`rounded-2xl p-4 shadow-xl space-y-3 animate-[slideDown_0.2s_ease-out_forwards] border ${
              isLight ? 'bg-white border-slate-200' : 'bg-white/10 border-white/15'
            }`}>
              <div className={`flex justify-between items-center border-b pb-2 ${isLight ? 'border-slate-200' : 'border-white/15'}`}>
                <span className="text-xs font-bold uppercase text-sky-500 dark:text-sky-300">New Follow-Up</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`text-[10px] ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white'}`}
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Contact Name</label>
                  <input
                    type="text"
                    required
                    value={newWith}
                    onChange={(e) => setNewWith(e.target.value)}
                    placeholder="e.g. Dhananjay Mane"
                    className={`w-full rounded-xl px-3 py-2 outline-none transition-all border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-white/5 border-white/10 text-white focus:border-sky-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Time & Date</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. Today at 03:45 PM"
                    className={`w-full rounded-xl px-3 py-2 outline-none transition-all border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-white/5 border-white/10 text-white focus:border-sky-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] uppercase font-bold mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Task Notes</label>
                  <textarea
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Discuss final layout specs..."
                    className={`w-full rounded-xl px-3 py-2 outline-none transition-all h-16 resize-none border ${
                      isLight ? 'bg-white border-slate-200 text-slate-800 focus:border-sky-400' : 'bg-white/5 border-white/10 text-white focus:border-sky-400'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-sky-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm font-sans"
              >
                Save Scheduled Follow-up
              </button>
            </form>
          )}

          {/* Chronological List of Follow-up items from PDF Page 5 */}
          <div className="space-y-3.5">
            <p className={`text-[10px] font-bold uppercase tracking-widest px-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Scheduled Activities</p>
            
            {followups.map((fu) => (
              <div
                key={fu.id}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  fu.completed
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60'
                    : isLight ? 'bg-white border-slate-200 shadow-lg shadow-slate-200/40' : 'bg-white/10 border-white/10 shadow-lg'
                }`}
              >
                {/* Horizontal status line */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                      isLight ? 'bg-slate-100 text-sky-600 border-slate-200' : 'bg-white/5 text-sky-300 border-white/10'
                    }`}>
                      {fu.type}
                    </span>
                    <h4 className={`text-sm font-extrabold mt-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>{fu.with}</h4>
                  </div>
                  <button
                    onClick={() => handleCompleteFollowup(fu.id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      fu.completed
                        ? 'bg-emerald-500 text-white border-emerald-400/20'
                        : isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-white/5 hover:bg-white/10 text-white/60 border-white/10'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-300 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{fu.time}</span>
                  </div>
                  
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <span className={`text-[9px] font-bold block uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/40'}`}>Goal / Notes</span>
                    <p className={`text-[11px] leading-relaxed font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-white/80'}`}>
                      {fu.notes}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </YStack>
  );
}
