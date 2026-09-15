import { FileText, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APPLICATION_STATUS_META, RECRUITER_STATUSES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { formatRelativeTime } from "@/lib/format";
import { useUpdateApplicationStatusMutation } from "../api";

const MAX_SKILLS = 6;

const ApplicantCard = ({ application, jobId }) => {
  const [updateStatus, { isLoading }] = useUpdateApplicationStatusMutation();
  const { candidate, candidateProfile: profile } = application;
  const isWithdrawn = application.status === "withdrawn";

  // the current status is always listed, even when it isn't one a recruiter can choose
  const statusOptions = RECRUITER_STATUSES.includes(application.status)
    ? RECRUITER_STATUSES
    : [application.status, ...RECRUITER_STATUSES];

  const handleStatusChange = async (status) => {
    try {
      await updateStatus({ id: application._id, jobId, status }).unwrap();
      toast.success(`Moved ${candidate?.fullName ?? "applicant"} to ${APPLICATION_STATUS_META[status].label}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <article className="rounded-xl border bg-card p-5 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <UserAvatar user={candidate} size="md" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="type-h4 text-foreground">{candidate?.fullName ?? "Deleted user"}</h3>
            <StatusBadge status={application.status} />
          </div>
          {profile?.headline && <p className="type-body text-muted-foreground">{profile.headline}</p>}
          <p className="type-caption text-muted-foreground">
            {[
              profile?.location,
              profile?.experienceYears !== undefined && profile?.experienceYears !== null && `${profile.experienceYears} yrs experience`,
              `Applied ${formatRelativeTime(application.createdAt)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="w-full sm:w-44">
          <Select value={application.status} onValueChange={handleStatusChange} disabled={isLoading || isWithdrawn}>
            <SelectTrigger className="w-full" aria-label={`Status for ${candidate?.fullName}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status} disabled={!RECRUITER_STATUSES.includes(status)}>
                  {APPLICATION_STATUS_META[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {profile?.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.skills.slice(0, MAX_SKILLS).map((skill) => (
            <Badge key={skill} variant="neutral">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {application.coverLetter && (
        <details className="group mt-4 rounded-lg bg-surface p-3">
          <summary className="type-body cursor-pointer font-medium text-foreground">Cover letter</summary>
          <p className="type-body mt-2 whitespace-pre-line text-muted-foreground">{application.coverLetter}</p>
        </details>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
        {application.resume?.url && (
          <Button asChild variant="soft" size="sm">
            <a href={application.resume.url} target="_blank" rel="noopener noreferrer">
              <FileText /> Resume
            </a>
          </Button>
        )}
        {candidate?.email && (
          <Button asChild variant="ghost" size="sm">
            <a href={`mailto:${candidate.email}`}>
              <Mail /> {candidate.email}
            </a>
          </Button>
        )}
        {candidate?.phone && (
          <Button asChild variant="ghost" size="sm">
            <a href={`tel:${candidate.phone.replace(/\s+/g, "")}`}>
              <Phone /> {candidate.phone}
            </a>
          </Button>
        )}
      </div>
    </article>
  );
};

export default ApplicantCard;
