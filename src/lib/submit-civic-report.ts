import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAuthenticatedSupabaseServerClient, getSupabaseServerClient } from "@/lib/supabase-server";

const SubmitReportSchema = z.object({
  accessToken: z.string().min(1, "Authentication is required"),

  imageUrl: z.string().optional(),
  imageHash: z.string().regex(/^[0-9a-f]{64}$/, "Invalid image fingerprint"),

  location: z
    .string()
    .trim()
    .min(8, "Proper street/area details are required"),

  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),

  description: z.string().optional(),

  detectedIssue: z.string().min(1),
  category: z.string().min(1),

  severity: z.enum([
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ]),

  safetyRisk: z.string().optional(),
  department: z.string().optional(),

  confidence: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional(),

  aiReasoning: z.string().optional(),
});

export const submitCivicReport = createServerFn({
  method: "POST",
})
  .validator((data: unknown) =>
    SubmitReportSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    /*
     * Verify the access token with Supabase.
     * Never trust a user ID sent directly by the browser.
     */
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(data.accessToken);

    if (authError || !user) {
      console.error(
        "Report authentication failed:",
        authError,
      );

      throw new Error(
        "Please sign in with Google before submitting a report.",
      );
    }

    const authenticatedSupabase = getAuthenticatedSupabaseServerClient(data.accessToken);
    const { data: result, error } = await authenticatedSupabase.rpc("submit_civic_report_with_image_hash", {
      p_image_url: data.imageUrl ?? null, p_image_hash: data.imageHash, p_location: data.location,
      p_latitude: data.latitude, p_longitude: data.longitude,
      p_description: data.description ?? null, p_detected_issue: data.detectedIssue,
      p_category: data.category, p_severity: data.severity,
      p_safety_risk: data.safetyRisk ?? null, p_department: data.department ?? null,
      p_confidence: data.confidence ?? null, p_ai_reasoning: data.aiReasoning ?? null,
    });

    if (error) {
      console.error(
        "Supabase report submission failed:",
        {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
      );

      throw new Error(
        "Unable to submit civic report. Please try again.",
      );
    }

    return {
      success: true,
      ...(Array.isArray(result) ? result[0] : result),
    };
  });
