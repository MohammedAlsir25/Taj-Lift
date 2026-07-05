import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, ShieldCheck, KeyRound, Check, RefreshCw, X, AlertCircle, 
  Sparkles, ShieldAlert, Smartphone, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfile } from './ProfileContext';

interface BiometricGateProps {
  children: React.ReactNode;
}

export default function BiometricGate({ children }: BiometricGateProps) {
  const { currentUser, theme, isBiometricallyVerified, setIsBiometricallyVerified } = useProfile();
  const isLight = theme === 'light';

  const [authMode, setAuthMode] = useState<'face' | 'fingerprint'>('fingerprint');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Ready to secure');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // PIN backup variables
  const [showPinBackup, setShowPinBackup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Reset internal gate states when biometric status is locked again
  useEffect(() => {
    if (!isBiometricallyVerified) {
      setIsSuccess(false);
      setIsScanning(false);
      setScanProgress(0);
      setScanStatusText('Ready to secure');
      setShowPinBackup(false);
      setPinInput('');
    }
  }, [isBiometricallyVerified]);

  // Auto-trigger biometric scan when the screen loads for realism
  useEffect(() => {
    if (currentUser && !isBiometricallyVerified && !showPinBackup) {
      const autoStartTimer = setTimeout(() => {
        handleStartScan();
      }, 800); // Trigger auto-scan in 800ms
      return () => clearTimeout(autoStartTimer);
    }
  }, [currentUser, isBiometricallyVerified, authMode, showPinBackup]);

  if (!currentUser) {
    return <>{children}</>;
  }

  if (isBiometricallyVerified) {
    return <>{children}</>;
  }

  const handleStartScan = () => {
    if (isScanning || isSuccess) return;
    setIsScanning(true);
    setIsError(false);
    setScanProgress(0);
    setScanStatusText('Initializing sensor array...');

    const statuses = [
      'Accessing encrypted enclave...',
      'Capturing biometric signature...',
      'Matching mathematical hash...',
      'Contacting Taj core vault...',
      'Verifying security clearance...'
    ];

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += Math.floor(Math.random() * 12) + 8;
      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(interval);
        setScanProgress(100);
        setScanStatusText('Clearance Granted!');
        setIsSuccess(true);
        setIsScanning(false);
        
        // Final success delay before entering the app
        setTimeout(() => {
          sessionStorage.setItem('taj_biometric_verified', 'true');
          setIsBiometricallyVerified(true);
        }, 1000);
      } else {
        setScanProgress(currentProg);
        const textIdx = Math.floor((currentProg / 100) * statuses.length);
        setScanStatusText(statuses[textIdx] || 'Analyzing data...');
      }
    }, 150);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '9999' || pinInput.length === 4) {
      setIsSuccess(true);
      setScanStatusText('PIN Accepted');
      setTimeout(() => {
        sessionStorage.setItem('taj_biometric_verified', 'true');
        setIsBiometricallyVerified(true);
      }, 1000);
    } else {
      setPinError(true);
      setPinInput('');
      setTimeout(() => setPinError(false), 1000);
    }
  };

  const handlePinPress = (num: string) => {
    if (pinInput.length < 4) {
      const newVal = pinInput + num;
      setPinInput(newVal);
      if (newVal.length === 4) {
        // Auto-validate 4 digits
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          // Allow any 4-digit PIN for dynamic prototype ease, but 1234/9999 as standard
          setIsSuccess(true);
          setScanStatusText('Clearance Granted');
          setTimeout(() => {
            sessionStorage.setItem('taj_biometric_verified', 'true');
            setIsBiometricallyVerified(true);
          }, 800);
        }, 600);
      }
    }
  };

  const handlePinDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  return (
    <div className={`absolute inset-0 z-[10000] flex flex-col justify-between overflow-hidden p-6 font-sans select-none transition-all duration-300 ${
      isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#0a0d16] text-white'
    }`}>
      
      {/* Absolute neon grid overlay for biometric tech aesthetic */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(14,165,233,0.06)_0%,_transparent_75%)] pointer-events-none z-0" />

      {/* Top Security Status Header */}
      <div className="relative z-10 text-center pt-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] uppercase font-bold tracking-widest ${
          isLight 
            ? 'bg-slate-200/50 border-slate-300 text-slate-600' 
            : 'bg-white/5 border-white/10 text-sky-400'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
          <span>Encrypted Session Lock</span>
        </div>
        <p className={`text-[10px] mt-2 uppercase tracking-widest font-bold opacity-60 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
          Taj Lift Security Node
        </p>
      </div>

      {/* Main Verification View Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {!showPinBackup ? (
            <motion.div
              key="biometric-scan-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center"
            >
              {/* Profile Avatar indicator */}
              <div className="flex flex-col items-center mb-6">
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 shadow-lg relative ${
                  isLight ? 'border-sky-500/50 shadow-slate-200' : 'border-sky-500/30 shadow-black/40'
                }`}>
                  <img 
                    src={currentUser.profilePic} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover rounded-full" 
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0d16] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                </div>
                <h2 className="text-sm font-extrabold mt-2 tracking-tight">{currentUser.name}</h2>
                <span className={`text-[9px] uppercase tracking-wider font-bold opacity-70 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                  {currentUser.role}
                </span>
              </div>

              {/* Toggle switch between Face ID and Touch ID */}
              <div className={`flex p-1 rounded-xl mb-8 border ${
                isLight ? 'bg-slate-200/60 border-slate-300' : 'bg-white/5 border-white/10'
              }`}>
                <button
                  onClick={() => { setAuthMode('fingerprint'); setIsError(false); }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    authMode === 'fingerprint'
                      ? (isLight ? 'bg-white text-slate-900 shadow' : 'bg-sky-500 text-white shadow-lg shadow-sky-500/20')
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Touch ID
                </button>
                <button
                  onClick={() => { setAuthMode('face'); setIsError(false); }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    authMode === 'face'
                      ? (isLight ? 'bg-white text-slate-900 shadow' : 'bg-sky-500 text-white shadow-lg shadow-sky-500/20')
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Face ID
                </button>
              </div>

              {/* Scanner Target Circle */}
              <div className="relative mb-8">
                {/* External breathing ripple circle */}
                <motion.div
                  animate={{ scale: isScanning ? [1, 1.1, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className={`absolute -inset-4 rounded-full border border-dashed opacity-25 pointer-events-none ${
                    isSuccess ? 'border-emerald-500' : isLight ? 'border-slate-400' : 'border-sky-500'
                  }`}
                />

                {/* Main sensor pad */}
                <button
                  onClick={handleStartScan}
                  disabled={isScanning || isSuccess}
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300 relative overflow-hidden group shadow-xl ${
                    isSuccess 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/10'
                      : isScanning
                        ? 'bg-sky-500/5 border-sky-400 text-sky-400'
                        : isLight
                          ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-500'
                          : 'bg-[#121824] hover:bg-[#151c2c] border-white/10 text-white hover:border-sky-500/50 hover:text-sky-400'
                  }`}
                >
                  {/* Virtual Scanning Sweep line */}
                  {isScanning && (
                    <motion.div
                      initial={{ y: -64 }}
                      animate={{ y: 64 }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut', repeatType: 'reverse' }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent shadow-[0_0_8px_rgba(14,165,233,0.8)] z-10"
                    />
                  )}

                  {/* Icon displays depending on selected mode */}
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success-icon"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="text-emerald-500"
                      >
                        <Check className="w-14 h-14 stroke-[3]" />
                      </motion.div>
                    ) : authMode === 'fingerprint' ? (
                      <motion.div
                        key="fingerprint-icon"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`transition-all duration-300 ${isScanning ? 'text-sky-400 animate-pulse' : ''}`}
                      >
                        <Fingerprint className="w-16 h-16 stroke-[1.2] group-hover:scale-105 transition-transform" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="faceid-icon"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`relative transition-all duration-300 ${isScanning ? 'text-sky-400 animate-pulse' : ''}`}
                      >
                        {/* Custom camera alignment box outline mock */}
                        <div className="w-16 h-16 border-2 border-dashed border-current rounded-2xl flex items-center justify-center">
                          <div className="w-8 h-8 border border-current rounded-full flex items-center justify-center opacity-60">
                            <div className="w-2 h-2 bg-current rounded-full" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Circular scanning ring border indicator */}
                  {isScanning && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        className="stroke-sky-500/10"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        className="stroke-sky-500"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="376.8"
                        strokeDashoffset={376.8 - (376.8 * scanProgress) / 100}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.15s ease-out' }}
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Status information readout block */}
              <div className="text-center h-12 flex flex-col justify-center">
                <p className={`text-xs font-semibold tracking-wide ${
                  isSuccess ? 'text-emerald-500' : isLight ? 'text-slate-800' : 'text-white'
                }`}>
                  {scanStatusText}
                </p>
                {isScanning && (
                  <p className="text-[10px] text-sky-500 font-mono mt-1 font-bold">
                    SECURE SIGNATURE ENVELOPE: {scanProgress}%
                  </p>
                )}
                {!isScanning && !isSuccess && (
                  <p className={`text-[10px] opacity-50 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                    {authMode === 'fingerprint' ? 'Hold finger on the sensor area to begin scanning' : 'Position phone and click to unlock with FaceID'}
                  </p>
                )}
              </div>

              {/* Call to action button */}
              {!isScanning && !isSuccess && (
                <button
                  onClick={handleStartScan}
                  className="mt-6 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[11px] font-extrabold uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-98 transition-all cursor-pointer"
                >
                  Unlock Device Session
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="pin-backup-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[280px] flex flex-col items-center"
            >
              {/* Back to biometric link */}
              <button
                onClick={() => { setShowPinBackup(false); setPinInput(''); }}
                className="self-start flex items-center gap-1.5 text-[10px] uppercase font-bold text-sky-500 hover:text-sky-400 mb-6 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Use Biometrics</span>
              </button>

              <h2 className="text-sm font-extrabold text-center tracking-tight">Enter Secure PIN</h2>
              <p className={`text-[9px] uppercase tracking-wider text-center opacity-60 mb-6 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                Enter 4-Digit Field Access Credential
              </p>

              {/* Pin indicator dots */}
              <div className="flex gap-4 mb-8">
                {[0, 1, 2, 3].map((index) => {
                  const hasValue = pinInput.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                        pinError 
                          ? 'bg-red-500 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                          : isSuccess
                            ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : hasValue
                              ? 'bg-sky-500 border-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]'
                              : isLight
                                ? 'border-slate-300 bg-slate-100'
                                : 'border-white/20 bg-slate-900'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Custom numerical PIN pad */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinPress(num)}
                    className={`h-12 rounded-xl text-sm font-black flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      isLight 
                        ? 'bg-slate-200/60 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-300/40' 
                        : 'bg-white/5 hover:bg-white/10 active:scale-95 text-white border border-white/5'
                    }`}
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  type="button"
                  onClick={handlePinDelete}
                  className={`h-12 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/50'
                  }`}
                >
                  Del
                </button>

                <button
                  type="button"
                  onClick={() => handlePinPress('0')}
                  className={`h-12 rounded-xl text-sm font-black flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    isLight 
                      ? 'bg-slate-200/60 hover:bg-slate-200 active:scale-95 text-slate-800 border border-slate-300/40' 
                      : 'bg-white/5 hover:bg-white/10 active:scale-95 text-white border border-white/5'
                  }`}
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Quick clear
                    setPinInput('');
                  }}
                  className={`h-12 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center transition-all duration-150 cursor-pointer ${
                    isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-white/50'
                  }`}
                >
                  Clear
                </button>
              </div>

              {pinError && (
                <p className="text-[10px] text-red-500 font-bold mt-4 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Correct PIN is 1234 or 9999
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backup PIN/Biometrics Option switch Link Footer */}
      <div className="relative z-10 text-center pb-2">
        {!showPinBackup ? (
          <button
            onClick={() => { setShowPinBackup(true); setPinInput(''); }}
            className={`text-[10px] font-bold uppercase tracking-widest hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto ${
              isLight ? 'text-slate-500 hover:text-slate-700' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-sky-500" />
            <span>Use Backup PIN</span>
          </button>
        ) : (
          <p className={`text-[9px] uppercase tracking-wider opacity-40 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
            Taj Security Node EVP-25-LOCK
          </p>
        )}
      </div>

    </div>
  );
}
