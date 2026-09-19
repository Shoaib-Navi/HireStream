import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// Status changes of an application, newest first
const StatusTimeline = ({ history = [] }) => (
  <ol className="relative ml-1.5 space-y-7 border-l pl-6">
    {[...history].reverse().map((entry, index) => (
      <li key={`${entry.status}-${entry.changedAt}`} className="relative">
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-1 -left-[1.9rem] size-3 rounded-full border-2 border-card",
            index === 0 ? "bg-foreground" : "bg-muted-foreground/40",
          )}
        />
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={entry.status} />
          <time dateTime={entry.changedAt} className="type-caption text-muted-foreground">
            {formatDate(entry.changedAt)}
          </time>
        </div>
        {entry.note && <p className="type-body mt-2 text-foreground">{entry.note}</p>}
      </li>
    ))}
  </ol>
);

export default StatusTimeline;
