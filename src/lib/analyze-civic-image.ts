import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { CivicIssueAnalysisSchema } from "@/lib/civic-analysis";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_API_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

// Free router lets OpenRouter choose an available free model.
// Image input requires the selected model to support vision.
const OPENROUTER_MODEL = "openrouter/free";

const rawModelResponseSchema = z.discriminatedUnion("hasCivicIssue", [
  z.object({
    hasCivicIssue: z.literal(true),
    detectedIssue: z.string(),
    category: z.enum([
      "Pothole/Road Damage",
      "Garbage",
      "Broken Streetlight",
      "Water Leak",
      "Drainage/Sewage",
      "Fallen Tree",
      "Damaged Public Infrastructure",
      "Other Civic Issue",
    ]),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    safetyRisk: z.string(),
    suggestedDepartment: z.string(),
    confidence: z.number().min(0).max(100),
    reasoning: z.string(),
    message: z.string().optional(),
  }),

  z.object({
    hasCivicIssue: z.literal(false),
    detectedIssue: z.string().optional(),
    category: z.string().optional(),
    severity: z.string().optional(),
    safetyRisk: z.string().optional(),
    suggestedDepartment: z.string().optional(),
    confidence: z.number().optional(),
    reasoning: z.string().optional(),
    message: z.string(),
  }),
]);

function validateImage(data: unknown): { image: File } {
  if (!(data instanceof FormData)) {
    throw new Error("Invalid analysis request.");
  }

  const image = data.get("image");

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("Please upload an image to analyze.");
  }

  if (!image.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  if (image.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 10MB or smaller.");
  }

  return { image };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return Buffer.from(buffer).toString("base64");
}

function cleanJsonText(text: string): string {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

function parseAndValidateAnalysis(text: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleanJsonText(text));
  } catch {
    console.error("AI returned invalid JSON:", text);

    throw new Error(
      "AI analysis returned an invalid response. Please try again.",
    );
  }

  const raw = rawModelResponseSchema.safeParse(parsed);

  if (!raw.success) {
    console.error(
      "AI response failed validation:",
      raw.error.flatten(),
    );

    throw new Error(
      "AI analysis returned an invalid response. Please try again.",
    );
  }

  if (!raw.data.hasCivicIssue) {
    return CivicIssueAnalysisSchema.parse({
      hasCivicIssue: false,
      message:
        raw.data.message ||
        "No clear civic issue was detected. Please upload a clearer civic-problem photo.",
    });
  }

  return CivicIssueAnalysisSchema.parse({
    hasCivicIssue: true,
    detectedIssue: raw.data.detectedIssue,
    category: raw.data.category,
    severity: raw.data.severity,
    safetyRisk: raw.data.safetyRisk,
    suggestedDepartment: raw.data.suggestedDepartment,
    confidence: raw.data.confidence,
    reasoning: raw.data.reasoning,
  });
}

async function analyzeWithGemini(
  apiKey: string,
  base64Image: string,
  mimeType: string,
  prompt: string,
): Promise<
  | { success: true; text: string }
  | { success: false; status: number }
> {
  let response: Response;

  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        contents: [
          {
            role: "user",

            parts: [
              {
                text: prompt,
              },

              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],

        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });
  } catch (error) {
    console.error("Gemini network error:", error);

    return {
      success: false,
      status: 0,
    };
  }

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Gemini API request failed:", {
      status: response.status,
      error: errorText,
    });

    return {
      success: false,
      status: response.status,
    };
  }

  const payload = await response.json();

  const text =
    payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text || typeof text !== "string") {
    console.error("Unexpected Gemini response:", payload);

    return {
      success: false,
      status: 500,
    };
  }

  return {
    success: true,
    text,
  };
}

async function analyzeWithOpenRouter(
  apiKey: string,
  base64Image: string,
  mimeType: string,
  prompt: string,
): Promise<string> {
  let response: Response;

  try {
    response = await fetch(OPENROUTER_API_URL, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model: OPENROUTER_MODEL,

        messages: [
          {
            role: "user",

            content: [
              {
                type: "text",
                text: prompt,
              },

              {
                type: "image_url",

                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],

        temperature: 0.1,
      }),
    });
  } catch (error) {
    console.error("OpenRouter network error:", error);

    throw new Error(
      "Unable to reach the backup AI service. Please try again.",
    );
  }

  if (!response.ok) {
    const errorText = await response.text();

    console.error("OpenRouter API request failed:", {
      status: response.status,
      error: errorText,
    });

    throw new Error(
      "AI analysis is temporarily unavailable. Please try again.",
    );
  }

  const payload = await response.json();

  const content =
    payload?.choices?.[0]?.message?.content;

  if (typeof content === "string" && content.trim()) {
    return content;
  }

  // Handle providers that may return content as an array.
  if (Array.isArray(content)) {
    const text = content
      .filter(
        (part: any) =>
          part &&
          part.type === "text" &&
          typeof part.text === "string",
      )
      .map((part: any) => part.text)
      .join("");

    if (text.trim()) {
      return text;
    }
  }

  console.error("Unexpected OpenRouter response:", payload);

  throw new Error(
    "Backup AI returned an invalid response. Please try again.",
  );
}

export const analyzeCivicImage = createServerFn({
  method: "POST",
})
  .validator(validateImage)
  .handler(async ({ data }) => {
    const geminiApiKey =
      process.env.GEMINI_API_KEY;

    const openRouterApiKey =
      process.env.OPENROUTER_API_KEY;

    if (!geminiApiKey && !openRouterApiKey) {
      throw new Error(
        "AI analysis is not configured. Please contact the application administrator.",
      );
    }

    const base64Image = arrayBufferToBase64(
      await data.image.arrayBuffer(),
    );

    const prompt = `
You are an AI civic-infrastructure image analyst for an application called FixMyCity.

Analyze ONLY what is clearly visible in the supplied image.

Determine whether the image clearly shows a genuine civic/public-infrastructure issue.

Supported categories:
- Pothole/Road Damage
- Garbage
- Broken Streetlight
- Water Leak
- Drainage/Sewage
- Fallen Tree
- Damaged Public Infrastructure
- Other Civic Issue

IMPORTANT RULES:

1. Do not invent or hallucinate problems.
2. Do not infer invisible causes, measurements, locations, or circumstances.
3. If the image is unrelated, ambiguous, too unclear, or does not clearly show a civic issue:
   set hasCivicIssue to false.
4. Severity must be one of:
   LOW, MEDIUM, HIGH, CRITICAL.
5. confidence must be a number from 0 to 100.
6. Return ONLY valid JSON.
7. Do not include markdown or code fences.

Return exactly this JSON structure:

{
  "hasCivicIssue": true,
  "detectedIssue": "",
  "category": "Pothole/Road Damage",
  "severity": "LOW",
  "safetyRisk": "",
  "suggestedDepartment": "",
  "confidence": 0,
  "reasoning": "",
  "message": ""
}

If no valid civic issue exists, still return every field.
Set hasCivicIssue to false and explain why in "message".
Use empty strings for fields that do not apply.
`;

    // PRIMARY: Gemini
    if (geminiApiKey) {
      const geminiResult =
        await analyzeWithGemini(
          geminiApiKey,
          base64Image,
          data.image.type,
          prompt,
        );

      if (geminiResult.success) {
        return parseAndValidateAnalysis(
          geminiResult.text,
        );
      }

      /*
       * Gemini quota exhausted.
       * Automatically switch to OpenRouter.
       */
      if (
        geminiResult.status === 429 &&
        openRouterApiKey
      ) {
        console.warn(
          "Gemini quota exhausted. Switching to OpenRouter fallback.",
        );

        const fallbackText =
          await analyzeWithOpenRouter(
            openRouterApiKey,
            base64Image,
            data.image.type,
            prompt,
          );

        return parseAndValidateAnalysis(
          fallbackText,
        );
      }

      throw new Error(
        "AI analysis is temporarily unavailable. Please try again.",
      );
    }

    // Gemini unavailable/config missing → use OpenRouter directly.
    if (openRouterApiKey) {
      const fallbackText =
        await analyzeWithOpenRouter(
          openRouterApiKey,
          base64Image,
          data.image.type,
          prompt,
        );

      return parseAndValidateAnalysis(
        fallbackText,
      );
    }

    throw new Error(
      "AI analysis is not configured. Please contact the application administrator.",
    );
  });