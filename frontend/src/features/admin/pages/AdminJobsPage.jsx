import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CompanyLogo from "@/components/common/CompanyLogo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { JOB_STATUS_META } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { formatDate, pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDeleteAdminJobMutation, useGetAdminJobsQuery, useUpdateAdminJobStatusMutation } from "../api";
import { AdminSearch, FilterSelect } from "../components/AdminFilters";
import { useAdminFilters } from "../hooks/useAdminFilters";

const STATUS_OPTIONS = Object.entries(JOB_STATUS_META).map(([value, { label }]) => ({ value, label }));

const AdminJobsPage = () => {
  useDocumentTitle("Jobs");
  const { filters, update, setPage, params } = useAdminFilters({ status: "" });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAdminJobsQuery(params);
  const [updateJobStatus, { isLoading: updating }] = useUpdateAdminJobStatusMutation();
  const [deleteJob, { isLoading: deleting }] = useDeleteAdminJobMutation();
  const [jobToDelete, setJobToDelete] = useState(null);

  const jobs = data?.jobs ?? [];

  const changeStatus = async (job, status) => {
    try {
      await updateJobStatus({ id: job._id, status }).unwrap();
      toast.success(status === "closed" ? "Job closed" : "Job reopened");
    } catch (apiError) {
      toast.error(getErrorMessage(apiError));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(jobToDelete._id).unwrap();
      toast.success("Job deleted");
      setJobToDelete(null);
    } catch (apiError) {
      toast.error(getErrorMessage(apiError));
    }
  };

  const renderTable = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load jobs" error={error} onRetry={refetch} />;
    if (jobs.length === 0) return <EmptyState title="No jobs match these filters" />;

    return (
      <div className={cn("overflow-x-auto rounded-xl border bg-card transition-opacity", isFetching && "opacity-60")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Posted by</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CompanyLogo company={job.company} size="sm" />
                    <div className="min-w-0">
                      <Link to={`/jobs/${job._id}`} className="type-body flex items-center gap-1.5 font-medium text-foreground hover:underline">
                        {job.title}
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      </Link>
                      <p className="type-caption truncate text-muted-foreground">
                        {job.company?.name} · Posted {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="type-body text-foreground">{job.postedBy?.fullName ?? "—"}</p>
                  <p className="type-caption truncate text-muted-foreground">{job.postedBy?.email}</p>
                </TableCell>
                <TableCell className="type-caption text-muted-foreground">{pluralize(job.applicationCount, "applicant")}</TableCell>
                <TableCell>
                  <StatusBadge type="job" status={job.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {job.status === "closed" ? (
                      <Button variant="outline" size="sm" disabled={updating} onClick={() => changeStatus(job, "open")}>
                        Reopen
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled={updating} onClick={() => changeStatus(job, "closed")}>
                        Close
                      </Button>
                    )}
                    {job.applicationCount === 0 && (
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setJobToDelete(job)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Jobs" description="Every job posted on the platform." />

      <div className="flex flex-col gap-3 sm:flex-row">
        <AdminSearch value={filters.q} onChange={(q) => update({ q })} placeholder="Search job titles" />
        <FilterSelect label="Statuses" value={filters.status} options={STATUS_OPTIONS} onChange={(status) => update({ status })} />
      </div>

      {renderTable()}

      <Pagination page={filters.page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={Boolean(jobToDelete)}
        onOpenChange={(open) => !open && setJobToDelete(null)}
        title={`Delete "${jobToDelete?.title}"?`}
        description="This permanently removes the job post. This can't be undone."
        confirmLabel="Delete job"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminJobsPage;
