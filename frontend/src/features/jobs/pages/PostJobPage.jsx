import { Building2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useGetMyCompaniesQuery } from "@/features/companies/api";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useCreateJobMutation } from "../api";
import JobForm from "../components/JobForm";

const PostJobPage = () => {
  useDocumentTitle("Post a job");
  const { data: companies, isLoading, isError, error, refetch } = useGetMyCompaniesQuery();
  const [createJob] = useCreateJobMutation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const job = await createJob(payload).unwrap();
    toast.success(job.status === "draft" ? "Draft saved" : "Job published");
    navigate("/recruiter/jobs");
  };

  const renderContent = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState error={error} onRetry={refetch} />;
    if (companies.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="Register your company first"
          description="Jobs are posted on behalf of a company. It only takes a minute."
          action={
            <Button asChild>
              <Link to="/recruiter/companies/new">Register company</Link>
            </Button>
          }
        />
      );
    }
    const requestedCompany = searchParams.get("company");
    const companyId = companies.some((company) => company._id === requestedCompany) ? requestedCompany : companies[0]._id;
    return <JobForm companies={companies} initialValues={{ companyId }} onSubmit={handleSubmit} />;
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Hiring" title="Post a job" description="Publish now, or save a draft and publish later." />
      {renderContent()}
    </div>
  );
};

export default PostJobPage;
