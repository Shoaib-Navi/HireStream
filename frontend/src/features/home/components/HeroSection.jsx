import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ScrambleText from "@/components/common/ScrambleText";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import JobSearchBar from "@/features/jobs/components/JobSearchBar";
import { cleanParams } from "@/lib/query";

const POPULAR_SEARCHES = ["React", "Node.js", "Data Analyst", "UI/UX Designer", "DevOps"];

const HeroSection = () => {
  const navigate = useNavigate();
  const { isRecruiter } = useAuth();

  const handleSearch = (values) => {
    const search = new URLSearchParams(cleanParams(values)).toString();
    navigate({ pathname: "/jobs", search: search ? `?${search}` : "" });
  };

  return (
    <section className="dark rounded-b-section bg-background text-foreground">
      <div className="page-container pt-16 pb-16 sm:pt-28 sm:pb-24">
        <div className="flex flex-wrap items-center gap-3">
          <ScrambleText text="Job search, simplified" className="type-label text-muted-foreground" />
          <span className="type-label rounded-sm bg-secondary px-2.5 py-1.5 text-foreground">Free for job seekers</span>
        </div>

        <h1 className="type-display mt-7 max-w-5xl animate-fade-up">Find the job that moves your career forward.</h1>

        <div className="mt-10 flex flex-wrap gap-2">
          <Button asChild size="xl" variant="highlight">
            <Link to="/jobs">
              Find jobs <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="xl" variant="secondary">
            <Link to={isRecruiter ? "/recruiter/jobs/new" : "/register?role=recruiter"}>
              {isRecruiter ? "Post a job" : "Start hiring"} <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="mt-20 grid gap-12 sm:mt-28 lg:grid-cols-2 lg:items-end">
          <p className="type-lead max-w-2xl lg:order-2">
            HireStream connects people who are ready for their next move with companies that are hiring. Search roles,
            apply with one profile and follow every application from applied to hired.
          </p>
          <div className="space-y-4 lg:order-1">
            <JobSearchBar size="lg" onSearch={handleSearch} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-label mr-1 text-muted-foreground">Popular</span>
              {POPULAR_SEARCHES.map((term) => (
                <Button key={term} asChild variant="outline" size="sm">
                  <Link to={`/jobs?q=${encodeURIComponent(term)}`}>{term}</Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
