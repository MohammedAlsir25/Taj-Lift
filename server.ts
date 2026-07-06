import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

declare global {
  namespace Express {
    interface Request {
      user?: { uid: string; [key: string]: any };
    }
  }
}

dotenv.config();

const PROJECT_ID = "gen-lang-client-0121446000";

let admin: any = null;
(async () => {
  try {
    const { createRequire } = await import('module');
    const req = createRequire(import.meta.url);
    admin = req("firebase-admin");
    if (!admin.getApps().length) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const credPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
        admin.initializeApp({ projectId: PROJECT_ID, credential: admin.applicationDefault() });
      } else {
        admin.initializeApp({ projectId: PROJECT_ID });
      }
    }
    console.log("Firebase Admin initialized");
  } catch (e: any) {
    console.warn("Firebase Admin not available:", e?.message || e);
  }
})();

// Middleware: verify Firebase ID token from Authorization header
async function verifyAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const idToken = authHeader.split("Bearer ")[1];
  if (!admin) {
    // Dev fallback: accept any token when Admin SDK is not available
    req.user = { uid: "dev-user" };
    return next();
  }
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "10mb" }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  }) : null;

  // Rate limiters
  const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false, message: { error: "Too many requests. Try again later." } });
  const dispatchLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false, message: { error: "Too many dispatch requests." } });

  // POST /api/ai/analyze — Protected AI analysis
  app.post("/api/ai/analyze", aiLimiter, verifyAuth, async (req, res) => {
    try {
      const { projects, userPrompt, analysisType } = req.body;

      if (!projects || !Array.isArray(projects)) {
        return res.status(400).json({ error: "Projects data is required" });
      }

      if (!ai) {
        return res.status(503).json({ error: "AI service not configured. Set GEMINI_API_KEY." });
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
        content += `- Total Budget: AED ${proj.budget.toLocaleString()}\n`;
        content += `- Total Spent: AED ${totalSpent.toLocaleString()} (${spentPercent}% of budget)\n`;
        content += `- Completion Stage: ${proj.completed}%\n`;
        content += `- Status: ${proj.status}\n`;
        
        if (proj.expenses && proj.expenses.length > 0) {
          content += `- Logged Expenses:\n`;
          proj.expenses.forEach((exp: any) => {
            content += `  * ${exp.title} [Category: ${exp.category}]: AED ${exp.amount.toLocaleString()} on ${exp.date}\n`;
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

      let response;
      let modelUsed = "gemini-3.1-pro-preview";
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: content,
          config: {
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          },
        });
      } catch (proError: any) {
        console.warn("Gemini 3.1 Pro preview failed, falling back to Gemini 3.5 Flash:", proError);
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: content,
          config: { systemInstruction: systemInstruction },
        });
        modelUsed = "gemini-3.5-flash";
      }

      res.json({ result: response.text, modelUsed });
    } catch (error: any) {
      console.error("Error in AI financial advisor:", error);
      res.status(500).json({ error: error.message || "An error occurred during AI analysis." });
    }
  });

  // POST /api/breakdown/dispatch — Create breakdown + send FCM push
  app.post("/api/breakdown/dispatch", dispatchLimiter, verifyAuth, async (req, res) => {
    try {
      const { liftName, siteLocation, urgency, reportedIssues, assignedTechUid } = req.body;
      if (!liftName || !siteLocation || !assignedTechUid) {
        return res.status(400).json({ error: "liftName, siteLocation, and assignedTechUid are required" });
      }

      if (!admin) {
        return res.status(503).json({ error: "Push notifications not configured. Set GOOGLE_APPLICATION_CREDENTIALS." });
      }

      // Create breakdown document in Firestore
      const db = admin.firestore();
      const breakdownRef = db.collection("breakdowns").doc();
      await breakdownRef.set({
        id: breakdownRef.id,
        liftName,
        siteLocation,
        urgency: urgency || "Medium",
        reportedIssues: reportedIssues || "",
        status: "dispatched",
        assignedTo: assignedTechUid,
        createdBy: req.user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Look up tech's FCM token
      const techDoc = await db.collection("users").doc(assignedTechUid).get();
      const fcmToken = techDoc.data()?.fcmToken;

      if (fcmToken) {
        const message = {
          token: fcmToken,
          notification: {
            title: `New Breakdown: ${liftName}`,
            body: `${urgency} priority at ${siteLocation}`,
          },
          android: {
            priority: "high" as const,
            notification: {
              channelId: "breakdown_alerts",
              priority: "high" as const,
              defaultSound: true,
            },
          },
        };
        await admin.messaging().send(message);
      }

      res.json({ success: true, breakdownId: breakdownRef.id });
    } catch (error: any) {
      console.error("Error dispatching breakdown:", error);
      res.status(500).json({ error: error.message || "Failed to dispatch breakdown" });
    }
  });

  // POST /api/notifications/register-token — Save FCM token for current user
  app.post("/api/notifications/register-token", verifyAuth, async (req, res) => {
    try {
      const { fcmToken } = req.body;
      if (!fcmToken) return res.status(400).json({ error: "fcmToken is required" });

      if (!admin) {
        return res.status(503).json({ error: "Push notifications not configured." });
      }

      await admin.firestore().collection("users").doc(req.user.uid).update({ fcmToken });
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error registering FCM token:", error);
      res.status(500).json({ error: "Failed to register token" });
    }
  });

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
