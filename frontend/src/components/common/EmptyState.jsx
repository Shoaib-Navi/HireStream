import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const EmptyState = ({ icon: Icon = Inbox, title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-14 text-center",
      className,
    )}
  >
    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
      <Icon className="size-6" aria-hidden="true" />
    </div>
    <h3 className="type-h4 text-foreground">{title}</h3>
    {description && <p className="type-body mt-1 max-w-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
