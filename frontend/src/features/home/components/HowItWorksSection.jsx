import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import FeatureGrid from "@/components/common/FeatureGrid";
import ScrambleText from "@/components/common/ScrambleText";
import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "Create your profile", description: "Add your skills, experience and resume once. It goes with every application." },
  { title: "Find the right job", description: "Filter open roles by work mode, job type, experience and salary." },
  { title: "Apply in one click", description: "Send your profile, resume and an optional cover letter in seconds." },
  { title: "Track your progress", description: "Follow every status change, from applied to shortlisted, interview and hired." },
];

const HowItWorksSection = () => (
  <section className="dark rounded-section bg-background text-foreground">
    <div className="page-container grid gap-12 py-20 sm:py-28 lg:grid-cols-[20rem_1fr] lg:gap-16">
      <div className="flex flex-col justify-between gap-10">
        <div className="space-y-5">
          <ScrambleText text="How it works" className="type-label block text-muted-foreground" />
          <h2 className="type-h1">From search to offer, in one place.</h2>
          <ul className="type-h3 space-y-1 pt-4 text-muted-foreground">
            {STEPS.map((step, index) => (
              <li key={step.title} className={index === 0 ? "text-foreground" : undefined}>
                {step.title.split(" ").slice(0, 2).join(" ")}
              </li>
            ))}
          </ul>
        </div>
        <Button asChild size="lg" variant="highlight" className="self-start">
          <Link to="/register">
            Create your profile <ArrowRight />
          </Link>
        </Button>
      </div>
      <FeatureGrid items={STEPS} columns={2} />
    </div>
  </section>
);

export default HowItWorksSection;
