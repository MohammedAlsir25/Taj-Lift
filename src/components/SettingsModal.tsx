import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Moon, Sun, User, Briefcase, Phone, MapPin, CheckCircle, Shield, Award, LogOut, Star } from 'lucide-react';
import { useProfile, AVATAR_PRESETS } from './ProfileContext';
import { Switch } from './Tamagui';
import LegalModal from './LegalModal';

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
    lockSession
  } = useProfile();

  const [tempName, setTempName] = useState(name);
  const [tempRole, setTempRole] = useState(role);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempRegion, setTempRegion] = useState(region);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'cca'>('privacy');

  // App Rating States
  const [appRating, setAppRating] = useState<number>(() => {
    return Number(localStorage.getItem('taj_app_rating') || '0');
  });
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState<string>(() => {
    return localStorage.getItem('taj_app_rating_feedback') || '';
  });
  const [isRatingSubmitted, setIsRatingSubmitted] = useState<boolean>(() => {
    return localStorage.getItem('taj_app_rating_submitted') === 'true';
  });

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appRating === 0) return;
    localStorage.setItem('taj_app_rating', appRating.toString());
    localStorage.setItem('taj_app_rating_feedback', ratingFeedback);
    localStorage.setItem('taj_app_rating_submitted', 'true');
    setIsRatingSubmitted(true);
  };

  const handleSave = () => {
    setName(tempName);
    setRole(tempRole);
    setPhone(tempPhone);
    setRegion(tempRegion);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
      setIsSettingsOpen(false);
    }, 800);
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
                <div className="relative">
                  <img
                    src={profilePic}
                    alt="Current Avatar"
                    className="w-20 h-20 rounded-full border-3 border-sky-400 object-cover shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className={`absolute -bottom-1 -right-1 p-1.5 bg-sky-500 rounded-full text-white shadow-md border-2 ${
                    theme === 'light' ? 'border-slate-50' : 'border-slate-900'
                  }`}>
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

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

                {/* Role */}
                <div className="flex flex-col space-y-1">
                  <label className={`text-[9px] font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-500' : 'text-white/40'
                  }`}>Job Title / Role</label>
                  <div className="relative">
                    <Briefcase className={`absolute left-3 top-2.5 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`} />
                    <input
                      type="text"
                      value={tempRole}
                      onChange={(e) => setTempRole(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                        theme === 'light' 
                          ? 'bg-white border-slate-200 text-slate-800' 
                          : 'bg-white/5 border-white/10 text-white'
                      }`}
                      placeholder="Enter designation"
                    />
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
                    <MapPin className={`absolute left-3 top-2.5 w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`} />
                    <input
                      type="text"
                      value={tempRegion}
                      onChange={(e) => setTempRegion(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                        theme === 'light' 
                          ? 'bg-white border-slate-200 text-slate-800' 
                          : 'bg-white/5 border-white/10 text-white'
                      }`}
                      placeholder="Enter assigned area"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Extra Section - Stats badge */}
              <div className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
                theme === 'light' 
                  ? 'bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100 shadow-sm' 
                  : 'bg-gradient-to-r from-sky-950/25 to-blue-950/25 border-sky-500/10'
              }`}>
                <div className="p-2 bg-sky-500/15 rounded-xl text-sky-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-widest">SLA Elite Status</h4>
                  <p className={`text-[10px] mt-0.5 font-medium leading-relaxed ${
                    theme === 'light' ? 'text-slate-600' : 'text-white/70'
                  }`}>
                    99.4% on-time dispatch rate. Ranked #1 in Dubai South elevator service efficiency.
                  </p>
                </div>
              </div>

              {/* Rate the App Feedback & Rating Card */}
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                  : 'bg-[#0f172a] border-sky-500/10 text-white shadow-sky-500/5'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rate Taj Lift Portal
                  </span>
                  {isRatingSubmitted && (
                    <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      Submitted
                    </span>
                  )}
                </div>

                {!isRatingSubmitted ? (
                  <form onSubmit={handleRatingSubmit} className="space-y-3">
                    <p className={`text-[10px] leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      How do you rate the dispatch tools, interactive routes, and offline financial controls?
                    </p>

                    {/* Interactive Stars Row */}
                    <div className="flex items-center gap-2.5 justify-center py-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = star <= (hoverRating || appRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setAppRating(star)}
                            className="focus:outline-none transform hover:scale-125 active:scale-95 transition-all cursor-pointer"
                          >
                            <Star 
                              className={`w-6 h-6 transition-all duration-150 ${
                                active 
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]' 
                                  : 'text-slate-400 opacity-40'
                              }`} 
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback Text Area */}
                    <textarea
                      value={ratingFeedback}
                      onChange={(e) => setRatingFeedback(e.target.value)}
                      placeholder="Write your feedback... (e.g. Excellent speed, great offline sync)"
                      maxLength={120}
                      className={`w-full p-2.5 rounded-xl border text-[10px] outline-none resize-none h-12 transition-all ${
                        theme === 'light'
                          ? 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-400'
                          : 'bg-slate-950/40 border-white/10 text-white placeholder-white/30 focus:border-sky-500/50'
                      }`}
                    />

                    <button
                      type="submit"
                      disabled={appRating === 0}
                      className={`w-full py-2 rounded-xl text-[9px] uppercase font-black tracking-widest cursor-pointer transition-all ${
                        appRating === 0
                          ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                          : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/10'
                      }`}
                    >
                      Submit Rating
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-2 space-y-2">
                    <div className="flex justify-center gap-1.5 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-5 h-5 ${star <= appRating ? 'text-amber-400 fill-amber-400' : 'text-slate-600 opacity-20'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-emerald-500">Thank you for rating our app {appRating}/5!</p>
                    {ratingFeedback && (
                      <p className={`text-[9px] italic border-t border-white/5 pt-1.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        "{ratingFeedback}"
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsRatingSubmitted(false)}
                      className="text-[8px] text-sky-400 uppercase font-black hover:underline tracking-wide mt-1"
                    >
                      Change Rating
                    </button>
                  </div>
                )}
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

              {/* Lock Session Button */}
              <button
                type="button"
                onClick={() => {
                  lockSession();
                  setIsSettingsOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-sky-500 bg-sky-500/10 hover:bg-sky-500/15 transition-all border border-sky-500/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Shield className="w-4 h-4 text-sky-400 animate-pulse" />
                <span>Lock Session (Requires Biometrics)</span>
              </button>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsSettingsOpen(false);
                }}
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
                disabled={showSaveSuccess}
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
