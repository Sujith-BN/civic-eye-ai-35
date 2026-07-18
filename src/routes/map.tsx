import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertOctagon,
  Check,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { getCivicReports } from "@/lib/get-civic-reports";
import { confirmCivicReport } from "@/lib/confirm-civic-report";
import { getMyCivicConfirmations } from "@/lib/get-my-civic-confirmations";
import { CivicMapLoader } from "@/components/CivicMapLoader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase-client";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      {
        title: "Civic Map — FixMyCity",
      },
      {
        name: "description",
        content:
          "Explore real civic issues reported by citizens.",
      },
    ],
  }),

  component: MapPage,
});

type CivicReport = {
  id: number;
  submitter_id: string | null;
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

const filters = [
  "All",
  "Pothole",
  "Garbage",
  "Streetlight",
  "Water",
  "Drainage",
  "Other",
] as const;

type Filter = (typeof filters)[number];

function MapPage() {
  const [reports, setReports] = useState<CivicReport[]>([]);

  const [filter, setFilter] = useState<Filter>("All");

  const [selectedId, setSelectedId] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [confirmingId, setConfirmingId] =
    useState<number | null>(null);

  const [confirmedReports, setConfirmedReports] =
    useState<Set<number>>(new Set());
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  /* =====================================================
     LOAD AUTHENTICATED USER + DATABASE CONFIRMATIONS
  ===================================================== */

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
      setCurrentUserId(data.session?.user.id ?? null);
      if (!data.session?.access_token) return;

      try {
        const ids = await getMyCivicConfirmations({
          data: { accessToken: data.session.access_token },
        });
        setConfirmedReports(new Set(ids));
      } catch (error) {
        console.error("Unable to load database confirmations:", error);
      }
    });
  }, []);

  /* =====================================================
     LOAD REAL REPORTS FROM SUPABASE
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadReports() {
      try {
        setLoading(true);
        setError(null);

       

        const result = await getCivicReports();


        if (!cancelled) {
          setReports(
            (result ?? []) as CivicReport[],
          );
        }
      } catch (err) {
        console.error(
          "Failed to load civic reports:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load civic reports.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     FILTER REPORTS
  ===================================================== */

  const visible = useMemo(() => {
    if (filter === "All") {
      return reports;
    }

    return reports.filter((report) =>
      matchesFilter(
        report.category,
        filter,
      ),
    );
  }, [reports, filter]);

  /* =====================================================
     AUTO SELECT FIRST VISIBLE REPORT
  ===================================================== */

  useEffect(() => {
    if (
      visible.length > 0 &&
      !visible.some(
        (report) =>
          report.id === selectedId,
      )
    ) {
      setSelectedId(visible[0].id);
    }

    if (visible.length === 0) {
      setSelectedId(null);
    }
  }, [visible, selectedId]);

  const selected =
    visible.find(
      (report) =>
        report.id === selectedId,
    ) ??
    reports.find(
      (report) =>
        report.id === selectedId,
    ) ??
    null;

  const mappedReports = visible.filter(
    (report) =>
      report.latitude != null &&
      report.longitude != null,
  );

  const mappedCount = mappedReports.length;

  /* =====================================================
     CONFIRM REPORT
  ===================================================== */

  const handleConfirmReport =
    async () => {
      if (!selected) {
        return;
      }

      if (!accessToken) {
        toast.info("Please sign in to confirm an issue.");
        return;
      }

      if (selected.submitter_id === currentUserId) {
        toast.info("You cannot confirm your own report.");
        return;
      }

      if (
        confirmedReports.has(
          selected.id,
        )
      ) {
        toast.info(
          "You already confirmed this issue.",
        );

        return;
      }

      try {
        setConfirmingId(selected.id);

        const result =
          await confirmCivicReport({
            data: {
              reportId: selected.id,
              accessToken,
            },
          });

        /*
         * Update confirmation count immediately
         * without reloading all reports.
         */
        setReports((current) =>
          current.map((report) =>
            report.id === selected.id
              ? {
                  ...report,
                  confirmations:
                    result.confirmations,
                }
              : report,
          ),
        );

        setConfirmedReports((current) => {
          const next = new Set(current);
          next.add(selected.id);
          return next;
        });

        toast.success(
          "Thanks! Your confirmation was added.",
        );
      } catch (err) {
        console.error(
          "Report confirmation failed:",
          err,
        );

        toast.error(
          err instanceof Error
            ? err.message
            : "Unable to confirm this issue.",
        );
      } finally {
        setConfirmingId(null);
      }
    };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />

          <h2 className="mt-4 font-display text-xl font-bold">
            Loading Civic Map
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Mapping real citizen reports...
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
            Civic Map unavailable
          </h2>

          <p className="mt-2 text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

      {/* HEADER */}

      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">
          Civic map
        </div>

        <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">
          Your city, mapped.
        </h1>

        <p className="mt-2 text-muted-foreground">
          Explore and verify real civic issues
          submitted by citizens.
        </p>
      </div>

      {/* FILTERS */}

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setFilter(item)
            }
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",

              filter === item
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-foreground/40",
            )}
          >
            {item === "All"
              ? "All Issues"
              : item}
          </button>
        ))}
      </div>

      {/* MAP + DETAILS */}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">

        {/* REAL MAP */}

        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-border bg-secondary/20 shadow-elegant">

          {mappedCount > 0 ? (
            <CivicMapLoader
              reports={mappedReports}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          ) : (
            <div className="grid h-full place-items-center">
              <div className="max-w-sm px-6 text-center">
                <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />

                <h2 className="mt-3 font-display text-xl font-bold">
                  No mapped reports
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                  Reports need valid latitude
                  and longitude before they can
                  appear on the civic map.
                </p>
              </div>
            </div>
          )}

          {/* MAP COUNT */}

          <div className="absolute right-4 top-4 z-[500] flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold shadow-card backdrop-blur">
            <Search className="h-3.5 w-3.5" />

            Showing {mappedCount} mapped{" "}
            {mappedCount === 1
              ? "issue"
              : "issues"}
          </div>
        </div>

        {/* SELECTED REPORT */}

        <div className="lg:sticky lg:top-20 lg:self-start">

          {selected ? (
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">

              {/* IMAGE */}

              {selected.image_url && (
                <img
                  src={selected.image_url}
                  alt={
                    selected.detected_issue
                  }
                  className="h-56 w-full object-cover"
                />
              )}

              <div className="p-6">

                {/* BADGES */}

                <div className="flex flex-wrap items-center gap-2">

                  <SeverityBadge
                    severity={
                      selected.severity as any
                    }
                  />

                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                    {formatStatus(selected.status)}
                  </span>

                  <span className="font-mono text-xs text-muted-foreground">
                    #{selected.id}
                  </span>

                </div>

                {/* ISSUE */}

                <h2 className="mt-4 font-display text-2xl font-bold">
                  {selected.detected_issue}
                </h2>

                <div className="mt-1 text-sm font-medium text-primary">
                  {selected.category}
                </div>

                {/* LOCATION */}

                {selected.location && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">

                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      {selected.location}
                    </span>

                  </div>
                )}

                {/* DESCRIPTION */}

                {selected.description && (
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {selected.description}
                  </p>
                )}

                {/* INFO */}

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <InfoBox
                    label="AI Confidence"
                    value={`${selected.confidence ?? 0}%`}
                  />

                  <InfoBox
                    label="Confirmations"
                    value={String(
                      selected.confirmations ?? 0,
                    )}
                  />

                  <InfoBox
                    label="Department"
                    value={
                      selected.department ||
                      "Pending"
                    }
                  />

                  <InfoBox
                    label="Status"
                    value={
                      formatStatus(selected.status)
                    }
                  />

                </div>

                {/* SAFETY */}

                {selected.safety_risk && (
                  <div className="mt-4 rounded-xl border border-warning/20 bg-warning/10 p-3">

                    <div className="text-xs font-bold uppercase tracking-wider">
                      Safety Risk
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {selected.safety_risk}
                    </p>

                  </div>
                )}

                {/* CONFIRM BUTTON */}

                <div className="mt-5">

                  <button
                    type="button"
                    onClick={() =>
                      void handleConfirmReport()
                    }
                    disabled={
                      confirmingId ===
                        selected.id ||
                      (currentUserId !== null &&
                        selected.submitter_id === currentUserId) ||
                      confirmedReports.has(
                        selected.id,
                      )
                    }
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all",

                      confirmedReports.has(
                        selected.id,
                      )
                        ? "cursor-default bg-success/15 text-success"
                        : "bg-primary text-primary-foreground hover:opacity-90",

                      confirmingId ===
                        selected.id &&
                        "cursor-wait opacity-70",
                    )}
                  >

                    {confirmingId ===
                    selected.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : confirmedReports.has(
                        selected.id,
                      ) ? (
                      <>
                        <Check className="h-4 w-4" />
                        You confirmed this issue
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />

                        {currentUserId !== null &&
                        selected.submitter_id === currentUserId
                          ? "You reported this issue"
                          : "Confirm Issue"}{" "}·{" "}
                        {selected.confirmations ??
                          0}
                      </>
                    )}

                  </button>

                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Community confirmations help
                    prioritize issues that affect
                    more citizens.
                  </p>

                </div>

                {/* COORDINATES */}

                {selected.latitude != null &&
                  selected.longitude != null && (
                    <div className="mt-4 text-xs text-muted-foreground">

                      Coordinates:{" "}

                      {selected.latitude.toFixed(
                        6,
                      )}

                      ,{" "}

                      {selected.longitude.toFixed(
                        6,
                      )}

                    </div>
                  )}

              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">

              <MapPin className="mx-auto h-8 w-8 text-muted-foreground" />

              <p className="mt-3 text-sm text-muted-foreground">
                No reports available for this
                filter.
              </p>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   INFO BOX
========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-secondary/50 p-3">

      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>

      <div className="mt-1 break-words text-sm font-semibold">
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   FILTER MATCHING
========================================================= */

function matchesFilter(
  category: string,
  filter: Filter,
) {
  const value =
    category.toLowerCase();

  switch (filter) {
    case "Pothole":
      return (
        value.includes("pothole") ||
        value.includes("road damage")
      );

    case "Garbage":
      return value.includes(
        "garbage",
      );

    case "Streetlight":
      return value.includes(
        "streetlight",
      );

    case "Water":
      return value.includes(
        "water",
      );

    case "Drainage":
      return (
        value.includes("drainage") ||
        value.includes("sewage")
      );

    case "Other":
      return ![
        "pothole",
        "road damage",
        "garbage",
        "streetlight",
        "water",
        "drainage",
        "sewage",
      ].some((keyword) =>
        value.includes(keyword),
      );

    default:
      return true;
  }
}

function formatStatus(status: string | null) {
  return (status || "REPORTED").replace(/_/g, " ");
}
