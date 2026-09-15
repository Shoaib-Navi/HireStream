import { BadgeCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CompanyLogo from "@/components/common/CompanyLogo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { COMPANY_STATUS_META } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useGetAdminCompaniesQuery, useUpdateAdminCompanyMutation } from "../api";
import { AdminSearch, FilterSelect } from "../components/AdminFilters";
import { useAdminFilters } from "../hooks/useAdminFilters";

const VERIFICATION_OPTIONS = [
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

const STATUS_OPTIONS = Object.entries(COMPANY_STATUS_META).map(([value, { label }]) => ({ value, label }));

const AdminCompaniesPage = () => {
  useDocumentTitle("Companies");
  const { filters, update, setPage, params } = useAdminFilters({ status: "", isVerified: "" });
  const { data, isLoading, isFetching, isError, error, refetch } = useGetAdminCompaniesQuery(params);
  const [updateCompany, { isLoading: updating }] = useUpdateAdminCompanyMutation();

  const companies = data?.companies ?? [];

  const save = async (company, changes, message) => {
    try {
      await updateCompany({ id: company._id, ...changes }).unwrap();
      toast.success(message);
    } catch (apiError) {
      toast.error(getErrorMessage(apiError));
    }
  };

  const renderTable = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load companies" error={error} onRetry={refetch} />;
    if (companies.length === 0) return <EmptyState title="No companies match these filters" />;

    return (
      <div className={cn("overflow-x-auto rounded-xl border bg-card transition-opacity", isFetching && "opacity-60")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Jobs</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <CompanyLogo company={company} size="sm" />
                    <div className="min-w-0">
                      <Link to={`/companies/${company.slug}`} className="type-body flex items-center gap-1.5 font-medium text-foreground hover:underline">
                        {company.name}
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      </Link>
                      <p className="type-caption truncate text-muted-foreground">{company.location || "Location not set"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="type-body text-foreground">{company.owner?.fullName ?? "—"}</p>
                  <p className="type-caption truncate text-muted-foreground">{company.owner?.email}</p>
                </TableCell>
                <TableCell className="type-caption text-muted-foreground">{pluralize(company.jobCount, "job")}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge type="company" status={company.status} />
                    {company.isVerified && (
                      <span className="type-caption inline-flex items-center gap-1 text-success">
                        <BadgeCheck className="size-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updating}
                      onClick={() =>
                        save(
                          company,
                          { isVerified: !company.isVerified },
                          company.isVerified ? "Verification removed" : `${company.name} is now verified`,
                        )
                      }
                    >
                      {company.isVerified ? "Unverify" : "Verify"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={company.status === "active" ? "text-destructive" : undefined}
                      disabled={updating}
                      onClick={() =>
                        save(
                          company,
                          { status: company.status === "active" ? "suspended" : "active" },
                          company.status === "active" ? `${company.name} was suspended` : `${company.name} was reactivated`,
                        )
                      }
                    >
                      {company.status === "active" ? "Suspend" : "Reactivate"}
                    </Button>
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
      <PageHeader title="Companies" description="Verify real companies and suspend the ones that break the rules." />

      <div className="flex flex-col gap-3 sm:flex-row">
        <AdminSearch value={filters.q} onChange={(q) => update({ q })} placeholder="Search companies" />
        <FilterSelect label="Statuses" value={filters.status} options={STATUS_OPTIONS} onChange={(status) => update({ status })} />
        <FilterSelect
          label="Verification"
          value={filters.isVerified}
          options={VERIFICATION_OPTIONS}
          onChange={(isVerified) => update({ isVerified })}
        />
      </div>

      {renderTable()}

      <Pagination page={filters.page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default AdminCompaniesPage;
