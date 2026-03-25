import React, { useEffect, useState } from "react";
import FilterCard from "./FilterCard";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "./shared/Footer";
import PageHero from "./shared/PageHero";
import { SlidersHorizontal, X, Search, ChevronDown, ChevronUp } from "lucide-react";

const Jobs = () => {
  const { allJobs, searchedQuery } = useSelector((store) => store.job);
  const [filterJobs,        setFilterJobs]        = useState(allJobs);
  const [showMobileFilter,  setShowMobileFilter]  = useState(false);
  const [activeFilters,     setActiveFilters]      = useState({});
  const [showFilterPanel,   setShowFilterPanel]    = useState(true);
  const [currentPage,       setCurrentPage]        = useState(1);

  const JOBS_PER_PAGE = 9; // ← Point 4: limit cards shown

  // ── Point 1 & 2: Multi-filter logic ──────────────────────────────────────
  useEffect(() => {
    let filtered = allJobs;

    // Apply search query
    if (searchedQuery) {
      filtered = filtered.filter((job) =>
        job.title.toLowerCase().includes(searchedQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchedQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchedQuery.toLowerCase())
      );
    }

    // Apply multiple active filters
    if (Object.keys(activeFilters).length > 0) {
      filtered = filtered.filter((job) => {
        return Object.entries(activeFilters).every(([category, values]) => {
          if (!values || values.length === 0) return true;
          return values.some((val) => {
            const v = val.toLowerCase();
            return (
              job.title?.toLowerCase().includes(v)       ||
              job.jobType?.toLowerCase().includes(v)     ||
              job.location?.toLowerCase().includes(v)    ||
              job.salary?.toString().includes(v)         ||
              job.experienceLevel?.toString().includes(v)
            );
          });
        });
      });
    }

    setFilterJobs(filtered);
    setCurrentPage(1); // reset to page 1 on filter change
  }, [allJobs, searchedQuery, activeFilters]);

  // ── Point 4: Pagination ───────────────────────────────────────────────────
  const totalPages   = Math.ceil(filterJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = filterJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const hasActiveFilters = Object.values(activeFilters).some((v) => v?.length > 0);

  const clearAllFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  return (
    <div>
      <Navbar />

      {/* PageHero */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-6xl mx-auto">
        <PageHero
          image="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400"
          title="Find Your Dream Job"
          subtitle="Browse thousands of verified roles across top companies in India."
          btnText="Browse all jobs"
          btnLink="/browse"
          align="right"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 mb-12">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            {/* Point 1: Only show count when filters are active */}
            {hasActiveFilters || searchedQuery ? (
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  <span className="text-[#6a38c2]">{filterJobs.length}</span> result{filterJobs.length !== 1 ? "s" : ""} found
                </p>
                {searchedQuery && (
                  <p className="text-xs text-gray-400 mt-0.5">for "{searchedQuery}"</p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  All Jobs
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {allJobs.length} open positions available
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Active filter chips — Point 2: show selected filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs px-3 py-1.5 rounded-full border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors font-medium flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}

            {/* Point 3: Toggle filter panel on desktop */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-[#e0d4fd] bg-white text-[#6a38c2] text-sm font-semibold hover:bg-[#f3eeff] transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilterPanel ? "Hide filters" : "Show filters"}
              {showFilterPanel
                ? <ChevronUp className="h-3.5 w-3.5" />
                : <ChevronDown className="h-3.5 w-3.5" />
              }
            </button>

            {/* Mobile filter button */}
            <button
              onClick={() => setShowMobileFilter(true)}
              className="flex md:hidden items-center gap-2 px-4 py-2 rounded-xl border border-[#e0d4fd] bg-white text-[#6a38c2] text-sm font-semibold hover:bg-[#f3eeff] transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="h-4 w-4 rounded-full bg-[#6a38c2] text-white text-[9px] flex items-center justify-center font-bold">
                  {Object.values(activeFilters).flat().length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Active filter tags row ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {Object.entries(activeFilters).flatMap(([category, values]) =>
              (values || []).map((val) => (
                <span
                  key={`${category}-${val}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-50 text-[#6a38c2] border border-purple-100 font-medium"
                >
                  {val}
                  <button
                    onClick={() => {
                      setActiveFilters((prev) => {
                        const updated = { ...prev };
                        updated[category] = (updated[category] || []).filter((v) => v !== val);
                        if (updated[category].length === 0) delete updated[category];
                        return updated;
                      });
                    }}
                  >
                    <X className="h-3 w-3 hover:text-red-400 transition-colors" />
                  </button>
                </span>
              ))
            )}
          </div>
        )}

        {/* ── Layout ── */}
        <div className="flex gap-5 items-start">

          {/* Point 3: Desktop FilterCard — toggleable */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 280 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden md:block shrink-0 overflow-hidden sticky top-20"
              >
                <div className="w-[280px]">
                  <FilterCard
                    activeFilters={activeFilters}
                    setActiveFilters={setActiveFilters}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile drawer */}
          <AnimatePresence>
            {showMobileFilter && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMobileFilter(false)}
                  className="fixed inset-0 bg-black/30 z-40 md:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-white z-50 shadow-2xl overflow-y-auto md:hidden flex flex-col"
                >
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4 text-[#6a38c2]" />
                      <span className="font-semibold text-gray-900 text-sm">Filters</span>
                      {hasActiveFilters && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-[#6a38c2] border border-purple-100 font-semibold">
                          {Object.values(activeFilters).flat().length} active
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowMobileFilter(false)}
                      className="h-8 w-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <FilterCard
                      activeFilters={activeFilters}
                      setActiveFilters={setActiveFilters}
                    />
                  </div>
                  <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                    <button
                      onClick={() => setShowMobileFilter(false)}
                      className="flex-1 py-2.5 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-colors"
                    >
                      Show {filterJobs.length} results
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Job listings ── */}
          {filterJobs.length <= 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-[#6a38c2]" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">No jobs found</h2>
              <p className="text-sm text-gray-400 max-w-xs">Try adjusting your filters or search with different keywords.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-[#6a38c2] text-white text-sm font-semibold hover:bg-[#5b2db0] transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 min-w-0">

              {/* Grid — Point 4: paginated */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {paginatedJobs.map((job) => (
                    <motion.div
                      key={job?._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Job job={job} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* ── Pagination — Point 4 ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">

                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      )
                      .reduce((acc, page, idx, arr) => {
                        if (idx > 0 && page - arr[idx - 1] > 1) {
                          acc.push("...");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === "..." ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            className={`h-9 w-9 rounded-xl text-sm font-semibold transition-colors ${
                              currentPage === item
                                ? "bg-[#6a38c2] text-white shadow-sm shadow-[#6a38c2]/30"
                                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>

                </div>
              )}

              {/* Page info */}
              {totalPages > 1 && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Page {currentPage} of {totalPages} · {filterJobs.length} total jobs
                </p>
              )}

            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Jobs;