import { Briefcase, Clock, MapPin, Wallet } from "lucide-react";
import { EMPLOYMENT_TYPES, labelFor, WORK_MODES } from "@/lib/constants";
import { formatExperience, formatSalary } from "@/lib/format";
import { cn } from "@/lib/utils";

// Location, job type, experience and salary of a job, as an icon list
const JobMeta = ({ job, className }) => {
  const items = [
    { icon: MapPin, label: `${job.location} · ${labelFor(WORK_MODES, job.workMode)}` },
    { icon: Briefcase, label: labelFor(EMPLOYMENT_TYPES, job.employmentType) },
    { icon: Clock, label: formatExperience(job.experience) },
    { icon: Wallet, label: formatSalary(job.salary) },
  ];

  return (
    <ul className={cn("type-caption flex flex-wrap gap-x-4 gap-y-1.5 text-muted-foreground", className)}>
      {items.map(({ icon: Icon, label }, index) => (
        <li key={index} className="inline-flex items-center gap-1.5">
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
};

export default JobMeta;
