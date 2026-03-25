import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";

const footerLinks = {
  "For Job Seekers": [
    { label: "Browse Jobs",      path: "/browse"  },
    { label: "My Applications",  path: "/jobs"    },
    { label: "Saved Jobs",       path: "/profile" },
    { label: "Career Resources", path: "#"        },
    { label: "Resume Tips",      path: "#"        },
  ],
  "For Employers": [
    { label: "Post a Job",        path: "/admin/jobs" },
    { label: "Browse Candidates", path: "#"           },
    { label: "Pricing Plans",     path: "#"           },
    { label: "Recruiter Login",   path: "/login"      },
    { label: "Hire in Bulk",      path: "#"           },
  ],
  "Company": [
    { label: "About Us",  path: "#" },
    { label: "Blog",      path: "#" },
    { label: "Careers",   path: "#" },
    { label: "Press Kit", path: "#" },
    { label: "Contact",   path: "#" },
  ],
};

const socials = [
  { label: "Twitter",   href: "#", svg: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { label: "LinkedIn",  href: "#", svg: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { label: "GitHub",    href: "#", svg: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> },
  { label: "Instagram", href: "#", svg: <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg> },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-950 text-gray-400 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* ── Top grid ── */}
        <div className="pb-10 border-b border-gray-800">

          {/* ── Brand + Links layout ──
              mobile:  brand full width, then links in 2-col grid below
              lg:      brand left (2 cols), links right (3 cols) side by side  */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">

            {/* Brand column */}
            <div className="flex flex-col gap-4 lg:w-[38%] shrink-0">
              <Link to="/" className="w-fit">
                <span className="text-white font-extrabold text-xl tracking-tight relative inline-block">
                  HireStream
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#6a38c2] rounded-full" />
                </span>
              </Link>

              <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
                India's #1 platform connecting ambitious talent with the companies that deserve them. Your dream job is closer than you think.
              </p>

              {/* Contact info */}
              <div className="flex flex-col gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#6a38c2] shrink-0" />
                  Bangalore, India
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#6a38c2] shrink-0" />
                  hello@HireStream.in
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#6a38c2] shrink-0" />
                  +91 98765 43210
                </span>
              </div>

              {/* Socials */}
              <div className="flex items-center gap-3 mt-1">
                {socials.map(({ svg, href, label }) => (
                 <a 
                    key={label}
                    href={href}
                    aria-label={label}
                    className="h-8 w-8 rounded-lg border border-gray-800 bg-gray-900 flex items-center justify-center text-gray-500 hover:border-[#6a38c2]/50 hover:text-[#9b6dff] hover:bg-[#6a38c2]/10 transition-all"
                  >
                    {svg}
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns — 2 col on mobile fills full width, 3 col on sm+ */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
              {Object.entries(footerLinks).map(([heading, links]) => (
                <div key={heading} className="flex flex-col gap-3">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-300">
                    {heading}
                  </h4>
                  <ul className="flex flex-col gap-2">
                    {links.map(({ label, path }) => (
                      <li key={label}>
                        <button
                          onClick={() => navigate(path)}
                          className="text-sm text-gray-500 hover:text-white transition-colors text-left"
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── CTA Banner ── */}
        <div className="py-6 border-b border-gray-800">
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 px-5 sm:px-8 py-6 rounded-2xl bg-gradient-to-r from-[#6a38c2]/20 via-[#6a38c2]/10 to-[#f83002]/10 border border-[#6a38c2]/20 overflow-hidden">
            <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-[#6a38c2]/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-[#f83002]/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 text-center sm:text-left">
              <p className="text-white font-bold text-base leading-snug">
                Ready to get hired?
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Join 1M+ professionals who found their dream job on HireStream.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <Link to="/login">
                <button className="px-4 py-2 rounded-xl border border-gray-600 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-all">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <button className="px-4 py-2 rounded-xl bg-[#6a38c2] hover:bg-[#5b2db0] text-white text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-[#6a38c2]/30">
                  Create Profile <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} HireStream. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <button
                key={item}
                onClick={() => navigate("#")}
                className="hover:text-gray-400 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;