import { ArrowLeft, SearchX } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import CompanyLogo from "@/components/common/CompanyLogo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import FileUpload from "@/components/common/FileUpload";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import { PageLoader } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getErrorMessage } from "@/lib/errors";
import {
  useCreateCompanyMutation,
  useGetMyCompanyQuery,
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
} from "../api";
import CompanyForm from "../components/CompanyForm";

// Register a new company (/recruiter/companies/new) or edit one (/recruiter/companies/:id/edit)
const CompanyFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  useDocumentTitle(isEdit ? "Edit company" : "Register company");
  const navigate = useNavigate();

  const { data: company, isLoading, isError, error, refetch } = useGetMyCompanyQuery(id, { skip: !isEdit });
  const [createCompany] = useCreateCompanyMutation();
  const [updateCompany] = useUpdateCompanyMutation();
  const [uploadLogo, { isLoading: uploadingLogo }] = useUploadCompanyLogoMutation();

  const handleCreate = async (payload) => {
    const created = await createCompany(payload).unwrap();
    toast.success("Company registered. Add a logo so candidates recognize you.");
    navigate(`/recruiter/companies/${created._id}/edit`, { replace: true });
  };

  const handleUpdate = async (payload) => {
    await updateCompany({ id, ...payload }).unwrap();
    toast.success("Company updated");
  };

  const handleLogoUpload = async (file) => {
    try {
      await uploadLogo({ id, file }).unwrap();
      toast.success("Logo updated");
    } catch (uploadError) {
      toast.error(getErrorMessage(uploadError));
    }
  };

  const renderContent = () => {
    if (!isEdit) {
      return <CompanyForm submitLabel="Register company" onSubmit={handleCreate} />;
    }
    if (isLoading) return <PageLoader />;
    if (isError) {
      return error?.status === 404 || error?.status === 400 ? (
        <EmptyState
          icon={SearchX}
          title="Company not found"
          action={
            <Button asChild>
              <Link to="/recruiter/companies">Back to companies</Link>
            </Button>
          }
        />
      ) : (
        <ErrorState error={error} onRetry={refetch} />
      );
    }
    return (
      <>
        <SectionCard title="Logo" description="A square PNG, JPG or WEBP image, up to 5 MB.">
          <div className="flex flex-wrap items-center gap-4">
            <CompanyLogo company={company} size="lg" />
            <FileUpload
              accept="image/png,image/jpeg,image/webp,image/gif"
              onSelect={handleLogoUpload}
              loading={uploadingLogo}
              label={company.logo?.url ? "Replace logo" : "Upload logo"}
            />
          </div>
        </SectionCard>
        <CompanyForm key={company._id} company={company} submitLabel="Save changes" onSubmit={handleUpdate} />
      </>
    );
  };

  return (
    <div className="space-y-6">
      <Link to="/recruiter/companies" className="type-caption inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Companies
      </Link>
      <PageHeader
        title={isEdit ? (company?.name ?? "Edit company") : "Register a company"}
        description={isEdit ? "Keep your company details up to date." : "Tell candidates who they'll be working for."}
      />
      {renderContent()}
    </div>
  );
};

export default CompanyFormPage;
