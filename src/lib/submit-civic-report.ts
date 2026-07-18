import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase-server";

const SubmitReportSchema = z.object({
  accessToken: z.string().min(1, "Authentication is required"),

  imageUrl: z.string().optional(),

  location: z
    .string()
    .trim()
    .min(8, "Proper street/area details are required"),

  latitude: z.number(),
  longitude: z.number(),

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

    /*
     * user.id is now verified by Supabase.
     */
    const { data: report, error } = await supabase
      .from("civic_reports")
      .insert({
        submitter_id: user.id,

        image_url: data.imageUrl ?? null,

        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,

        description: data.description ?? null,

        detected_issue: data.detectedIssue,
        category: data.category,
        severity: data.severity,

        safety_risk: data.safetyRisk ?? null,
        department: data.department ?? null,

        confidence: data.confidence ?? null,
        ai_reasoning: data.aiReasoning ?? null,

        status: "REPORTED",
        confirmations: 0,
      })
      .select("id")
      .single();

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
      reportId: report.id,
    };
  });