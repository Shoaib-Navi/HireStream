import { AlertTriangle, CheckCircle2, Clock, Inbox, Info, Loader2, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/utils";

// One visual language for every state the app reports: the same square chip, soft tone
// background and icon, whether it appears in a toast, an error panel or an empty list.
const STATUS_TONES = {
  success: { icon: CheckCircle2, chip: "bg-success-soft text-success" },
  error: { icon: OctagonAlert, chip: "bg-danger-soft text-destructive" },
  warning: { icon: AlertTriangle, chip: "bg-warning-soft text-warning" },
  info: { icon: Info, chip: "bg-info-soft text-info" },
  progress: { icon: Loader2, chip: "bg-primary-soft text-primary", spin: true },
  pending: { icon: Clock, chip: "bg-muted text-muted-foreground" },
  neutral: { icon: Inbox, chip: "border bg-surface text-foreground" },
};

const SIZES = {
  sm: { box: "size-9 rounded-md", icon: "size-4" },
  md: { box: "size-12 rounded-md", icon: "size-5" },
  lg: { box: "size-14 rounded-lg", icon: "size-6" },
};

const StatusIcon = ({ tone = "neutral", icon: OverrideIcon, size = "md", className }) => {
  const { icon: ToneIcon, chip, spin } = STATUS_TONES[tone] ?? STATUS_TONES.neutral;
  const Icon = OverrideIcon ?? ToneIcon;
  const dimensions = SIZES[size] ?? SIZES.md;

  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", dimensions.box, chip, className)}>
      <Icon className={cn(dimensions.icon, spin && "animate-spin")} aria-hidden="true" />
    </span>
  );
};

export default StatusIcon;
