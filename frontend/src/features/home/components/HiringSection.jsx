import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrambleText from "@/components/common/ScrambleText";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

// Editorial block for employers: short question, large statement, call to action
const HiringSection = () => {
  const { isRecruiter } = useAuth();

  return (
    <section className="page-container py-20 sm:py-28">
      <ScrambleText text="For employers" className="type-label block text-muted-foreground" />
      <h2 className="type-display mt-6 max-w-5xl">Great hires start with a simple process.</h2>

      <div className="mt-16 grid gap-8 border-t pt-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
        <p className="type-body-lg text-foreground">Hiring for your team and short on time?</p>
        <div className="max-w-3xl space-y-10">
          <p className="type-lead text-foreground">
            Post a job in minutes, review every applicant with their profile, resume and cover letter in one place, and
            move the right people from shortlist to offer.
          </p>
          <Button asChild size="lg" variant="highlight">
            <Link to={isRecruiter ? "/recruiter/jobs/new" : "/register?role=recruiter"}>
              {isRecruiter ? "Post a job" : "Start hiring"} <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HiringSection;
