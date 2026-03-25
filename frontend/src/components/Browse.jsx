import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { setSearchedQuery } from "@/redux/jobSlice";
import Footer from "./shared/Footer";
import PageHero from "./shared/PageHero";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Browse = () => {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);
  const dispatch    = useDispatch();
  const navigate    = useNavigate();

  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, []);

  return (
    <div>
      <Navbar />

      {/* PageHero with padding */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 max-w-6xl mx-auto">
        <PageHero
          image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400"
          title="Explore Opportunities"
          subtitle="Filter by role, salary, location and work mode. Your next career move is here."
          btnText="Start browsing"
          btnLink="/browse"
          align="left"
        />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 my-6 sm:my-10">

        {/* Results header */}
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-gray-900">
              Search Results
              <span className="ml-2 text-sm sm:text-base font-medium text-[#6a38c2]">
                ({allJobs.length})
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              {allJobs.length > 0
                ? `Showing ${allJobs.length} open position${allJobs.length > 1 ? "s" : ""}`
                : "No results found"}
            </p>
          </div>
        </div>

        {/* Jobs grid or empty state */}
        {allJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-[#6a38c2]" />
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
              No jobs found
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Try adjusting your search or browse all available listings.
            </p>
            <button
              onClick={() => { dispatch(setSearchedQuery("")); navigate("/browse"); }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#6a38c2] text-white text-sm font-semibold hover:bg-[#5b2db0] transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {allJobs.map((job) => (
              <Job key={job._id} job={job} />
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default Browse;