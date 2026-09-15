import { ArrowLeft, ExternalLink, FileText, Mail, Phone, SearchX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import { MatchBreakdown } from "@/components/common/MatchScore";
import SectionCard from "@/components/common/SectionCard";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import UserAvatar from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EducationEntry, ExperienceEntry } from "@/features/profile/components/ProfileEntries";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatDate } from "@/lib/format";
import { useGetApplicationQuery } from "../api";
import PrivateNotes from "../components/PrivateNotes";
import StatusTimeline from "../components/StatusTimeline";
import StatusUpdateForm from "../components/StatusUpdateForm";

const LINK_LABELS = { linkedin: "LinkedIn", github: "GitHub", portfolio: "Portfolio", website: "Website" };

const RecruiterApplicationPage = () => {
  const { id } = useParams();
  const { data: application, isLoading, isError, error, refetch } = useGetApplicationQuery(id);
  useDocumentTitle(application?.candidate ? `${application.candidate.fullName} · Application` : "Application");

  if (isLoading) return <PageLoader />;
  if (isError) {
    return error?.status === 404 || error?.status === 400 ? (
      <EmptyState
        icon={SearchX}
        title="Application not found"
        action={
          <Button asChild>
            <Link to="/recruiter/jobs">Back to your jobs</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={error} onRetry={refetch} />
    );
  }

  const { candidate, candidateProfile: profile, job } = application;
  const links = Object.entries(profile?.links ?? {}).filter(([, url]) => url);

  return (
    <div className="space-y-6">
      <Link
        to={job ? `/recruiter/jobs/${job._id}/applicants` : "/recruiter/jobs"}
        className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> {job?.title ?? "Your jobs"}
      </Link>

      <header className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar user={candidate} size="lg" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="type-h2 text-foreground">{candidate?.fullName ?? "Deleted user"}</h1>
            <StatusBadge status={application.status} />
          </div>
          {profile?.headline && <p className="type-body-lg text-muted-foreground">{profile.headline}</p>}
          <p className="type-caption text-muted-foreground">
            Applied {formatDate(application.createdAt)}
            {profile?.location && ` · ${profile.location}`}
            {profile?.experienceYears !== undefined && profile?.experienceYears !== null && ` · ${profile.experienceYears} yrs experience`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate?.email && (
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${candidate.email}`}>
                <Mail /> Email
              </a>
            </Button>
          )}
          {candidate?.phone && (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${candidate.phone.replace(/\s+/g, "")}`}>
                <Phone /> Call
              </a>
            </Button>
          )}
          {application.resume?.url && (
            <Button asChild size="sm">
              <a href={application.resume.url} target="_blank" rel="noopener noreferrer">
                <FileText /> Resume
              </a>
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <SectionCard title="Cover letter">
            <p className="type-body whitespace-pre-line text-foreground">
              {application.coverLetter || "No cover letter was included."}
            </p>
          </SectionCard>

          {profile?.bio && (
            <SectionCard title="About">
              <p className="type-body whitespace-pre-line text-foreground">{profile.bio}</p>
            </SectionCard>
          )}

          {profile?.skills?.length > 0 && (
            <SectionCard title="Skills">
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>
            </SectionCard>
          )}

          {profile?.experience?.length > 0 && (
            <SectionCard title="Experience">
              <ul className="divide-y">
                {profile.experience.map((item) => (
                  <li key={item._id} className="py-4 first:pt-0 last:pb-0">
                    <ExperienceEntry item={item} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {profile?.education?.length > 0 && (
            <SectionCard title="Education">
              <ul className="divide-y">
                {profile.education.map((item) => (
                  <li key={item._id} className="py-4 first:pt-0 last:pb-0">
                    <EducationEntry item={item} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {links.length > 0 && (
            <SectionCard title="Links">
              <div className="flex flex-wrap gap-2">
                {links.map(([key, url]) => (
                  <Button key={key} asChild variant="outline" size="sm">
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {LINK_LABELS[key] ?? key} <ExternalLink />
                    </a>
                  </Button>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <aside className="space-y-6">
          <SectionCard title="Update status">
            {/* re-created after each change so the form starts from the saved status */}
            <StatusUpdateForm key={application.status} application={application} />
          </SectionCard>
          {application.match && (
            <SectionCard title="Profile match" description="Based on the job's skills, experience and location.">
              <MatchBreakdown match={application.match} />
            </SectionCard>
          )}
          <SectionCard title="Progress">
            <StatusTimeline history={application.statusHistory} />
          </SectionCard>
          <SectionCard title="Private notes">
            <PrivateNotes applicationId={application._id} notes={application.notes} />
          </SectionCard>
        </aside>
      </div>
    </div>
  );
};

export default RecruiterApplicationPage;
