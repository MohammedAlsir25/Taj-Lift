import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfile } from '../components/ProfileContext';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import TajLogo from '../components/TajLogo';
import LegalModal from '../components/LegalModal';

export default function SignIn() {
  const navigate = useNavigate();
  const { login, theme } = useProfile();
  const isLight = theme === 'light';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'cca'>('privacy');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setError(result.error || 'Invalid email address or password.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 overflow-y-auto no-scrollbar">
      
      <div className="flex flex-col items-center text-center mt-4">
        <div className="scale-110 mb-3.5">
          <TajLogo />
        </div>
        <h2 className={`text-lg font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Taj Lift Portal
        </h2>
        <p className={`text-[10px] uppercase tracking-widest font-bold ${isLight ? 'text-slate-500' : 'text-sky-400'}`}>
          Field Operations Gateway
        </p>
      </div>

      <div className={`my-auto py-5 px-4.5 rounded-[24px] border shadow-2xl space-y-4 transition-all duration-300 ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
      }`}>
        <div className="space-y-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wide">Sign In</h3>
          <p className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Access your assigned lift fleet & schedules
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-2 text-[10px] font-bold">
            <ShieldAlert className="w-4 h-4 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-2 text-[10px] font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Success! Redirecting to Dashboard...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-wider block opacity-75">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-2.5 w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@tajlifts.com"
                className={`w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-950/40 border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black uppercase tracking-wider block opacity-75">
                Password
              </label>
              <span className="text-[8px] font-bold text-sky-400 opacity-80 uppercase cursor-pointer hover:underline">
                Forgot?
              </span>
            </div>
            <div className="relative">
              <Lock className={`absolute left-3 top-2.5 w-4 h-4 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2 text-xs font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-950/40 border-white/10 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-2.5 opacity-60 hover:opacity-100 ${isLight ? 'text-slate-600' : 'text-white'}`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={success || loading}
            className={`w-full py-2.5 rounded-xl font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all duration-200 ${
              success
                ? 'bg-emerald-500 text-white'
                : loading
                ? 'bg-sky-400 text-white opacity-70'
                : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/10'
            }`}
          >
            <span>{loading ? 'Signing in...' : 'Access Portal'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div className="text-center py-2 space-y-3 flex-none">
        <div>
          <p className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Don't have an operational account?
          </p>
          <Link 
            to="/signup" 
            className="text-[10px] font-black text-sky-400 uppercase tracking-wider hover:underline mt-1 inline-block"
          >
            Request Account / Sign Up
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 border-t border-slate-500/10 pt-2.5 text-[8.5px] font-extrabold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setLegalTab('privacy');
              setIsLegalOpen(true);
            }}
            className="text-slate-500 hover:text-sky-400 transition"
          >
            Privacy
          </button>
          <span className="opacity-20 text-slate-500">•</span>
          <button
            type="button"
            onClick={() => {
              setLegalTab('terms');
              setIsLegalOpen(true);
            }}
            className="text-slate-500 hover:text-sky-400 transition"
          >
            Terms
          </button>
          <span className="opacity-20 text-slate-500">•</span>
          <button
            type="button"
            onClick={() => {
              setLegalTab('cca');
              setIsLegalOpen(true);
            }}
            className="text-slate-500 hover:text-sky-400 transition"
          >
            CCA Compliance
          </button>
        </div>

        <LegalModal
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
          initialTab={legalTab}
          theme={theme}
        />
      </div>

    </div>
  );
}
