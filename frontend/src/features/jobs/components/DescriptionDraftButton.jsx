import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import LoadingButton from "@/components/common/LoadingButton";
import { useDraftJobDescriptionMutation } from "@/features/ai/api";
import { getErrorMessage } from "@/lib/errors";

// Writes a first draft of the description, responsibilities and requirements from the basics above.
// The recruiter edits everything afterwards; nothing is saved until they submit the form.
const DescriptionDraftButton = ({ values, onDraft }) => {
  const [draftJobDescription, { isLoading }] = useDraftJobDescriptionMutation();

  const handleClick = async () => {
    if (values.title.trim().length < 3) {
      toast.error("Add a job title first");
      return;
    }

    try {
      const draft = await draftJobDescription({
        title: values.title,
        location: values.location || undefined,
        employmentType: values.employmentType,
        workMode: values.workMode,
        skills: values.skills,
        experience: { min: Number(values.experienceMin) || 0, max: values.experienceMax ? Number(values.experienceMax) : null },
      }).unwrap();

      onDraft(draft);
      toast.success("Draft ready — edit anything you'd like");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <LoadingButton type="button" variant="outline" size="sm" loading={isLoading} onClick={handleClick}>
      <Sparkles /> Write a first draft
    </LoadingButton>
  );
};

export default DescriptionDraftButton;
