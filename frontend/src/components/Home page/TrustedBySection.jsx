// TrustedBySection.jsx

import React from "react";

const companies = [
  {
    name: "Google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
  {
    name: "Microsoft",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  },
  {
    name: "Amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  },
  {
    name: "Meta",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
  },
  {
    name: "Flipkart",
    logo: "https://cdn.worldvectorlogo.com/logos/flipkart.svg",
  },
  {
    name: "Swiggy",
    logo: "https://companieslogo.com/img/orig/SWIGGY.NS_BIG-f0e9f79a.png?t=1731987060",
  },
  {
    name: "Razorpay",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
  },
  {
    name: "Infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
  },
];

const allCompanies = [...companies, ...companies];

const TrustedBySection = () => {
  return (
    <section className="py-12 border-y border-gray-100 bg-white">

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 40s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Label */}
     

      {/* Marquee container — mid width, centered */}
      <div className="relative w-[65%] mx-auto overflow-hidden mt-5">

        {/* Left blur fade */}
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        {/* Right blur fade */}
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex marquee-track w-max items-center">
          {allCompanies.map((company, index) => (
            <div
              key={`${company.name}-${index}`}
              className="mx-10 flex items-center justify-center"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="h-6 object-contain grayscale opacity-40 hover:opacity-80 hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>

      </div>
       <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mt-20">
        Trusted by top companies hiring on our platform
      </p>
    </section>
  );
};

export default TrustedBySection;