import { ArrowLeft, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useForgotPasswordMutation } from "../api";

const ForgotPasswordPage = () => {
  useDocumentTitle("Forgot password");
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();
  const { values, errors, handleChange, setServerErrors } = useFormState({ email: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await forgotPassword(values).unwrap();
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    }
  };

  const backToLogin = (
    <Link to="/login" className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-3.5" /> Back to log in
    </Link>
  );

  if (isSuccess) {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex size-12 items-center justify-center rounded-md border bg-surface text-foreground">
            <MailCheck className="size-5" aria-hidden="true" />
          </div>
          <h1 className="type-h1 text-foreground">Check your email</h1>
          <p className="type-body text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{values.email}</span>, we've sent a link to
            reset your password. The link expires in 30 minutes.
          </p>
        </div>
        {backToLogin}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="type-h1 text-foreground">Forgot your password?</h1>
        <p className="type-body text-muted-foreground">Enter the email you signed up with and we'll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            aria-invalid={Boolean(errors.email)}
            autoFocus
          />
        </FormField>
        <LoadingButton type="submit" size="lg" className="w-full" loading={isLoading}>
          Send reset link
        </LoadingButton>
      </form>

      {backToLogin}
    </div>
  );
};

export default ForgotPasswordPage;
