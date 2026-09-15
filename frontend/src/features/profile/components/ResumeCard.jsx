import { useState } from "react";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import FileUpload from "@/components/common/FileUpload";
import SectionCard from "@/components/common/SectionCard";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { useRemoveResumeMutation, useUploadResumeMutation } from "../api";

const ResumeCard = ({ profile }) => {
  const [uploadResume, { isLoading: uploading }] = useUploadResumeMutation();
  const [removeResume, { isLoading: removing }] = useRemoveResumeMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const resume = profile.resume;

  const handleUpload = async (file) => {
    try {
      await uploadResume(file).unwrap();
      toast.success("Resume uploaded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRemove = async () => {
    try {
      await removeResume().unwrap();
      toast.success("Resume removed");
      setConfirmOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <SectionCard id="resume" title="Resume" description="PDF, up to 5 MB. It's attached to every application you send.">
      {resume?.url ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <FileText className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="type-body truncate font-medium text-foreground">{resume.originalName || "Resume"}</p>
              {resume.uploadedAt && <p className="type-caption text-muted-foreground">Uploaded {formatDate(resume.uploadedAt)}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href={resume.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> View
              </a>
            </Button>
            <FileUpload accept="application/pdf" onSelect={handleUpload} loading={uploading} label="Replace" />
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="type-body text-muted-foreground">You need a resume before you can apply to jobs.</p>
          <FileUpload accept="application/pdf" onSelect={handleUpload} loading={uploading} label="Upload resume" variant="default" />
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove your resume?"
        description="Applications you've already sent keep their copy. You'll need a resume to apply to new jobs."
        confirmLabel="Remove"
        destructive
        loading={removing}
        onConfirm={handleRemove}
      />
    </SectionCard>
  );
};

export default ResumeCard;
