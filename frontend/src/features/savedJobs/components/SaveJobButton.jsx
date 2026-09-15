import { Bookmark } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useSaveJobMutation, useUnsaveJobMutation } from "../api";

// Bookmark toggle for job seekers. Guests are sent to log in; recruiters don't see it.
const SaveJobButton = ({ job, variant = "icon", className }) => {
  const { user, isCandidate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [saveJob, { isLoading: saving }] = useSaveJobMutation();
  const [unsaveJob, { isLoading: removing }] = useUnsaveJobMutation();

  if (user && !isCandidate) return null;

  const isSaved = Boolean(job.isSaved);
  const busy = saving || removing;

  const toggle = async (event) => {
    // the button sits on top of a card that is itself a link
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    try {
      if (isSaved) {
        await unsaveJob(job._id).unwrap();
        toast.success("Removed from saved jobs");
      } else {
        await saveJob(job._id).unwrap();
        toast.success("Job saved");
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const icon = <Bookmark className={cn(isSaved && "fill-current")} />;

  if (variant === "full") {
    return (
      <Button variant="outline" className={cn("w-full", className)} onClick={toggle} disabled={busy} aria-pressed={isSaved}>
        {icon} {isSaved ? "Saved" : "Save job"}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("relative z-10", className)}
      onClick={toggle}
      disabled={busy}
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
    >
      {icon}
    </Button>
  );
};

export default SaveJobButton;
