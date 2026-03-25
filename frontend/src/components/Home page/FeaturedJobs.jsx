import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import LatestJobCards from "../LatestJobCards";

const FeaturedJobs = () => {
  const navigate    = useNavigate();
  const { allJobs } = useSelector((store) => store.job);

  return (
    <section className="py-10 sm:py-16 bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 my-8 sm:my-14">

        {/* Header */}
        <div className="flex items-start sm:items-end justify-between mb-6 sm:mb-10 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
              <span className="text-[#6a38c2]">Latest & Top </span>
              Job Openings
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 hidden sm:block">
              Hand-picked roles from top employers — updated daily
            </p>
          </div>
          <button
            onClick={() => navigate("/browse")}
            className="text-xs sm:text-sm text-[#6a38c2] font-semibold hover:underline flex items-center gap-1 shrink-0 mt-1"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>

        {/* Grid */}
        {allJobs.length <= 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-4">
              <ArrowRight className="h-6 w-6 text-[#6a38c2]" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No jobs available right now</p>
            <p className="text-gray-400 text-xs mt-1">Check back soon or browse all listings</p>
            <button
              onClick={() => navigate("/browse")}
              className="mt-4 px-5 py-2 rounded-xl bg-[#6a38c2] text-white text-sm font-semibold hover:bg-[#5b2db0] transition-colors"
            >
              Browse all jobs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {allJobs.slice(0, 6).map((job) => (
              <LatestJobCards key={job._id} job={job} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default FeaturedJobs;