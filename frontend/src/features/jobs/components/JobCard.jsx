import { BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import MatchScore from "@/components/common/MatchScore";
import StatusBadge from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SaveJobButton from "@/features/savedJobs/components/SaveJobButton";
import { JOB_STATUS_META } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import JobMeta from "./JobMeta";

const MAX_SKILLS = 4;

const JobCard = ({ job, className }) => (
  <article
    className={cn(
      "group relative flex flex-col gap-5 rounded-xl border bg-card p-6 transition-colors hover:border-foreground/30",
      className,
    )}
  >
    <div className="flex items-start gap-3">
      <CompanyLogo company={job.company} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="type-caption flex items-center gap-1 text-muted-foreground">
          <span className="truncate">{job.company?.name}</span>
          {job.company?.isVerified && <BadgeCheck className="size-3.5 shrink-0 text-foreground" aria-label="Verified company" />}
        </p>
        <p className="type-caption text-muted-foreground">{formatRelativeTime(job.createdAt)}</p>
      </div>
      {job.status && job.status !== "open" && JOB_STATUS_META[job.status] && <StatusBadge type="job" status={job.status} />}
      <MatchScore match={job.match} />
      <SaveJobButton job={job} className="-mt-1 -mr-2" />
    </div>

    <div className="space-y-2">
      <h3 className="type-h3 text-foreground">
        {/* the link covers the whole card */}
        <Link to={`/jobs/${job._id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {job.title}
        </Link>
      </h3>
      {job.summary && <p className="type-body line-clamp-2 text-muted-foreground">{job.summary}</p>}
    </div>

    <JobMeta job={job} />

    {job.skills?.length > 0 && (
      <div className="mt-auto flex flex-wrap gap-1.5">
        {job.skills.slice(0, MAX_SKILLS).map((skill) => (
          <Badge key={skill} variant="neutral">
            {skill}
          </Badge>
        ))}
        {job.skills.length > MAX_SKILLS && <Badge variant="neutral">+{job.skills.length - MAX_SKILLS}</Badge>}
      </div>
    )}
  </article>
);

export const JobCardSkeleton = () => (
  <div className="flex flex-col gap-5 rounded-xl border bg-card p-6" aria-hidden="true">
    <div className="flex gap-3">
      <Skeleton className="size-9 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);

export const JobListSkeleton = ({ count = 4, className = "grid gap-4" }) => (
  <div className={className} role="status" aria-label="Loading jobs">
    {Array.from({ length: count }, (_, index) => (
      <JobCardSkeleton key={index} />
    ))}
  </div>
);

export default JobCard;
