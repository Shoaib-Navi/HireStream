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

const JobSection = ({ title, children }) => (
  <section className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
    <h2 className="type-h3 text-foreground">{title}</h2>
    <div className="type-body mt-4 text-muted-foreground">{children}</div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="list-disc space-y-2 pl-5 marker:text-primary">
    {items.map((item) => (
      <li key={item}>{item}</li>
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
    <div className="page-container py-8 lg:py-12">
      <Link to="/jobs" className="type-caption inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All jobs
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_20rem] lg:gap-8">
        <article className="min-w-0 space-y-6">
          <header className="rounded-2xl border bg-card p-6 shadow-card sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <CompanyLogo company={job.company} size="lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {job.status !== "open" && <StatusBadge type="job" status={job.status} />}
                  <span className="type-caption text-muted-foreground">Posted {formatRelativeTime(job.createdAt)}</span>
                </div>
                <h1 className="type-h1 text-foreground">{job.title}</h1>
                <p className="type-body-lg flex items-center gap-1.5 text-muted-foreground">
                  {job.company?.name}
                  {job.company?.isVerified && <BadgeCheck className="size-4 text-primary" aria-label="Verified company" />}
                </p>
                <JobMeta job={job} className="pt-1" />
              </div>
            </div>
          </header>

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
                  <Badge key={skill} variant="brand">
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
    </div>
  );
};

export default JobDetailsPage;
