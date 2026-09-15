import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatDate, formatExperience, formatNumber, formatSalary } from "@/lib/format";
import SaveJobButton from "@/features/savedJobs/components/SaveJobButton";
import ApplyDialog from "./ApplyDialog";

// Key facts of a job and the right call to action for the current visitor
const ApplyCard = ({ job }) => {
  const { user, isCandidate } = useAuth();
  const location = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const facts = [
    { label: "Salary", value: formatSalary(job.salary) },
    { label: "Experience", value: formatExperience(job.experience) },
    { label: "Openings", value: formatNumber(job.openings) },
    { label: "Applicants", value: formatNumber(job.applicationCount) },
    ...(job.deadline ? [{ label: "Apply by", value: formatDate(job.deadline) }] : []),
  ];

  const renderAction = () => {
    if (job.isOwner) {
      return (
        <Button asChild variant="outline" className="w-full">
          <Link to={`/recruiter/jobs/${job._id}/applicants`}>View applicants</Link>
        </Button>
      );
    }
    if (job.hasApplied) {
      return (
        <>
          <Button disabled variant="soft" className="w-full">
            <CheckCircle2 /> Applied
          </Button>
          <Button asChild variant="link" className="w-full">
            <Link to="/dashboard/applications">Track your application</Link>
          </Button>
        </>
      );
    }
    if (!job.isAcceptingApplications) {
      return <p className="type-body text-center text-muted-foreground">This job is no longer accepting applications.</p>;
    }
    if (!user) {
      return (
        <Button asChild size="lg" className="w-full">
          <Link to="/login" state={{ from: location.pathname }}>
            Log in to apply
          </Link>
        </Button>
      );
    }
    if (isCandidate) {
      return (
        <Button size="lg" className="w-full" onClick={() => setDialogOpen(true)}>
          Apply now
        </Button>
      );
    }
    return <p className="type-caption text-center text-muted-foreground">Recruiter accounts can't apply to jobs.</p>;
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      <dl className="divide-y">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <dt className="type-label text-muted-foreground">{fact.label}</dt>
            <dd className="type-body text-right font-medium text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 space-y-2">
        {renderAction()}
        {!job.isOwner && <SaveJobButton job={job} variant="full" />}
      </div>
      {isCandidate && <ApplyDialog job={job} open={dialogOpen} onOpenChange={setDialogOpen} />}
    </div>
  );
};

export default ApplyCard;
