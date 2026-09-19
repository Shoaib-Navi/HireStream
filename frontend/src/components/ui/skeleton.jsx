import { cn } from "@/lib/utils"

// A sweep rather than a pulse: quieter, and it matches the loading bar used elsewhere
function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted relative overflow-hidden rounded-md", className)}
      {...props}>
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full animate-shimmer bg-linear-to-r from-transparent via-foreground/5 to-transparent" />
    </div>
  );
}

export { Skeleton }
