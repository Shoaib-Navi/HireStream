import { useGetSimilarJobsQuery } from "../api";
import JobCard, { JobListSkeleton } from "./JobCard";

const GRID = "grid gap-4 md:grid-cols-2";

// Open jobs close to this one; the section stays out of the page when there are none
const SimilarJobs = ({ jobId }) => {
  const { data: jobs = [], isLoading, isError } = useGetSimilarJobsQuery(jobId);

  if (isError || (!isLoading && jobs.length === 0)) return null;

  return (
    <section aria-labelledby="similar-jobs" className="page-container pb-16">
      <div className="border-t pt-8">
        <h2 id="similar-jobs" className="type-label mb-6 text-muted-foreground">
          Similar jobs
        </h2>
        {isLoading ? (
          <JobListSkeleton count={2} className={GRID} />
        ) : (
          <div className={GRID}>
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SimilarJobs;
