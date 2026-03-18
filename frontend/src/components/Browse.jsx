import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useDispatch, useSelector } from "react-redux";
import useGetAllJobs from "@/hooks/useGetAllJobs";
import { setSearchedQuery } from "@/redux/jobSlice";
import Footer from "./shared/Footer";
import PageHero from "./shared/PageHero";

// const randomJobs = [1,2,3,4,5,6];

const Browse = () => {
  useGetAllJobs();
  const { allJobs } = useSelector((store) => store.job);
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      dispatch(setSearchedQuery(""));
    };
  }, []);

  return (
    <div>
      <Navbar />
      <PageHero
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400"
        title="Explore Opportunities"
        subtitle="Filter by role, salary, location and work mode. Your next career move is here."
        btnText="Start browsing"
        btnLink="/browse"
        align="left"
      />
      <div className="max-w-7xl mx-auto my-10">
        <h1 className="font-bold text-xl my-10">
          Search Results ({allJobs.length})
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {allJobs.map((job) => {
            return <Job key={job._id} job={job} />;
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
