import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/mock-data";

const styles: Record<Severity, string> = {
  Low: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/15 text-warning-foreground border-warning/40",
  High: "bg-accent/20 text-accent-foreground border-accent/40",
  Critical: "bg-critical/15 text-critical border-critical/40",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
      styles[severity], className,
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        severity === "Low" && "bg-success",
        severity === "Medium" && "bg-warning",
        severity === "High" && "bg-accent",
        severity === "Critical" && "bg-critical animate-pulse",
      )} />
      {severity}
    </span>
  );
}
