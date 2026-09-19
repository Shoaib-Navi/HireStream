import { useState } from "react";
import { SearchX, SlidersHorizontal } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import ScrambleText from "@/components/common/ScrambleText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { JOB_SORT_OPTIONS } from "@/lib/constants";
import { pluralize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useGetJobsQuery } from "../api";
import JobCard, { JobListSkeleton } from "../components/JobCard";
import JobFilters from "../components/JobFilters";
import JobSearchBar from "../components/JobSearchBar";
import { useJobFilters } from "../hooks/useJobFilters";

const JobsPage = () => {
  useDocumentTitle("Find jobs");
  const { filters, apiParams, updateFilters, clearFilters, activeFilterCount } = useJobFilters();
  const { data, isLoading, isFetching, isError, error, refetch } = useGetJobsQuery(apiParams);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const jobs = data?.jobs ?? [];
  const meta = data?.meta;
  const hasSearch = activeFilterCount > 0 || Boolean(filters.q) || Boolean(filters.location);

  const changePage = (page) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderResults = () => {
    if (isLoading) return <JobListSkeleton />;
    if (isError) return <ErrorState title="Couldn't load jobs" error={error} onRetry={refetch} />;
    if (jobs.length === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title="No jobs match your search"
          description="Try different keywords or remove some filters."
          action={
            hasSearch && (
              <Button variant="outline" onClick={clearFilters}>
                Clear search
              </Button>
            )
          }
        />
      );
    }
    return (
      <div className={cn("grid gap-4 transition-opacity", isFetching && "opacity-60")}>
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    );
  };

  return (
    <>
      <section className="dark rounded-b-section bg-background text-foreground">
        <div className="page-container pt-14 pb-14 sm:pt-20 sm:pb-20">
          <ScrambleText text="Open positions" className="type-label block text-muted-foreground" />
          <h1 className="type-h1 mt-5 max-w-3xl">Find your next role.</h1>
          <p className="type-body-lg mt-3 max-w-xl text-muted-foreground">
            Search open positions from companies hiring on HireStream.
          </p>
          {/* re-created when the URL changes so the inputs show the current search */}
          <JobSearchBar
            key={`${filters.q}|${filters.location}`}
            size="lg"
            className="mt-10 max-w-4xl"
            defaultQuery={filters.q}
            defaultLocation={filters.location}
            onSearch={updateFilters}
          />
        </div>
      </section>

      <div className="page-container grid gap-10 py-12 lg:grid-cols-[15rem_1fr] lg:gap-14">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 border-t pt-6">
            <JobFilters filters={filters} onChange={updateFilters} onClear={clearFilters} idPrefix="desktop" />
          </div>
        </aside>

        <section aria-label="Results" className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <p className="type-label text-muted-foreground" aria-live="polite">
              {isLoading ? "Searching…" : `${pluralize(meta?.total ?? 0, "job")} found`}
            </p>
            <div className="flex items-center gap-2">
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal /> Filters
                    {activeFilterCount > 0 && <Badge variant="neutral">{activeFilterCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Narrow down the results.</SheetDescription>
                  </SheetHeader>
                  <div className="px-4 pb-6">
                    <JobFilters filters={filters} onChange={updateFilters} onClear={clearFilters} idPrefix="mobile" />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={filters.sort} onValueChange={(sort) => updateFilters({ sort })}>
                <SelectTrigger size="sm" aria-label="Sort jobs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {JOB_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderResults()}

          <Pagination className="mt-10" page={filters.page} totalPages={meta?.totalPages} onPageChange={changePage} />
        </section>
      </div>
    </>
  );
};

export default JobsPage;
