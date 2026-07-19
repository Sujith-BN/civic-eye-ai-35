import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const supportedReportLanguages = {
  en: "English", kn: "Kannada (ಕನ್ನಡ)", hi: "Hindi (हिन्दी)", ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)", ml: "Malayalam (മലയാളം)", mr: "Marathi (मराठी)", bn: "Bengali (বাংলা)",
} as const;

const schema = z.object({
  language: z.enum(["en", "kn", "hi", "ta", "te", "ml", "mr", "bn"]),
  issue: z.string().min(1).max(160), safetyRisk: z.string().min(1).max(300),
  reasoning: z.string().min(1).max(1000), department: z.string().min(1).max(160),
});

export const translateCivicReport = createServerFn({ method: "POST" })
  .validator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    if (data.language === "en") return data;
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Translation is temporarily unavailable.");
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=" + key, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `Translate these civic-report display fields to ${supportedReportLanguages[data.language]}. Preserve meaning. Return only JSON with issue, safetyRisk, reasoning, department. Do not add markdown.\n${JSON.stringify({ issue: data.issue, safetyRisk: data.safetyRisk, reasoning: data.reasoning, department: data.department })}` }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.1 } }),
    });
    if (!response.ok) throw new Error("Translation is temporarily unavailable.");
    const text = (await response.json())?.candidates?.[0]?.content?.parts?.[0]?.text;
    const translated = z.object({ issue: z.string(), safetyRisk: z.string(), reasoning: z.string(), department: z.string() }).safeParse(JSON.parse(text || ""));
    if (!translated.success) throw new Error("Translation is temporarily unavailable.");
    return translated.data;
  });
