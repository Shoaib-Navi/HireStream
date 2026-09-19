import { RotateCw } from "lucide-react";
import StatusIcon from "@/components/common/StatusIcon";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

// Same frame as EmptyState, so a failure and an empty list feel like the same system
const ErrorState = ({ title = "Couldn't load this", error, onRetry, className }) => (
  <div
    role="alert"
    className={cn(
      "flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-16 text-center",
      className,
    )}
  >
    <StatusIcon tone="error" className="mb-5" />
    <h3 className="type-h3 text-foreground">{title}</h3>
    <p className="type-body mt-2 max-w-sm text-muted-foreground">{getErrorMessage(error)}</p>
    {onRetry && (
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        <RotateCw /> Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
