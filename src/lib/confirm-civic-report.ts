import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase-server";

const ConfirmReportSchema = z.object({
  reportId: z.number().int().positive(),
});

export const confirmCivicReport = createServerFn({
  method: "POST",
})
  .validator((data) => ConfirmReportSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = getSupabaseServerClient();

    // Get current confirmation count
    const { data: report, error: readError } = await supabase
      .from("civic_reports")
      .select("id, confirmations")
      .eq("id", data.reportId)
      .single();

    if (readError || !report) {
      console.error("Failed to find civic report:", readError);

      throw new Error("Unable to find this civic report.");
    }

    const newConfirmations =
      (report.confirmations ?? 0) + 1;

    // Update confirmation count
    const { data: updated, error: updateError } = await supabase
      .from("civic_reports")
      .update({
        confirmations: newConfirmations,
      })
      .eq("id", data.reportId)
      .select("id, confirmations")
      .single();

    if (updateError || !updated) {
      console.error(
        "Failed to update confirmations:",
        updateError,
      );

      throw new Error(
        "Unable to confirm this report.",
      );
    }

    return updated;
  });