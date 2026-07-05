import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: "Materials" | "Labor" | "Permits" | "Logistics" | "Repairs" | "Maintenance" | "Other";
  date: string;
  reportedBy: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  budget: number;
  completed: number; // 0 to 100
  status: "ongoing" | "completed" | "pending";
  expenses: Expense[];
}

interface ProjectContextType {
  projects: Project[];
  addProject: (name: string, location: string, budget: number) => Project;
  addExpense: (projectId: string, title: string, amount: number, category: Expense["category"], date: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getAIAnalysis: (analysisType: "report" | "summary" | "chat", userPrompt?: string) => Promise<{ result: string; modelUsed: string }>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_PROJECTS: Project[] = [
  {
    id: "EVP-25-A04",
    name: "Marina Heights High-Speed Installation",
    location: "Dubai",
    budget: 2500000,
    completed: 65,
    status: "ongoing",
    expenses: [
      { id: "exp-1", title: "Excavation & Shaft Concrete", amount: 450000, category: "Materials", date: "2026-05-12", reportedBy: "Alex (Lead Tech)" },
      { id: "exp-2", title: "Machine Hoist Unit purchase", amount: 890000, category: "Materials", date: "2026-05-19", reportedBy: "Sarah Connor" },
      { id: "exp-3", title: "Scaffolding & Safety Gear Setup", amount: 120000, category: "Logistics", date: "2026-05-20", reportedBy: "John (Supervisor)" },
      { id: "exp-4", title: "Civil Team Labor Advance", amount: 300000, category: "Labor", date: "2026-05-24", reportedBy: "Sarah Connor" }
    ]
  },
  {
    id: "EVP-25-M02",
    name: "Downtown Plaza AMC",
    location: "Dubai",
    budget: 1500000,
    completed: 100,
    status: "completed",
    expenses: [
      { id: "exp-5", title: "Initial Inspection & Lubricants", amount: 50000, category: "Maintenance", date: "2026-06-01", reportedBy: "Marcus (Tech II)" },
      { id: "exp-6", title: "Rope Tensioner Replacement", amount: 150000, category: "Repairs", date: "2026-06-15", reportedBy: "Marcus (Tech II)" }
    ]
  },
  {
    id: "EVP-25-B18",
    name: "Al Reem Tech Park Heavy Lift",
    location: "Abu Dhabi",
    budget: 4500000,
    completed: 15,
    status: "ongoing",
    expenses: [
      { id: "exp-7", title: "Architectural Shaft Blueprinting", amount: 250000, category: "Permits", date: "2026-06-25", reportedBy: "Elena (Director)" },
      { id: "exp-8", title: "Steel Frame Advance Logistics", amount: 600000, category: "Logistics", date: "2026-07-02", reportedBy: "John (Supervisor)" }
    ]
  },
  {
    id: "EVP-25-H09",
    name: "Jumeirah Residential Duplex",
    location: "Dubai",
    budget: 1200000,
    completed: 0,
    status: "pending",
    expenses: []
  }
];

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("taj_projects");
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  // 1. Real-time Firestore synchronization for projects
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      if (snapshot.empty) {
        // If Firestore projects collection is empty, seed with initial projects
        INITIAL_PROJECTS.forEach((p) => {
          setDoc(doc(db, "projects", p.id), p).catch((err) =>
            console.error("Error seeding project:", p.id, err)
          );
        });
      } else {
        const list: Project[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as Project);
        });
        // Sort projects by ID or maintain a consistent order if needed
        setProjects(list);
      }
    }, (error) => {
      console.error("Firestore onSnapshot projects error:", error);
    });
    return () => unsubscribe();
  }, []);

  // Sync projects list to localStorage as a fallback
  useEffect(() => {
    localStorage.setItem("taj_projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = (name: string, location: string, budget: number): Project => {
    const cityCode = location.substring(0, 3).toUpperCase();
    const randNum = Math.floor(10 + Math.random() * 90);
    const id = `EVP-25-${cityCode}${randNum}`;
    
    const newProject: Project = {
      id,
      name,
      location,
      budget,
      completed: 0,
      status: "pending",
      expenses: []
    };

    // Optimistic local state update
    setProjects(prev => [newProject, ...prev]);

    // Save to real Firestore database immediately
    setDoc(doc(db, "projects", newProject.id), newProject).catch((err) => {
      console.error("Firestore project creation failed:", err);
    });

    return newProject;
  };

  const addExpense = (projectId: string, title: string, amount: number, category: Expense["category"], date: string) => {
    const reporter = localStorage.getItem("taj_profile_name") || "Sarah Connor";
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title,
      amount,
      category,
      date,
      reportedBy: reporter
    };

    // Find project, append expense, update status if pending, and save document to Firestore
    const currentProj = projects.find(p => p.id === projectId);
    if (currentProj) {
      const updatedExpenses = [...currentProj.expenses, newExpense];
      const updatedProject: Project = {
        ...currentProj,
        expenses: updatedExpenses,
        status: currentProj.status === "pending" ? "ongoing" : currentProj.status
      };

      // Optimistic local state update
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));

      // Save updated project object back to Firestore
      setDoc(doc(db, "projects", projectId), updatedProject).catch((err) => {
        console.error("Firestore expense log failed:", err);
      });
    }
  };

  const getProjectById = (id: string) => {
    return projects.find(p => p.id === id);
  };

  const getAIAnalysis = async (analysisType: "report" | "summary" | "chat", userPrompt?: string) => {
    try {
      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projects,
          analysisType,
          userPrompt
        })
      });
      if (!res.ok) {
        throw new Error("Failed to fetch AI analysis from server.");
      }
      return await res.json();
    } catch (err: any) {
      console.error(err);
      return {
        result: `### AI Operational Insight\n\nCould not fetch financial advice. Error: ${err.message || "Connection issue"}.\n\n*Suggestion:* Run a build to verify the fullstack Express integration matches port requirements.`,
        modelUsed: "Local Fallback"
      };
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, addExpense, getProjectById, getAIAnalysis }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
