import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useResetPasswordMutation } from "../api";

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
      <div className="space-y-4">
        <h1 className="type-h1 text-foreground">Link is incomplete</h1>
        <p className="type-body text-muted-foreground">Open the link from your email again, or request a new one.</p>
        <Link to="/forgot-password" className="type-body font-medium text-primary hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="type-h1 text-foreground">Choose a new password</h1>
        <p className="type-body text-muted-foreground">You'll be signed out of every device and can log in with the new password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField label="New password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
            autoFocus
          />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            aria-invalid={Boolean(errors.confirmPassword)}
          />
        </FormField>
        {errors.token && <p className="type-body text-destructive">{errors.token}</p>}
        <LoadingButton type="submit" size="lg" className="w-full" loading={isLoading}>
          Reset password
        </LoadingButton>
      </form>

      <p className="type-body text-center text-muted-foreground">
        Link expired?{" "}
        <Link to="/forgot-password" className="font-medium text-primary hover:underline">
          Request a new one
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
