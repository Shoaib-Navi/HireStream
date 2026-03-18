// CategorySection.jsx
// ─── Lets users browse jobs by category with icon cards ─────────────────────
// REMOVE: Delete this entire file + its import in Home.jsx if not needed

import React from "react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";
import {
  Code2, Paintbrush, BarChart3, HeadphonesIcon,
  Megaphone, ShieldCheck, Database, Briefcase
} from "lucide-react";

const categories = [
  { label: "Engineering",     icon: Code2,           count: "3.2k jobs",  color: "text-blue-600 bg-blue-50   border-blue-100"  },
  { label: "Design",          icon: Paintbrush,      count: "1.1k jobs",  color: "text-pink-600 bg-pink-50   border-pink-100"  },
  { label: "Marketing",       icon: Megaphone,       count: "980 jobs",   color: "text-orange-500 bg-orange-50 border-orange-100"},
  { label: "Analytics",       icon: BarChart3,       count: "760 jobs",   color: "text-green-600 bg-green-50  border-green-100" },
  { label: "Support",         icon: HeadphonesIcon,  count: "540 jobs",   color: "text-cyan-600 bg-cyan-50    border-cyan-100"  },
  { label: "Security",        icon: ShieldCheck,     count: "430 jobs",   color: "text-red-600 bg-red-50      border-red-100"   },
  { label: "Data Science",    icon: Database,        count: "1.4k jobs",  color: "text-violet-600 bg-violet-50 border-violet-100"},
  { label: "Management",      icon: Briefcase,       count: "670 jobs",   color: "text-amber-600 bg-amber-50  border-amber-100" },
];

const CategorySection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCategoryClick = (label) => {
    dispatch(setSearchedQuery(label));
    navigate("/browse");
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Browse by <span className="text-[#6a38c2]">Category</span>
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Explore roles across every industry — find what fits you best
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(({ label, icon: Icon, count, color }) => (
            <button
              key={label}
              onClick={() => handleCategoryClick(label)}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:border-[#6a38c2]/40 hover:bg-purple-50/60 hover:shadow-sm transition-all text-center"
            >
              <div className={`p-3 rounded-xl border ${color} transition-transform group-hover:scale-110`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{count}</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategorySection;