import { Briefcase, Building2, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import { PageLoader } from "@/components/common/Spinner";
import StatCard from "@/components/common/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { APPLICATION_STATUS_META, JOB_STATUS_META, ROLE_META } from "@/lib/constants";
import { formatNumber, formatRelativeTime, pluralize } from "@/lib/format";

import { useGetAdminOverviewQuery } from "../api";

const Breakdown = ({ meta, counts }) => (
  <ul className="grid gap-3 sm:grid-cols-2">
    {Object.entries(meta).map(([key, { label }]) => (
      <li key={key} className="flex items-center justify-between gap-4 rounded-lg bg-surface px-3 py-2">
        <span className="type-label text-muted-foreground">{label}</span>
        <span className="type-body font-medium text-foreground">{formatNumber(counts[key] ?? 0)}</span>
      </li>
    ))}
  </ul>
);

const AdminOverviewPage = () => {
  useDocumentTitle("Admin overview");
  const { data, isLoading, isError, error, refetch } = useGetAdminOverviewQuery();

  // The header stays put while the figures load, so opening this tab does not blank the
  // page and then push the title back in
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Admin" title="Overview" description="Everything happening across HireStream." />
        <PageLoader />
      </div>
    );
  }
  if (isError) return <ErrorState title="Couldn't load the overview" error={error} onRetry={refetch} />;

  const { users, companies, jobs, applications, recentUsers, recentJobs } = data;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Overview" description="Everything happening across HireStream." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Users"
          value={formatNumber(users.total)}
          icon={Users}
          hint={users.suspended > 0 ? `${users.suspended} suspended` : "All active"}
        />
        <StatCard
          label="Companies"
          value={formatNumber(companies.total)}
          icon={Building2}
          hint={`${companies.unverified} awaiting verification`}
        />
        <StatCard label="Jobs" value={formatNumber(jobs.total)} icon={Briefcase} hint={`${jobs.byStatus.open} open`} />
        <StatCard label="Applications" value={formatNumber(applications.total)} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Users by role">
          <Breakdown meta={ROLE_META} counts={users.byRole} />
        </SectionCard>
        <SectionCard title="Jobs by status">
          <Breakdown meta={JOB_STATUS_META} counts={jobs.byStatus} />
        </SectionCard>
      </div>

      <SectionCard title="Applications by status">
        <Breakdown meta={APPLICATION_STATUS_META} counts={applications.byStatus} />
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Newest users" action={<Link to="/admin/users" className="type-label text-primary hover:underline">View all</Link>}>
          <ul className="divide-y">
            {recentUsers.map((user) => (
              <li key={user._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <UserAvatar user={user} />
                <div className="min-w-0 flex-1">
                  <p className="type-body truncate font-medium text-foreground">{user.fullName}</p>
                  <p className="type-caption truncate text-muted-foreground">{user.email}</p>
                </div>
                <StatusBadge type="role" status={user.role} />
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Newest jobs" action={<Link to="/admin/jobs" className="type-label text-primary hover:underline">View all</Link>}>
          <ul className="divide-y">
            {recentJobs.map((job) => (
              <li key={job._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <CompanyLogo company={job.company} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="type-body truncate font-medium text-foreground">{job.title}</p>
                  <p className="type-caption truncate text-muted-foreground">
                    {job.company?.name} · {pluralize(job.applicationCount, "applicant")} · {formatRelativeTime(job.createdAt)}
                  </p>
                </div>
                <StatusBadge type="job" status={job.status} />
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
