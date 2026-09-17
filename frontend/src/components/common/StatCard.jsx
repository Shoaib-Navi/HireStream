import { cn } from "@/lib/utils";

// The same semantic set the badges use: neutral by default, and a tone only when
// the number means something (in progress, healthy, needs attention).
const TONES = {
  neutral: "bg-muted text-foreground",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
};

const StatCard = ({ label, value, icon: Icon, hint, tone = "neutral", className }) => (
  <div className={cn("flex items-start gap-4 rounded-xl border bg-card p-5 shadow-card", className)}>
    {Icon && (
      <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", TONES[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
    )}
    <div className="min-w-0">
      <p className="type-caption text-muted-foreground">{label}</p>
      <p className="type-h2 mt-0.5 text-foreground">{value}</p>
      {hint && <p className="type-caption mt-1 text-muted-foreground">{hint}</p>}
    </div>
  </div>
);

export default StatCard;
