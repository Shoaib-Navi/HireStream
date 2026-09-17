import { BarChart3, Briefcase, Building2, IndianRupee, Laptop, MapPin, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EMPLOYMENT_TYPES, labelFor, WORK_MODES } from "@/lib/constants";
import { formatExperience, formatSalary } from "@/lib/format";
import { cn } from "@/lib/utils";

const WORK_MODE_ICONS = { remote: Wifi, hybrid: Laptop, onsite: Building2 };

// The facts of a job as a row of solid chips. Icons are monochrome and take the chip's
// foreground, so the row inverts correctly inside the dark hero without extra colour.
const JobMeta = ({ job, className }) => {
  const hasSalary = job.salary?.min != null || job.salary?.max != null;

  const items = [
    { icon: Briefcase, label: labelFor(EMPLOYMENT_TYPES, job.employmentType) },
    { icon: WORK_MODE_ICONS[job.workMode] ?? Building2, label: labelFor(WORK_MODES, job.workMode) },
    { icon: MapPin, label: job.location },
    { icon: BarChart3, label: formatExperience(job.experience) },
    // A job with no published range would otherwise read "Not disclosed" as a tag
    ...(hasSalary ? [{ icon: IndianRupee, label: formatSalary(job.salary) }] : []),
  ].filter((item) => item.label);

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label}>
          <Badge>
            <Icon aria-hidden="true" />
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  );
};

export default JobMeta;
