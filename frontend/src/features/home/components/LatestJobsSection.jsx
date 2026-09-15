import { ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import SectionHeading from "@/components/common/SectionHeading";
import { Button } from "@/components/ui/button";
import { useGetJobsQuery } from "@/features/jobs/api";
import JobCard, { JobListSkeleton } from "@/features/jobs/components/JobCard";

const GRID_CLASS = "grid gap-4 md:grid-cols-2 lg:grid-cols-3";

const LatestJobsSection = () => {
  const { data, isLoading, isError, error, refetch } = useGetJobsQuery({ limit: 6 });

  const renderJobs = () => {
    if (isLoading) return <JobListSkeleton count={6} className={GRID_CLASS} />;
    if (isError) return <ErrorState title="Couldn't load jobs" error={error} onRetry={refetch} />;
    if (data.jobs.length === 0) {
      return <EmptyState icon={Briefcase} title="No open jobs yet" description="New roles will show up here as soon as they're posted." />;
    }
    return (
      <div className={GRID_CLASS}>
        {data.jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    );
  };

  return (
    <section className="page-container py-16 sm:py-20">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading align="left" eyebrow="Latest openings" title="Recently posted jobs" description="New roles from companies hiring on HireStream." />
        <Button asChild variant="outline" className="shrink-0">
          <Link to="/jobs">
            View all jobs <ArrowRight />
          </Link>
        </Button>
      </div>
      <div className="mt-10">{renderJobs()}</div>
    </section>
  );
};

export default LatestJobsSection;
