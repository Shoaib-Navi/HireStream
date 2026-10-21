import { MailWarning } from "lucide-react";
import { toast } from "sonner";
import LoadingButton from "@/components/common/LoadingButton";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useResendVerificationMutation } from "../api";
import { useAuth } from "../hooks/useAuth";

// Reminds signed-in users to verify their email; renders nothing once verified
const EmailVerificationNotice = ({ className }) => {
  const { user } = useAuth();
  const [resend, { isLoading, isSuccess }] = useResendVerificationMutation();

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    try {
      const { message } = await resend().unwrap();
      toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div
      role="status"
      className={cn("flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center", className)}
    >
      <MailWarning className="size-5 shrink-0 text-warning" aria-hidden="true" />
      <p className="type-body flex-1 text-foreground">
        Please verify your email. We sent a link to <span className="font-medium">{user.email}</span>.
      </p>
      <LoadingButton variant="outline" size="sm" loading={isLoading} disabled={isSuccess} onClick={handleResend}>
        {isSuccess ? "Link sent" : "Resend link"}
      </LoadingButton>
    </div>
  );
};

export default EmailVerificationNotice;
