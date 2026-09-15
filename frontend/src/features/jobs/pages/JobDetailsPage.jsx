import { ArrowLeft, BadgeCheck, SearchX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ApplyCard from "@/features/applications/components/ApplyCard";
import CompanyAboutCard from "@/features/companies/components/CompanyAboutCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatRelativeTime } from "@/lib/format";
import { useGetJobQuery } from "../api";
import JobMeta from "../components/JobMeta";

// Label on the left, content on the right, separated by a hairline
const JobSection = ({ title, children }) => (
  <section className="grid gap-4 border-t py-8 sm:grid-cols-[11rem_1fr] sm:gap-8">
    <h2 className="type-label pt-1 text-muted-foreground">{title}</h2>
    <div className="type-body-lg min-w-0 text-foreground">{children}</div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="space-y-3">
    {items.map((item, index) => (
      <li key={item} className="flex gap-4">
        <span className="type-caption pt-1 text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const JobDetailsPage = () => {
  const { id } = useParams();
  const { data: job, isLoading, isError, error, refetch } = useGetJobQuery(id);
  useDocumentTitle(job ? `${job.title} at ${job.company?.name}` : "Job details");

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <div className="page-container py-16">
        {error?.status === 404 || error?.status === 400 ? (
          <EmptyState
            icon={SearchX}
            title="Job not found"
            description="This job may have been removed or is no longer public."
            action={
              <Button asChild>
                <Link to="/jobs">Browse jobs</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState title="Couldn't load this job" error={error} onRetry={refetch} />
        )}
      </div>
    );
  }

  return (
    <>
      <section className="dark rounded-b-section bg-background text-foreground">
        <div className="page-container pt-8 pb-14 sm:pb-20">
          <Link to="/jobs" className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" /> All jobs
          </Link>

          <div className="mt-12 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <CompanyLogo company={job.company} size="sm" />
              <p className="type-body-lg flex items-center gap-1.5">
                {job.company?.name}
                {job.company?.isVerified && <BadgeCheck className="size-4" aria-label="Verified company" />}
              </p>
              <span className="type-caption text-muted-foreground">· Posted {formatRelativeTime(job.createdAt)}</span>
              {job.status !== "open" && <StatusBadge type="job" status={job.status} />}
            </div>
            <h1 className="type-h1 max-w-4xl">{job.title}</h1>
            <JobMeta job={job} />
          </div>
        </div>
      </section>

      <div className="page-container grid gap-10 py-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
        <article className="min-w-0">
          <JobSection title="About the role">
            <p className="whitespace-pre-line">{job.description}</p>
          </JobSection>

          {job.responsibilities?.length > 0 && (
            <JobSection title="Responsibilities">
              <BulletList items={job.responsibilities} />
            </JobSection>
          )}

          {job.requirements?.length > 0 && (
            <JobSection title="Requirements">
              <BulletList items={job.requirements} />
            </JobSection>
          )}

          {job.skills?.length > 0 && (
            <JobSection title="Skills">
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>
            </JobSection>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ApplyCard job={job} />
          <CompanyAboutCard company={job.company} />
        </aside>
      </div>
    </>
  );
};

export default JobDetailsPage;
