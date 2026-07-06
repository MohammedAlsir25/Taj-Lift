import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useProfile } from "./ProfileContext";

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

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const { currentUser } = useProfile();

  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, "projects"), (snapshot) => {
      const list: Project[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Project);
      });
      setProjects(list);
    }, (error) => {
      console.error("Firestore onSnapshot projects error:", error);
    });
    return () => unsubscribe();
  }, [currentUser]);

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
    const reporter = "Field Team";
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
