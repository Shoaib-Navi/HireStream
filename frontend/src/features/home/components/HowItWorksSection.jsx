import { ListChecks, Search, Send, UserRoundPlus } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

const STEPS = [
  { icon: UserRoundPlus, title: "Create your profile", text: "Add your skills, experience and resume once." },
  { icon: Search, title: "Find the right job", text: "Filter by work mode, job type, experience and salary." },
  { icon: Send, title: "Apply in one click", text: "Your profile and resume go with every application." },
  { icon: ListChecks, title: "Track your progress", text: "See every status change, from applied to hired." },
];

const HowItWorksSection = () => (
  <section className="page-container py-16 sm:py-20">
    <SectionHeading eyebrow="How it works" title="From search to offer, in one place" />
    <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map(({ icon: Icon, title, text }, index) => (
        <li key={title} className="relative">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <span className="type-overline text-muted-foreground">Step {index + 1}</span>
          </div>
          <h3 className="type-h4 mt-5 text-foreground">{title}</h3>
          <p className="type-body mt-1.5 text-muted-foreground">{text}</p>
        </li>
      ))}
    </ol>
  </section>
);

export default HowItWorksSection;
