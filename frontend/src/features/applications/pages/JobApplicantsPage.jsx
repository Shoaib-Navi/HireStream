import { useState } from "react";
import { ArrowLeft, Eye, SearchX, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { APPLICATION_STATUS_META } from "@/lib/constants";
import { cleanParams } from "@/lib/query";
import { cn } from "@/lib/utils";
import { useGetJobApplicationsQuery } from "../api";
import ApplicantCard from "../components/ApplicantCard";

const ALL = "all";

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const [status, setStatus] = useState(ALL);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetJobApplicationsQuery({
    jobId,
    ...cleanParams({ status: status === ALL ? "" : status, page, limit: 10 }),
  });
  useDocumentTitle(data?.job ? `Applicants · ${data.job.title}` : "Applicants");

  const statusCounts = data?.statusCounts ?? {};
  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
  const filters = [
    { value: ALL, label: "All", count: total },
    ...Object.entries(APPLICATION_STATUS_META).map(([value, meta]) => ({
      value,
      label: meta.label,
      count: statusCounts[value] ?? 0,
    })),
  ];
  const applications = data?.applications ?? [];

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  if (isError && (error?.status === 404 || error?.status === 400)) {
    return (
      <EmptyState
        icon={SearchX}
        title="Job not found"
        description="This job doesn't exist or belongs to another recruiter."
        action={
          <Button asChild>
            <Link to="/recruiter/jobs">Back to your jobs</Link>
          </Button>
        }
      />
    );
  }

  const renderApplications = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load applicants" error={error} onRetry={refetch} />;
    if (applications.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title={status === ALL ? "No applicants yet" : "No applicants with this status"}
          description="New applications show up here as soon as candidates apply."
        />
      );
    }
    return (
      <div className={cn("space-y-4 transition-opacity", isFetching && "opacity-60")}>
        {applications.map((application) => (
          <ApplicantCard key={application._id} application={application} jobId={jobId} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Link to="/recruiter/jobs" className="type-caption inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Your jobs
      </Link>

      <PageHeader
        title="Applicants"
        description={data?.job?.title}
        actions={
          <Button asChild variant="outline">
            <Link to={`/jobs/${jobId}`}>
              <Eye /> View job post
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter applicants by status">
        {filters.map((filter) => {
          const active = status === filter.value;
          return (
            <Button
              key={filter.value}
              size="sm"
              variant={active ? "default" : "outline"}
              aria-pressed={active}
              onClick={() => changeStatus(filter.value)}
            >
              {filter.label}
              <span className={cn("type-caption rounded-full px-1.5", active ? "bg-primary-foreground/20" : "bg-muted")}>
                {filter.count}
              </span>
            </Button>
          );
        })}
      </div>

      {renderApplications()}

      <Pagination page={page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default JobApplicantsPage;
