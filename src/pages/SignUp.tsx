import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProfile, AVATAR_PRESETS } from '../components/ProfileContext';
import { Mail, Lock, User, Phone, MapPin, Briefcase, Eye, EyeOff, ShieldAlert, CheckCircle, ArrowRight, Camera } from 'lucide-react';
import TajLogo from '../components/TajLogo';
import LegalModal from '../components/LegalModal';

export default function SignUp() {
  const navigate = useNavigate();
  const { signup, theme } = useProfile();
  const isLight = theme === 'light';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Dubai South & Jebel Ali');
  const [role, setRole] = useState('Field Technician');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | 'cca'>('privacy');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !phone || !region || !role) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await signup(name, email, password, role, phone, region, selectedAvatar);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setError(result.error || 'An account with this email address already exists.');
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-5 overflow-y-auto no-scrollbar">
      
      <div className="flex items-center gap-3 justify-center mt-2 flex-none">
        <div className="scale-90">
          <TajLogo />
        </div>
        <div>
          <h2 className={`text-sm font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Taj Lift Portal
          </h2>
          <p className={`text-[9px] uppercase tracking-widest font-bold ${isLight ? 'text-slate-500' : 'text-sky-400'}`}>
            Staff Registration
          </p>
        </div>
      </div>

      <div className={`my-3 py-4 px-4 rounded-[24px] border shadow-2xl space-y-3.5 transition-all duration-300 flex-1 flex flex-col justify-center ${
        isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-white/10 backdrop-blur-md border-white/10 text-white'
      }`}>
        <div className="space-y-0.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-sky-400">Register Account</h3>
          <p className={`text-[9px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Join the Taj Lift operational dispatcher & team
          </p>
        </div>

        {error && (
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-1.5 text-[9px] font-bold">
            <ShieldAlert className="w-3.5 h-3.5 flex-none" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5 text-[9px] font-bold">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Registration successful! Loading...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5 overflow-y-auto no-scrollbar max-h-[350px] pr-0.5">
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase tracking-wider block opacity-75">
              Choose Avatar / Upload Pic
            </span>
            <div className="flex items-center gap-2.5 justify-center py-1">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedAvatar(preset.url)}
                  className={`relative rounded-full p-0.5 transition-all cursor-pointer ${
                    selectedAvatar === preset.url
                      ? 'ring-2 ring-sky-400 scale-105 shadow-md shadow-sky-400/20'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-8 h-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-full w-9 h-9 flex items-center justify-center border border-dashed transition-all cursor-pointer hover:border-sky-400 hover:text-sky-400 ${
                  !AVATAR_PRESETS.some(p => p.url === selectedAvatar)
                    ? 'ring-2 ring-sky-400 scale-105 shadow-md border-sky-400 text-sky-400'
                    : 'opacity-60 hover:opacity-100 text-slate-400 border-slate-300'
                }`}
                title="Upload custom image"
              >
                {(!AVATAR_PRESETS.some(p => p.url === selectedAvatar) && selectedAvatar.startsWith('data:image/')) ? (
                  <img
                    src={selectedAvatar}
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

          <div className="space-y-0.5">
            <label className="text-[8px] font-black uppercase tracking-wider block opacity-75">
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-2.5 top-2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marcus Aurelius"
                className={`w-full pl-8 pr-3 py-1.5 text-[11px] font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-950/40 border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[8px] font-black uppercase tracking-wider block opacity-75">
              Work Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-2.5 top-2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. marcus@tajlifts.com"
                className={`w-full pl-8 pr-3 py-1.5 text-[11px] font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-950/40 border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[8px] font-black uppercase tracking-wider block opacity-75">
              Password (Min 6 chars)
            </label>
            <div className="relative">
              <Lock className={`absolute left-2.5 top-2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-8 pr-9 py-1.5 text-[11px] font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-950/40 border-white/10 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-2.5 top-2 opacity-60 hover:opacity-100 ${isLight ? 'text-slate-600' : 'text-white'}`}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-[8px] font-black uppercase tracking-wider block opacity-75">
              Operational Mobile Phone
            </label>
            <div className="relative">
              <Phone className={`absolute left-2.5 top-2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +971 50 987 6543"
                className={`w-full pl-8 pr-3 py-1.5 text-[11px] font-semibold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                  isLight 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-slate-950/40 border-white/10 text-white'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="text-[8px] font-black uppercase tracking-wider block opacity-75">
                Staff Role
              </label>
              <div className="relative">
                <Briefcase className={`absolute left-2 top-2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full pl-7 pr-1 py-1.5 text-[10px] font-bold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-800' 
                      : 'bg-slate-950/50 border-white/10 text-white'
                  }`}
                >
                  <option value="Field Technician">Technician</option>
                  <option value="Maintenance Supervisor">Supervisor</option>
                  <option value="Taj Operations Lead">Operations Lead</option>
                  <option value="Regional Director">Director</option>
                </select>
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[8px] font-black uppercase tracking-wider block opacity-75">
                Assigned Territory
              </label>
              <div className="relative">
                <MapPin className={`absolute left-2 top-2 w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/30'}`} />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={`w-full pl-7 pr-1 py-1.5 text-[10px] font-bold rounded-xl border outline-none focus:ring-1 focus:ring-sky-400 transition-all ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-800' 
                      : 'bg-slate-950/50 border-white/10 text-white'
                  }`}
                >
                  <option value="Dubai Marina & JBR">Marina / JBR</option>
                  <option value="Dubai South & Jebel Ali">Dubai South</option>
                  <option value="Downtown & Business Bay">Downtown</option>
                  <option value="Pune & Maharashtra">Pune Hub</option>
                </select>
              </div>
            </div>
          </div>

          <p className={`text-[8.5px] leading-relaxed text-center mt-2.5 px-1 font-medium ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            By signing up, you agree to our{' '}
            <button
              type="button"
              onClick={() => {
                setLegalTab('privacy');
                setIsLegalOpen(true);
              }}
              className="text-sky-400 font-bold hover:underline cursor-pointer focus:outline-none"
            >
              Privacy Policy
            </button>
            ,{' '}
            <button
              type="button"
              onClick={() => {
                setLegalTab('terms');
                setIsLegalOpen(true);
              }}
              className="text-sky-400 font-bold hover:underline cursor-pointer focus:outline-none"
            >
              Terms of Service
            </button>
            , and{' '}
            <button
              type="button"
              onClick={() => {
                setLegalTab('cca');
                setIsLegalOpen(true);
              }}
              className="text-sky-400 font-bold hover:underline cursor-pointer focus:outline-none"
            >
              CCA Compliance Standards
            </button>
            .
          </p>

          <button
            type="submit"
            disabled={success || loading}
            className={`w-full mt-2 py-2 rounded-xl font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all duration-200 ${
              success
                ? 'bg-emerald-500 text-white'
                : loading
                ? 'bg-sky-400 text-white opacity-70'
                : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sky-500/10'
            }`}
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <LegalModal
          isOpen={isLegalOpen}
          onClose={() => setIsLegalOpen(false)}
          initialTab={legalTab}
          theme={theme}
        />
      </div>

      <div className="text-center py-1 flex-none">
        <p className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          Already registered in dispatch?
        </p>
        <Link 
          to="/signin" 
          className="text-[10px] font-black text-sky-400 uppercase tracking-wider hover:underline mt-0.5 inline-block"
        >
          Access Portal / Sign In
        </Link>
      </div>

    </div>
  );
}
