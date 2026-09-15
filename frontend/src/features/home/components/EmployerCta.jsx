import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import GridBackground from "@/components/common/GridBackground";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

const EmployerCta = () => {
  const { isRecruiter } = useAuth();

  return (
    <section className="page-container pb-20">
      <GridBackground
        className="rounded-3xl bg-brand-950 text-white"
        lineColor="color-mix(in oklab, white 6%, transparent)"
      >
        <div className="flex flex-col gap-8 px-6 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="type-overline text-brand-300">For employers</p>
            <h2 className="type-h1">Hiring? Reach candidates who are ready to move.</h2>
            <p className="type-body-lg text-brand-100/80">
              Post jobs, review applicants with their profiles and resumes, and move them through your hiring pipeline.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="xl" variant="highlight">
              <Link to={isRecruiter ? "/recruiter/jobs/new" : "/register?role=recruiter"}>
                {isRecruiter ? "Post a job" : "Start hiring"} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </GridBackground>
    </section>
  );
};

export default EmployerCta;
