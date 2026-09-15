import { useState } from "react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import { PageLoader } from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useGetMyProfileQuery } from "@/features/profile/api";
import { getErrorMessage } from "@/lib/errors";
import { useApplyToJobMutation } from "../api";

const ApplyDialog = ({ job, open, onOpenChange }) => {
  const { data: profile, isLoading: profileLoading } = useGetMyProfileQuery(undefined, { skip: !open });
  const [applyToJob, { isLoading }] = useApplyToJobMutation();
  const [coverLetter, setCoverLetter] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await applyToJob({ jobId: job._id, coverLetter }).unwrap();
      toast.success("Application submitted. Good luck!");
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const renderBody = () => {
    if (profileLoading) return <PageLoader className="min-h-40" />;

    if (!profile?.resume?.url) {
      return (
        <div className="rounded-xl border border-dashed p-6 text-center">
          <FileText className="mx-auto size-8 text-primary" aria-hidden="true" />
          <p className="type-h4 mt-3 text-foreground">Upload your resume first</p>
          <p className="type-body mt-1 text-muted-foreground">Your resume is attached to every application you send.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard/profile#resume">Go to your profile</Link>
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border bg-surface p-3">
          <FileText className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0">
            <p className="type-body truncate font-medium text-foreground">{profile.resume.originalName}</p>
            <p className="type-caption text-muted-foreground">Attached resume</p>
          </div>
        </div>
        <FormField label="Cover letter" htmlFor="coverLetter" hint="Optional. Tell the recruiter why you're a great fit.">
          <Textarea
            id="coverLetter"
            rows={6}
            maxLength={5000}
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.target.value)}
            placeholder="Hi! I'm excited about this role because…"
          />
        </FormField>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <LoadingButton type="submit" loading={isLoading}>
            Submit application
          </LoadingButton>
        </DialogFooter>
      </form>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
          <DialogDescription>{job.company?.name} will see your profile, resume and cover letter.</DialogDescription>
        </DialogHeader>
        {renderBody()}
      </DialogContent>
    </Dialog>
  );
};

export default ApplyDialog;
