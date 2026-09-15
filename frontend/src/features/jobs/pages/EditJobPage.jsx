import { ArrowLeft, SearchX } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useGetMyCompaniesQuery } from "@/features/companies/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useGetJobQuery, useUpdateJobMutation } from "../api";
import JobForm from "../components/JobForm";
import { toJobFormValues } from "../utils/jobForm";

const EditJobPage = () => {
  useDocumentTitle("Edit job");
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: job, isLoading: jobLoading, isError, error, refetch } = useGetJobQuery(id);
  const { data: companies, isLoading: companiesLoading } = useGetMyCompaniesQuery();
  const [updateJob] = useUpdateJobMutation();

  const handleSubmit = async (payload) => {
    await updateJob({ id, ...payload }).unwrap();
    toast.success("Job updated");
    navigate("/recruiter/jobs");
  };

  const renderContent = () => {
    if (jobLoading || companiesLoading) return <PageLoader />;
    if ((isError && (error?.status === 404 || error?.status === 400)) || (job && !job.isOwner)) {
      return (
        <EmptyState
          icon={SearchX}
          title="Job not found"
          action={
            <Button asChild>
              <Link to="/recruiter/jobs">Back to your jobs</Link>
            </Button>
          }
        />
      );
    }
    if (isError) return <ErrorState error={error} onRetry={refetch} />;
    return <JobForm key={job._id} companies={companies ?? []} initialValues={toJobFormValues(job)} isEditing onSubmit={handleSubmit} />;
  };

  return (
    <div className="space-y-6">
      <Link to="/recruiter/jobs" className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-3.5" /> Your jobs
      </Link>
      <PageHeader title="Edit job" description={job?.title} />
      {renderContent()}
    </div>
  );
};

export default EditJobPage;
