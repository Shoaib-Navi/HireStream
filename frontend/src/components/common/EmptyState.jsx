import StatusIcon from "@/components/common/StatusIcon";
import { cn } from "@/lib/utils";

const EmptyState = ({ icon, title, description, action, tone = "neutral", className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center",
      className,
    )}
  >
    <StatusIcon tone={tone} icon={icon} className="mb-5" />
    <h3 className="type-h3 text-foreground">{title}</h3>
    {description && <p className="type-body mt-2 max-w-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
