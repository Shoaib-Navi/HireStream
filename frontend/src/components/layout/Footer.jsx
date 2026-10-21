import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
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
  <footer className="dark rounded-t-section bg-background text-foreground">
    <div className="page-container pt-16 pb-8 sm:pt-24">
      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-8">
          <p className="type-h1 max-w-lg">Your next role is one search away.</p>
          <Button asChild size="lg" variant="highlight">
            <Link to="/jobs">
              Find jobs <ArrowRight />
            </Link>
          </Button>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="type-label text-muted-foreground">{column.title}</h2>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="type-body-lg text-foreground/80 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Logo />
        <div className="flex items-center gap-6">
          <p className="type-caption text-muted-foreground">© {new Date().getFullYear()} HireStream</p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            Source code <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
