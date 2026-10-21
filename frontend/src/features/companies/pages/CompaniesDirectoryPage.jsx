import { useEffect, useState } from "react";
import { BadgeCheck, Building2, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import ScrambleText from "@/components/common/ScrambleText";
import { PageLoader } from "@/components/common/Spinner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { pluralize } from "@/lib/format";
import { cleanParams } from "@/lib/query";
import { cn } from "@/lib/utils";
import { useGetCompaniesQuery } from "../api";

const PAGE_SIZE = 12;

const CompaniesDirectoryPage = () => {
  useDocumentTitle("Companies");
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);

  const [search, setSearch] = useState(query);
  const debouncedSearch = useDebounce(search.trim());

  // Keep the URL in step with what the user typed, after they pause typing
  useEffect(() => {
    if (debouncedSearch === query) return;
    setSearchParams(cleanParams({ q: debouncedSearch }), { replace: true });
  }, [debouncedSearch, query, setSearchParams]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetCompaniesQuery(
    cleanParams({ q: query, page, limit: PAGE_SIZE }),
  );
  const companies = data?.companies ?? [];

  const changePage = (nextPage) => {
    setSearchParams(cleanParams({ q: query, page: nextPage > 1 ? nextPage : "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderCompanies = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load companies" error={error} onRetry={refetch} />;
    if (companies.length === 0) {
      return <EmptyState icon={Building2} title="No companies found" description="Try a different name." />;
    }
    return (
      <ul className={cn("grid gap-4 transition-opacity md:grid-cols-2 lg:grid-cols-3", isFetching && "opacity-60")}>
        {companies.map((company) => (
          <li key={company._id}>
            <Link
              to={`/companies/${company.slug}`}
              className="flex h-full flex-col gap-5 rounded-xl border bg-card p-6 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-center gap-3">
                <CompanyLogo company={company} />
                <div className="min-w-0">
                  <p className="type-h4 flex items-center gap-1.5 text-foreground">
                    <span className="truncate">{company.name}</span>
                    {company.isVerified && <BadgeCheck className="size-4 shrink-0" aria-label="Verified company" />}
                  </p>
                  <p className="type-caption truncate text-muted-foreground">
                    {[company.industry, company.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {company.description && <p className="type-body line-clamp-2 text-muted-foreground">{company.description}</p>}
              <p className="type-label mt-auto text-foreground">{pluralize(company.openJobCount, "open job")}</p>
            </Link>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <section className="dark rounded-b-section bg-background text-foreground">
        <div className="page-container pt-14 pb-14 sm:pt-20 sm:pb-20">
          <ScrambleText text="Companies" className="type-label block text-muted-foreground" />
          <h1 className="type-h1 mt-5 max-w-3xl">Companies hiring on HireStream.</h1>
          <label className="mt-10 flex max-w-xl items-center gap-2.5 rounded-lg border bg-card px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Search companies</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by company name"
              maxLength={100}
              className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          </label>
        </div>
      </section>

      <div className="page-container py-12">
        <p className="type-label mb-6 border-t pt-6 text-muted-foreground" aria-live="polite">
          {isLoading ? "Loading…" : pluralize(data?.meta?.total ?? 0, "company", "companies")}
        </p>
        {renderCompanies()}
        <Pagination className="mt-10" page={page} totalPages={data?.meta?.totalPages} onPageChange={changePage} />
      </div>
    </>
  );
};

export default CompaniesDirectoryPage;
