import React, { useState } from "react";
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  PieChart as PieIcon, 
  Briefcase, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown, 
  Calendar, 
  Activity, 
  FileText, 
  RefreshCw, 
  BrainCircuit, 
  Send
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { YStack, XStack, Heading, Text, Card, Button } from "../components/Tamagui";
import { useProfile } from "../components/ProfileContext";
import { useProjects, Project, Expense } from "../components/ProjectContext";

export default function ProjectFinance() {
  const navigate = useNavigate();
  const { theme } = useProfile();
  const isLight = theme === "light";
  const { projects, addProject, addExpense, getAIAnalysis } = useProjects();

  // Active sub-tab
  const [activeSubTab, setActiveSubTab] = useState<"projects" | "ai">("projects");
  
  // UI states
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [financeAlert, setFinanceAlert] = useState<string | null>(null);

  // Form states - Project
  const [newProjName, setNewProjName] = useState("");
  const [newProjLocation, setNewProjLocation] = useState("Dubai");
  const [newProjBudget, setNewProjBudget] = useState("");

  // Form states - Expense
  const [selectedProjId, setSelectedProjId] = useState(projects[0]?.id || "");
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpAmount, setNewExpAmount] = useState("");
  const [newExpCategory, setNewExpCategory] = useState<Expense["category"]>("Materials");
  const [newExpDate, setNewExpDate] = useState(new Date().toISOString().split("T")[0]);

  // AI states
  const [aiResponse, setAiResponse] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [aiModel, setAiModel] = useState("");

  // Local analytical insights generated instantly
  const categorySums: Record<string, number> = {};
  let totalMaterialsCost = 0;
  let highBurnCount = 0;
  
  projects.forEach(p => {
    const totalSpent = p.expenses ? p.expenses.reduce((s, e) => s + e.amount, 0) : 0;
    const spendRate = p.budget > 0 ? Math.round((totalSpent / p.budget) * 100) : 0;
    if (spendRate > p.completed && p.status !== "completed") {
      highBurnCount++;
    }
    if (p.expenses) {
      p.expenses.forEach(e => {
        categorySums[e.category] = (categorySums[e.category] || 0) + e.amount;
        if (e.category === "Materials") {
          totalMaterialsCost += e.amount;
        }
      });
    }
  });

  const sortedCategories = Object.entries(categorySums).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0]?.[0] || "None";
  const topCategoryCost = sortedCategories[0]?.[1] || 0;

  // Real-time AI interactive states for the main budgets tab
  const [panelAIResponse, setPanelAIResponse] = useState<string>("");
  const [panelAILoading, setPanelAILoading] = useState(false);

  const triggerPortfolioAudit = async () => {
    setPanelAILoading(true);
    setPanelAIResponse("");
    try {
      const response = await getAIAnalysis(
        "chat",
        `Synthesize a strict cost-efficiency audit for Taj Lift Management. Specifically, review our active elevator portfolio: total budget of AED ${totalPortfolioBudget.toLocaleString()}, spent so far AED ${totalPortfolioSpend.toLocaleString()}, top cost category is ${topCategory} (AED ${topCategoryCost.toLocaleString()}), and we have ${highBurnCount} project(s) flag-marked as High-Burn (spending faster than completion %). Provide 3 highly creative, practical cost-saving recommendations for lift materials or labor procurement.`
      );
      setPanelAIResponse(response.result);
      triggerAlert("Dynamic AI Spend Audit finalized successfully!");
    } catch (err: any) {
      setPanelAIResponse(`Failed to synthesize portfolio cost advice. ${err.message || ""}`);
    } finally {
      setPanelAILoading(false);
    }
  };

  const triggerAlert = (msg: string) => {
    setFinanceAlert(msg);
    setTimeout(() => {
      setFinanceAlert(null);
    }, 4000);
  };

  // Math Calculations
  const totalPortfolioBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalPortfolioSpend = projects.reduce((sum, p) => {
    const projSpend = p.expenses ? p.expenses.reduce((s, e) => s + e.amount, 0) : 0;
    return sum + projSpend;
  }, 0);
  const remainingBudget = totalPortfolioBudget - totalPortfolioSpend;
  const spentPercentage = totalPortfolioBudget > 0 ? Math.round((totalPortfolioSpend / totalPortfolioBudget) * 100) : 0;

  // Form handlers
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName || !newProjBudget) {
      triggerAlert("Please enter all project fields!");
      return;
    }
    const budgetVal = parseFloat(newProjBudget);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      triggerAlert("Please enter a valid budget amount!");
      return;
    }
    const newProj = addProject(newProjName, newProjLocation, budgetVal);
    setNewProjName("");
    setNewProjBudget("");
    setIsAddingProject(false);
    setSelectedProjId(newProj.id);
    triggerAlert(`Project "${newProjName}" added successfully with ID: ${newProj.id}`);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjId || !newExpTitle || !newExpAmount) {
      triggerAlert("Please enter all expense fields!");
      return;
    }
    const amountVal = parseFloat(newExpAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      triggerAlert("Please enter a valid expense amount!");
      return;
    }
    addExpense(selectedProjId, newExpTitle, amountVal, newExpCategory, newExpDate);
    setNewExpTitle("");
    setNewExpAmount("");
    setIsAddingExpense(false);
    triggerAlert(`Expense of AED ${amountVal.toLocaleString()} logged into project successfully!`);
  };

  // AI handler
  const handleAIRequest = async (type: "report" | "summary" | "chat", promptText?: string) => {
    setAiLoading(true);
    setAiResponse("");
    setActiveSubTab("ai");
    try {
      const response = await getAIAnalysis(type, promptText || customPrompt);
      setAiResponse(response.result);
      setAiModel(response.modelUsed || "gemini-3.1-pro-preview");
      if (type === "chat") {
        setCustomPrompt("");
      }
    } catch (err: any) {
      setAiResponse(`Failed to communicate with AI model. ${err.message || ""}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper parser to render Gemini markdown elegantly
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="text-xs font-black mt-3 mb-1 text-sky-400 uppercase tracking-wide">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="text-sm font-black mt-4 mb-2 text-sky-400 border-b border-white/5 pb-0.5 uppercase">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={idx} className="text-base font-black mt-5 mb-3 text-white border-b border-white/10 pb-1">{line.replace("# ", "")}</h2>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const cleanLine = line.substring(2);
        return (
          <li key={idx} className="ml-3.5 list-disc text-[11px] leading-relaxed text-slate-300 dark:text-slate-300 my-1">
            {parseBoldText(cleanLine)}
          </li>
        );
      }
      if (line.trim() === "") return <div key={idx} className="h-1.5" />;
      return <p key={idx} className="text-[11px] leading-relaxed text-slate-300 dark:text-slate-200 my-1">{parseBoldText(line)}</p>;
    });
  };

  const parseBoldText = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-black text-sky-400 dark:text-sky-300">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <YStack className={`h-full overflow-y-auto no-scrollbar pb-24 relative ${isLight ? "text-slate-800" : "text-white"}`}>
      {/* Top Header Block */}
      <XStack jc="space-between" ai="center" className={`px-4 py-3.5 sticky top-0 z-10 border-b transition-colors duration-300 ${
        isLight ? "bg-white/90 backdrop-blur-md border-slate-200/60 shadow-sm" : "bg-[#0f1524]/85 backdrop-blur-md border-white/10"
      }`}>
        <XStack ai="center" className="gap-3">
          <button
            onClick={() => navigate("/")}
            className={`p-1 cursor-pointer transition-colors ${isLight ? "text-slate-600 hover:text-slate-900" : "text-white/80 hover:text-white"}`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Heading level={4} className={`text-sm font-black uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>Project Finance</Heading>
        </XStack>
        <span className="text-[9px] bg-sky-500/10 text-sky-500 dark:text-sky-300 font-extrabold px-2.5 py-0.5 rounded-full border border-sky-400/20">
          Smart Ledger
        </span>
      </XStack>

      {/* Tab Selector Links */}
      <div className={`w-full p-1 rounded-none flex border-b ${isLight ? "bg-slate-100 border-slate-200" : "bg-white/5 border-white/5"}`}>
        <button
          onClick={() => setActiveSubTab("projects")}
          className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer ${
            activeSubTab === "projects"
              ? isLight ? "bg-sky-600 text-white shadow-md" : "bg-sky-500 text-white shadow-lg"
              : isLight ? "text-slate-600 hover:bg-slate-300/30" : "text-slate-300 hover:bg-white/5"
          }`}
        >
          Budgets & Expenses
        </button>
        <button
          onClick={() => handleAIRequest("summary")}
          className={`flex-1 py-2 px-2.5 text-center text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all font-black cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === "ai"
              ? isLight ? "bg-sky-600 text-white shadow-md" : "bg-sky-500 text-white shadow-lg"
              : isLight ? "text-slate-600 hover:bg-slate-300/30" : "text-slate-300 hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20 animate-pulse" />
          AI Money Advisor
        </button>
      </div>

      {/* Toast Alert */}
      {financeAlert && (
        <div className={`absolute top-24 left-4 right-4 z-30 border p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideDown_0.2s_ease-out_forwards] ${
          isLight ? "bg-slate-900 border-slate-950/20 text-white" : "bg-slate-950/95 border-emerald-500/25 text-white"
        }`}>
          <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold">{financeAlert}</p>
        </div>
      )}

      {/* Primary Panels */}
      <div className="p-4 space-y-4">
        {activeSubTab === "projects" && (
          <>
            {/* Top Stats Cards */}
            <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 relative overflow-hidden ${
              isLight ? "bg-white border-slate-200" : "bg-white/5 backdrop-blur-md border-white/5"
            }`}>
              <div className="flex justify-between items-center">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? "text-slate-500" : "text-sky-300"}`}>Portfolio Budget Health</p>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className={`text-[9px] font-bold ${isLight ? "text-slate-500" : "text-slate-400"}`}>SLA Safe</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <span className={`text-[9px] font-bold block uppercase tracking-wider ${isLight ? "text-slate-400" : "text-white/40"}`}>Total Budget</span>
                  <span className={`text-sm font-black font-mono text-sky-500 dark:text-sky-400`}>AED {totalPortfolioBudget.toLocaleString()}</span>
                </div>
                <div>
                  <span className={`text-[9px] font-bold block uppercase tracking-wider ${isLight ? "text-slate-400" : "text-white/40"}`}>Total Expensed</span>
                  <span className={`text-sm font-black font-mono ${isLight ? "text-slate-800" : "text-white"}`}>AED {totalPortfolioSpend.toLocaleString()}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-extrabold uppercase">
                  <span>Usage Rate ({spentPercentage}%)</span>
                  <span>Balance: AED {remainingBudget.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      spentPercentage > 85 ? "bg-rose-500" : spentPercentage > 60 ? "bg-amber-500" : "bg-sky-500"
                    }`}
                    style={{ width: `${spentPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* AI-Powered Spend Insights & Savings Advisor */}
            <div className={`rounded-2xl p-4 border shadow-lg space-y-3.5 relative overflow-hidden transition-all duration-300 ${
              isLight ? "bg-gradient-to-br from-sky-50/50 to-white border-slate-200" : "bg-[#0c1221] border-sky-500/10 shadow-sky-500/5"
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-center border-b pb-2.5 border-slate-200/40 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-sky-500/10 rounded-lg text-sky-500 dark:text-sky-300">
                    <Sparkles className="w-4 h-4 text-sky-500 fill-sky-500/10 animate-pulse" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-slate-800" : "text-white"}`}>
                      AI-Powered Spend Insights
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400">Powered by Gemini 3.1 Pro</p>
                  </div>
                </div>
                <span className="text-[8px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  Real-time Audits
                </span>
              </div>

              {/* Instant Automated Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <div className={`p-2.5 rounded-xl border ${isLight ? "bg-white border-slate-200/80" : "bg-white/5 border-white/5"}`}>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">Top Cost Heavy</span>
                  <p className="text-xs font-black text-sky-500 mt-0.5 truncate">{topCategory}</p>
                  <span className="text-[9px] font-mono opacity-60">AED {topCategoryCost.toLocaleString()} logged</span>
                </div>

                <div className={`p-2.5 rounded-xl border ${isLight ? "bg-white border-slate-200/80" : "bg-white/5 border-white/5"}`}>
                  <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wide">Optimization Potential</span>
                  <p className="text-xs font-black text-emerald-500 mt-0.5">
                    AED {Math.round(totalPortfolioSpend * 0.08).toLocaleString()}
                  </p>
                  <span className="text-[9px] opacity-60">Est. 8% procurement saving</span>
                </div>
              </div>

              {/* Anomaly / Cost Burn Checks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span>Diagnostics Check</span>
                  <span>{highBurnCount === 0 ? "Perfect Health" : "Attention Required"}</span>
                </div>

                <div className="space-y-1.5 text-[10px] font-bold">
                  {highBurnCount > 0 ? (
                    <div className="flex items-start gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
                      <AlertTriangle className="w-3.5 h-3.5 flex-none mt-0.5" />
                      <div>
                        <p className="font-extrabold">Burn Velocity Flag</p>
                        <p className="text-[9px] opacity-80 mt-0.5">{highBurnCount} active projects are out-pacing milestone completion stage relative to budgets spent.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-2 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-500">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-none mt-0.5" />
                      <div>
                        <p className="font-extrabold">No Budget Anomalies</p>
                        <p className="text-[9px] opacity-80 mt-0.5">All installation budgets are optimally tracking under target milestone spending thresholds.</p>
                      </div>
                    </div>
                  )}

                  {topCategory === "Materials" && (
                    <div className="flex items-start gap-2 p-2 bg-sky-500/10 border border-sky-500/15 rounded-xl text-sky-500">
                      <TrendingUp className="w-3.5 h-3.5 flex-none mt-0.5" />
                      <div>
                        <p className="font-extrabold">Material Bulk Lever</p>
                        <p className="text-[9px] opacity-80 mt-0.5">High concentration in Raw Materials. Consolidation of steel frame & hoist unit suppliers can shave up to 12% in procurement costs.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Run Gemini Audit Button */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={panelAILoading}
                  onClick={triggerPortfolioAudit}
                  className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                    panelAILoading
                      ? "bg-slate-700 text-slate-300 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md shadow-sky-500/15 hover:shadow-lg hover:shadow-sky-500/20 active:scale-98"
                  }`}
                >
                  {panelAILoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Synthesizing Deep Budget Audit...</span>
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-3.5 h-3.5 text-white" />
                      <span>Generate Dynamic AI Cost Audit</span>
                    </>
                  )}
                </button>
              </div>

              {/* Audit Response Container */}
              <AnimatePresence>
                {panelAIResponse && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-xl border p-3 mt-3 overflow-hidden text-xs max-h-[250px] overflow-y-auto ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-950/60 border-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-center border-b pb-1.5 border-white/5 mb-2">
                      <span className="text-[9px] font-black uppercase text-sky-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-400" /> Actionable Advisor Recommendations
                      </span>
                      <button 
                        onClick={() => setPanelAIResponse("")} 
                        className="text-[9px] opacity-50 hover:opacity-100"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {renderMarkdown(panelAIResponse)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Action Buttons */}
            <XStack className="gap-2.5">
              <Button 
                onClick={() => {
                  setIsAddingProject(!isAddingProject);
                  setIsAddingExpense(false);
                }} 
                className="flex-1 bg-sky-500/10 border border-sky-400/20 text-sky-600 dark:text-sky-300 font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-xl flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Project
              </Button>
              <Button 
                onClick={() => {
                  setIsAddingExpense(!isAddingExpense);
                  setIsAddingProject(false);
                }}
                className="flex-1 bg-sky-500 text-white font-extrabold text-[10px] uppercase tracking-wider py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
              >
                <DollarSign className="w-4 h-4" /> Log Expense
              </Button>
            </XStack>

            {/* Form Add Project */}
            <AnimatePresence>
              {isAddingProject && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateProject}
                  className={`rounded-2xl p-4 border shadow-2xl space-y-3.5 overflow-hidden text-xs ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-white/10"
                  }`}
                >
                  <Heading level={5} className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-sky-500">
                    <Briefcase className="w-4 h-4" /> Create Elevator Project
                  </Heading>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">Project Title / Client Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Pune Solitaire HighRise Tower C" 
                        value={newProjName}
                        onChange={(e) => setNewProjName(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 border outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">City / Location</label>
                        <select 
                          value={newProjLocation} 
                          onChange={(e) => setNewProjLocation(e.target.value)}
                          className={`w-full rounded-xl px-2.5 py-2 border outline-none ${
                            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                          }`}
                        >
                          <option value="Dubai">Dubai</option>
                          <option value="Abu Dhabi">Abu Dhabi</option>
                          <option value="Sharjah">Sharjah</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">Project Budget (AED)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="e.g. 1800000" 
                          value={newProjBudget}
                          onChange={(e) => setNewProjBudget(e.target.value)}
                          className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                  <XStack className="gap-2 pt-1.5">
                    <Button 
                      type="button" 
                      onClick={() => setIsAddingProject(false)}
                      className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-xl border ${
                        isLight ? "bg-white border-slate-200 text-slate-600" : "bg-white/5 border-white/5 text-slate-300"
                      }`}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-sky-500 text-white py-2 text-[10px] uppercase font-bold rounded-xl"
                    >
                      Create Project
                    </Button>
                  </XStack>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Form Log Expense */}
            <AnimatePresence>
              {isAddingExpense && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateExpense}
                  className={`rounded-2xl p-4 border shadow-2xl space-y-3.5 overflow-hidden text-xs ${
                    isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-white/10"
                  }`}
                >
                  <Heading level={5} className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-sky-500">
                    <DollarSign className="w-4 h-4" /> Log Project Expense
                  </Heading>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">Target Project</label>
                      <select 
                        value={selectedProjId}
                        onChange={(e) => setSelectedProjId(e.target.value)}
                        className={`w-full rounded-xl px-2.5 py-2 border outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                        }`}
                      >
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">Expense Description</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Cabin Guide Rails purchase" 
                        value={newExpTitle}
                        onChange={(e) => setNewExpTitle(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 border outline-none ${
                          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">Cost Category</label>
                        <select 
                          value={newExpCategory} 
                          onChange={(e) => setNewExpCategory(e.target.value as any)}
                          className={`w-full rounded-xl px-2.5 py-2 border outline-none ${
                            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                          }`}
                        >
                          <option value="Materials">Materials</option>
                          <option value="Labor">Labor</option>
                          <option value="Permits">Permits</option>
                          <option value="Logistics">Logistics</option>
                          <option value="Repairs">Repairs</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">Cost (AED)</label>
                        <input 
                          type="number" 
                          required
                          placeholder="e.g. 75000" 
                          value={newExpAmount}
                          onChange={(e) => setNewExpAmount(e.target.value)}
                          className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                            isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold mb-1 opacity-70">Bill Date</label>
                      <input 
                        type="date" 
                        value={newExpDate}
                        onChange={(e) => setNewExpDate(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 border outline-none font-mono ${
                          isLight ? "bg-white border-slate-200 text-slate-800" : "bg-slate-950/50 border-white/15 text-white"
                        }`}
                      />
                    </div>
                  </div>
                  <XStack className="gap-2 pt-1.5">
                    <Button 
                      type="button" 
                      onClick={() => setIsAddingExpense(false)}
                      className={`flex-1 py-2 text-[10px] uppercase font-bold rounded-xl border ${
                        isLight ? "bg-white border-slate-200 text-slate-600" : "bg-white/5 border-white/5 text-slate-300"
                      }`}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-sky-500 text-white py-2 text-[10px] uppercase font-bold rounded-xl"
                    >
                      Log Charge
                    </Button>
                  </XStack>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Projects List Card Stack */}
            <div className="space-y-2.5">
              <Heading level={5} className={`text-[10px] font-black uppercase tracking-widest ${isLight ? "text-slate-500" : "text-white/50"}`}>
                Elevator Installation Portfolios
              </Heading>

              {projects.map((proj) => {
                const totalSpent = proj.expenses ? proj.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0;
                const spendRate = proj.budget > 0 ? Math.round((totalSpent / proj.budget) * 100) : 0;
                const isExpanded = expandedProjectId === proj.id;
                
                // Alert if budget is outpaced by completion
                const isRisk = spendRate > proj.completed && proj.status !== "completed";

                return (
                  <div 
                    key={proj.id} 
                    className={`rounded-2xl border overflow-hidden shadow-md transition-colors duration-300 ${
                      isLight 
                        ? isRisk ? "bg-rose-50/50 border-rose-200" : "bg-white border-slate-200" 
                        : isRisk ? "bg-rose-950/10 border-rose-500/15" : "bg-white/5 border-white/5"
                    }`}
                  >
                    {/* Project Main Row */}
                    <div 
                      onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                      className="p-4 cursor-pointer flex justify-between items-start select-none"
                    >
                      <div className="space-y-1.5 flex-1 pr-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            proj.status === "completed" ? "bg-emerald-500/10 text-emerald-500" :
                            proj.status === "ongoing" ? "bg-sky-500/10 text-sky-500" : "bg-amber-500/10 text-amber-500"
                          }`}>
                            {proj.status}
                          </span>
                          <span className={`text-[9px] font-bold font-mono ${isLight ? "text-slate-400" : "text-white/40"}`}>
                            {proj.id}
                          </span>
                          {isRisk && (
                            <span className="text-[8px] bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/25 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" /> High Burn
                            </span>
                          )}
                        </div>
                        <h4 className={`text-xs font-black leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>
                          {proj.name}
                        </h4>
                        <div className="flex gap-4 text-[10px] font-bold">
                          <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                            Budget: <strong className="font-extrabold font-mono text-sky-500">AED {proj.budget.toLocaleString()}</strong>
                          </span>
                          <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                            Spent: <strong className="font-extrabold font-mono text-emerald-500">AED {totalSpent.toLocaleString()}</strong>
                          </span>
                        </div>

                        {/* Project specific budget bars */}
                        <div className="pt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isRisk ? "bg-rose-500" : "bg-sky-500"}`}
                              style={{ width: `${spendRate}%` }}
                            ></div>
                          </div>
                          <span className="text-[9px] font-bold font-mono text-slate-400 flex-none">{spendRate}% spend vs {proj.completed}% complete</span>
                        </div>
                      </div>

                      <div className="pt-2 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>

                    {/* Project Expenses Expanded Drawer */}
                    {isExpanded && (
                      <div className={`p-4 border-t text-xs space-y-3 ${
                        isLight ? "bg-slate-50/50 border-slate-100" : "bg-slate-950/30 border-white/5"
                      }`}>
                        <div className="flex justify-between items-center">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-sky-400">Charge ledger details</h5>
                          <p className="text-[9px] font-bold opacity-60">Location: {proj.location}</p>
                        </div>

                        {proj.expenses && proj.expenses.length > 0 ? (
                          <div className="space-y-2">
                            {proj.expenses.map((exp) => (
                              <div 
                                key={exp.id} 
                                className={`p-2.5 rounded-xl border flex justify-between items-center ${
                                  isLight ? "bg-white border-slate-100 shadow-sm" : "bg-white/5 border-white/5"
                                }`}
                              >
                                <div>
                                  <p className={`text-[11px] font-black ${isLight ? "text-slate-800" : "text-white"}`}>{exp.title}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-bold opacity-60">
                                    <span className="bg-sky-500/10 text-sky-500 px-1 py-0.2 rounded text-[8px] uppercase">{exp.category}</span>
                                    <span>{exp.date}</span>
                                    <span>·</span>
                                    <span>{exp.reportedBy}</span>
                                  </div>
                                </div>
                                <span className="text-xs font-black font-mono text-sky-500">AED {exp.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 border border-dashed rounded-xl text-center text-[10px] opacity-50">
                            No active expenses logged. Tap "Log Expense" above to allocate first bill.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* AI Money Advisor Tab */}
        {activeSubTab === "ai" && (
          <div className="space-y-4">
            {/* AI Assistant Intro Header Card */}
            <div className={`p-4 rounded-2xl border relative overflow-hidden ${
              isLight ? "bg-sky-50 border-sky-200/60" : "bg-gradient-to-r from-sky-500/20 to-blue-500/10 border-sky-500/15"
            }`}>
              <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none">
                <Sparkles className="w-24 h-24 text-sky-400" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-sky-500 dark:text-sky-300">
                <BrainCircuit className="w-5 h-5 text-sky-500 animate-pulse" /> AI Strategic Co-Pilot
              </h4>
              <p className="text-[10px] leading-relaxed mt-1 text-sky-800 dark:text-sky-200/80">
                Driven securely by <strong className="font-extrabold text-sky-600 dark:text-sky-400">Gemini 3.1 Pro</strong> with High-Thinking capabilities. Audits project cost burn rates, category ratios, and yields tactical reports instantly.
              </p>
            </div>

            {/* Quick Prompts Bento Grid */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleAIRequest("report")}
                disabled={aiLoading}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col items-center gap-1.5 ${
                  isLight 
                    ? "bg-white border-slate-200 text-slate-800 hover:border-sky-500" 
                    : "bg-white/5 border-white/5 text-white hover:border-sky-500/50"
                }`}
              >
                <FileText className="w-4 h-4 text-sky-500" />
                <span className="text-[9px] font-black uppercase tracking-wide">Audit Report</span>
              </button>
              <button 
                onClick={() => handleAIRequest("chat", "Give me 5 distinct tips to optimize elevator logistics and shipping costs across Pune and Mumbai.")}
                disabled={aiLoading}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col items-center gap-1.5 ${
                  isLight 
                    ? "bg-white border-slate-200 text-slate-800 hover:border-sky-500" 
                    : "bg-white/5 border-white/5 text-white hover:border-sky-500/50"
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[9px] font-black uppercase tracking-wide">Savings Tips</span>
              </button>
              <button 
                onClick={() => handleAIRequest("chat", "Analyze our budget spend rate vs completed percentage for all projects. Flag those that are spending too fast before milestones are completed.")}
                disabled={aiLoading}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 flex flex-col items-center gap-1.5 ${
                  isLight 
                    ? "bg-white border-slate-200 text-slate-800 hover:border-sky-500" 
                    : "bg-white/5 border-white/5 text-white hover:border-sky-500/50"
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span className="text-[9px] font-black uppercase tracking-wide">Burn Audits</span>
              </button>
            </div>

            {/* AI Response Block */}
            <div className={`rounded-2xl border p-4 shadow-xl space-y-3 min-h-[180px] flex flex-col ${
              isLight ? "bg-white border-slate-200" : "bg-[#0c111e] border-white/5"
            }`}>
              <div className="flex justify-between items-center border-b pb-2 border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-sky-500 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> Advisor Output
                </p>
                {aiModel && (
                  <span className="text-[8px] font-mono opacity-50 uppercase bg-slate-500/10 px-1.5 py-0.5 rounded">
                    Engine: {aiModel}
                  </span>
                )}
              </div>

              {aiLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-2">
                  <RefreshCw className="w-6 h-6 text-sky-500 animate-spin" />
                  <p className="text-[10px] font-bold text-sky-400 animate-pulse">Gemini is Thinking (High Reasoning)...</p>
                </div>
              ) : aiResponse ? (
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {renderMarkdown(aiResponse)}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 opacity-40">
                  <Sparkles className="w-8 h-8 text-sky-500 mb-2" />
                  <p className="text-[10px] font-bold">Select one of the quick audit prompts above or ask a custom question below to consult Gemini.</p>
                </div>
              )}
            </div>

            {/* AI Interactive Chat Input Box */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!customPrompt.trim()) return;
                handleAIRequest("chat", customPrompt);
              }}
              className={`rounded-2xl p-2 border flex items-center gap-2 ${
                isLight ? "bg-white border-slate-200" : "bg-[#111726] border-white/10"
              }`}
            >
              <input 
                type="text"
                disabled={aiLoading}
                placeholder="Ask financial questions..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className={`flex-1 rounded-xl px-3 py-2 text-xs outline-none border-none bg-transparent ${
                  isLight ? "text-slate-800 placeholder-slate-400" : "text-white placeholder-slate-500"
                }`}
              />
              <button 
                type="submit"
                disabled={aiLoading || !customPrompt.trim()}
                className={`p-2 rounded-xl text-white transition-all ${
                  customPrompt.trim() && !aiLoading 
                    ? "bg-sky-500 hover:bg-sky-600 active:scale-95 cursor-pointer" 
                    : "bg-slate-700 opacity-50 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </YStack>
  );
}
