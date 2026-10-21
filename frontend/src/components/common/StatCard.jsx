import { cn } from "@/lib/utils";

// Every card gets the same neutral icon container. Colour is reserved for things that
// report a status, such as the badges, so a number never implies good or bad on its own.
const StatCard = ({ label, value, icon: Icon, hint, className }) => (
  <div className={cn("flex items-start gap-4 rounded-xl border bg-card p-5 shadow-card", className)}>
    {Icon && (
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-surface text-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </div>
    )}
    <div className="min-w-0">
      <p className="type-caption text-muted-foreground">{label}</p>
      <p className="type-h2 mt-0.5 text-foreground">{value}</p>
      {/* the hint keeps its line whether or not there is one, so the cards in a row
          stay the same height */}
      <p className="type-caption mt-1 min-h-[1.219rem] text-muted-foreground">{hint}</p>
    </div>
  </div>
);

export default StatCard;
