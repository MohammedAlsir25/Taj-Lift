import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize GoogleGenAI client securely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // API Route: Analyze finance and generate money management advice & reports
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { projects, userPrompt, analysisType } = req.body;

      if (!projects || !Array.isArray(projects)) {
        return res.status(400).json({ error: "Projects data is required" });
      }

      const systemInstruction = `You are an elite AI Financial Analyst and Advisor specialized in elevator installation and AMC operations for "Taj Lift Management". 
Your job is to provide highly precise, actionable, and mathematically accurate financial advice, budget optimization, and financial reports for elevator projects.
Formatting Guidelines:
- Use clean Markdown styling with clear headings, bold key metrics, and bulleted lists.
- Avoid low-quality filler. Provide direct, professional, and practical advice.
- Compare budget spent % vs completion stage % to identify project cost-efficiency risks (e.g. if spent is 80% but completion is only 30%, flag as Critical Risk).
- Recommend exact cost-saving actions or adjustments.`;

      let content = `Here are the current active elevator projects and their logged expenses:\n\n`;

      projects.forEach((proj: any) => {
        const totalSpent = proj.expenses ? proj.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0) : 0;
        const spentPercent = proj.budget > 0 ? Math.round((totalSpent / proj.budget) * 100) : 0;
        
        content += `### Project ID: ${proj.id} - ${proj.name}\n`;
        content += `- Location: ${proj.location}\n`;
        content += `- Total Budget: ₹${proj.budget.toLocaleString()}\n`;
        content += `- Total Spent: ₹${totalSpent.toLocaleString()} (${spentPercent}% of budget)\n`;
        content += `- Completion Stage: ${proj.completed}%\n`;
        content += `- Status: ${proj.status}\n`;
        
        if (proj.expenses && proj.expenses.length > 0) {
          content += `- Logged Expenses:\n`;
          proj.expenses.forEach((exp: any) => {
            content += `  * ${exp.title} [Category: ${exp.category}]: ₹${exp.amount.toLocaleString()} on ${exp.date}\n`;
          });
        } else {
          content += `- Logged Expenses: None\n`;
        }
        content += `\n`;
      });

      if (analysisType === "report") {
        content += `\nTASK: Generate a comprehensive, multi-project executive financial report. Audit each project's budget efficiency, flag critical overruns or high cost categories, and give a clear tactical recommendation for each project.`;
      } else if (analysisType === "chat" && userPrompt) {
        content += `\nTASK: Address the user's specific query: "${userPrompt}"\nReference the project financial data above to formulate a highly targeted, realistic response.`;
      } else {
        content += `\nTASK: Provide a quick money management summary with 3 core action points to optimize the overall budget.`;
      }

      // Try Querying Gemini 3.1 Pro with High Thinking Level, falling back to Gemini 3.5 Flash if quota/API fails
      let response;
      let modelUsed = "gemini-3.1-pro-preview";
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: content,
          config: {
            systemInstruction: systemInstruction,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH,
            },
          },
        });
      } catch (proError: any) {
        console.warn("Gemini 3.1 Pro preview failed or quota exceeded, falling back to Gemini 3.5 Flash:", proError);
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: content,
          config: {
            systemInstruction: systemInstruction,
          },
        });
        modelUsed = "gemini-3.5-flash";
      }

      res.json({
        result: response.text,
        modelUsed: modelUsed,
      });
    } catch (error: any) {
      console.error("Error in AI financial advisor:", error);
      res.status(500).json({ error: error.message || "An error occurred during AI analysis." });
    }
  });

  // Vite middleware for dev or serving static build for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
