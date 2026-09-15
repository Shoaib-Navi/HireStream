import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { GITHUB_URL } from "@/config/env";

const FOOTER_COLUMNS = [
  {
    title: "Job seekers",
    links: [
      { label: "Browse jobs", to: "/jobs" },
      { label: "Remote jobs", to: "/jobs?workMode=remote" },
      { label: "Internships", to: "/jobs?employmentType=internship" },
      { label: "Create your profile", to: "/register" },
    ],
  },
  {
    title: "Employers",
    links: [
      { label: "Start hiring", to: "/register?role=recruiter" },
      { label: "Recruiter dashboard", to: "/recruiter/jobs" },
      { label: "Post a job", to: "/recruiter/jobs/new" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t bg-surface">
    <div className="page-container grid gap-10 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
      <div className="space-y-3">
        <Logo />
        <p className="type-body max-w-sm text-muted-foreground">
          HireStream connects job seekers with companies that are hiring. Search roles, apply in minutes and track
          every application in one place.
        </p>
      </div>
      {FOOTER_COLUMNS.map((column) => (
        <div key={column.title}>
          <h2 className="type-overline text-foreground">{column.title}</h2>
          <ul className="mt-4 space-y-2.5">
            {column.links.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="type-body text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className="border-t">
      <div className="page-container flex flex-col items-center justify-between gap-3 py-5 sm:flex-row">
        <p className="type-caption text-muted-foreground">© {new Date().getFullYear()} HireStream. All rights reserved.</p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="type-caption inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          Source code <ExternalLink className="size-3.5" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
