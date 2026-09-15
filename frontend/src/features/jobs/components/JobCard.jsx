import { BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import JobMeta from "./JobMeta";

const MAX_SKILLS = 4;

const JobCard = ({ job, className }) => (
  <article
    className={cn(
      "group relative flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated",
      className,
    )}
  >
    <div className="flex items-start gap-3">
      <CompanyLogo company={job.company} />
      <div className="min-w-0 flex-1">
        <h3 className="type-h4 text-foreground transition-colors group-hover:text-primary">
          {/* the link covers the whole card */}
          <Link to={`/jobs/${job._id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {job.title}
          </Link>
        </h3>
        <p className="type-caption flex items-center gap-1 text-muted-foreground">
          {job.company?.name}
          {job.company?.isVerified && <BadgeCheck className="size-3.5 text-primary" aria-label="Verified company" />}
        </p>
      </div>
      <span className="type-caption shrink-0 text-muted-foreground">{formatRelativeTime(job.createdAt)}</span>
    </div>

    {job.summary && <p className="type-body line-clamp-2 text-muted-foreground">{job.summary}</p>}

    <JobMeta job={job} />

    {job.skills?.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
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
  <div className="flex flex-col gap-4 rounded-xl border bg-card p-5" aria-hidden="true">
    <div className="flex gap-3">
      <Skeleton className="size-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
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
