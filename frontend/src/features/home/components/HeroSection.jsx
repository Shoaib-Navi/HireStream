import { Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GridBackground from "@/components/common/GridBackground";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import JobSearchBar from "@/features/jobs/components/JobSearchBar";
import { cleanParams } from "@/lib/query";

const POPULAR_SEARCHES = ["React", "Node.js", "Data Analyst", "UI/UX Designer", "DevOps"];

const HeroSection = () => {
  const navigate = useNavigate();

  const handleSearch = (values) => {
    const search = new URLSearchParams(cleanParams(values)).toString();
    navigate({ pathname: "/jobs", search: search ? `?${search}` : "" });
  };

  return (
    <GridBackground className="border-b">
      <div className="page-container py-16 sm:py-24">
        <div className="mx-auto max-w-3xl animate-fade-up text-center">
          <Badge variant="brand" className="mb-5">
            <Sparkles /> Jobs from companies hiring right now
          </Badge>
          <h1 className="type-display text-foreground">
            Find work that <span className="text-primary">moves you forward</span>
          </h1>
          <p className="type-body-lg mx-auto mt-5 max-w-xl text-muted-foreground">
            Search open roles, apply with one profile and follow every application from applied to hired.
          </p>
        </div>

        <JobSearchBar size="lg" className="mx-auto mt-10 max-w-3xl" onSearch={handleSearch} />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="type-caption text-muted-foreground">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <Button key={term} asChild variant="outline" size="sm" className="rounded-full">
              <Link to={`/jobs?q=${encodeURIComponent(term)}`}>{term}</Link>
            </Button>
          ))}
        </div>
      </div>
    </GridBackground>
  );
};

export default HeroSection;
