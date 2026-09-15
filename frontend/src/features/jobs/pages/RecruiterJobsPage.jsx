import { useState } from "react";
import { Briefcase, Building2, Eye, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMyCompaniesQuery } from "@/features/companies/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDate, pluralize } from "@/lib/format";
import { cleanParams } from "@/lib/query";
import { cn } from "@/lib/utils";
import { useGetRecruiterJobsQuery } from "../api";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

const RecruiterJobsPage = () => {
  useDocumentTitle("Your jobs");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data: companies, isLoading: companiesLoading } = useGetMyCompaniesQuery();
  const { data, isLoading, isFetching, isError, error, refetch } = useGetRecruiterJobsQuery(
    cleanParams({ status: status === "all" ? "" : status, page, limit: 10 }),
  );

  const jobs = data?.jobs ?? [];

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
  };

  const renderJobs = () => {
    if (isLoading || companiesLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load your jobs" error={error} onRetry={refetch} />;
    if (companies?.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="Register your company to start hiring"
          description="Jobs are posted on behalf of a company. Add yours, then publish your first job."
          action={
            <Button asChild>
              <Link to="/recruiter/companies/new">Register company</Link>
            </Button>
          }
        />
      );
    }
    if (jobs.length === 0) {
      return (
        <EmptyState
          icon={Briefcase}
          title={status === "all" ? "No jobs posted yet" : "No jobs with this status"}
          description="Published jobs appear on the public job board right away."
          action={
            <Button asChild>
              <Link to="/recruiter/jobs/new">Post a job</Link>
            </Button>
          }
        />
      );
    }

    return (
      <ul className={cn("divide-y overflow-hidden rounded-xl border bg-card transition-opacity", isFetching && "opacity-60")}>
        {jobs.map((job) => (
          <li
            key={job._id}
            className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center"
          >
            <CompanyLogo company={job.company} size="sm" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="type-h4 truncate text-foreground">{job.title}</p>
                <StatusBadge type="job" status={job.status} />
              </div>
              <p className="type-caption text-muted-foreground">
                {job.company?.name} · {job.location} · Posted {formatDate(job.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="soft" size="sm">
                <Link to={`/recruiter/jobs/${job._id}/applicants`}>
                  <Users /> {pluralize(job.applicationCount, "applicant")}
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/jobs/${job._id}`}>
                  <Eye /> View
                </Link>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description="Manage your job posts and review applicants."
        actions={
          <Button asChild>
            <Link to="/recruiter/jobs/new">
              <Plus /> Post a job
            </Link>
          </Button>
        }
      />

      <Tabs value={status} onValueChange={changeStatus}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {renderJobs()}

      <Pagination page={page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default RecruiterJobsPage;
