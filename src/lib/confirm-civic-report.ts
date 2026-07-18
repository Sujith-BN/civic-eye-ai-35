import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getAuthenticatedSupabaseServerClient,
  getSupabaseServerClient,
} from "@/lib/supabase-server";

const ConfirmReportSchema = z.object({
  accessToken: z.string().min(1, "Please sign in to confirm an issue."),
  reportId: z.number().int().positive(),
});

export const confirmCivicReport = createServerFn({ method: "POST" })
  .validator((data) => ConfirmReportSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser(data.accessToken);

    if (authError || !auth.user) {
      throw new Error("Please sign in to confirm an issue.");
    }

    const authenticatedSupabase = getAuthenticatedSupabaseServerClient(data.accessToken);
    const { data: result, error } = await authenticatedSupabase.rpc("confirm_civic_report", {
      p_report_id: data.reportId,
    });

    if (error) {
      if (error.code === "23505") throw new Error("You already confirmed this issue.");
      throw new Error(error.message || "Unable to confirm this report.");
    }

    const confirmation = Array.isArray(result) ? result[0] : result;
    return { confirmations: confirmation?.confirmations ?? 0 };
  });
