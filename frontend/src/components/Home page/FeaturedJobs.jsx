// FeaturedJobs.jsx
// ─── Shows a grid of latest/featured job cards ───────────────────────────────
// REMOVE: Delete this entire file + its import in Home.jsx if not needed
// NOTE: Replace `dummyJobs` with your real Redux jobs data

import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { MapPin, Clock, Banknote, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import LatestJobCards from "../LatestJobCards";

// ── Replace with real data from Redux / API ──
const dummyJobs = [
  { id: 1, title: "Senior React Developer",  company: "Google",    location: "Bangalore",  type: "Full-time", salary: "₹30–45 LPA", logo: "G", tag: "Hot 🔥"   },
  { id: 2, title: "Product Designer",        company: "Flipkart",  location: "Remote",     type: "Full-time", salary: "₹18–28 LPA", logo: "F", tag: "New ✨"   },
  { id: 3, title: "Data Scientist",          company: "Microsoft", location: "Hyderabad",  type: "Hybrid",    salary: "₹25–40 LPA", logo: "M", tag: "Urgent ⚡" },
  { id: 4, title: "Backend Engineer",        company: "Razorpay",  location: "Pune",       type: "Full-time", salary: "₹20–35 LPA", logo: "R", tag: "Hot 🔥"   },
  { id: 5, title: "Marketing Manager",       company: "Swiggy",    location: "Mumbai",     type: "Hybrid",    salary: "₹12–20 LPA", logo: "S", tag: ""         },
  { id: 6, title: "DevOps Engineer",         company: "Amazon",    location: "Chennai",    type: "Full-time", salary: "₹28–42 LPA", logo: "A", tag: "New ✨"   },
];

const typeColor = {
  "Full-time": "bg-green-50 text-green-700 border-green-100",
  "Hybrid":    "bg-blue-50  text-blue-700  border-blue-100",
  "Remote":    "bg-purple-50 text-purple-700 border-purple-100",
};

const FeaturedJobs = () => {
  const navigate = useNavigate();
  const {allJobs} = useSelector(store => store.job);

  return (
    <section className="py-16 bg-[#fafafa]">
         <div className='max-w-6xl mx-auto my-20'>
      
     <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className='text-4xl font-bold'><span className='text-[#6a38c2]'>Latest & Top </span>Job Openings</h1>
          </div>
          <button
            onClick={() => navigate("/browse")}
            className="text-sm text-[#6a38c2] font-semibold hover:underline flex items-center gap-1"
          >
            View all jobs <ArrowRight className="h-4 w-4" />
          </button>
        </div>

      <div className="grid grid-cols-3 gap-4 my-5">
        {
            allJobs.length <= 0 ? <span>No Job Available</span> : allJobs.slice(0,6).map((job)=> <LatestJobCards  key={job._id} job={job} />)
        }
      </div>
    </div>
    </section>
  );
};

export default FeaturedJobs;




