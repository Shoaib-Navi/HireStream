import { useState } from "react";
import { ArrowLeft, BadgeCheck, Briefcase, ExternalLink, SearchX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import DetailSection from "@/components/common/DetailSection";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import { useGetJobsQuery } from "@/features/jobs/api";
import JobCard, { JobListSkeleton } from "@/features/jobs/components/JobCard";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { pluralize } from "@/lib/format";
import { useGetCompanyBySlugQuery } from "../api";

const CompanyProfilePage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(1);
  const { data: company, isLoading, isError, error, refetch } = useGetCompanyBySlugQuery(slug);
  const { data: jobsData, isLoading: jobsLoading } = useGetJobsQuery(
    { company: company?._id, page, limit: 10 },
    { skip: !company },
  );
  useDocumentTitle(company?.name ?? "Company");

  if (isLoading) return <PageLoader />;
  if (isError) {
    return (
      <div className="page-container py-16">
        {error?.status === 404 || error?.status === 400 ? (
          <EmptyState
            icon={SearchX}
            title="Company not found"
            action={
              <Button asChild>
                <Link to="/companies">All companies</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState error={error} onRetry={refetch} />
        )}
      </div>
    );
  }

  const facts = [
    { label: "Industry", value: company.industry },
    { label: "Location", value: company.location },
    { label: "Size", value: company.size && `${company.size} employees` },
    { label: "Founded", value: company.foundedYear },
  ].filter((fact) => fact.value);
  const jobs = jobsData?.jobs ?? [];

  return (
    <>
      <section className="dark rounded-b-section bg-background text-foreground">
        <div className="page-container pt-8 pb-14 sm:pb-20">
          <Link
            to="/companies"
            className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> All companies
          </Link>
          <div className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center">
            <CompanyLogo company={company} size="lg" />
            <div className="space-y-3">
              <h1 className="type-h1 flex items-center gap-3">
                {company.name}
                {company.isVerified && <BadgeCheck className="size-7 shrink-0" aria-label="Verified company" />}
              </h1>
              <p className="type-label text-muted-foreground">{pluralize(company.openJobCount, "open job")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container grid gap-10 py-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <div className="min-w-0">
          {company.description && (
            <DetailSection title="About">
              <p className="whitespace-pre-line">{company.description}</p>
            </DetailSection>
          )}
          <DetailSection title="Open positions">
            {jobsLoading ? (
              <JobListSkeleton count={2} />
            ) : jobs.length === 0 ? (
              <EmptyState icon={Briefcase} title="No open positions right now" description="Check back soon." />
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
                <Pagination page={page} totalPages={jobsData?.meta?.totalPages} onPageChange={setPage} />
              </div>
            )}
          </DetailSection>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border bg-card p-6">
            <dl className="divide-y">
              {facts.map((fact) => (
                <div key={fact.label} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                  <dt className="type-label text-muted-foreground">{fact.label}</dt>
                  <dd className="type-body text-right font-medium text-foreground">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {company.website && (
              <Button asChild variant="outline" className="mt-5 w-full">
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  Visit website <ExternalLink />
                </a>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default CompanyProfilePage;
