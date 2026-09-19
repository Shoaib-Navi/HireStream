import { Building2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useGetMyCompaniesQuery } from "../api";
import CompanyCard from "../components/CompanyCard";

const CompaniesPage = () => {
  useDocumentTitle("Your companies");
  const { data: companies, isLoading, isError, error, refetch } = useGetMyCompaniesQuery();

  const renderContent = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load your companies" error={error} onRetry={refetch} />;
    if (companies.length === 0) {
      return (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Register the company you're hiring for, then post jobs on its behalf."
          action={
            <Button asChild>
              <Link to="/recruiter/companies/new">Register company</Link>
            </Button>
          }
        />
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => (
          <CompanyCard key={company._id} company={company} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Hiring" title="Companies"
        description="The companies you post jobs for."
        actions={
          <Button asChild>
            <Link to="/recruiter/companies/new">
              <Plus /> New company
            </Link>
          </Button>
        }
      />
      {renderContent()}
    </div>
  );
};

export default CompaniesPage;
