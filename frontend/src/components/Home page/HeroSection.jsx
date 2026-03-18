import React, { useState } from "react";
import { Button } from "../ui/button";
import { Search } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useNavigate } from "react-router-dom";

const PopularTags = ({ onTagClick }) => {
  const tags = ["UI Designer", "React Developer", "Product Manager", "Remote", "Frontend"];
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap mt-2 px-4">
      <span className="text-xs sm:text-sm text-gray-400 font-medium">Trending:</span>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagClick(tag)}
          className="text-xs sm:text-sm px-3 py-1 rounded-full hover:bg-purple-100 border border-purple-100 transition-colors cursor-pointer"
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchJobHandler();
  };

  return (
    <div className="text-center px-4 sm:px-6">
      <div className="flex flex-col items-center gap-4 my-8 sm:my-12">

        {/* Badge */}
        <span className="mx-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-50 to-red-50 border border-purple-100 font-semibold text-xs sm:text-sm flex items-center gap-1.5 w-fit">
          Your Job Search Ends Here !!
        </span>

        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight px-2">
          Your Next Big Break <br className="hidden sm:block" />
          is Just a{" "}
          <span className="relative inline-block text-[#6a38c2]">
            Search Away
            <svg
              className="absolute -bottom-1 left-0 w-full"
              viewBox="0 0 200 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 5.5 Q50 1 100 5.5 Q150 10 199 5.5"
                stroke="#6a38c2"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                opacity="0.4"
              />
            </svg>
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-sm sm:text-base max-w-xs sm:max-w-md mx-auto leading-relaxed">
          Discover thousands of opportunities across top companies — find a role
          that fits your skills, lifestyle, and ambitions.
        </p>

        {/* Search Bar */}
        <div className="flex w-full sm:w-[80%] md:w-[60%] lg:w-[45%] mx-auto mt-1 rounded-2xl border border-gray-200 bg-white shadow-md shadow-purple-100/40 overflow-hidden focus-within:ring-2 focus-within:ring-[#6a38c2]/30 focus-within:border-[#6a38c2]/50 transition-all">
          <div className="flex items-center pl-3 sm:pl-4 text-gray-400 shrink-0">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Job title, skill, or company..."
            className="outline-none border-none w-full px-2 sm:px-3 py-3 sm:py-3.5 text-sm text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={searchJobHandler}
            className="m-1.5 px-3 sm:px-5 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-xs sm:text-sm font-semibold transition-colors shrink-0"
          >
            Search
          </Button>
        </div>

        {/* Popular Tags */}
        <PopularTags onTagClick={(tag) => setQuery(tag)} />

      </div>
    </div>
  );
};

export default HeroSection;