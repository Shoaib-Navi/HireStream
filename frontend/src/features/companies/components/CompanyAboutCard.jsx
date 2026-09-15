import { BadgeCheck, Building2, ExternalLink, MapPin, Users } from "lucide-react";
import CompanyLogo from "@/components/common/CompanyLogo";

// Company summary shown next to a job post
const CompanyAboutCard = ({ company }) => {
  if (!company) return null;

  const facts = [
    { icon: Building2, value: company.industry },
    { icon: MapPin, value: company.location },
    { icon: Users, value: company.size && `${company.size} employees` },
  ].filter((fact) => fact.value);

  return (
    <div className="rounded-xl border bg-card p-6">
      <p className="type-overline text-muted-foreground">About the company</p>
      <div className="mt-4 flex items-center gap-3">
        <CompanyLogo company={company} />
        <p className="type-h4 flex min-w-0 items-center gap-1.5 text-foreground">
          <span className="truncate">{company.name}</span>
          {company.isVerified && <BadgeCheck className="size-4 shrink-0 text-primary" aria-label="Verified company" />}
        </p>
      </div>
      {facts.length > 0 && (
        <ul className="type-caption mt-4 space-y-2 text-muted-foreground">
          {facts.map(({ icon: Icon, value }) => (
            <li key={value} className="flex items-center gap-2">
              <Icon className="size-4 shrink-0" aria-hidden="true" /> {value}
            </li>
          ))}
        </ul>
      )}
      {company.description && <p className="type-body mt-4 line-clamp-5 text-muted-foreground">{company.description}</p>}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="type-body mt-4 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          Visit website <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  );
};

export default CompanyAboutCard;
