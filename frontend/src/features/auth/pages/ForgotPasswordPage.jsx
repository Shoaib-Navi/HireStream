import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import ScrambleText from "@/components/common/ScrambleText";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useForgotPasswordMutation } from "../api";

const FIELD_LABEL = "type-label text-muted-foreground";

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
    <Link
      to="/login"
      className="type-label inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-3.5" /> Back to log in
    </Link>
  );

  if (isSuccess) {
    return (
      <div className="max-w-3xl space-y-10">
        <header className="space-y-6">
          <MailCheck className="size-8 text-primary" aria-hidden="true" />
          <h1 className="type-display">Check your email.</h1>
          <p className="type-body-lg max-w-xl text-muted-foreground">
            If an account exists for <span className="text-foreground">{values.email}</span>, we&apos;ve sent a link to
            reset your password. It expires in 30 minutes.
          </p>
        </header>
        {backToLogin}
      </div>
    );
  }

  return (
    <div className="space-y-14">
      <header className="space-y-6">
        <ScrambleText text="Happens to everyone." className="type-label block text-muted-foreground" />
        <h1 className="type-display max-w-3xl">
          Forgot it?
          <span className="block text-muted-foreground">We&apos;ll fix that.</span>
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-10" noValidate>
        <div className="grid gap-8 sm:max-w-md">
          <FormField label="Your email" htmlFor="email" error={errors.email} labelClassName={FIELD_LABEL} required>
            <Input
              variant="underline"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={values.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              autoFocus
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center">
          <LoadingButton type="submit" size="xl" loading={isLoading}>
            Send reset link <ArrowRight />
          </LoadingButton>
          <p className="type-label text-muted-foreground">We&apos;ll email you a link that works once.</p>
        </div>
      </form>

      {backToLogin}
    </div>
  );
};

export default ForgotPasswordPage;
