// PageHero.jsx
// ── Reusable full-width hero banner for any page ─────────────────────────────
// Usage: <PageHero image="..." title="..." subtitle="..." btnText="..." btnLink="..." />

import React from "react";
import { Link } from "react-router-dom";

const PageHero = ({
  image,                          // background image URL
  title     = "Find Your Role",   // main heading
  subtitle  = "Browse thousands of opportunities across top companies.",
  btnText   = "See all jobs",     // button label
  btnLink   = "/browse",          // button link
  align     = "right",            // "right" | "left" | "center"
  overlay   = true,               // dark overlay on image
}) => {

  const alignClass = {
    right:  "items-end   text-right",
    left:   "items-start text-left",
    center: "items-center text-center",
  }[align] || "items-end text-right";

  return (
    <div className="relative w-full h-[220px] rounded-2xl overflow-hidden mx-auto max-w-6xl">

      {/* Background image */}
      <img
        src={image}
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/30 to-black/60" />
      )}

      {/* Content */}
      <div className={`relative z-10 h-full flex flex-col justify-center px-16 gap-3 ${alignClass}`}>
        <h1 className="text-4xl font-extrabold text-white leading-tight max-w-sm">
          {title}
        </h1>
        <p className="text-sm text-white/80 max-w-xs leading-relaxed">
          {subtitle}
        </p>
        <Link to={btnLink}>
          <button className="mt-2 px-6 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-all w-fit">
            {btnText}
          </button>
        </Link>
      </div>

    </div>
  );
};

export default PageHero;