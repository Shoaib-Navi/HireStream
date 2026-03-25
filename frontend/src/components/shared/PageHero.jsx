// PageHero.jsx

import React from "react";
import { Link } from "react-router-dom";

const PageHero = ({
  image,
  title    = "Find Your Role",
  subtitle = "Browse thousands of opportunities across top companies.",
  btnText  = "See all jobs",
  btnLink  = "/browse",
  align    = "right",
  overlay  = true,
}) => {

  const alignClass = {
    right:  "items-end   text-right",
    left:   "items-start text-left",
    center: "items-center text-center",
  }[align] || "items-end text-right";

  return (
    <div className="relative w-full h-[120px] sm:h-[200px] md:h-[220px] rounded-xl sm:rounded-2xl overflow-hidden mx-auto max-w-6xl">

      {/* Background image */}
      <img
        src={image}
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/50 to-black/60" />
      )}

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 md:px-16 gap-2 sm:gap-3 ${alignClass}`}>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-tight max-w-[240px] sm:max-w-xs md:max-w-sm">
          {title}
        </h1>

        {/* Subtitle — visible from sm up */}
        <p className="hidden sm:block text-xs sm:text-sm text-white/80 max-w-[260px] md:max-w-xs leading-relaxed">
          {subtitle}
        </p>

        {/* Button */}
        <Link to={btnLink}>
          <button className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl bg-white text-gray-900 text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-all w-fit">
            {btnText}
          </button>
        </Link>

      </div>
    </div>
  );
};

export default PageHero;