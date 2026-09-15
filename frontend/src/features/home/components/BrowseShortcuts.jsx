import { ArrowRight, Building2, Clock, Globe2, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/common/SectionHeading";

const SHORTCUTS = [
  { label: "Remote jobs", description: "Work from anywhere in the country.", to: "/jobs?workMode=remote", icon: Globe2 },
  { label: "Hybrid roles", description: "Mix office days with home days.", to: "/jobs?workMode=hybrid", icon: Building2 },
  { label: "Internships", description: "Kick-start your career.", to: "/jobs?employmentType=internship", icon: GraduationCap },
  { label: "Part-time", description: "Flexible hours that fit your life.", to: "/jobs?employmentType=part-time", icon: Clock },
];

const BrowseShortcuts = () => (
  <section className="border-y bg-surface">
    <div className="page-container py-16 sm:py-20">
      <SectionHeading eyebrow="Explore" title="Browse jobs your way" description="Jump straight to the kind of work you want." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map(({ label, description, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="group rounded-xl border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <p className="type-h4 mt-4 text-foreground">{label}</p>
            <p className="type-caption mt-1 text-muted-foreground">{description}</p>
            <span className="type-caption mt-3 inline-flex items-center gap-1 font-medium text-primary">
              Browse <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default BrowseShortcuts;
