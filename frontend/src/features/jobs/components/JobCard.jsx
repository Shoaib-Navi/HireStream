import { BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import MatchScore from "@/components/common/MatchScore";
import SourceBadge from "@/components/common/SourceBadge";
import StatusBadge from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import SaveJobButton from "@/features/savedJobs/components/SaveJobButton";
import { JOB_STATUS_META } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import JobMeta from "./JobMeta";

const MAX_SKILLS = 4;

// Every card is the same height whatever the job is missing: the summary keeps its two
// clamped lines and the chip rows keep one row, so a job with no summary or no skills
// leaves a gap instead of pulling the cards below it upwards.
const SUMMARY_LINES = "min-h-12";
const CHIP_ROW = "min-h-[1.625rem]";

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
      <SourceBadge source={job.source} />
      <SaveJobButton job={job} className="-mt-1 -mr-2" />
    </div>

    <div className="space-y-2">
      <h3 className="type-h3 text-foreground">
        {/* the link covers the whole card */}
        <Link to={`/jobs/${job._id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {job.title}
        </Link>
      </h3>
      <p className={cn("type-body line-clamp-2 text-muted-foreground", SUMMARY_LINES)}>{job.summary}</p>
    </div>

    <JobMeta job={job} className={CHIP_ROW} />

    <div className={cn("mt-auto flex flex-wrap gap-1.5", CHIP_ROW)}>
      {job.skills?.slice(0, MAX_SKILLS).map((skill) => (
        <Badge key={skill} variant="neutral">
          {skill}
        </Badge>
      ))}
      {job.skills?.length > MAX_SKILLS && <Badge variant="neutral">+{job.skills.length - MAX_SKILLS}</Badge>}
    </div>
  </article>
);

// Mirrors the card's blocks so the list does not resize when the jobs arrive:
// 36px logo, a 27.5px heading, two lines of summary, then the two chip rows.
export const JobCardSkeleton = () => (
  <div className="flex flex-col gap-5 rounded-xl border bg-card p-6" aria-hidden="true">
    <div className="flex items-start gap-3">
      <Skeleton className="size-9 rounded-xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-[1.719rem] w-2/3" />
      <Skeleton className="h-12 w-full" />
    </div>
    <Skeleton className="h-[1.625rem] w-3/4" />
    <Skeleton className="h-[1.625rem] w-1/2" />
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
