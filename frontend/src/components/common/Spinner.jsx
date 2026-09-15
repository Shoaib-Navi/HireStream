import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Spinner = ({ className }) => (
  <Loader2 className={cn("size-5 animate-spin text-primary", className)} aria-hidden="true" />
);

export const PageLoader = ({ className }) => (
  <div role="status" aria-live="polite" className={cn("flex min-h-[40vh] items-center justify-center", className)}>
    <Spinner className="size-7" />
    <span className="sr-only">Loading…</span>
  </div>
);
