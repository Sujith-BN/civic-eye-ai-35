import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  AlertOctagon,
  CheckCircle2,
  Users,
  ArrowUpRight,
  Loader2,
  Database,
  MapPin,
  ImageIcon,
} from "lucide-react";

import { getCivicReports } from "@/lib/get-civic-reports";
import { SeverityBadge } from "@/components/SeverityBadge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";
import { updateCivicReportStatus } from "@/lib/update-civic-report-status";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Civic Dashboard — FixMyCity",
      },
      {
        name: "description",
        content:
          "Live civic intelligence from real citizen reports.",
      },
    ],
  }),

  component: DashboardPage,
});

type CivicReport = {
  id: number;
  created_at: string;

  image_url: string | null;

  location: string | null;

  latitude: number | null;
  longitude: number | null;

  description: string | null;

  detected_issue: string;
  category: string;
  severity: string;

  safety_risk: string | null;
  department: string | null;

  confidence: number | null;

  ai_reasoning: string | null;

  status: string | null;

  confirmations: number | null;
};

const CATEGORY_COLORS = [
  "#0ea5e9",
  "#14b8a6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#22c55e",
  "#64748b",
];

function DashboardPage() {
  const [reports, setReports] =
    useState<CivicReport[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  /* =====================================================
     LOAD REPORTS
  ===================================================== */

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        setLoading(true);
        setError(null);

        const result =
          await getCivicReports();

        if (!active) return;

        setReports(
          (result ?? []) as CivicReport[],
        );
      } catch (err) {
        console.error(
          "Dashboard loading failed:",
          err,
        );

        if (!active) return;

        setError(
          "Unable to load civic reports.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user.app_metadata?.civic_admin === true) {
        setAdminToken(data.session.access_token);
      }
    });
  }, []);

  const changeStatus = async (reportId: number, status: "REPORTED" | "IN_PROGRESS" | "RESOLVED") => {
    if (!adminToken) return;
    try {
      setUpdatingId(reportId);
      const updated = await updateCivicReportStatus({ data: { accessToken: adminToken, reportId, status } });
      setReports((current) => current.map((report) => report.id === updated.id ? { ...report, status: updated.status } : report));
      toast.success("Report status updated.");
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Unable to update report status.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* =====================================================
     KPI CALCULATIONS
  ===================================================== */

  const activeReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          normalizeStatus(report.status) !==
          "resolved",
      ).length,
    [reports],
  );

  const criticalIssues = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.severity?.toUpperCase() === "CRITICAL" &&
          normalizeStatus(report.status) !== "resolved",
      ).length,
    [reports],
  );

  const resolvedReports = useMemo(
    () =>
      reports.filter(
        (report) =>
          normalizeStatus(report.status) ===
          "resolved",
      ).length,
    [reports],
  );

  const totalConfirmations = useMemo(
    () =>
      reports.reduce(
        (total, report) =>
          total +
          (report.confirmations ?? 0),
        0,
      ),
    [reports],
  );

  /* =====================================================
     CATEGORY BREAKDOWN
  ===================================================== */

  const categoryBreakdown =
    useMemo(() => {
      const counts =
        new Map<string, number>();

      reports.forEach((report) => {
        const category =
          report.category ||
          "Other Civic Issue";

        counts.set(
          category,
          (counts.get(category) ?? 0) +
            1,
        );
      });

      return Array.from(
        counts.entries(),
      )
        .map(
          ([category, count], index) => ({
            category,
            count,
            color:
              CATEGORY_COLORS[
                index %
                  CATEGORY_COLORS.length
              ],
          }),
        )
        .sort(
          (a, b) =>
            b.count - a.count,
        );
    }, [reports]);

  /* =====================================================
     HIGH PRIORITY
  ===================================================== */

  const highPriority = useMemo(
    () =>
      [...reports]
        .filter(
          (report) =>
            normalizeStatus(
              report.status,
            ) !== "resolved",
        )
        .map((report) => ({
          report,
          score:
            calculatePriorityScore(
              report,
            ),
        }))
        .sort(
          (a, b) =>
            b.score - a.score,
        )
        .slice(0, 4),
    [reports],
  );

  /* =====================================================
     7 DAY TREND
  ===================================================== */

  const sevenDayTrend = useMemo(
    () => createSevenDayTrend(reports),
    [reports],
  );

  const maxDailyReports = Math.max(
    1,
    ...sevenDayTrend.map(
      (day) => day.count,
    ),
  );

  /* =====================================================
     RECENT REPORTS
  ===================================================== */

  const recentReports = useMemo(
    () =>
      [...reports]
        .sort(
          (a, b) =>
            new Date(
              b.created_at,
            ).getTime() -
            new Date(
              a.created_at,
            ).getTime(),
        )
        .slice(0, 10),
    [reports],
  );

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">

        <div className="text-center">

          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />

          <h2 className="mt-4 font-display text-xl font-bold">
            Loading Civic Intelligence
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Reading live reports from the database...
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">

        <div className="rounded-3xl border border-critical/20 bg-card p-8 text-center shadow-card">

          <AlertOctagon className="mx-auto h-10 w-10 text-critical" />

          <h2 className="mt-4 font-display text-2xl font-bold">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-muted-foreground">
            {error}
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl overflow-hidden px-4 py-6 sm:px-6 md:py-12">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            Live overview
          </div>

          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
            Civic Dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Real-time signals from citizen reports
            stored in FixMyCity.
          </p>

        </div>

        <div className="flex w-fit items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />

          </span>

          Live · {reports.length} reports

        </div>

      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">

        <KPI
          icon={TrendingUp}
          label="Active Reports"
          value={activeReports}
          tone="primary"
        />

        <KPI
          icon={AlertOctagon}
          label="Critical Issues"
          value={criticalIssues}
          tone="critical"
        />

        <KPI
          icon={CheckCircle2}
          label="Resolved"
          value={resolvedReports}
          tone="success"
        />

        <KPI
          icon={Users}
          label="Confirmations"
          value={totalConfirmations}
          tone="accent"
        />

      </div>

      {/* =================================================
          CATEGORY + TREND
      ================================================= */}

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">

        {/* CATEGORY */}

        <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">

          <div className="mb-5 flex items-start justify-between gap-3">

            <div>

              <h2 className="font-display text-xl font-bold">
                Issues by Category
              </h2>

              <p className="text-sm text-muted-foreground">
                Distribution across submitted reports
              </p>

            </div>

            <span className="shrink-0 text-xs text-muted-foreground">
              {reports.length} total
            </span>

          </div>

          {categoryBreakdown.length === 0 ? (
            <EmptyState message="No category data yet." />
          ) : (
            <div className="space-y-3">

              {categoryBreakdown.map(
                (category) => {
                  const percentage =
                    reports.length > 0
                      ? Math.round(
                          (category.count /
                            reports.length) *
                            100,
                        )
                      : 0;

                  return (
                    <div
                      key={
                        category.category
                      }
                    >

                      <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">

                        <span className="min-w-0 truncate font-medium">
                          {category.category}
                        </span>

                        <span className="shrink-0 text-muted-foreground">

                          <span className="font-semibold text-foreground">
                            {category.count}
                          </span>

                          {" · "}

                          {percentage}%

                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-secondary">

                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:
                              category.color,
                          }}
                        />

                      </div>

                    </div>
                  );
                },
              )}

            </div>
          )}

        </div>

        {/* TREND */}

        <div className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">

          <h2 className="font-display text-xl font-bold">
            7-Day Trend
          </h2>

          <p className="text-sm text-muted-foreground">
            Reports submitted per day
          </p>

          <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2">

            {sevenDayTrend.map(
              (day) => {
                const height =
                  day.count === 0
                    ? 4
                    : Math.max(
                        10,
                        (day.count /
                          maxDailyReports) *
                          100,
                      );

                return (
                  <div
                    key={day.date}
                    className="flex min-w-0 flex-1 flex-col items-center gap-1"
                  >

                    <div className="text-[10px] font-semibold">
                      {day.count}
                    </div>

                    <div
                      className="w-full rounded-t-lg bg-gradient-hero transition-all"
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${day.count} reports`}
                    />

                    <div className="text-[9px] text-muted-foreground sm:text-[10px]">
                      {day.label}
                    </div>

                  </div>
                );
              },
            )}

          </div>

          <div className="mt-4 text-sm text-muted-foreground">

            <span className="font-bold text-foreground">
              {sevenDayTrend.reduce(
                (total, day) =>
                  total + day.count,
                0,
              )}
            </span>

            {" reports submitted in the last 7 days"}

          </div>

        </div>

      </div>

      {/* =================================================
          HIGH PRIORITY - REDESIGNED
      ================================================= */}

      <section className="mb-6 overflow-hidden rounded-3xl border border-critical/20 bg-gradient-to-br from-critical/5 via-card to-card shadow-card">

        <div className="border-b border-border/70 p-5 sm:p-6">

          <div className="flex items-center gap-2">

            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-critical/10">

              <AlertOctagon className="h-5 w-5 text-critical" />

            </div>

            <div>

              <h2 className="font-display text-xl font-bold">
                High Priority Issues
              </h2>

              <p className="mt-0.5 text-sm text-muted-foreground">
                Prioritized by severity, AI confidence
                and community verification.
              </p>

            </div>

          </div>

        </div>

        {highPriority.length === 0 ? (
          <div className="p-5 sm:p-6">

            <EmptyState message="No active priority issues yet." />

          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">

            {highPriority.map(
              ({ report, score }) => (

                <article
                  key={report.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
                >

                  <div className="flex flex-col sm:flex-row">

                    {/* IMAGE */}

                    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-secondary sm:h-auto sm:min-h-[190px] sm:w-40">

                      {report.image_url ? (
                        <img
                          src={
                            report.image_url
                          }
                          alt={
                            report.detected_issue
                          }
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full min-h-[150px] w-full place-items-center">

                          <div className="text-center">

                            <ImageIcon className="mx-auto h-7 w-7 text-muted-foreground/60" />

                            <span className="mt-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              No evidence image
                            </span>

                          </div>

                        </div>
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="flex min-w-0 flex-1 flex-col p-4">

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex flex-wrap items-center gap-2">

                          <SeverityBadge
                            severity={
                              report.severity as any
                            }
                          />


                        </div>

                        {/* SCORE */}

                        <div className="shrink-0 text-right">

                          <div className="font-display text-xl font-bold text-critical">
                            {score}
                            <span className="text-xs font-semibold text-muted-foreground">
                              /100
                            </span>
                          </div>

                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            Priority
                          </div>

                        </div>

                      </div>

                      <h3
                        className="mt-3 line-clamp-2 text-base font-bold leading-snug"
                        title={
                          report.detected_issue
                        }
                      >
                        {report.detected_issue}
                      </h3>

                      {/* LOCATION */}

                      <div
                        className="mt-3 flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground"
                        title={
                          report.location ||
                          "Location unavailable"
                        }
                      >

                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                        <span className="line-clamp-2 leading-snug">
                          {formatLocation(
                            report.location,
                          )}
                        </span>

                      </div>

                      {/* FOOTER */}

                      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/60 pt-4">

                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">

                          <Users className="h-4 w-4" />

                          <span>
                            <strong className="text-foreground">
                              {report.confirmations ??
                                0}
                            </strong>{" "}
                            {(report.confirmations ??
                              0) === 1
                              ? "confirmation"
                              : "confirmations"}
                          </span>

                        </div>

                        <StatusPill
                          status={
                            report.status ||
                            "Reported"
                          }
                        />

                        {adminToken && (
                          <select
                            aria-label={`Update status for report ${report.id}`}
                            value={toStatusValue(report.status)}
                            disabled={updatingId === report.id}
                            onChange={(event) => void changeStatus(report.id, event.target.value as "REPORTED" | "IN_PROGRESS" | "RESOLVED")}
                            className="rounded-full border border-border bg-background px-2 py-1 text-[10px] font-semibold sm:text-xs"
                          >
                            <option value="REPORTED">REPORTED</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                          </select>
                        )}

                      </div>

                    </div>

                  </div>

                </article>

              ),
            )}

          </div>
        )}

      </section>

      {/* =================================================
          RECENT REPORTS - COMPLETELY REDESIGNED
      ================================================= */}

      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">

        {/* HEADER */}

        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">

          <div>

            <h2 className="font-display text-xl font-bold">
              Recent Reports
            </h2>

            <p className="mt-0.5 text-sm text-muted-foreground">
              Latest civic issues reported by citizens
            </p>

          </div>

          <span className="hidden shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:block">
            {recentReports.length} latest
          </span>

        </div>

        {recentReports.length === 0 ? (
          <div className="p-5 sm:p-6">

            <EmptyState message="No civic reports have been submitted yet." />

          </div>
        ) : (
          <div className="divide-y divide-border">

            {recentReports.map(
              (report) => (

                <article
                  key={report.id}
                  className="group p-4 transition-colors hover:bg-secondary/20 sm:p-5"
                >

                  <div className="flex gap-3 sm:gap-4">

                    {/* THUMBNAIL */}

                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary sm:h-24 sm:w-28">

                      {report.image_url ? (
                        <img
                          src={
                            report.image_url
                          }
                          alt={
                            report.detected_issue
                          }
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center">

                          <AlertOctagon className="h-6 w-6 text-muted-foreground/60" />

                        </div>
                      )}

                    </div>

                    {/* MAIN CONTENT */}

                    <div className="min-w-0 flex-1">

                      {/* BADGES */}

                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

                        <span className="rounded-full bg-secondary px-2 py-1 font-mono text-[10px] font-bold text-muted-foreground">
                          #{report.id}
                        </span>

                        <SeverityBadge
                          severity={
                            report.severity as any
                          }
                        />

                        <StatusPill
                          status={
                            report.status ||
                            "Reported"
                          }
                        />

                      </div>

                      {/* ISSUE */}

                      <h3
                        className="mt-2 line-clamp-2 text-sm font-bold leading-snug sm:text-base"
                        title={
                          report.detected_issue
                        }
                      >
                        {report.detected_issue}
                      </h3>

                      {/* LOCATION */}

                      <div
                        className="mt-2 flex min-w-0 items-start gap-1.5 text-xs text-muted-foreground sm:text-sm"
                        title={
                          report.location ||
                          "Location unavailable"
                        }
                      >

                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />

                        <span className="line-clamp-2 leading-snug">
                          {formatLocation(
                            report.location,
                          )}
                        </span>

                      </div>

                      {/* MOBILE CONFIRMATIONS */}

                      <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden">

                        <Users className="h-3.5 w-3.5" />

                        <strong className="text-foreground">
                          {report.confirmations ??
                            0}
                        </strong>

                        {(report.confirmations ??
                          0) === 1
                          ? " confirmation"
                          : " confirmations"}

                      </div>

                    </div>

                    {/* DESKTOP CONFIRMATIONS */}

                    <div className="hidden min-w-[110px] shrink-0 items-center justify-end sm:flex">

                      <div className="rounded-2xl bg-secondary/60 px-4 py-3 text-center">

                        <div className="flex items-center justify-center gap-1.5">

                          <Users className="h-4 w-4 text-primary" />

                          <span className="font-display text-lg font-bold">
                            {report.confirmations ??
                              0}
                          </span>

                        </div>

                        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {(report.confirmations ??
                            0) === 1
                            ? "Confirmation"
                            : "Confirmations"}
                        </div>

                      </div>

                    </div>

                  </div>

                </article>

              ),
            )}

          </div>
        )}

      </section>

    </div>
  );
}

/* =========================================================
   KPI
========================================================= */

function KPI({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any;
  label: string;
  value: number;
  tone:
    | "primary"
    | "critical"
    | "success"
    | "accent";
}) {
  const tones = {
    primary:
      "bg-primary/10 text-primary",

    critical:
      "bg-critical/10 text-critical",

    success:
      "bg-success/15 text-success",

    accent:
      "bg-accent/20 text-accent-foreground",
  };

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">

      <div className="flex items-center justify-between gap-2">

        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10",
            tones[tone],
          )}
        >

          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />

        </div>

        <span className="hidden items-center gap-1 text-xs font-semibold text-muted-foreground sm:inline-flex">

          <ArrowUpRight className="h-3 w-3" />

          Live

        </span>

      </div>

      <div className="mt-3 break-words font-display text-2xl font-bold sm:mt-4 sm:text-3xl">
        {value.toLocaleString()}
      </div>

      <div className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
        {label}
      </div>

    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function StatusPill({
  status,
}: {
  status: string;
}) {
  const normalized =
    normalizeStatus(status);

  const styles: Record<
    string,
    string
  > = {
    reported:
      "bg-secondary text-secondary-foreground",

    verified:
      "bg-primary/15 text-primary",

    "in progress":
      "bg-warning/20 text-warning-foreground",

    resolved:
      "bg-success/15 text-success",
  };

  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase sm:text-xs",

        styles[normalized] ??
          "bg-secondary text-secondary-foreground",
      )}
    >
      {status || "Reported"}
    </span>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-border bg-secondary/20 p-6">

      <div className="text-center">

        <Database className="mx-auto h-7 w-7 text-muted-foreground" />

        <p className="mt-2 text-sm text-muted-foreground">
          {message}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   LOCATION DISPLAY HELPER

   IMPORTANT:
   This only changes how the location LOOKS in the UI.
   It does NOT modify Supabase/database data.
========================================================= */

function formatLocation(
  location: string | null,
) {
  if (!location?.trim()) {
    return "Location unavailable";
  }

  const clean = location.trim();

  /*
   * Protect against obviously bad test values
   * such as "a".
   */
  if (clean.length <= 2) {
    return clean;
  }

  const parts = clean
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 3) {
    return parts.join(", ");
  }

  /*
   * Nominatim addresses often contain:
   * locality, city, taluk, district,
   * state, postcode, country.
   *
   * We want a clean display like:
   * Jannapura, Bhadravati, Karnataka
   */

  const ignoredPatterns = [
    /^\d{5,6}$/,
    /^india$/i,
  ];

  const usefulParts =
    parts.filter(
      (part) =>
        !ignoredPatterns.some(
          (pattern) =>
            pattern.test(part),
        ),
    );

  const first =
    usefulParts[0];

  const second =
    usefulParts[1];

  /*
   * State is usually near the end after
   * removing postcode and country.
   */
  const last =
    usefulParts[
      usefulParts.length - 1
    ];

  const selected = [
    first,
    second,
    last,
  ].filter(
    (value, index, array) =>
      value &&
      array.indexOf(value) === index,
  );

  return selected
    .slice(0, 3)
    .join(", ");
}

/* =========================================================
   HELPERS
========================================================= */

function normalizeStatus(
  status: string | null,
) {
  return (
    status || "Reported"
  )
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}

function toStatusValue(status: string | null): "REPORTED" | "IN_PROGRESS" | "RESOLVED" {
  const normalized = normalizeStatus(status).replace(/ /g, "_").toUpperCase();
  return normalized === "IN_PROGRESS" || normalized === "RESOLVED" ? normalized : "REPORTED";
}

function calculatePriorityScore(
  report: CivicReport,
) {
  const severityScores: Record<
    string,
    number
  > = {
    LOW: 20,
    MEDIUM: 45,
    HIGH: 70,
    CRITICAL: 90,
  };

  const severity =
    severityScores[
      report.severity?.toUpperCase()
    ] ?? 30;

  const confidence =
    report.confidence ?? 0;

  const confirmations =
    Math.min(
      report.confirmations ?? 0,
      20,
    );

  const score =
    severity * 0.7 +
    confidence * 0.2 +
    confirmations * 0.5;

  return Math.min(
    100,
    Math.round(score),
  );
}

function createSevenDayTrend(
  reports: CivicReport[],
) {
  const days: {
    date: string;
    label: string;
    count: number;
  }[] = [];

  for (
    let index = 6;
    index >= 0;
    index--
  ) {
    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0,
    );

    date.setDate(
      date.getDate() -
        index,
    );

    const key =
      formatDateKey(date);

    days.push({
      date: key,

      label:
        date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          },
        ),

      count: 0,
    });
  }

  reports.forEach(
    (report) => {
      const reportDate =
        new Date(
          report.created_at,
        );

      if (
        Number.isNaN(
          reportDate.getTime(),
        )
      ) {
        return;
      }

      const key =
        formatDateKey(
          reportDate,
        );

      const day =
        days.find(
          (item) =>
            item.date === key,
        );

      if (day) {
        day.count += 1;
      }
    },
  );

  return days;
}

function formatDateKey(
  date: Date,
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(
    2,
    "0",
  );

  const day = String(
    date.getDate(),
  ).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}
