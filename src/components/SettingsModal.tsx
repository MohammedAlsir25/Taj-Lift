import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Moon, Sun, User, Briefcase, Phone, MapPin, CheckCircle, Shield, Award, LogOut, Star, Database, Trash2, RefreshCw, Mail } from 'lucide-react';
import { useProfile, AVATAR_PRESETS } from './ProfileContext';
import { Switch } from './Tamagui';
import LegalModal from './LegalModal';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function SettingsModal() {
  const {
    profilePic,
    setProfilePic,
    name,
    setName,
    role,
    setRole,
    theme,
    setTheme,
    isAvailable,
    setIsAvailable,
    isSettingsOpen,
    setIsSettingsOpen,
    phone,
    setPhone,
    region,
    setRegion,
    logout,
    lockSession,
    currentUser
  } = useProfile();

  const [tempName, setTempName] = useState(name);
  const [tempRole, setTempRole] = useState(role);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempRegion, setTempRegion] = useState(region);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    if (isSettingsOpen) {
      setTempName(name || '');
      setTempRole(role || '');
      setTempPhone(phone || '');
      setTempRegion(region || '');
    }
  }, [isSettingsOpen, name, role, phone, region]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePic(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'cca'>('privacy');

  // Loading Screen & Confirmation States
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);

  const handleSave = () => {
    setLoadingMessage("Updating your secure personnel profile...");
    setTimeout(() => {
      setName(tempName);
      setRole(tempRole);
      setPhone(tempPhone);
      setRegion(tempRegion);
      setLoadingMessage(null);
      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
        setIsSettingsOpen(false);
      }, 800);
    }, 1200);
  };

  const [isResetting, setIsResetting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const handleResetDatabase = async () => {
    setShowPurgeConfirm(false);
    setLoadingMessage("Purging live database... Deleting mock projects, leads, breakdowns, payments, and schedules...");
    setIsResetting(true);
    try {
      const collectionsToClear = [
        "projects",
        "leads",
        "pm_slots",
        "breakdowns",
        "payments",
        "followups"
      ];
      
      for (const colName of collectionsToClear) {
        const querySnapshot = await getDocs(collection(db, colName));
        const batch = writeBatch(db);
        querySnapshot.forEach((document) => {
          batch.delete(doc(db, colName, document.id));
        });
        await batch.commit();
        
        // Also clear local cache to prevent stale render
        localStorage.removeItem(`taj_cache_${colName}`);
      }
      
      // Clear general sync states
      localStorage.removeItem("taj_pending_writes");
      
      setResetCompleted(true);
      setLoadingMessage("Workspace primed successfully! Reloading portal application...");
      setTimeout(() => {
        setResetCompleted(false);
        setLoadingMessage(null);
        // Force reload the page to refresh all active listeners/states
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error clearing mock database:", error);
      setLoadingMessage(null);
      alert("Failed to reset database: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsResetting(false);
    }
  };

  const handleLockSession = () => {
    setLoadingMessage("Securing portal and locking workspace...");
    setTimeout(() => {
      lockSession();
      setLoadingMessage(null);
      setIsSettingsOpen(false);
    }, 1000);
  };

  const handleSignOut = () => {
    setLoadingMessage("Terminating session and signing out of Taj Lift Portal...");
    setTimeout(async () => {
      await logout();
      setLoadingMessage(null);
      setIsSettingsOpen(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSettingsOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-[9998] pointer-events-auto"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`absolute bottom-0 left-0 right-0 h-[88%] rounded-t-[32px] border-t z-[9999] pointer-events-auto flex flex-col overflow-hidden shadow-2xl transition-colors duration-300 ${
              theme === 'light' 
                ? 'bg-slate-50 border-slate-200 text-slate-800' 
                : 'bg-[#0f1524] border-white/10 text-white'
            }`}
          >
            {/* Grabber indicator */}
            <div className="flex justify-center py-2.5 flex-none">
              <div className={`w-12 h-1.5 rounded-full ${theme === 'light' ? 'bg-slate-300' : 'bg-white/20'}`} />
            </div>

            {/* Header */}
            <div className={`px-5 pb-3 pt-1 flex items-center justify-between border-b flex-none ${
              theme === 'light' ? 'border-slate-200' : 'border-white/5'
            }`}>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider">Manager Profile</h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  theme === 'light' ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-6 pb-20">
              
              {/* Profile Pic Selection */}
              <div className="flex flex-col items-center space-y-3.5">
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload profile picture"
                >
                  <img
                    src={profilePic}
                    alt="Current Avatar"
                    className="w-20 h-20 rounded-full border-3 border-sky-400 object-cover shadow-xl group-hover:brightness-95 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1.5 bg-sky-500 rounded-full text-white shadow-md border-2 group-hover:scale-110 transition-all ${
                    theme === 'light' ? 'border-slate-50' : 'border-slate-900'
                  }`}>
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Horizontal Quick Presets list */}
                <div className="w-full flex flex-col space-y-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${
                    theme === 'light' ? 'text-slate-500' : 'text-white/40'
                  }`}>
                    Quick Select Avatar Preset
                  </span>
                  <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-2 no-scrollbar">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setProfilePic(preset.url)}
                        className={`relative rounded-full p-0.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          profilePic === preset.url
                            ? 'ring-2 ring-sky-400 scale-105 shadow-md shadow-sky-400/20'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-10 h-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {profilePic === preset.url && (
                          <div className="absolute -top-1 -right-1 bg-sky-400 rounded-full p-0.5">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative rounded-full w-11 h-11 flex items-center justify-center border border-dashed transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                        !AVATAR_PRESETS.some(p => p.url === profilePic)
                          ? 'ring-2 ring-sky-400 scale-105 shadow-md shadow-sky-400/20 border-sky-400 text-sky-400'
                          : 'opacity-70 hover:opacity-100 text-slate-400 border-slate-300'
                      }`}
                      title="Upload custom image"
                    >
                      {(!AVATAR_PRESETS.some(p => p.url === profilePic) && profilePic.startsWith('data:image/')) ? (
                        <img
                          src={profilePic}
                          alt="Custom Upload"
                          className="w-full h-full rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status & Availability switches */}
              <div className={`p-3.5 rounded-2xl border ${
                theme === 'light' 
                  ? 'bg-white border-slate-200/80 shadow-sm' 
                  : 'bg-white/5 border-white/5'
              }`}>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-sky-400 mb-3">Availability Status</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">Duty Status Indicator</p>
                    <p className={`text-[9px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-white/50'}`}>
                      {isAvailable ? '🟢 Active & On-Duty (Live Updates)' : '🔴 Break / Offline (Silent Mode)'}
                    </p>
                  </div>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                  />
                </div>
              </div>

              {/* Interactive Settings: Theme selector */}
              <div className={`p-3.5 rounded-2xl border ${
                theme === 'light' 
                  ? 'bg-white border-slate-200/80 shadow-sm' 
                  : 'bg-white/5 border-white/5'
              }`}>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-sky-400 mb-3">Preferences</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold">System Appearance</p>
                    <p className={`text-[9px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-white/50'}`}>
                      {theme === 'dark' ? '🌌 Cosmic Twilight Dark' : '☀️ Frosted Ice Light'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                    <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-sky-400' : 'text-slate-400'}`} />
                  </div>
                </div>
              </div>

              {/* Edit Details Forms */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-sky-400">Personnel Details</h3>
                
                {/* Name */}
                <div className="flex flex-col space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-500' : 'text-white/40'
                  }`}>Full Name</label>
                  <div className="relative">
                    <User className={`absolute left-3 top-2.5 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`} />
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                        theme === 'light' 
                          ? 'bg-white border-slate-200 text-slate-800' 
                          : 'bg-white/5 border-white/10 text-white'
                      }`}
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="flex flex-col space-y-1 opacity-80">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-500' : 'text-white/40'
                  }`}>Work Email Address (Read-only)</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-2.5 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`} />
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || ''}
                      className={`w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border outline-none cursor-not-allowed ${
                        theme === 'light' 
                          ? 'bg-slate-100 border-slate-200 text-slate-500' 
                          : 'bg-white/5 border-white/5 text-white/50'
                      }`}
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="flex flex-col space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-500' : 'text-white/40'
                  }`}>Job Title / Role</label>
                  <div className="relative">
                    <Briefcase className={`absolute left-3 top-2.5 w-4 h-4 z-10 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`} />
                    <select
                      value={tempRole}
                      onChange={(e) => setTempRole(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all cursor-pointer relative ${
                        theme === 'light' 
                          ? 'bg-white border-slate-200 text-slate-800' 
                          : 'bg-[#151c30] border-white/10 text-white'
                      }`}
                    >
                      <option value="Field Technician" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Field Technician</option>
                      <option value="Maintenance Supervisor" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Maintenance Supervisor</option>
                      <option value="Taj Operations Lead" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Taj Operations Lead</option>
                      <option value="Regional Director" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Regional Director</option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-500' : 'text-white/40'
                  }`}>Operational Phone</label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-2.5 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`} />
                    <input
                      type="text"
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                        theme === 'light' 
                          ? 'bg-white border-slate-200 text-slate-800' 
                          : 'bg-white/5 border-white/10 text-white'
                      }`}
                      placeholder="Enter mobile number"
                    />
                  </div>
                </div>

                {/* Region */}
                <div className="flex flex-col space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-500' : 'text-white/40'
                  }`}>Assigned Region</label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-2.5 w-4 h-4 z-10 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`} />
                    <select
                      value={tempRegion}
                      onChange={(e) => setTempRegion(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all cursor-pointer relative ${
                        theme === 'light' 
                          ? 'bg-white border-slate-200 text-slate-800' 
                          : 'bg-[#151c30] border-white/10 text-white'
                      }`}
                    >
                      <option value="Dubai Marina & JBR" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Dubai Marina & JBR</option>
                      <option value="Dubai South & Jebel Ali" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Dubai South & Jebel Ali</option>
                      <option value="Downtown & Business Bay" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Downtown & Business Bay</option>
                      <option value="Pune & Maharashtra" className={theme === 'light' ? 'text-slate-800' : 'bg-[#151c30] text-white'}>Pune & Maharashtra</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Legal & Regulatory Compliance Section */}
              <div className={`p-3.5 rounded-2xl border ${
                theme === 'light' 
                  ? 'bg-white border-slate-200/80 shadow-sm' 
                  : 'bg-white/5 border-white/5'
              }`}>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-sky-400 mb-1.5">Legal & Regulatory Compliance</h3>
                <p className={`text-[9.5px] leading-relaxed mb-3 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Review our corporate policies, data protections, and regional/global accessibility compliance certifications.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLegalTab('privacy');
                      setIsLegalOpen(true);
                    }}
                    className={`py-2 px-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider text-center cursor-pointer transition-all border ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-slate-950/40 hover:bg-slate-900/60 border-white/5 text-white/90'
                    }`}
                  >
                    Privacy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLegalTab('terms');
                      setIsLegalOpen(true);
                    }}
                    className={`py-2 px-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider text-center cursor-pointer transition-all border ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-slate-950/40 hover:bg-slate-900/60 border-white/5 text-white/90'
                    }`}
                  >
                    Terms
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLegalTab('cca');
                      setIsLegalOpen(true);
                    }}
                    className={`py-2 px-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider text-center cursor-pointer transition-all border ${
                      theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        : 'bg-slate-950/40 hover:bg-slate-900/60 border-white/5 text-white/90'
                    }`}
                  >
                    CCA
                  </button>
                </div>
              </div>

              {/* Database reset section */}
              <div className={`p-4 rounded-2xl border ${
                theme === 'light' 
                  ? 'bg-red-50/50 border-red-100 shadow-sm' 
                  : 'bg-red-950/10 border-red-500/10'
              }`}>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" /> Workspace Preparation (Client Slate)
                </h3>
                <p className={`text-[9.5px] leading-relaxed mb-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Prepare this application for deployment to your client. This will completely purge all sample/mock data including projects, leads, service schedule slots, breakdown reports, payments, and followups. Your admin login credentials will remain intact.
                </p>
                
                <button
                  type="button"
                  onClick={() => setShowPurgeConfirm(true)}
                  disabled={isResetting || resetCompleted}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                    resetCompleted
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 text-rose-400'
                  }`}
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                      <span>Resetting Database...</span>
                    </>
                  ) : resetCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span>Purged Successfully! Reloading...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Purge Sample Data & Start Fresh</span>
                    </>
                  )}
                </button>
              </div>

              {/* Lock Session Button */}
              <button
                type="button"
                onClick={handleLockSession}
                className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-sky-500 bg-sky-500/10 hover:bg-sky-500/15 transition-all border border-sky-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Shield className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Lock Session (Requires Biometrics)</span>
              </button>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 hover:bg-rose-500/15 transition-all border border-rose-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <LogOut className="w-4 h-4 animate-pulse" />
                <span>Sign Out of Portal</span>
              </button>

            </div>

            {/* Bottom Actions Footer */}
            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t flex gap-2.5 z-10 ${
              theme === 'light' 
                ? 'bg-white border-slate-200' 
                : 'bg-[#0b0f19] border-white/15'
            }`}>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 active:scale-98'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 active:scale-98'
                }`}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={showSaveSuccess || !!loadingMessage}
                className={`flex-[1.5] py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-widest text-white transition-all bg-sky-500 shadow-lg shadow-sky-500/20 hover:bg-sky-600 cursor-pointer active:scale-98 flex items-center justify-center gap-1.5`}
              >
                {showSaveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 animate-bounce" />
                    <span>Saved!</span>
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>

            {/* Custom Purge Confirmation Overlay */}
            <AnimatePresence>
              {showPurgeConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-[99999] flex flex-col items-center justify-center p-6"
                >
                  <div className={`p-6 rounded-3xl border w-full max-w-xs text-center space-y-4 shadow-2xl ${
                    theme === 'light' 
                      ? 'bg-white border-slate-200 text-slate-800' 
                      : 'bg-[#131929] border-rose-500/20 text-white'
                  }`}>
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto animate-bounce">
                      <Trash2 className="w-6 h-6" />
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-wider text-rose-500">
                        System Purge Required?
                      </h4>
                      <p className={`text-[10px] font-semibold leading-relaxed mt-2 ${
                        theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        Are you absolutely sure you want to permanently delete all sample/mock projects, leads, breakdowns, schedule slots, payments, and followups from the live database?
                      </p>
                      <p className="text-[9.5px] font-bold text-rose-400 mt-1 leading-normal italic">
                        This action is irreversible and prepares the workspace as a pristine clean slate for your client.
                      </p>
                    </div>
                    
                    <div className="flex gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPurgeConfirm(false)}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          theme === 'light'
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            : 'bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleResetDatabase}
                        className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer"
                      >
                        Purge Now
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Global Loading Overlay Screen */}
            <AnimatePresence>
              {loadingMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-[100000] flex flex-col items-center justify-center p-6 text-center select-none"
                >
                  <div className="relative mb-6">
                    {/* Outer glowing pulse ring */}
                    <div className="absolute inset-x-0 top-0 bottom-0 rounded-full bg-sky-500/10 blur-xl animate-pulse" />
                    {/* Spinner */}
                    <RefreshCw className="w-12 h-12 text-sky-400 animate-spin relative z-10" />
                  </div>
                  
                  <h3 className="text-sm font-black uppercase tracking-widest text-sky-400 mb-2">
                    Processing Request
                  </h3>
                  
                  <p className="text-xs font-medium text-slate-300 max-w-xs leading-relaxed animate-pulse">
                    {loadingMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <LegalModal
            isOpen={isLegalOpen}
            onClose={() => setIsLegalOpen(false)}
            initialTab={legalTab}
            theme={theme}
          />
        </>
      )}
    </AnimatePresence>
  );
}
