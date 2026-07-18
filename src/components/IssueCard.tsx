import { CivicIssue, priorityScore } from "@/lib/mock-data";
import { SeverityBadge } from "./SeverityBadge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function IssueCard({ issue }: { issue: CivicIssue }) {
  const [count, setCount] = useState(issue.confirmations);
  const [seen, setSeen] = useState(false);
  const verified = count >= 15;
  const score = priorityScore({ ...issue, confirmations: count });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img src={issue.photo} alt={issue.title} className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute top-3 left-3 flex gap-2">
          <SeverityBadge severity={issue.severity} />
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/90 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-success-foreground shadow-elegant">
              <ShieldCheck className="h-3 w-3" /> Community Verified
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 rounded-lg bg-background/95 px-2.5 py-1 text-xs font-mono font-semibold shadow-card">
          {issue.id}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <h3 className="min-w-0 font-display text-lg font-bold leading-tight">{issue.title}</h3>
          <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-xs font-medium">{issue.category}</span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{issue.location}</span>
        </div>

        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary-glow/5 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI Priority Score
            </div>
            <span className={cn("text-xs font-bold uppercase",
              score >= 85 ? "text-critical" : score >= 65 ? "text-accent-foreground" : "text-muted-foreground")}>
              {score >= 85 ? "Critical" : score >= 65 ? "High" : score >= 40 ? "Medium" : "Low"}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-2xl font-bold">{score}</span>
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-gradient-hero transition-all" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="font-medium text-foreground">{count}</span> citizens
          </div>
          <span className="text-xs text-muted-foreground">Status: <span className="font-medium text-foreground">{issue.status}</span></span>
        </div>

        <Button
          disabled={seen}
          onClick={() => { setCount(count + 1); setSeen(true); }}
          className={cn("w-full font-bold uppercase tracking-wider",
            seen ? "bg-success text-success-foreground" : "bg-gradient-hero shadow-elegant hover:opacity-90")}
        >
          {seen ? "✓ You confirmed this" : "I see this too"}
        </Button>
      </div>
    </div>
  );
}
