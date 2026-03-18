// TestimonialsSection.jsx

import React from "react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Frontend Developer @ Google",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    text: "I had been job hunting for 3 months with no luck. Within a week on HireStream, I had 4 interview calls and landed my dream role at Google. Absolutely incredible platform!",
    handle: "@priya_sharma",
  },
  {
    name: "Arjun Mehta",
    role: "Data Scientist @ Microsoft",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    text: "The quality of listings here is unmatched. No spam, no irrelevant roles — just clean, verified opportunities. Found my current job in less than 2 weeks.",
    handle: "@arjun_mehta",
  },
  {
    name: "Sneha Patel",
    role: "Product Manager @ Flipkart",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "The one-click apply feature saved me so much time. The category filters are spot on and the UI is just so clean. Highly recommend to anyone switching careers.",
    handle: "@sneha_p",
  },
  {
    name: "Rahul Verma",
    role: "Backend Engineer @ Razorpay",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    text: "HireStream is the only platform where I felt the jobs were actually curated for my skill set. Got placed within 10 days of signing up!",
    handle: "@rahul_v",
  },
  {
    name: "Aisha Khan",
    role: "UX Designer @ Swiggy",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
    text: "Love HireStream. The design roles here are actually good — not just copy-paste JDs. Finally found a team that values design thinking.",
    handle: "@aisha_designs",
  },
  {
    name: "Karan Nair",
    role: "DevOps Engineer @ Amazon",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    text: "Switched from Naukri to HireStream and never looked back. The interface is clean, the jobs are real, and the response rate is way higher.",
    handle: "@karan_nair",
  },
  {
    name: "Divya Menon",
    role: "Data Analyst @ Infosys",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    text: "As a fresher, I was worried I wouldn't find anything relevant. HireStream had so many entry-level roles that actually matched my profile. Got my first job here!",
    handle: "@divya_m",
  },
  {
    name: "Rohit Sinha",
    role: "Full Stack Developer @ Zomato",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    text: "The trending tags and category filters are a game changer. I found my current role by just clicking 'React Developer' — took less than a minute.",
    handle: "@rohit_codes",
  },
  {
    name: "Meera Iyer",
    role: "Marketing Manager @ Paytm",
    avatar: "https://randomuser.me/api/portraits/women/17.jpg",
    text: "I was skeptical at first but HireStream proved me wrong. Three rounds and an offer in 12 days. The platform just works.",
    handle: "@meera_iyer",
  },
];

// Split into 3 columns with varied card sizes for masonry feel
const col1 = [testimonials[0], testimonials[3], testimonials[6]];
const col2 = [testimonials[1], testimonials[4], testimonials[7]];
const col3 = [testimonials[2], testimonials[5], testimonials[8]];

const TestimonialCard = ({ name, role, avatar, text, handle }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 hover:border-[#6a38c2]/30 hover:shadow-md hover:shadow-purple-100/30 transition-all">
    {/* Author */}
    <div className="flex items-center gap-3 mb-3">
      <img
        src={avatar}
        alt={name}
        className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100"
      />
      <div>
        <p className="text-sm font-semibold text-gray-900">{name}</p>
        <p className="text-xs text-gray-400">{handle}</p>
      </div>
      {/* X / Twitter icon */}
      <div className="ml-auto">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-300 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </div>
    </div>
    {/* Text */}
    <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
    {/* Role tag */}
    <p className="text-xs text-[#6a38c2] font-medium mt-3">{role}</p>
  </div>
);

const ScrollColumn = ({ items, duration, reverse = false }) => {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden h-[580px]">
      <style>{`
        @keyframes scrollUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .scroll-up-${duration} {
          animation: scrollUp ${duration}s linear infinite;
        }
        .scroll-down-${duration} {
          animation: scrollDown ${duration}s linear infinite;
        }
        .scroll-up-${duration}:hover,
        .scroll-down-${duration}:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className={reverse ? `scroll-down-${duration}` : `scroll-up-${duration}`}>
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.name}-${i}`} {...t} />
        ))}
      </div>

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#fafafa] to-transparent z-10 pointer-events-none" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fafafa] to-transparent z-10 pointer-events-none" />
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-[#fafafa] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mt-2">
            People Who Found Their{" "}
            <span className="text-[#6a38c2]">Dream Jobs</span>
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Real people, real offers — here's what they have to say.
          </p>
        </div>

        {/* 3 scrolling columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ScrollColumn items={col1} duration={28} reverse={false} />
          <ScrollColumn items={col2} duration={22} reverse={true} />
          <ScrollColumn items={col3} duration={32} reverse={false} />
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;