import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'cca';
  theme: 'light' | 'dark';
}

export default function LegalModal({ isOpen, onClose, initialTab = 'privacy', theme }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'cca'>(initialTab);
  const isLight = theme === 'light';

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'cca', label: 'CCA Compliance', icon: Scale },
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm z-[10000] pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`absolute bottom-0 left-0 right-0 h-[85%] rounded-t-[32px] border-t z-[10001] pointer-events-auto flex flex-col overflow-hidden shadow-2xl transition-colors duration-300 ${
              isLight 
                ? 'bg-slate-50 border-slate-200 text-slate-800' 
                : 'bg-[#0b0f19] border-white/10 text-white'
            }`}
          >
            {/* Grabber indicator */}
            <div className="flex justify-center py-2.5 flex-none">
              <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
            </div>

            {/* Header */}
            <div className={`px-5 pb-3 pt-1 flex items-center justify-between border-b flex-none ${
              isLight ? 'border-slate-200' : 'border-white/5'
            }`}>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-sky-400" />
                <h2 className="text-xs font-black uppercase tracking-wider">Regulatory Compliance & Legal Docs</h2>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-full transition-all cursor-pointer ${
                  isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-white/10 text-white/70'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs Selector Bar */}
            <div className={`px-4 py-2 border-b flex gap-1 flex-none ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/25 border-white/5'
            }`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? isLight
                          ? 'bg-white text-sky-500 shadow-sm border border-slate-200'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/25'
                        : isLight
                          ? 'text-slate-500 hover:bg-slate-200/50'
                          : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'opacity-60'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Document Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar font-sans text-xs leading-relaxed">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  {activeTab === 'privacy' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          Effective: July 2026
                        </span>
                        <span className="text-[10px] text-slate-400">Ver 2.4.1</span>
                      </div>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        1. Introduction & Overview
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        Taj Lift Systems Ltd ("Taj Lift", "we", "our", "us") respects your privacy and is committed to protecting the telemetry, telemetry analytics, location-based dispatch coordinates, and personal data of our technician fleet, corporate managers, and client entities. 
                      </p>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        2. Information We Collect
                      </h3>
                      <div className="pl-2 border-l-2 border-sky-500/30 space-y-2">
                        <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                          <strong>GPS Telemetry & Route Data:</strong> Real-time location coordinates of field service technicians to optimize scheduling, ETA calculation, and emergency elevator dispatch.
                        </p>
                        <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                          <strong>Elevator Analytics & Inspections:</strong> Device signatures, mechanical stress indicators, weight sensor ratings, and inspector logs created through the inspection portal.
                        </p>
                        <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                          <strong>Account Information:</strong> Profile avatar configurations, professional certifications, duty status switches, and workspace roles.
                        </p>
                      </div>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        3. How We Process and Secure Data
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        All telemetry data is transmitted using encrypted TLS 1.3 channels. Financial ledgers and audit records are compiled and sealed server-side, preventing unauthorized local modifications. No personal telemetry is sold to third parties.
                      </p>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        4. Global Standards & Compliance
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        Taj Lift maintains complete alignment with the UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL) and the California Consumer Privacy Act (CCPA).
                      </p>
                    </div>
                  )}

                  {activeTab === 'terms' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          Revised: June 2026
                        </span>
                        <span className="text-[10px] text-slate-400">Ver 1.12.0</span>
                      </div>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        1. Agreement to Terms
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        By registering an account on the Taj Lift Operations Portal or utilizing any of the dispatcher tools, real-time route mappings, or automatic ledger tools, you explicitly agree to these Terms of Service. If you do not agree, you must immediately close the application and log off.
                      </p>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        2. Permitted Workspace Use & License
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        Users are granted a limited, non-exclusive, non-transferable license to access the Taj Lift dispatch dashboard purely for authorized elevator maintenance, project finance audits, client presentations, and supervisor logistics. Commercial extraction of database records is strictly prohibited.
                      </p>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        3. Technician Dispatch & Duty Standards
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        Technicians are expected to toggling their <strong>Duty Status Indicator</strong> accurately. System dispatches rely on algorithmic fairness and proximity metrics. Fraudulent manipulation of simulated locations or offline status toggling will result in temporary workspace suspension.
                      </p>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        4. Financial Disclaimer & Audit Tools
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        The <strong>Project Finance Ledger</strong> generates automated budget forecasts and AI cost suggestions based on structural parameters. While mathematically validated, they do not constitute formal financial advisory declarations.
                      </p>
                    </div>
                  )}

                  {activeTab === 'cca' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          Compliance Certified
                        </span>
                        <span className="text-[10px] text-slate-400">CCA-2026-AE</span>
                      </div>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        CCA Compliance Statement
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        Under the Consumer Care Association (CCA) frameworks, California Consumer Privacy Act (CCPA), and UAE Federal Law No. 15 of 2020 on Consumer Protection, Taj Lift ensures the highest standards of data portability, consumer accessibility, and equipment safety auditing.
                      </p>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        1. Consumer & Operator Data Rights
                      </h3>
                      <div className="space-y-2">
                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
                          <div>
                            <span className="font-bold block">Right to Know & Access:</span>
                            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                              Any client organization or registered operator can demand a comprehensive report of their elevator inspection telemetry and financial records.
                            </span>
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
                          <div>
                            <span className="font-bold block">Right to Delete (Erasure):</span>
                            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                              Users can request deletion of personal telemetry logs (unless required for ongoing elevator system warranty validations under regional safety acts).
                            </span>
                          </div>
                        </div>

                        <div className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
                          <div>
                            <span className="font-bold block">Nondiscrimination:</span>
                            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>
                              We do not degrade system features or dispatch frequencies based on the exercise of any local privacy or protection rights.
                            </span>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-sm font-black uppercase tracking-wide text-sky-400">
                        2. Mechanical Accessibility & Safety Core
                      </h3>
                      <p className={isLight ? 'text-slate-600' : 'text-slate-300'}>
                        Our inspection forms strictly mandate testing for ADA (Americans with Disabilities Act) and local GCC elevator cabin accessibility, braille controls, visual floor indicators, and emergency speaker response systems, in conformity with CCA hardware guidelines.
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky Modal Bottom Actions */}
            <div className={`p-4 border-t flex flex-col gap-2 flex-none ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#090d16] border-white/10'
            }`}>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-500/10 cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Acknowledge & Accept Documents</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
