import { BadgeCheck, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import CompanyLogo from "@/components/common/CompanyLogo";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";

// A recruiter's company with its management actions
const CompanyCard = ({ company }) => {
  const details = [company.industry, company.location].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col rounded-xl border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <CompanyLogo company={company} />
        <div className="min-w-0 flex-1">
          <h3 className="type-h4 flex items-center gap-1.5 text-foreground">
            <span className="truncate">{company.name}</span>
            {company.isVerified && <BadgeCheck className="size-4 shrink-0 text-success" aria-label="Verified company" />}
          </h3>
          <p className="type-caption text-muted-foreground">{details || "Add details so candidates get to know you"}</p>
        </div>
        {company.status === "suspended" && <StatusBadge status={company.status} type="company" />}
      </div>

      <p className="type-body mt-4 text-muted-foreground">{pluralize(company.openJobCount ?? 0, "open job")}</p>

      <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
        <Button asChild size="sm" variant="outline">
          <Link to={`/recruiter/companies/${company._id}/edit`}>
            <Pencil /> Edit
          </Link>
        </Button>
        <Button asChild size="sm" variant="soft">
          <Link to={`/recruiter/jobs/new?company=${company._id}`}>
            <Plus /> Post a job
          </Link>
        </Button>
      </div>
    </article>
  );
};

export default CompanyCard;
