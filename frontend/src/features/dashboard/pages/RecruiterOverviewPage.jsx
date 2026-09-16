import { Briefcase, Building2, CalendarClock, CheckCircle2, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import { PageLoader } from "@/components/common/Spinner";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { APPLICATION_STATUS_META } from "@/lib/constants";
import { formatNumber, formatRelativeTime, pluralize } from "@/lib/format";
import { useGetRecruiterOverviewQuery } from "../api";

const PipelineBars = ({ byStatus, total }) => (
  <ul className="space-y-4">
    {Object.entries(APPLICATION_STATUS_META).map(([status, meta]) => {
      const count = byStatus[status] ?? 0;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      return (
        <li key={status}>
          <div className="flex items-center justify-between gap-4">
            <span className="type-label text-muted-foreground">{meta.label}</span>
            <span className="type-body font-medium text-foreground">{formatNumber(count)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${percent}%` }} />
          </div>
        </li>
      );
    })}
  </ul>
);

const RecruiterOverviewPage = () => {
  useDocumentTitle("Overview");
  const { data: overview, isLoading, isError, error, refetch } = useGetRecruiterOverviewQuery();

  const postJobButton = (
    <Button asChild>
      <Link to="/recruiter/jobs/new">
        <Plus /> Post a job
      </Link>
    </Button>
  );

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState title="Couldn't load your overview" error={error} onRetry={refetch} />;

  if (overview.companyCount === 0) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Hiring" title="Overview" description="How your hiring is going." />
        <EmptyState
          icon={Building2}
          title="Welcome! Start by registering your company"
          description="Jobs are posted on behalf of a company. Add yours, then publish your first job."
          action={
            <Button asChild>
              <Link to="/recruiter/companies/new">Register company</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const { jobs, applications, recentApplications, topJobs } = overview;

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="How your hiring is going." actions={postJobButton} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open jobs" value={formatNumber(jobs.open)} icon={Briefcase} hint={`${jobs.draft} drafts · ${jobs.closed} closed`} />
        <StatCard label="Applicants" value={formatNumber(applications.total)} icon={Users} tone="info" />
        <StatCard label="In interview" value={formatNumber(applications.byStatus.interview ?? 0)} icon={CalendarClock} tone="warning" />
        <StatCard label="Hired" value={formatNumber(applications.byStatus.hired ?? 0)} icon={CheckCircle2} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Pipeline" description="Where every applicant stands.">
          <PipelineBars byStatus={applications.byStatus} total={applications.total} />
        </SectionCard>

        <SectionCard title="Busiest open jobs">
          {topJobs.length === 0 ? (
            <p className="type-body text-muted-foreground">You don't have any open jobs right now.</p>
          ) : (
            <ul className="divide-y">
              {topJobs.map((job) => (
                <li key={job._id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="type-body truncate font-medium text-foreground">{job.title}</p>
                    <p className="type-caption text-muted-foreground">{job.company?.name}</p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/recruiter/jobs/${job._id}/applicants`}>{pluralize(job.applicationCount, "applicant")}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Recent applicants">
        {recentApplications.length === 0 ? (
          <p className="type-body text-muted-foreground">New applications will show up here.</p>
        ) : (
          <ul className="divide-y">
            {recentApplications.map((application) => (
              <li key={application._id}>
                <Link
                  to={`/recruiter/applications/${application._id}`}
                  className="-mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-accent"
                >
                  <UserAvatar user={application.candidate} />
                  <div className="min-w-0 flex-1">
                    <p className="type-body truncate font-medium text-foreground">{application.candidate?.fullName}</p>
                    <p className="type-caption truncate text-muted-foreground">
                      {application.job?.title} · {formatRelativeTime(application.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={application.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
};

export default RecruiterOverviewPage;
