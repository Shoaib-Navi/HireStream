import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";

const ErrorState = ({ title = "Couldn't load this", error, onRetry, className }) => (
  <div
    role="alert"
    className={cn("flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-14 text-center", className)}
  >
    <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-danger-soft text-destructive">
      <AlertTriangle className="size-6" aria-hidden="true" />
    </div>
    <h3 className="type-h4 text-foreground">{title}</h3>
    <p className="type-body mt-1 max-w-sm text-muted-foreground">{getErrorMessage(error)}</p>
    {onRetry && (
      <Button variant="outline" className="mt-5" onClick={onRetry}>
        <RotateCw /> Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
