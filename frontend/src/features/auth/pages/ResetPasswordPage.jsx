import { ArrowRight } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import ScrambleText from "@/components/common/ScrambleText";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useResetPasswordMutation } from "../api";

const FIELD_LABEL = "type-label text-muted-foreground";

const ResetPasswordPage = () => {
  useDocumentTitle("Reset password");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { values, errors, handleChange, setErrors, setServerErrors } = useFormState({ password: "", confirmPassword: "" });
  const token = searchParams.get("token") ?? "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (values.password !== values.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      toast.success("Password updated. Log in with your new password.");
      navigate("/login", { replace: true });
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    }
  };

  if (!token) {
    return (
      <div className="max-w-3xl space-y-8">
        <h1 className="type-display">Link is incomplete.</h1>
        <p className="type-body-lg text-muted-foreground">Open the link from your email again, or request a new one.</p>
        <Link to="/forgot-password" className="type-label text-foreground underline underline-offset-4 hover:no-underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-14">
      <header className="space-y-6">
        <ScrambleText text="Almost there." className="type-label block text-muted-foreground" />
        <h1 className="type-display max-w-3xl">
          New password.
          <span className="block text-muted-foreground">Fresh start.</span>
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-10" noValidate>
        <div className="grid gap-8 sm:grid-cols-2">
          <FormField label="New password" htmlFor="password" error={errors.password} labelClassName={FIELD_LABEL} required>
            <PasswordInput
              variant="underline"
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
              autoFocus
            />
          </FormField>
          <FormField
            label="Confirm password"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
            labelClassName={FIELD_LABEL}
            required
          >
            <PasswordInput
              variant="underline"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat the password"
              value={values.confirmPassword}
              onChange={handleChange}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
          </FormField>
        </div>

        {errors.token && <p className="type-body text-destructive">{errors.token}</p>}

        <div className="flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center">
          <LoadingButton type="submit" size="xl" loading={isLoading}>
            Reset password <ArrowRight />
          </LoadingButton>
          <p className="type-label text-muted-foreground">You&apos;ll be signed out on every device.</p>
        </div>
      </form>

      <p className="type-body text-muted-foreground">
        Link expired?{" "}
        <Link to="/forgot-password" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
          Request a new one
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
