import { useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetMyProfileQuery } from "@/features/profile/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { APPLICATION_STATUS_META } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import { cleanParams } from "@/lib/query";
import { cn } from "@/lib/utils";
import { useGetMyApplicationsQuery } from "../api";

const ALL = "all";

const STATUS_OPTIONS = [
  { value: ALL, label: "All statuses" },
  ...Object.entries(APPLICATION_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
];

const MyApplicationsPage = () => {
  useDocumentTitle("Your applications");
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);

  const { data: profile } = useGetMyProfileQuery();
  const { data, isLoading, isFetching, isError, error, refetch } = useGetMyApplicationsQuery(
    cleanParams({ status: status === ALL ? "" : status, page, limit: 10 }),
  );
  const applications = data?.applications ?? [];

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const renderApplications = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load your applications" error={error} onRetry={refetch} />;
    if (applications.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          title={status === ALL ? "You haven't applied to any jobs yet" : "No applications with this status"}
          description="When you apply to a job, you can follow its progress here."
          action={
            <Button asChild>
              <Link to="/jobs">Find jobs</Link>
            </Button>
          }
        />
      );
    }

    return (
      <ul className={cn("divide-y overflow-hidden rounded-xl border bg-card transition-opacity", isFetching && "opacity-60")}>
        {applications.map((application) => (
          <li key={application._id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-accent/50">
            <CompanyLogo company={application.company} size="sm" />
            <div className="min-w-0 flex-1">
              {application.job ? (
                <Link to={`/dashboard/applications/${application._id}`} className="type-h4 block truncate text-foreground hover:underline">
                  {application.job.title}
                </Link>
              ) : (
                <p className="type-h4 text-muted-foreground">Job no longer available</p>
              )}
              <p className="type-caption text-muted-foreground">
                {application.company?.name} · Applied {formatRelativeTime(application.createdAt)}
                {application.job && application.job.status !== "open" && " · Job closed"}
              </p>
            </div>
            <StatusBadge status={application.status} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title="Applications"
        description="Follow every job you've applied to."
        actions={
          <Select value={status} onValueChange={changeStatus}>
            <SelectTrigger aria-label="Filter by status" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {profile && !profile.resume?.url && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center">
          <Upload className="size-5 shrink-0 text-warning" aria-hidden="true" />
          <p className="type-body flex-1 text-foreground">Upload your resume so you can apply to jobs in one click.</p>
          <Button asChild size="sm">
            <Link to="/dashboard/profile#resume">Upload resume</Link>
          </Button>
        </div>
      )}

      {renderApplications()}

      <Pagination page={page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default MyApplicationsPage;
