import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getAuthenticatedSupabaseServerClient,
  getSupabaseServerClient,
} from "@/lib/supabase-server";

const schema = z.object({
  accessToken: z.string().min(1),
  reportId: z.number().int().positive(),
  status: z.enum(["REPORTED", "IN_PROGRESS", "RESOLVED"]),
});

export const updateCivicReportStatus = createServerFn({ method: "POST" })
  .validator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const verifier = getSupabaseServerClient();
    const { data: auth, error: authError } = await verifier.auth.getUser(data.accessToken);
    if (authError || !auth.user) throw new Error("Please sign in to update report status.");

    const supabase = getAuthenticatedSupabaseServerClient(data.accessToken);
    const { data: result, error } = await supabase.rpc("update_civic_report_status", {
      p_report_id: data.reportId,
      p_status: data.status,
    });
    if (error) throw new Error(error.message || "Unable to update report status.");
    const report = Array.isArray(result) ? result[0] : result;
    return { id: Number(report.id), status: String(report.status) };
  });
