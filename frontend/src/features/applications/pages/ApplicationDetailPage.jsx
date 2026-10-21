import { useState } from "react";
import { ArrowLeft, ExternalLink, FileText, SearchX } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import CompanyLogo from "@/components/common/CompanyLogo";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import { PageLoader } from "@/components/common/Spinner";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import JobMeta from "@/features/jobs/components/JobMeta";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { WITHDRAWABLE_STATUSES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { useGetApplicationQuery, useWithdrawApplicationMutation } from "../api";
import StatusTimeline from "../components/StatusTimeline";

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const { data: application, isLoading, isError, error, refetch } = useGetApplicationQuery(id);
  const [withdraw, { isLoading: withdrawing }] = useWithdrawApplicationMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  useDocumentTitle(application?.job ? `Application · ${application.job.title}` : "Application");

  const handleWithdraw = async () => {
    try {
      await withdraw(id).unwrap();
      toast.success("Application withdrawn");
      setConfirmOpen(false);
    } catch (withdrawError) {
      toast.error(getErrorMessage(withdrawError));
    }
  };

  if (isLoading) return <PageLoader />;
  if (isError) {
    return error?.status === 404 || error?.status === 400 ? (
      <EmptyState
        icon={SearchX}
        title="Application not found"
        action={
          <Button asChild>
            <Link to="/dashboard/applications">Back to applications</Link>
          </Button>
        }
      />
    ) : (
      <ErrorState error={error} onRetry={refetch} />
    );
  }

  const { job, company } = application;
  const canWithdraw = WITHDRAWABLE_STATUSES.includes(application.status);

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard/applications"
        className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Applications
      </Link>

      <PageHeader
        title={job?.title ?? "Job no longer available"}
        description={`${company?.name ?? ""} · Applied ${formatDate(application.createdAt)}`}
        actions={<StatusBadge status={application.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <SectionCard title="Progress" description="Every update on your application.">
            <StatusTimeline history={application.statusHistory} />
          </SectionCard>

          <SectionCard title="What you sent">
            <div className="space-y-5">
              {application.resume?.url && (
                <a
                  href={application.resume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-md border p-3 transition-colors hover:bg-accent"
                >
                  <FileText className="size-5 shrink-0" aria-hidden="true" />
                  <span className="type-body min-w-0 flex-1 truncate">{application.resume.originalName || "Resume"}</span>
                  <ExternalLink className="size-4 text-muted-foreground" aria-hidden="true" />
                </a>
              )}
              <div>
                <p className="type-label text-muted-foreground">Cover letter</p>
                <p className="type-body mt-2 whitespace-pre-line text-foreground">
                  {application.coverLetter || "No cover letter was included."}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-4">
          {job && (
            <SectionCard title="The job">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CompanyLogo company={company} size="sm" />
                  <p className="type-body font-medium text-foreground">{company?.name}</p>
                </div>
                <JobMeta job={job} />
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/jobs/${job._id}`}>View job post</Link>
                </Button>
              </div>
            </SectionCard>
          )}

          {canWithdraw && (
            <Button variant="ghost" className="w-full text-destructive" onClick={() => setConfirmOpen(true)}>
              Withdraw application
            </Button>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Withdraw this application?"
        description="The recruiter will see that you withdrew. You can't apply to this job again."
        confirmLabel="Withdraw"
        destructive
        loading={withdrawing}
        onConfirm={handleWithdraw}
      />
    </div>
  );
};

export default ApplicationDetailPage;
