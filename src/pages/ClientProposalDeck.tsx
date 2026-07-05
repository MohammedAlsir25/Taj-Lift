import React, { useState } from 'react';
import { 
  ArrowLeft, Printer, CheckCircle2, FileText, 
  Mail, Phone, Globe, Calendar, Users, Wrench, 
  DollarSign, ClipboardCheck, Sparkles, Sliders, Settings, 
  MapPin, Activity, Shield, Check, Star, RefreshCw
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile } from '../components/ProfileContext';
import TajLogo from '../components/TajLogo';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import Dashboard from './Dashboard';
import ProjectTracker from './ProjectTracker';
import ProjectFinance from './ProjectFinance';
import TechnicianMap from './TechnicianMap';

export default function ClientProposalDeck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme } = useProfile();
  const isLight = theme === 'light';

  // Customizer state
  const [clientName, setClientName] = useState(searchParams.get('client') || 'Emaar Properties');
  const [proposalAmount, setProposalAmount] = useState(searchParams.get('amount') || 'AED 2,450,000');
  const [proposalDate, setProposalDate] = useState(new Date().toLocaleDateString('en-AE', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [activeSlide, setActiveSlide] = useState(0);

  const totalSlides = 14;

  const [captureProgress, setCaptureProgress] = useState<string | null>(null);
  const [currentCapturingView, setCurrentCapturingView] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const captureLiveAppScreenshots = async () => {
    try {
      setCaptureProgress("Initializing PDF Presentation Builder...");
      // Wait for React to mount the container
      await new Promise(resolve => setTimeout(resolve, 400));

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 800]
      });

      const views = [
        { key: 'cover', label: 'Executive Cover Page' },
        { key: 'dashboard', label: 'BirdEye Management Dashboard' },
        { key: 'tracker', label: 'Field Project Operations Tracker' },
        { key: 'finance', label: 'Financial Cost Audit & AI Ledger' },
        { key: 'map', label: 'Live GPS Fleet Dispatch Map' }
      ];

      for (let i = 0; i < views.length; i++) {
        const view = views[i];
        setCaptureProgress(`Rendering live view: ${view.label} (Slide ${i + 1}/${views.length})...`);
        setCurrentCapturingView(view.key);

        // Give extra time for React rendering, charts drawing, animations to settle
        await new Promise(resolve => setTimeout(resolve, 1500));

        const target = document.getElementById('capture-sandbox-target');
        if (!target) {
          throw new Error("Target element not found in DOM");
        }

        setCaptureProgress(`Capturing high-resolution viewport for ${view.label}...`);
        
        const canvas = await html2canvas(target, {
          scale: 2, // 2x high resolution
          useCORS: true,
          logging: false,
          backgroundColor: '#090d16'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 1280;
        const imgHeight = 800;

        if (i > 0) {
          pdf.addPage([imgWidth, imgHeight], 'l');
        }

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      setCaptureProgress("Compiling and optimizing PDF slides...");
      await new Promise(resolve => setTimeout(resolve, 600));

      pdf.save(`Taj-Lift-Live-App-Presentation-${clientName.replace(/\s+/g, '-')}.pdf`);
      setCaptureProgress(null);
      setCurrentCapturingView(null);
    } catch (error) {
      console.error("PDF Capture Error:", error);
      setCaptureProgress("Error capturing screens. Please try again.");
      setTimeout(() => {
        setCaptureProgress(null);
        setCurrentCapturingView(null);
      }, 3000);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#0f1524] text-white'}`}>
      
      {/* Dynamic PDF Landscape Print Styles */}
      <style>{`
        @media print {
          body, html, #root {
            background-color: #051e36 !important;
            color: #0f172a !important;
            width: 297mm !important;
            height: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .print-slide {
            width: 297mm !important;
            height: 210mm !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: 10mm 15mm !important;
            box-sizing: border-box !important;
            background: radial-gradient(circle at center, #0a3d62 0%, #051e36 100%) !important;
            position: relative !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>

      {/* Presentation Header Bar (Hidden in Printing) */}
      <header className="no-print sticky top-0 z-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white shadow-xl border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <button 
            onClick={() => navigate('/tracker')} 
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5 text-sky-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <TajLogo size="sm" />
              <h1 className="text-sm font-black uppercase tracking-wider text-sky-400">Taj Lift Deck Builder</h1>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Export gorgeous, high-fidelity Landscape Presentations representing our actual application</p>
          </div>
        </div>

        {/* Real-time presentation customizer */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Target Client:</span>
            <input 
              type="text" 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)} 
              className="bg-transparent text-xs text-white focus:outline-none border-b border-sky-400/30 w-36 font-bold focus:border-sky-400"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Quote Reference:</span>
            <input 
              type="text" 
              value={proposalAmount} 
              onChange={(e) => setProposalAmount(e.target.value)} 
              className="bg-transparent text-xs text-white focus:outline-none border-b border-sky-400/30 w-28 font-bold focus:border-sky-400"
            />
          </div>

          <button 
            onClick={captureLiveAppScreenshots} 
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-sky-500 hover:bg-sky-600 text-white transition active:scale-95 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Capture Live App PDF</span>
          </button>

          <button 
            onClick={handlePrint} 
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white transition active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Export Presentation PDF</span>
          </button>
        </div>
      </header>

      {/* Screen Interactive Viewer Wrapper (Sequential landscape slideshow) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-center p-4 md:p-8 no-print">
        
        {/* Landscape Presentation Slide Window */}
        <div className="w-full aspect-[16/10] max-w-5xl rounded-3xl shadow-2xl border border-slate-800/40 bg-gradient-to-br from-[#0c2e4e] via-[#051c31] to-[#031322] flex flex-col justify-between p-6 md:p-10 relative overflow-hidden transition-all duration-300">
          
          {/* Subtle Background Grid Line Accents for Deck Feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

          {/* Slide Header inside Deck viewport */}
          <div className="flex justify-between items-center pb-3 border-b border-white/10 z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-widest bg-sky-500/10 px-2.5 py-1 rounded">ElevatorPlus</span>
              <span className="text-[11px] font-bold text-slate-300">Taj Lift Platform Proposal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                Slide {activeSlide + 1} of {totalSlides}
              </span>
              <span className="text-[10px] font-mono text-slate-400">For: {clientName}</span>
            </div>
          </div>

          {/* Slide Core Canvas Content */}
          <div className="flex-1 py-4 flex flex-col justify-center items-center overflow-hidden z-10">
            {renderSlideContent(activeSlide, clientName, proposalAmount, proposalDate)}
          </div>

          {/* Slideshow controls footer */}
          <div className="flex justify-between items-center border-t border-white/10 pt-4 z-10">
            <button 
              disabled={activeSlide === 0}
              onClick={() => setActiveSlide(prev => Math.max(0, prev - 1))}
              className="text-xs px-4 py-2 rounded-xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-20 disabled:pointer-events-none transition"
            >
              Previous Slide
            </button>
            
            {/* Nav dots */}
            <div className="flex gap-1.5 overflow-x-auto py-1 px-2 max-w-[250px] md:max-w-md no-scrollbar">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                   key={idx}
                   onClick={() => setActiveSlide(idx)}
                   className={`w-2 h-2 rounded-full transition-all flex-none ${
                     activeSlide === idx ? 'bg-sky-400 w-6 shadow-glow' : 'bg-white/20 hover:bg-white/40'
                   }`}
                   title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button 
              disabled={activeSlide === totalSlides - 1}
              onClick={() => setActiveSlide(prev => Math.min(totalSlides - 1, prev + 1))}
              className="text-xs px-5 py-2 rounded-xl font-bold bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-20 disabled:pointer-events-none transition"
            >
              Next Slide
            </button>
          </div>
        </div>

        {/* Printing / presentation tips block */}
        <div className="mt-6 text-center max-w-xl">
          <p className="text-xs text-slate-400 leading-relaxed font-semibold">
            ✨ <strong className="text-sky-400 uppercase tracking-wider">Aesthetic Slide Preview:</strong> Redesigned with pixel-perfect screenshots, flowcharts, and mobile mockups derived from our actual application dashboard modules.
          </p>
        </div>
      </div>

      {/* PRINT-ONLY MASTER CONTAINER (Sequential rendering layout for print) */}
      <div className="hidden print:block w-full">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <div key={index} className="print-slide">
            
            {/* Grid line effect on print */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            {/* Slide Header */}
            <div className="flex justify-between items-center pb-3 border-b border-white/15 w-full mb-4 z-10">
              <div className="flex items-center gap-2">
                <TajLogo size="sm" />
                <span className="text-[12px] font-black uppercase text-sky-400 tracking-wider">Taj Lift Management Platform</span>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-sky-300 uppercase tracking-widest">Enterprise Client Proposal</p>
                <p className="text-[10px] font-black text-white uppercase">Slide {index + 1} / {totalSlides}</p>
              </div>
            </div>

            {/* Slide Content Core area */}
            <div className="flex-1 flex flex-col justify-center items-center py-4 z-10 w-full overflow-hidden">
              {renderSlideContent(index, clientName, proposalAmount, proposalDate)}
            </div>

            {/* Slide Footer */}
            <div className="flex justify-between items-center border-t border-white/15 pt-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4 z-10">
              <span>Prepared for: {clientName}</span>
              <span className="text-sky-400 font-black">ElevatorPlus Suite</span>
              <span>© {new Date().getFullYear()} Taj Lift</span>
            </div>

          </div>
        ))}
      </div>

      {/* Dynamic Progress Loader Overlay */}
      {captureProgress && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 no-print">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6">
            
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center animate-pulse">
                <Activity className="w-8 h-8 text-sky-400" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black uppercase tracking-wider">Compiling Live Client Report</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Our high-resolution rendering engine is capturing live, active application views in real-time.
              </p>
            </div>

            <div className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left space-y-2.5 font-mono">
              <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
                <span>Engine Status:</span>
                <span className="animate-pulse">Active</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-normal border-t border-slate-800/80 pt-2 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin flex-none" />
                <span>{captureProgress}</span>
              </p>
            </div>

            <p className="text-[9.5px] text-slate-500 uppercase font-black tracking-widest animate-pulse">
              Generating High Fidelity PDF Presentation
            </p>
          </div>
        </div>
      )}

      {/* Off-screen Capture Sandbox */}
      {currentCapturingView && (
        <div 
          id="capture-sandbox-container"
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '1280px',
            height: '800px',
            overflow: 'hidden',
            backgroundColor: '#090d16',
            zIndex: -1000,
            pointerEvents: 'none'
          }}
          className="no-print"
        >
          <div id="capture-sandbox-target" className="w-[1280px] h-[800px] relative p-8 bg-[#090d16] text-white">
            <style>{`
              #capture-sandbox-target main,
              #capture-sandbox-target .overflow-y-auto {
                height: 100% !important;
                max-height: none !important;
                overflow: visible !important;
              }
              #capture-sandbox-target .no-scrollbar {
                overflow: visible !important;
              }
              #capture-sandbox-target .pb-24,
              #capture-sandbox-target .pb-32 {
                padding-bottom: 0 !important;
              }
              #capture-sandbox-target .sticky {
                position: relative !important;
              }
            `}</style>
            
            {currentCapturingView === 'cover' && (
              <div className="w-full h-full bg-gradient-to-br from-[#0c2e4e] via-[#051c31] to-[#031322] flex flex-col justify-between p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
                
                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-3">
                    <TajLogo size="lg" />
                    <div>
                      <h1 className="text-2xl font-black tracking-tight text-white">Taj Lift Management</h1>
                      <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Enterprise Operations Suite</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-sky-500/10 text-sky-400 font-extrabold px-3.5 py-1.5 rounded-full border border-sky-500/25 uppercase tracking-widest">
                    Live App Report
                  </span>
                </div>

                <div className="my-auto max-w-2xl z-10 space-y-4">
                  <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md font-bold uppercase tracking-wider">
                    Programmatic High-Resolution Client Presentation
                  </span>
                  <h2 className="text-4xl font-black tracking-tight leading-none text-white uppercase">
                    Operational Fleet & <br />Financial Audit Proposal
                  </h2>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
                    A compiled presentation demonstrating real-time, active parameters of the Taj Lift Platform. Features live fleet telemetry, budget tracking, and management audits.
                  </p>
                </div>

                <div className="flex justify-between items-end border-t border-white/10 pt-6 z-10">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] font-black block">Prepared For</span>
                      <span className="font-extrabold text-white text-sm">{clientName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] font-black block">Proposed Investment</span>
                      <span className="font-extrabold text-sky-400 text-sm">{proposalAmount}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] font-black block">Compiled Date</span>
                      <span className="font-bold text-slate-200">{proposalDate}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-slate-400 uppercase tracking-wider text-[9px] font-black block">Status Reference</span>
                      <span className="font-extrabold text-emerald-400">Verified Live Data</span>
                    </div>
                  </div>
                  <div className="text-right text-slate-500 text-[10px] font-mono">
                    Taj Lift Systems Ltd · Confidential
                  </div>
                </div>
              </div>
            )}
            
            {currentCapturingView === 'dashboard' && <Dashboard />}
            {currentCapturingView === 'tracker' && <ProjectTracker />}
            {currentCapturingView === 'finance' && <ProjectFinance />}
            {currentCapturingView === 'map' && <TechnicianMap />}
          </div>
        </div>
      )}

    </div>
  );
}


// Global slide renderer function used for both screen preview and print
function renderSlideContent(
  index: number, 
  clientName: string, 
  amount: string, 
  date: string
) {
  switch (index) {
    case 0:
      // Slide 1: Cover Page
      return (
        <div className="text-center space-y-6 max-w-2xl mx-auto py-8">
          <div className="inline-flex items-center justify-center p-8 rounded-3xl bg-white shadow-2xl relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-emerald-400 rounded-3xl blur-md opacity-30 animate-pulse" />
            
            {/* Custom high-fidelity ElevatorPlus logo mockup as per Page 1 */}
            <div className="relative flex flex-col items-center bg-[#072445] px-8 py-5 rounded-2xl border border-white/10 text-white min-w-[210px]">
              <div className="flex items-center justify-center gap-2">
                {/* Custom Lift Arrows icon */}
                <div className="flex flex-col items-center bg-white text-[#072445] p-1.5 rounded-lg font-black text-[14px]">
                  <span className="leading-none text-emerald-600">▲</span>
                  <span className="leading-none text-rose-600 -mt-0.5">▼</span>
                </div>
                <div className="text-left font-sans leading-none">
                  <h1 className="text-base font-black tracking-widest uppercase">Elevator</h1>
                  <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase border-t border-white/25 pt-0.5 mt-0.5">Plus</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white font-sans uppercase">ElevatorPlus</h1>
            <div className="flex items-center justify-center gap-3 text-emerald-400 font-extrabold tracking-widest uppercase text-xs">
              <span>Organize</span>
              <span className="text-white/20">|</span>
              <span>Automate</span>
              <span className="text-white/20">|</span>
              <span>Scale</span>
            </div>
          </div>
          
          <div className="h-0.5 bg-gradient-to-r from-transparent via-sky-500 to-transparent w-48 mx-auto rounded-full" />
          
          <div className="space-y-1 text-slate-300">
            <p className="text-[10px] uppercase tracking-widest font-black text-sky-400">Commercial Setup & Workflow Proposal</p>
            <p className="text-sm font-bold">Specially prepared for: <span className="text-white font-black underline decoration-emerald-400 decoration-2">{clientName}</span></p>
            <p className="text-[10px] font-mono text-slate-400 mt-2">Proposal Date: {date} · Budget Reference: <span className="text-emerald-400 font-black">{amount}</span></p>
          </div>
        </div>
      );

    case 1:
      // Slide 2: Stages We Focus On
      return (
        <div className="space-y-6 w-full text-center flex flex-col justify-center items-center h-full">
          {/* Elegant header tab with dark blue curved banner */}
          <div className="bg-[#051e36] border border-sky-400/20 shadow-xl px-12 py-3.5 rounded-2xl -mt-2">
            <h2 className="text-lg font-extrabold text-white uppercase tracking-wider">Stages We Focus On</h2>
          </div>

          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
            ElevatorPlus bridges the gap between sales capture, field mechanics, payment followups, and emergency maintenance on a single responsive, real-time workspace.
          </p>

          {/* Serpentine Pipeline Diagram as per Screenshot 2 */}
          <div className="relative w-full max-w-3xl py-6 px-4 flex flex-col items-center justify-center">
            
            {/* Simulated pipeline connecting paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 800 160">
              <path 
                d="M 100 45 L 260 45 Q 310 45 310 80 L 310 80 Q 310 115 360 115 L 700 115" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="4" 
                strokeDasharray="8 6"
              />
              <path 
                d="M 100 45 L 700 45" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2" 
                className="opacity-20"
              />
            </svg>

            {/* Grid of the 8 modules */}
            <div className="grid grid-cols-4 gap-x-6 gap-y-10 w-full relative z-10">
              {[
                { title: 'Lead Capture', step: '01', desc: 'Facebook, Google, Website Sync' },
                { title: 'Estimation', step: '02', desc: 'Tax matrix quotes in minutes' },
                { title: 'Installation', step: '03', desc: 'Site layout & Gantt scheduling' },
                { title: 'Follow-Up', step: '04', desc: 'CRM alert lists and logs' },
                { title: 'Payment Reminders', step: '05', desc: 'Milestone invoicing and ledgers' },
                { title: 'PM / AMC', step: '06', desc: 'SLA templates and alerts' },
                { title: 'Repair Orders', step: '07', desc: 'Logged BOM and spare parts' },
                { title: 'Breakdowns', step: '08', desc: 'Live emergency tech dispatch' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="bg-[#0c2445] hover:bg-[#0f305c] border border-sky-400/20 hover:border-sky-400/40 rounded-2xl px-4 py-2.5 shadow-xl text-center transition-all duration-300 w-full transform hover:-translate-y-1">
                    <span className="text-[9px] font-mono font-black text-sky-400 block mb-0.5">STAGE {item.step}</span>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">{item.title}</h3>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 2:
      // Slide 3: Lead Capture CRM
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">01 / Lead Capture CRM</span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Direct CRM Live Sync</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 flex-1 items-center">
            
            {/* Flowchart diagram representation */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400">Leads Flow</span>
                  <span className="text-[9px] bg-sky-500/10 text-sky-600 font-bold px-2 py-0.5 rounded">Process</span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="bg-sky-500 text-white font-black text-[10px] px-3 py-2 rounded-xl uppercase">Manage</div>
                  <span className="text-slate-400 text-xs">➔</span>
                  <div className="bg-slate-800 text-white font-black text-[10px] px-3 py-2 rounded-xl uppercase">Enquiries</div>
                  <span className="text-slate-400 text-xs">➔</span>
                  <div className="bg-amber-500 text-white font-black text-[10px] px-3 py-2 rounded-xl uppercase">Follow-ups</div>
                </div>

                <div className="h-px bg-slate-200/60 my-2" />

                <div className="flex justify-between items-center pt-1 text-[9px] font-bold text-slate-400 uppercase">
                  <span>Facebook</span>
                  <span>Google Forms</span>
                  <span>Gmail</span>
                  <span>Indiamart</span>
                  <span>Website</span>
                </div>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[10.5px] leading-relaxed text-slate-600">
                📝 <strong>Instant capture matrix:</strong> Capture every potential client instantly through QR code scans or business card uploads. Leads are automatically stored and organized in one dashboard.
              </div>
            </div>

            {/* Mobile View Mockup representation */}
            <div className="bg-[#f8fafc] border-2 border-slate-200 rounded-3xl p-3 shadow-lg max-w-sm mx-auto w-full relative overflow-hidden">
              <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                  <span className="text-[11px] font-extrabold text-slate-700">Enquiries</span>
                  <span className="text-[9px] font-mono font-bold text-slate-400">Site Filter</span>
                </div>

                {/* Highlighted Lead Card */}
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3 relative">
                  <span className="absolute right-2 top-2 text-[8px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase">Won</span>
                  
                  <h4 className="text-xs font-black text-slate-800">Rahul Patil</h4>
                  <p className="text-[9.5px] font-bold text-slate-500 mt-0.5 font-mono">Site: Creation Plaza · Pune</p>
                  <p className="text-[9px] text-slate-400 mt-1">Lead Date: 13/06/2026</p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Rep: Sanjay Sir</span>
                    <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Assigned: Manisha</span>
                  </div>
                </div>

                {/* Pending Lead Card */}
                <div className="border border-slate-100 rounded-xl p-2.5 relative opacity-70">
                  <span className="absolute right-2 top-2 text-[8px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded uppercase">Pending</span>
                  <h4 className="text-[11px] font-black text-slate-800">Dhananjay Mane</h4>
                  <p className="text-[9px] text-slate-400">Site: Wakad Site Alpha</p>
                </div>
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Eliminates manual data entry and ensures no inquiry is missed. Start your sales process smartly from the first touchpoint.
          </p>
        </div>
      );

    case 3:
      // Slide 4: Estimation
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">02 / Estimation & Quotation Builder</span>
            <span className="text-[11px] font-mono font-bold text-slate-500">Fast Tax Matrices</span>
          </div>

          {/* Three screenshots side-by-side representing steps */}
          <div className="grid grid-cols-3 gap-4 my-4 flex-1">
            
            {/* Panel 1: Requirement Gathering */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-sky-600 uppercase tracking-widest block mb-1">Step 1</span>
                <h4 className="text-[11px] font-black text-slate-700 border-b border-slate-200/60 pb-1 mb-2">Requirement Gathering</h4>
                
                <div className="space-y-1.5 text-[8.5px] text-slate-500 font-bold">
                  <div className="p-1 border border-slate-200 bg-white rounded">Branch: Wakad</div>
                  <div className="p-1 border border-slate-200 bg-white rounded">Site Name: Accuria Wakad</div>
                  <div className="p-1 border border-slate-200 bg-white rounded">Lift: Passenger (Gearless)</div>
                  <div className="p-1 border border-slate-200 bg-white rounded">Shaft Size: 1800 x 1800 mm</div>
                  <div className="p-1 border border-slate-200 bg-white rounded">Passengers: 6 (408 kg)</div>
                </div>
              </div>
              
              <div className="bg-sky-500 text-white font-black text-center text-[9px] py-1.5 rounded-lg mt-2 uppercase tracking-wider">
                Save & Continue
              </div>
            </div>

            {/* Panel 2: Quotation on the Go */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-sky-600 uppercase tracking-widest block mb-1">Step 2</span>
                <h4 className="text-[11px] font-black text-slate-700 border-b border-slate-200/60 pb-1 mb-2">Quotation Generator</h4>
                
                <div className="space-y-1 text-[8px] text-slate-500">
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                    <span>Base Cabin:</span>
                    <span className="font-mono text-slate-700">AED 850,000</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                    <span>Motor Addon:</span>
                    <span className="font-mono text-slate-700">AED 120,000</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                    <span>SLA Shaft:</span>
                    <span className="font-mono text-slate-700">AED 570,000</span>
                  </div>
                  <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                    <span>VAT (5%):</span>
                    <span className="font-mono text-slate-700">AED 77,000</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500 text-white font-black text-center text-[9px] py-1.5 rounded-lg mt-2 uppercase tracking-wider">
                Confirm Estimate
              </div>
            </div>

            {/* Panel 3: Multiple Revisions */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-sky-600 uppercase tracking-widest block mb-1">Step 3</span>
                <h4 className="text-[11px] font-black text-slate-700 border-b border-slate-200/60 pb-1 mb-2">Revision Control</h4>
                
                <div className="space-y-1 text-[8.5px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Revision EVP-25/Q-1102A</div>
                  <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Revision EVP-25/Q-1102B</div>
                </div>

                <div className="mt-2.5 p-1 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[7.5px] font-mono leading-tight">
                  Cost calculated with automated standard matrices based on cabin, passenger load, and shaft sizes.
                </div>
              </div>

              <div className="bg-slate-800 text-white font-black text-center text-[9px] py-1.5 rounded-lg mt-2 uppercase tracking-wider">
                View PDF Quote
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Generate professional, customized quotations in just minutes based on the client’s specific requirements. Easily share quotes via WhatsApp or email, boosting your chances of faster approvals.
          </p>
        </div>
      );

    case 4:
      // Slide 5: Follow Up
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">03 / Lead Follow-up Engine</span>
            <div className="flex items-center gap-1 text-[10px] font-black text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>SLA Breaches Alert</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 flex-1 items-center">
            
            {/* Left: Mobile screen showing Scheduled Follow-ups list */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-3 max-w-sm mx-auto w-full">
              <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2.5">
                <div className="flex justify-between items-center bg-rose-50 border border-rose-100 text-rose-600 rounded-lg p-2 text-[10px] font-bold">
                  <span>Follow-Up due in:</span>
                  <span className="font-mono">2h 27m 03s</span>
                </div>

                <div className="space-y-2 text-[9.5px]">
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50">
                    <div className="flex justify-between font-black text-slate-800">
                      <span>Dhananjay Mane</span>
                      <span className="text-sky-500">Today, 03:45 PM</span>
                    </div>
                    <p className="text-[8.5px] text-slate-400 mt-0.5">Discuss final quotation & shaft layouts.</p>
                  </div>

                  <div className="p-2 border border-slate-100 rounded-lg">
                    <div className="flex justify-between font-black text-slate-800">
                      <span>Samantha Lee</span>
                      <span className="text-sky-500">Tomorrow, 10:00 AM</span>
                    </div>
                    <p className="text-[8.5px] text-slate-400 mt-0.5">Gather custom motor configuration metrics.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Flowchart/Diagram of Lead Lifecycle with Bubble */}
            <div className="space-y-4">
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-2xl flex flex-col items-center text-center space-y-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Conversion Funnel</span>
                
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-sky-100 rounded-full text-sky-600 font-bold text-xs">Lead</div>
                  <span className="text-slate-400">➔</span>
                  <div className="p-2.5 bg-[#072445] text-white rounded-full font-bold text-xs">Customer</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-slate-500 uppercase mt-2">
                  <span className="p-1 border border-slate-200 rounded-lg">✔ Follow-Up Reminders</span>
                  <span className="p-1 border border-slate-200 rounded-lg">✔ Missed Alerts</span>
                </div>
              </div>

              {/* Float badge */}
              <div className="bg-[#072445] text-white p-3 rounded-2xl border border-white/10 shadow-lg text-center font-bold text-[11px] leading-snug">
                ⭐ &quot;Every Lead has a Potential. Don&apos;t Lose any with organized Followups&quot;
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Never let a lead go cold again. ElevatorPlus reminds your team to follow up with potential clients at the right time. Track every communication and stay updated on lead status within the app.
          </p>
        </div>
      );

    case 5:
      // Slide 6: Installation Gantt
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">04 / Stage & Phase Tracking</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">Interactive Gantt View</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 flex-1 items-center">
            
            {/* Left Panel: Desktop Web-view of Gantt Chart */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Phase Timeline Tracker</span>
              
              <div className="space-y-2 text-[8.5px]">
                {/* Task 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>1. Dispatch of Materials</span>
                    <span>100% Done</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Task 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>2. Shaft Alignment Checks</span>
                    <span>100% Done</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Task 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>3. Cabin Frame Assembly & Motor</span>
                    <span>50% In Progress</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                {/* Task 4 */}
                <div className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>4. Inspector Licensing Clearance</span>
                    <span>0% Scheduled</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-300 h-full rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Project Planning Checklist */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Project Planning & Tracking</span>
              
              <div className="space-y-2 text-[10px] font-bold text-slate-700">
                <div className="flex items-center gap-2 bg-white p-2 border border-slate-100 rounded-lg">
                  <span className="text-emerald-500">✔</span>
                  <span>Final Quality Checklist (QC) Verified</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 border border-slate-100 rounded-lg">
                  <span className="text-emerald-500">✔</span>
                  <span>Handover Certificate Ready</span>
                </div>
                <div className="flex items-center gap-2 bg-white p-2 border border-slate-100 rounded-lg opacity-60">
                  <span className="text-slate-300">○</span>
                  <span>Final Client Payment Collection Triggered</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-[9px] leading-relaxed border border-emerald-100">
                🚀 <strong>Handover to EI:</strong> Streamlines the entire installation journey from scheduling to final handover. Assign tasks to technicians, monitor progress in real-time, and ensure timely completion.
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Provides clients with live updates to build transparency and trust. Deliver every project with precision and professionalism.
          </p>
        </div>
      );

    case 6:
      // Slide 7: Payment Reminders
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">05 / Cash Flow & Payments</span>
            <span className="text-[11px] font-mono font-bold text-slate-500">Pending Milestone Ledgers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 flex-1 items-center">
            
            {/* Left: Collect Payment mobile screen */}
            <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-3 max-w-sm mx-auto w-full">
              <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2.5 text-[9.5px]">
                <div className="flex justify-between font-bold border-b border-slate-100 pb-2 text-slate-600">
                  <span>Due: AED 1,245,000</span>
                  <span className="text-emerald-600">Collected: AED 1,245,000</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 block mb-0.5">Amount</label>
                    <div className="p-1.5 border border-slate-200 bg-slate-50 rounded">AED 1,245,000</div>
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 block mb-0.5">Payment Date</label>
                    <div className="p-1.5 border border-slate-200 bg-slate-50 rounded font-mono">2026. 06. 14.</div>
                  </div>
                  <div>
                    <label className="text-[8px] font-bold text-slate-400 block mb-0.5">Payment Type</label>
                    <div className="p-1.5 border border-slate-200 bg-slate-50 rounded">NEFT / Bank Transfer</div>
                  </div>
                </div>

                <div className="bg-sky-500 text-white font-black text-center text-[10px] py-2 rounded-lg mt-2 uppercase">
                  Save Transaction
                </div>
              </div>
            </div>

            {/* Right: Payment Terms Table & Circular Diagram */}
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/50 space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Standard 3-Stage Payment Terms</span>
                
                <table className="w-full text-left text-[9.5px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[8px] font-black">
                      <th className="pb-1">Milestone %</th>
                      <th className="pb-1">Scope of Work</th>
                      <th className="pb-1 text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 font-semibold">
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-[#072445] font-black">50% Advance</td>
                      <td className="py-1">Before dispatch start</td>
                      <td className="py-1 text-right font-mono">AED 1,245,000</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-1 text-[#072445] font-black">40% Delivery</td>
                      <td className="py-1">Material arriving onsite</td>
                      <td className="py-1 text-right font-mono">AED 1,050,000</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-[#072445] font-black">10% Handover</td>
                      <td className="py-1">Licensing & testing certificate</td>
                      <td className="py-1 text-right font-mono">AED 254,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-sky-50 rounded-xl text-[10px] leading-relaxed text-slate-600 border border-sky-100">
                💳 <strong>Automatic reminders:</strong> Automate your billing and payment collection process with smart alerts. Send timely reminders for pending payments and keep your records updated without manual chasing.
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Improve cash flow and reduce missed or delayed payments effortlessly. Keep your finances smooth and stress-free.
          </p>
        </div>
      );

    case 7:
      // Slide 8: PM & AMC
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">06 / PM & AMC Scheduler</span>
            <div className="flex gap-1.5 text-[8.5px] font-black uppercase">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">On Going</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Pending</span>
              <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded">Expired</span>
            </div>
          </div>

          {/* Three panels represent PM & AMC */}
          <div className="grid grid-cols-3 gap-4 my-4 flex-1">
            
            {/* Panel 1: Create AMC Quotations */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-[#072445] uppercase tracking-widest block mb-1">Feature A</span>
                <h4 className="text-[11px] font-black text-slate-700 border-b border-slate-200/60 pb-1 mb-2">PM Inspection Form</h4>
                
                <div className="space-y-1 text-[8px] text-slate-500 font-bold">
                  <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> ARD System Check - Good</div>
                  <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Alarm bell battery - Avg</div>
                  <div className="flex items-center gap-1"><span className="text-emerald-500">✔</span> Cabin frame lubrication - Good</div>
                  <div className="flex items-center gap-1"><span className="text-rose-500">✖</span> Machine room lock - Bad</div>
                </div>
              </div>

              <div className="bg-[#072445] text-white font-black text-center text-[9px] py-1.5 rounded-lg mt-2 uppercase">
                Submit Checklist
              </div>
            </div>

            {/* Panel 2: Track PM Slots */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-[#072445] uppercase tracking-widest block mb-1">Feature B</span>
                <h4 className="text-[11px] font-black text-slate-700 border-b border-slate-200/60 pb-1 mb-2">Predictive Slots</h4>
                
                <div className="space-y-1.5 text-[8.5px]">
                  <div className="p-1 bg-white border border-slate-100 rounded-lg">
                    <div className="flex justify-between font-black text-slate-800">
                      <span>Wakad Plaza Site</span>
                      <span className="text-amber-600">Pending</span>
                    </div>
                    <p className="text-[7.5px] text-slate-400">Due Date: 01/05/2026</p>
                  </div>

                  <div className="p-1 bg-white border border-slate-100 rounded-lg">
                    <div className="flex justify-between font-black text-slate-800">
                      <span>Saffron Towers</span>
                      <span className="text-sky-600">On Going</span>
                    </div>
                    <p className="text-[7.5px] text-slate-400">Due Date: 30/04/2026</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-1 mt-2">
                <span className="flex-1 bg-sky-500 text-white font-black text-center text-[8px] py-1.5 rounded-lg uppercase">Call Tech</span>
                <span className="flex-1 bg-emerald-500 text-white font-black text-center text-[8px] py-1.5 rounded-lg uppercase">WhatsApp</span>
              </div>
            </div>

            {/* Panel 3: Expiring AMC Reminders */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-[#072445] uppercase tracking-widest block mb-1">Feature C</span>
                <h4 className="text-[11px] font-black text-slate-700 border-b border-slate-200/60 pb-1 mb-2">Expiring SLA Alerts</h4>
                
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 text-[8px] text-rose-700 font-bold space-y-1">
                  <p className="uppercase">⚠️ PM Contract Expired!</p>
                  <p className="font-normal text-[7.5px] leading-tight text-rose-600">Accuria Software Pvt Ltd has passed their AMC due threshold.</p>
                </div>
              </div>

              <div className="flex justify-between gap-1 mt-2">
                <span className="flex-1 bg-slate-800 text-white font-black text-center text-[8px] py-1.5 rounded-lg uppercase">Renew PM</span>
                <span className="flex-1 bg-slate-400 text-white font-black text-center text-[8px] py-1.5 rounded-lg uppercase">Extend PM</span>
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Ensure every lift is maintained on schedule with automatic AMC and PM alerts. Track service history, schedule visits, and get reminders well in advance. Strengthen client trust through proactive maintenance.
          </p>
        </div>
      );

    case 8:
      // Slide 9: Breakdown Operations
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">07 / Breakdown Operations</span>
            <span className="text-[10px] bg-red-100 text-red-800 font-black px-2.5 py-0.5 rounded-full uppercase animate-pulse">Emergency Dispatch Desk</span>
          </div>

          {/* 4 stage horizontal flow */}
          <div className="grid grid-cols-4 gap-3.5 my-4 flex-1">
            
            {/* 1. Create */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] bg-sky-500/10 text-sky-600 font-black px-1.5 py-0.5 rounded uppercase block w-max mb-1">01 / Create</span>
                <h4 className="text-[10px] font-black text-slate-800">Alert Captured</h4>
                <p className="text-[8px] text-slate-400 mt-1">Passenger reports lift stuck at Wakad Site, ARD failing.</p>
              </div>
              <div className="bg-red-500 text-white font-black text-center text-[8.5px] py-1 rounded-lg uppercase">
                Emergency Alert!
              </div>
            </div>

            {/* 2. Assign */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-600 font-black px-1.5 py-0.5 rounded uppercase block w-max mb-1">02 / Assign</span>
                <h4 className="text-[10px] font-black text-slate-800">Geotrack Match</h4>
                <p className="text-[8px] text-slate-400 mt-1">Arjun Mehta is the nearest technician on-grid (6 km Away).</p>
              </div>
              <div className="bg-[#072445] text-white font-black text-center text-[8.5px] py-1 rounded-lg uppercase">
                Assign Arjun
              </div>
            </div>

            {/* 3. Resolve */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] bg-amber-500/10 text-amber-600 font-black px-1.5 py-0.5 rounded uppercase block w-max mb-1">03 / Resolve</span>
                <h4 className="text-[10px] font-black text-slate-800">Resolution Form</h4>
                <div className="space-y-1 text-[7.5px] font-bold text-slate-500 mt-1">
                  <div>✔ Fan/Blower OK</div>
                  <div>✔ ARD battery swapped</div>
                </div>
              </div>
              <div className="bg-emerald-500 text-white font-black text-center text-[8.5px] py-1 rounded-lg uppercase">
                Mark Resolved
              </div>
            </div>

            {/* 4. Manage Repairs */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col justify-between">
              <div>
                <span className="text-[8px] bg-indigo-500/10 text-indigo-600 font-black px-1.5 py-0.5 rounded uppercase block w-max mb-1">04 / History</span>
                <h4 className="text-[10px] font-black text-slate-800">Repair Audits</h4>
                <p className="text-[8px] text-slate-400 mt-1">Logs stored inside the master PM history ledger for compliance.</p>
              </div>
              <div className="bg-slate-800 text-white font-black text-center text-[8.5px] py-1 rounded-lg uppercase">
                View History
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Get real-time alerts the moment a breakdown is reported. Assign the nearest available technician using location tracking and update clients immediately. Reduce elevator downtime.
          </p>
        </div>
      );

    case 9:
      // Slide 10: Repair Order
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">08 / Repair & BOM Documents</span>
            <span className="text-[11px] font-mono font-bold text-slate-500">Document Flow</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 flex-1 items-center">
            
            {/* Left: Description and bullets */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-[#072445] tracking-tight">Structured Part Logistics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log and manage every repair request with full visibility from issue to resolution. Track spare parts, log delivery notes, and generate Purchase Orders (PO), Goods Receipt Notes (GRN), and Delivery Chalans (DC) instantly.
              </p>

              <div className="space-y-1.5 text-[10px] font-bold text-slate-600 font-mono">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>PO - Purchase Orders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>GRN - Goods Receipt Notes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>DC - Delivery Chalans</span>
                </div>
              </div>
            </div>

            {/* Right: Overlapping mockups of document PDFs */}
            <div className="relative h-44 flex items-center justify-center">
              
              {/* Purchase Order Mock */}
              <div className="absolute left-4 top-2 bg-slate-50 border border-slate-200 rounded-xl p-3 w-48 shadow-lg transform -rotate-6 z-10 hover:z-30 transition-all">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200 text-[8px] font-bold text-slate-400">
                  <span>PO-2026/1105</span>
                  <span className="text-sky-500">Purchase Order</span>
                </div>
                <p className="text-[10px] font-black text-slate-800 mt-1.5">Emirates Steel</p>
                <p className="text-[9px] text-slate-400">BOM: Shaft angles & brackets</p>
                <p className="text-[10px] text-emerald-600 font-black mt-1 font-mono">AED 450,000</p>
              </div>

              {/* Goods Receipt Note Mock */}
              <div className="absolute right-4 bottom-2 bg-white border border-slate-200 rounded-xl p-3 w-48 shadow-lg transform rotate-3 z-20 hover:z-30 transition-all">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200 text-[8px] font-bold text-slate-400">
                  <span>GRN-2026/0841</span>
                  <span className="text-emerald-500">GRN Receipt</span>
                </div>
                <p className="text-[10px] font-black text-slate-800 mt-1.5">Gulf Lift Motors</p>
                <p className="text-[9px] text-slate-400">BOM: Gearless motor unit</p>
                <p className="text-[10px] text-[#072445] font-black mt-1 font-mono">AED 890,000</p>
              </div>

            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Ensure no repair request falls through the cracks. Maintain complete electronic accountability for every spare part and field installation.
          </p>
        </div>
      );

    case 10:
      // Slide 11: BirdEye Dashboard for Management
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">09 / BirdEye Business Dashboard</span>
            <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">Management Snapshot</span>
          </div>

          {/* 4 beautifully structured donut-looking charts with stats */}
          <div className="grid grid-cols-4 gap-3 my-4 flex-1 items-center">
            
            {/* Donut Chart 1: Enquiries */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center h-full min-h-[170px]">
              <span className="text-[8px] font-black text-slate-400 uppercase">Enquiries</span>
              
              {/* Dynamic SVG Donut Chart */}
              <div className="relative w-16 h-16 my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeDasharray="62 38" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-black">112</span>
                  <span className="text-[7px] text-slate-400 uppercase">Cases</span>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] font-black text-[#072445]">62% Finalized</p>
                <p className="text-[7.5px] text-slate-400 font-mono">80 Deals Won</p>
              </div>
            </div>

            {/* Donut Chart 2: Jobs */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center h-full min-h-[170px]">
              <span className="text-[8px] font-black text-slate-400 uppercase">Jobs Installed</span>
              
              <div className="relative w-16 h-16 my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="33 67" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-black">108</span>
                  <span className="text-[7px] text-slate-400 uppercase">Sites</span>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] font-black text-emerald-600">33% Completed</p>
                <p className="text-[7.5px] text-slate-400 font-mono">67 Active Handover</p>
              </div>
            </div>

            {/* Donut Chart 3: PM */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center h-full min-h-[170px]">
              <span className="text-[8px] font-black text-slate-400 uppercase">PM Compliance</span>
              
              <div className="relative w-16 h-16 my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.5" strokeDasharray="88 12" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-black">107</span>
                  <span className="text-[7px] text-slate-400 uppercase">SLA</span>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] font-black text-amber-600">88% Confirmed</p>
                <p className="text-[7.5px] text-slate-400 font-mono">94 SLA active</p>
              </div>
            </div>

            {/* Donut Chart 4: Breakdowns */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-between text-center h-full min-h-[170px]">
              <span className="text-[8px] font-black text-slate-400 uppercase">Breakdowns</span>
              
              <div className="relative w-16 h-16 my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.5" strokeDasharray="45 55" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xs font-black">63</span>
                  <span className="text-[7px] text-slate-400 uppercase">Alerts</span>
                </div>
              </div>

              <div>
                <p className="text-[9.5px] font-black text-rose-600">45% Addressed</p>
                <p className="text-[7.5px] text-slate-400 font-mono">45 Started on map</p>
              </div>
            </div>

          </div>

          {/* Quick interactive looking sub-nav */}
          <div className="flex justify-center gap-2 py-1.5 border-t border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 px-3 py-1 rounded bg-slate-50 border border-slate-200">Track</span>
            <span className="text-[9px] font-black uppercase text-slate-400 px-3 py-1 rounded bg-slate-50 border border-slate-200">Analyze</span>
            <span className="text-[9px] font-black uppercase text-slate-400 px-3 py-1 rounded bg-slate-50 border border-slate-200">Overview</span>
            <span className="text-[9px] font-black uppercase text-slate-400 px-3 py-1 rounded bg-slate-50 border border-slate-200">Implement</span>
            <span className="text-[9px] font-black uppercase text-[#072445] px-3 py-1 rounded bg-sky-100 border border-sky-200">Visualize</span>
          </div>
        </div>
      );

    case 11:
      // Slide 12: Live Location Tracking
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">10 / Live Location Tracking</span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono animate-pulse">● 14 Techs Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 flex-1 items-center">
            
            {/* Left: Employee tracking map mockup */}
            <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50/50 h-full flex flex-col justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Geographic Live Grid</span>
              
              {/* Simulated Map SVG */}
              <div className="bg-sky-50 border border-sky-100 rounded-xl flex-1 flex items-center justify-center relative min-h-[120px] my-1.5 overflow-hidden">
                <svg className="w-full h-full opacity-30 absolute inset-0" viewBox="0 0 100 100">
                  <path d="M10 0 L10 100 M30 0 L30 100 M50 0 L50 100 M70 0 L70 100 M90 0 L90 100 M0 20 L100 20 M0 40 L100 40 M0 60 L100 60 M0 80 L100 80" stroke="#0284c7" strokeWidth="0.5" />
                  <path d="M0 30 Q50 50 100 70" stroke="#0284c7" strokeWidth="2" fill="none" />
                </svg>

                {/* Pin 1 */}
                <div className="absolute top-1/4 left-1/3 flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-emerald-500 animate-bounce" />
                  <span className="text-[7.5px] bg-slate-800 text-white font-extrabold px-1 rounded -mt-1 shadow">Shrutika</span>
                </div>

                {/* Pin 2 */}
                <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-sky-500 animate-pulse" />
                  <span className="text-[7.5px] bg-slate-800 text-white font-extrabold px-1 rounded -mt-1 shadow">Rohit</span>
                </div>
              </div>

              <p className="text-[8.5px] text-slate-400 text-center font-mono">GPS Dispatch Engine active</p>
            </div>

            {/* Middle: Active Fleet list */}
            <div className="border border-slate-200 rounded-2xl p-2.5 bg-slate-50/50 h-full flex flex-col justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Fleet Radar</span>
              
              <div className="space-y-1.5 my-2">
                <div className="bg-white border border-slate-100 p-2 rounded-lg flex justify-between items-center text-[9px]">
                  <div>
                    <h5 className="font-black text-slate-700">Shrutika Thore</h5>
                    <p className="text-slate-400 text-[8px]">Moving to Wakad · 10:12 AM</p>
                  </div>
                  <span className="text-slate-500">🔋 34%</span>
                </div>

                <div className="bg-white border border-slate-100 p-2 rounded-lg flex justify-between items-center text-[9px]">
                  <div>
                    <h5 className="font-black text-slate-700">Rohit Patil</h5>
                    <p className="text-slate-400 text-[8px]">On Site (Saffron) · 11:12 AM</p>
                  </div>
                  <span className="text-emerald-600 font-extrabold">🔋 82%</span>
                </div>
              </div>

              <div className="bg-emerald-500 text-white font-black text-center text-[8.5px] py-1 rounded uppercase">
                Optimized Routes
              </div>
            </div>

            {/* Right: Timeline clock log */}
            <div className="border border-slate-200 rounded-2xl p-2.5 bg-[#072445] text-white h-full flex flex-col justify-between">
              <span className="text-[9px] font-black text-sky-300 uppercase tracking-widest block">Timeline Logs</span>
              
              <div className="space-y-2 text-[8.5px] my-1.5 font-sans">
                <div className="border-l-2 border-emerald-400 pl-2">
                  <p className="font-black">09:00 AM - Clock In</p>
                  <p className="text-slate-400 text-[8px]">GPS verification approved</p>
                </div>
                <div className="border-l-2 border-sky-400 pl-2">
                  <p className="font-black">10:00 AM - Site Visit Started</p>
                  <p className="text-slate-400 text-[8px]">Site visit registered at Wakad</p>
                </div>
                <div className="border-l-2 border-slate-500 pl-2">
                  <p className="font-black">06:00 PM - Clock Out</p>
                  <p className="text-slate-400 text-[8px]">Summary log generated</p>
                </div>
              </div>

              <span className="text-[7.5px] text-slate-400 font-mono text-center">Auto compliance logs stored</span>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Monitor your field technicians in real-time as they move between job sites. Know exactly where your team is and assign urgent tasks based on proximity.
          </p>
        </div>
      );

    case 12:
      // Slide 13: MIS Reporting
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">11 / Structured MIS Reporting</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">Excel / PDF Format</span>
          </div>

          <div className="my-4 flex-1 flex flex-col justify-center space-y-4">
            
            {/* Diagram */}
            <div className="flex items-center justify-center gap-6 bg-slate-50 border border-slate-200/60 py-3 rounded-2xl max-w-xl mx-auto w-full">
              <div className="text-center">
                <span className="text-[10px] font-black text-[#072445] block">Complex Database Records</span>
                <span className="text-[8px] text-slate-400">Leads, PM, Billing, Spares, GPS</span>
              </div>
              <span className="text-slate-400 text-xl font-bold">➔</span>
              <div className="text-center">
                <span className="text-[10px] font-black text-emerald-600 block">Structured MIS Spreadsheets</span>
                <span className="text-[8px] text-slate-400">Actionable analytical reporting</span>
              </div>
            </div>

            {/* Grid of the 16 report tabs */}
            <div className="grid grid-cols-4 gap-2.5 w-full max-w-3xl mx-auto">
              {[
                'Inventory Report', 'Attendance Report',
                'Field Team Tracking', 'BOM Report',
                'Lead Report', 'Enquiry Report',
                'PM Sales', 'FollowUp Report',
                'Quotation Report', 'Job Report',
                'PMS Report', 'Service Slots',
                'Site Visit Tracking', 'Breakdown Report',
                'User Performance', 'Repair Order'
              ].map((report, i) => (
                <div key={i} className="p-2 border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/20 text-center font-bold text-[9.5px] text-slate-700 rounded-xl transition duration-200 shadow-sm cursor-pointer transform hover:scale-[1.02]">
                  📄 {report}
                </div>
              ))}
            </div>

          </div>

          <div className="text-center border-t border-slate-100 pt-2">
            <span className="text-xs font-black uppercase tracking-wider text-sky-600">And Much More...</span>
          </div>
        </div>
      );

    case 13:
      // Slide 14: Strategy Call
      return (
        <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-4xl text-slate-800 flex flex-col justify-between h-full min-h-[350px]">
          {/* Header Tab */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-black text-[#072445] uppercase tracking-wider bg-slate-100 px-3 py-1 rounded">Let&apos;s Organize & Scale Your Operations</span>
            <span className="text-[11px] font-mono font-bold text-slate-500">Contact Us</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 flex-1 items-center">
            
            {/* Left Box: SVG QR Code */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center space-y-2.5 max-w-xs mx-auto w-full text-center">
              <span className="text-[10px] font-black text-[#072445] uppercase tracking-wider">Book a Strategy Call</span>
              
              {/* High-Fidelity SVG QR Code */}
              <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-md">
                <svg viewBox="0 0 100 100" className="w-24 h-24 text-[#072445]" fill="currentColor">
                  {/* Position detection patterns */}
                  <rect x="0" y="0" width="25" height="25" />
                  <rect x="3" y="3" width="19" height="19" fill="white" />
                  <rect x="6" y="6" width="13" height="13" />

                  <rect x="75" y="0" width="25" height="25" />
                  <rect x="78" y="3" width="19" height="19" fill="white" />
                  <rect x="81" y="6" width="13" height="13" />

                  <rect x="0" y="75" width="25" height="25" />
                  <rect x="3" y="78" width="19" height="19" fill="white" />
                  <rect x="6" y="81" width="13" height="13" />

                  {/* Random simulated QR matrix blocks */}
                  <rect x="35" y="10" width="10" height="5" />
                  <rect x="45" y="15" width="5" height="10" />
                  <rect x="55" y="5" width="10" height="5" />
                  <rect x="35" y="35" width="15" height="15" />
                  <rect x="55" y="40" width="10" height="15" />
                  <rect x="10" y="35" width="5" height="15" />
                  <rect x="15" y="55" width="15" height="5" />
                  <rect x="35" y="60" width="20" height="5" />
                  <rect x="65" y="65" width="10" height="10" />
                  <rect x="80" y="45" width="15" height="5" />
                  <rect x="85" y="55" width="5" height="15" />
                  <rect x="40" y="80" width="15" height="15" />
                </svg>
              </div>

              <p className="text-[10px] font-bold text-slate-500 uppercase">Scan QR to Schedule Demo</p>
            </div>

            {/* Right Box: Link and details */}
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center text-center space-y-1">
                <a 
                  href="https://elevatorplus.app/demo-request" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-sm font-black text-sky-600 hover:underline tracking-tight"
                >
                  elevatorplus.app/demo-request
                </a>
                <span className="text-[9.5px] font-bold text-slate-400 uppercase">(Click on Link)</span>
              </div>

              {/* Three white contact pills */}
              <div className="grid grid-cols-1 gap-2 text-[10px] font-bold text-slate-500 uppercase">
                <div className="p-2 border border-slate-200 bg-white rounded-xl flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <span>Call: +91 888 383 2222</span>
                </div>
                <div className="p-2 border border-slate-200 bg-white rounded-xl flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-500" />
                  <span>Website: elevatorplus.app</span>
                </div>
                <div className="p-2 border border-slate-200 bg-white rounded-xl flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>Email: hello@elevatorplus.app</span>
                </div>
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 font-medium text-center border-t border-slate-100 pt-2 leading-relaxed">
            Let’s review how ElevatorPlus can optimize your unique logistics. Request a dedicated product setup alignment or commercial contract review.
          </p>
        </div>
      );

    default:
      return null;
  }
}
