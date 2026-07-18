import { createServerFn } from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const getCivicReports = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = getSupabaseServerClient();

  const { data, error, count, status, statusText } =
    await supabase
      .from("civic_reports")
      .select("*", {
        count: "exact",
      })
      .order("created_at", {
        ascending: false,
      });

 

  if (error) {
    throw new Error(
      `Supabase fetch failed: ${error.message}`,
    );
  }

  return data ?? [];
});