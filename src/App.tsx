import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Wifi, Battery, Signal, Zap } from 'lucide-react';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import LeadProfile from './pages/LeadProfile';
import InspectionForm from './pages/InspectionForm';
import ProjectTracker from './pages/ProjectTracker';
import TechnicianMap from './pages/TechnicianMap';
import ProjectFinance from './pages/ProjectFinance';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ClientProposalDeck from './pages/ClientProposalDeck';
import { ProfileProvider, useProfile } from './components/ProfileContext';
import { ProjectProvider } from './components/ProjectContext';
import SettingsModal from './components/SettingsModal';
import BiometricGate from './components/BiometricGate';

// Custom wrapper to enable page transitions using Framer Motion
function AnimatedRoutes() {
  const location = useLocation();
  const { currentUser } = useProfile();

  // Route guarding: if not logged in, only allow /signin or /signup
  if (!currentUser) {
    if (location.pathname === '/signup') {
      return (
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route path="/signup" element={<PageWrapper><SignUp /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/signup" replace />} />
          </Routes>
        </AnimatePresence>
      );
    }
    return (
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/signin" element={<PageWrapper><SignIn /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route
          path="/"
          element={
            <PageWrapper isHome={true}>
              <Dashboard />
            </PageWrapper>
          }
        />
        <Route
          path="/lead"
          element={
            <PageWrapper>
              <LeadProfile />
            </PageWrapper>
          }
        />
        <Route
          path="/inspection"
          element={
            <PageWrapper>
              <InspectionForm />
            </PageWrapper>
          }
        />
        <Route
          path="/map"
          element={
            <PageWrapper>
              <TechnicianMap />
            </PageWrapper>
          }
        />
        <Route
          path="/tracker"
          element={
            <PageWrapper>
              <ProjectTracker />
            </PageWrapper>
          }
        />
        <Route
          path="/finance"
          element={
            <PageWrapper>
              <ProjectFinance />
            </PageWrapper>
          }
        />
        <Route
          path="/proposal"
          element={
            <ClientProposalDeck />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// Staggered horizontal slide and fade transition parameters
function PageWrapper({ children, isHome = false }: { children: React.ReactNode; isHome?: boolean }) {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, x: isHome ? 0 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: isHome ? 0 : -20 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="w-full h-full flex flex-col overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const { theme, currentUser } = useProfile();
  const isLight = theme === 'light';
  const location = useLocation();

  if (location.pathname === '/proposal') {
    return <AnimatedRoutes />;
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center py-4 px-2 sm:py-8 font-sans antialiased leading-normal relative overflow-hidden transition-colors duration-300 ${
      isLight ? 'bg-slate-100 text-slate-800 selection:bg-sky-200' : 'bg-[#0b0f19] text-white selection:bg-brand-secondary/20'
    }`}>
      
      {/* Absolute Background Radial Gradients for the entire webpage */}
      {isLight ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.1)_0%,_transparent_60%),_radial-gradient(circle_at_bottom_left,_rgba(226,232,240,0.8)_0%,_transparent_50%)] pointer-events-none z-0"></div>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15)_0%,_transparent_60%),_radial-gradient(circle_at_bottom_left,_rgba(9,13,22,0.95)_0%,_transparent_50%)] pointer-events-none z-0"></div>
      )}

      {/* Dynamic header title explaining preview controls on desktop */}
      <div className="mb-4 text-center hidden md:block z-10">
        <h1 className={`text-2xl font-bold flex items-center justify-center gap-2 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          Taj Lift Management Dashboard
        </h1>
        <p className={`text-xs mt-1 uppercase tracking-widest font-semibold opacity-70 ${isLight ? 'text-slate-600' : 'text-blue-200/75'}`}>
          Field Operations Management Suite • Frosted Glass Edition
        </p>
      </div>

      {/* Outer Phone Mockup Bezel with Shadow */}
      <div className={`relative w-full max-w-[393px] h-[812px] rounded-[48px] border-[10px] border-slate-900/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col select-none ring-1 ring-white/10 z-10 transition-colors duration-300 ${
        isLight ? 'bg-slate-50' : 'bg-[#090d16]'
      }`}>
        
        {/* Internal Radial Gradients inside the phone frame */}
        {isLight ? (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08)_0%,_transparent_50%),_radial-gradient(circle_at_bottom_left,_rgba(241,245,249,0.95)_0%,_transparent_50%)] pointer-events-none z-0"></div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.15)_0%,_transparent_50%),_radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.95)_0%,_transparent_50%)] pointer-events-none z-0"></div>
        )}

        {/* Bezel Camera Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full z-[9999] flex items-center justify-center">
          <div className="w-3 h-3 bg-slate-800 rounded-full ml-auto mr-4"></div>
        </div>

        {/* Phone Status Bar Row with Glass Background */}
        <div className={`h-10 text-white flex items-center justify-between px-7 pt-2 select-none z-50 flex-none font-sans border-b transition-colors duration-300 ${
          isLight ? 'bg-slate-100/70 border-slate-200/60 text-slate-800' : 'bg-white/5 border-white/5 text-white'
        }`}>
          <span className="text-[12px] font-bold font-sans tracking-wide">18:50</span>
          <div className={`flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-white/90'}`}>
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-bold">100%</span>
              <Battery className="w-4 h-4 fill-current opacity-80" />
            </div>
          </div>
        </div>

        {/* Core Content Viewport with Router mapping */}
        <BiometricGate>
          <main className="flex-1 w-full relative overflow-hidden z-10">
            <AnimatedRoutes />
          </main>

          {/* Persistent Absolute Centered Mobile Bottom Nav Bar Component */}
          {currentUser && <BottomNav />}
        </BiometricGate>

        {/* Settings Panel sheet, sliding up from bottom inside the mockup view */}
        <SettingsModal />

        {/* Rounded Home Indicator Screen Strip */}
        <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full z-50 pointer-events-none ${
          isLight ? 'bg-slate-900/25' : 'bg-white/30'
        }`}></div>
      </div>

      {/* Live Operational stats in web footer for completeness */}
      <footer className={`mt-4 hidden md:flex items-center space-x-8 opacity-80 z-10 border py-2 px-6 rounded-full text-xs font-semibold transition-colors duration-300 ${
        isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-white/5 border-white/10 text-white'
      }`}>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-[#2E7D32]"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-green-500">Operational</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-[#1E62D0]"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">Technicians Live: 14</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-[#D32F2F]"></div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-500">High Alert: 2 Cases</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <ProjectProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ProjectProvider>
    </ProfileProvider>
  );
}
