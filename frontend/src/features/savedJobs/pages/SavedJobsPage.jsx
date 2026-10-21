import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import JobCard, { JobListSkeleton } from "@/features/jobs/components/JobCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cn } from "@/lib/utils";
import { useGetSavedJobsQuery } from "../api";

const SavedJobsPage = () => {
  useDocumentTitle("Saved jobs");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetSavedJobsQuery({ page, limit: 10 });
  const jobs = data?.jobs ?? [];

  const renderJobs = () => {
    if (isLoading) return <JobListSkeleton count={3} />;
    if (isError) return <ErrorState title="Couldn't load your saved jobs" error={error} onRetry={refetch} />;
    if (jobs.length === 0) {
      return (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Tap the bookmark on any job to keep it here for later."
          action={
            <Button asChild>
              <Link to="/jobs">Find jobs</Link>
            </Button>
          }
        />
      );
    }
    return (
      <div className={cn("grid gap-4 transition-opacity", isFetching && "opacity-60")}>
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title="Saved jobs" description="Jobs you've bookmarked to come back to." />
      {renderJobs()}
      <Pagination page={page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default SavedJobsPage;
