import { BellPlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { cleanParams } from "@/lib/query";
import { useCreateJobAlertMutation } from "../api";

const ALERTS_PATH = "/dashboard/alerts";

// Saves the current job search as an alert. Guests are sent to log in; recruiters don't see it.
const CreateAlertButton = ({ filters, className }) => {
  const { user, isCandidate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [createAlert, { isLoading }] = useCreateJobAlertMutation();

  if (user && !isCandidate) return null;

  const create = async () => {
    if (!user) {
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    const { q, location: place, employmentType, workMode, experience, salaryMin } = filters;
    try {
      await createAlert({ criteria: cleanParams({ q, location: place, employmentType, workMode, experience, salaryMin }) }).unwrap();
      toast.success("Job alert created", {
        description: "We'll email you new jobs for this search every day.",
        action: { label: "Manage", onClick: () => navigate(ALERTS_PATH) },
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Button variant="outline" size="sm" className={className} onClick={create} disabled={isLoading}>
      <BellPlus /> Create alert
    </Button>
  );
};

export default CreateAlertButton;
