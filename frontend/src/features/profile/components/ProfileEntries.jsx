import { formatMonthYear } from "@/lib/format";

// Read-only display of profile entries, shared by the profile editor and the recruiter's applicant view

export const ExperienceEntry = ({ item }) => (
  <div>
    <p className="type-h4 text-foreground">{item.title}</p>
    <p className="type-body text-muted-foreground">
      {item.company}
      {item.location && ` · ${item.location}`}
    </p>
    <p className="type-caption text-muted-foreground">
      {formatMonthYear(item.startDate)} – {item.isCurrent ? "Present" : formatMonthYear(item.endDate) || "—"}
    </p>
    {item.description && <p className="type-body mt-2 whitespace-pre-line text-foreground">{item.description}</p>}
  </div>
);

export const EducationEntry = ({ item }) => (
  <div>
    <p className="type-h4 text-foreground">{item.institution}</p>
    <p className="type-body text-muted-foreground">
      {item.degree}
      {item.fieldOfStudy && `, ${item.fieldOfStudy}`}
    </p>
    {(item.startYear || item.endYear) && (
      <p className="type-caption text-muted-foreground">
        {item.startYear ?? "—"} – {item.endYear ?? "Present"}
        {item.grade && ` · ${item.grade}`}
      </p>
    )}
  </div>
);
