import React from "react";

const testimonials = [
  { name: "Priya Sharma",  role: "Frontend Developer @ Google",   avatar: "https://randomuser.me/api/portraits/women/44.jpg", text: "Within a week on HireStream, I had 4 interview calls and landed my dream role at Google. Absolutely incredible platform!", handle: "@priya_sharma" },
  { name: "Arjun Mehta",   role: "Data Scientist @ Microsoft",    avatar: "https://randomuser.me/api/portraits/men/32.jpg",   text: "No spam, no irrelevant roles — just clean, verified opportunities. Found my current job in less than 2 weeks.", handle: "@arjun_mehta" },
  { name: "Sneha Patel",   role: "Product Manager @ Flipkart",    avatar: "https://randomuser.me/api/portraits/women/68.jpg", text: "The one-click apply feature saved me so much time. The category filters are spot on and the UI is just so clean.", handle: "@sneha_p" },
  { name: "Rahul Verma",   role: "Backend Engineer @ Razorpay",   avatar: "https://randomuser.me/api/portraits/men/75.jpg",   text: "HireStream is the only platform where I felt jobs were actually curated for my skill set. Got placed within 10 days!", handle: "@rahul_v" },
  { name: "Aisha Khan",    role: "UX Designer @ Swiggy",          avatar: "https://randomuser.me/api/portraits/women/26.jpg", text: "Love HireStream. The design roles here are actually good — not just copy-paste JDs. Finally found a team that values design thinking.", handle: "@aisha_designs" },
  { name: "Karan Nair",    role: "DevOps Engineer @ Amazon",      avatar: "https://randomuser.me/api/portraits/men/11.jpg",   text: "Switched from Naukri to HireStream and never looked back. The interface is clean, the jobs are real.", handle: "@karan_nair" },
  { name: "Divya Menon",   role: "Data Analyst @ Infosys",        avatar: "https://randomuser.me/api/portraits/women/55.jpg", text: "As a fresher, HireStream had so many entry-level roles that matched my profile. Got my first job here!", handle: "@divya_m" },
  { name: "Rohit Sinha",   role: "Full Stack Developer @ Zomato", avatar: "https://randomuser.me/api/portraits/men/46.jpg",   text: "I found my current role by just clicking 'React Developer' — took less than a minute.", handle: "@rohit_codes" },
  { name: "Meera Iyer",    role: "Marketing Manager @ Paytm",     avatar: "https://randomuser.me/api/portraits/women/17.jpg", text: "Three rounds and an offer in 12 days. The platform just works.", handle: "@meera_iyer" },
];

const col1 = [testimonials[0], testimonials[3], testimonials[6]];
const col2 = [testimonials[1], testimonials[4], testimonials[7]];
const col3 = [testimonials[2], testimonials[5], testimonials[8]];

const TestimonialCard = ({ name, role, avatar, text, handle }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 hover:border-[#6a38c2]/30 hover:shadow-md hover:shadow-purple-100/30 transition-all">
    <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
      <img src={avatar} alt={name} className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-gray-100 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-[10px] sm:text-xs text-gray-400 truncate">{handle}</p>
      </div>
      <div className="ml-auto shrink-0">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-300 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
    </div>
    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{text}</p>
    <p className="text-[10px] sm:text-xs text-[#6a38c2] font-medium mt-2 sm:mt-3 truncate">{role}</p>
  </div>
);

const ScrollColumn = ({ items, duration, reverse = false }) => {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden h-[420px] sm:h-[500px] md:h-[560px]">
      <style>{`
        @keyframes scrollUp   { 0%{transform:translateY(0)}    100%{transform:translateY(-50%)} }
        @keyframes scrollDown { 0%{transform:translateY(-50%)} 100%{transform:translateY(0)}    }
        .sup-${duration}  { animation: scrollUp   ${duration}s linear infinite; }
        .sdn-${duration}  { animation: scrollDown ${duration}s linear infinite; }
        .sup-${duration}:hover, .sdn-${duration}:hover { animation-play-state: paused; }
      `}</style>
      <div className={reverse ? `sdn-${duration}` : `sup-${duration}`}>
        {doubled.map((t, i) => <TestimonialCard key={`${t.name}-${i}`} {...t} />)}
      </div>
      <div className="absolute top-0 left-0 right-0 h-10 sm:h-16 bg-gradient-to-b from-[#fafafa] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-10 sm:h-16 bg-gradient-to-t from-[#fafafa] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

const TestimonialsSection = () => (
  <section className="py-12 sm:py-16 md:py-20 bg-[#fafafa] overflow-hidden">
    <div className="max-w-5xl mx-auto px-4 sm:px-6">

      {/* Header */}
      <div className="text-center mb-8 sm:mb-10 md:mb-14">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          People Who Found Their{" "}
          <span className="text-[#6a38c2]">Dream Jobs</span>
        </h2>
        <p className="text-gray-500 mt-2 text-xs sm:text-sm">
          Real people, real offers — here's what they have to say.
        </p>
      </div>

      {/* Columns:
          mobile  → 1 column (only col1)
          tablet  → 2 columns (col1 + col2)
          desktop → 3 columns (all)        */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <ScrollColumn items={col1} duration={28} reverse={false} />
        <div className="hidden sm:block">
          <ScrollColumn items={col2} duration={22} reverse={true} />
        </div>
        <div className="hidden lg:block">
          <ScrollColumn items={col3} duration={32} reverse={false} />
        </div>
      </div>

    </div>
  </section>
);

export default TestimonialsSection;