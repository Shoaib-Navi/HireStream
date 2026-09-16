import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Inline spinner, for buttons and tight spaces
export const Spinner = ({ className }) => (
  <Loader2 className={cn("size-5 animate-spin text-primary", className)} aria-hidden="true" />
);

// Full-page waiting state: a hairline track with a travelling bar and a quiet label,
// which reads as part of the layout rather than a spinner dropped on top of it
export const PageLoader = ({ label = "Loading", className }) => (
  <div role="status" aria-live="polite" className={cn("flex min-h-[40vh] flex-col items-center justify-center gap-5", className)}>
    <div className="h-px w-40 overflow-hidden bg-border" aria-hidden="true">
      <span className="block h-full w-1/3 animate-shimmer bg-primary" />
    </div>
    <p className="type-label text-muted-foreground" aria-hidden="true">
      {label}
    </p>
    <span className="sr-only">{label}…</span>
  </div>
);
