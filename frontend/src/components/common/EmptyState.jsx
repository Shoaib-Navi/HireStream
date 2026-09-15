import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const EmptyState = ({ icon: Icon = Inbox, title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center",
      className,
    )}
  >
    <div className="mb-5 flex size-12 items-center justify-center rounded-md border bg-surface text-foreground">
      <Icon className="size-5" aria-hidden="true" />
    </div>
    <h3 className="type-h3 text-foreground">{title}</h3>
    {description && <p className="type-body mt-2 max-w-sm text-muted-foreground">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
