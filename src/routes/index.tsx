import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Camera,
  MapPin,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCivicReports } from "@/lib/get-civic-reports";

export const Route = createFileRoute("/")({
  component: Landing,
});

type CivicReport = {
  id: number;
  status: string | null;
  severity: string | null;
  confirmations: number | null;
};

function Landing() {
  const [reports, setReports] = useState<CivicReport[]>([]);

  /* =====================================================
     LOAD REAL REPORTS FROM SUPABASE
  ===================================================== */

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const data = await getCivicReports();

        if (!active) return;

        setReports((data ?? []) as CivicReport[]);
      } catch (error) {
        console.error(
          "Failed to load homepage stats:",
          error,
        );
      }
    }

    void loadReports();

    return () => {
      active = false;
    };
  }, []);

  /* =====================================================
     REAL HOMEPAGE STATS
  ===================================================== */

  const liveStats = useMemo(() => {
    const active = reports.filter(
      (report) =>
        normalizeStatus(report.status) !== "resolved",
    ).length;

    const critical = reports.filter(
      (report) =>
        report.severity?.trim().toUpperCase() === "CRITICAL" &&
        normalizeStatus(report.status) !== "resolved",
    ).length;

    const resolved = reports.filter(
      (report) =>
        normalizeStatus(report.status) === "resolved",
    ).length;

    const confirmations = reports.reduce(
      (total, report) =>
        total + (report.confirmations ?? 0),
      0,
    );

    return {
      active,
      critical,
      resolved,
      confirmations,
    };
  }, [reports]);

  return (
    <div>
      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 md:pb-32 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            {/* LEFT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Civic Intelligence
              </div>

              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
                See a problem.
                <br />
                Snap it.{" "}
                <span className="text-gradient">
                  Fix your city.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                FixMyCity turns citizen photos into structured,
                verified, and prioritized civic reports. AI analyzes
                evidence, classifies severity, and routes it to the
                right department — instantly.
              </p>

              {/* ACTION BUTTONS */}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/report">
                  <Button
                    size="lg"
                    className="h-12 bg-gradient-hero px-6 text-base font-semibold shadow-elegant hover:opacity-90"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Report an Issue
                  </Button>
                </Link>

                <Link to="/map">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 border-2 px-6 text-base font-semibold"
                  >
                    <MapPin className="mr-2 h-5 w-5" />
                    Explore Civic Map
                  </Button>
                </Link>
              </div>

              {/* FEATURES */}

              <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-muted-foreground sm:gap-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-success" />
                  Community verified
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  Instant AI triage
                </div>
              </div>
            </div>

            {/* RIGHT HERO IMAGE */}

            <div className="relative">
              <div className="relative rounded-3xl border border-border bg-card p-4 shadow-elegant sm:p-6">
                <img
                  src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=70"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                  alt="Civic issue"
                />

                {/* AI ANALYSIS CARD */}

                <div className="absolute -bottom-6 left-2 max-w-[230px] rounded-2xl border border-border bg-background p-3 shadow-elegant sm:-left-6 sm:max-w-xs sm:p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Analysis
                  </div>

                  <div className="mt-1.5 font-display text-base font-bold sm:text-lg">
                    Pothole detected
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Severity:{" "}
                    <span className="font-semibold text-critical">
                      Critical
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-muted-foreground">
                    Confidence: 96%
                  </div>
                </div>

                {/* VERIFIED CARD */}

                <div className="absolute -right-1 -top-4 rounded-2xl border border-border bg-background px-3 py-2 shadow-elegant sm:-right-4 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-success">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified
                  </div>

                  <div className="mt-0.5 text-sm font-bold">
                    Community backed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          REAL LIVE STATS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {[
            {
              label: "Active Reports",
              value: liveStats.active.toLocaleString(),
              icon: TrendingUp,
              color: "text-primary",
            },
            {
              label: "Critical Issues",
              value: liveStats.critical.toLocaleString(),
              icon: Zap,
              color: "text-critical",
            },
            {
              label: "Resolved",
              value: liveStats.resolved.toLocaleString(),
              icon: CheckCircle2,
              color: "text-success",
            },
            {
              label: "Confirmations",
              value: liveStats.confirmations.toLocaleString(),
              icon: Users,
              color: "text-accent-foreground",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5"
            >
              <stat.icon
                className={`h-5 w-5 ${stat.color}`}
              />

              <div className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                {stat.value}
              </div>

              <div className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =================================================
          HOW IT WORKS
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">
            How it works
          </div>

          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl">
            Three steps to a better city
          </h2>

          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            From snapshot to civic action in under a minute.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Capture",
              icon: Camera,
              desc: "Snap a photo of the civic issue — a pothole, garbage pile, broken streetlight. Add your location with one tap.",
            },
            {
              step: "02",
              title: "AI Analyzes",
              icon: Sparkles,
              desc: "Our AI classifies the issue, assigns severity, estimates safety risk, and routes it to the responsible department.",
            },
            {
              step: "03",
              title: "Community Acts",
              icon: Users,
              desc: "Neighbors confirm the issue. Verified reports get boosted priority scores and faster municipal response.",
            },
          ].map((step) => (
            <div
              key={step.step}
              className="relative rounded-3xl border border-border bg-card p-7 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-hero shadow-elegant">
                  <step.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                <span className="font-display text-4xl font-bold text-muted-foreground/30">
                  {step.step}
                </span>
              </div>

              <h3 className="mt-5 font-display text-2xl font-bold">
                {step.title}
              </h3>

              <p className="mt-2 leading-relaxed text-muted-foreground">
                {step.desc}
              </p>

             
            </div>
          ))}
        </div>
      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 text-primary-foreground shadow-elegant sm:p-10 md:p-16">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />

          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Your city is one photo away from getting better.
            </h2>

            <p className="mt-4 text-base opacity-90 sm:text-lg">
              Turn everyday civic problems into structured,
              actionable reports powered by AI and community
              verification.
            </p>

            <Link to="/report">
              <Button
                size="lg"
                className="mt-8 h-12 bg-background px-6 font-semibold text-foreground hover:bg-background/90"
              >
                Report your first issue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   HELPER
========================================================= */

function normalizeStatus(status: string | null) {
  return (status || "REPORTED")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ");
}
