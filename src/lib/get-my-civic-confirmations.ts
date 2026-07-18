import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  getAuthenticatedSupabaseServerClient,
  getSupabaseServerClient,
} from "@/lib/supabase-server";

export const getMyCivicConfirmations = createServerFn({ method: "POST" })
  .validator((data) => z.object({ accessToken: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const verifier = getSupabaseServerClient();
    const { data: auth, error: authError } = await verifier.auth.getUser(data.accessToken);
    if (authError || !auth.user) throw new Error("Please sign in to view confirmations.");

    const supabase = getAuthenticatedSupabaseServerClient(data.accessToken);
    const { data: confirmations, error } = await supabase
      .from("report_confirmations")
      .select("report_id");
    if (error) throw new Error("Unable to load your confirmations.");
    return (confirmations ?? []).map((confirmation) => Number(confirmation.report_id));
  });
