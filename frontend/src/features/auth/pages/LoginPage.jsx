import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import ScrambleText from "@/components/common/ScrambleText";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useLoginMutation } from "../api";

const FIELD_LABEL = "type-label text-muted-foreground";

// After a successful login, AuthLayout redirects to where the user came from or their dashboard
const LoginPage = () => {
  useDocumentTitle("Log in");
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const { values, errors, handleChange, setServerErrors } = useFormState({ email: "", password: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { user } = await login(values).unwrap();
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-14">
      <header className="space-y-6">
        <ScrambleText text="One profile. Every application." className="type-label block text-muted-foreground" />
        <h1 className="type-display max-w-3xl">
          Welcome back.
          <span className="block text-muted-foreground">Let&apos;s get to work.</span>
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-10" noValidate>
        <div className="grid gap-8 sm:grid-cols-2">
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
          <FormField label="Your password" htmlFor="password" error={errors.password} labelClassName={FIELD_LABEL} required>
            <PasswordInput
              variant="underline"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center">
          <LoadingButton type="submit" size="xl" loading={isLoading}>
            Log in <ArrowRight />
          </LoadingButton>
          <p className="type-label text-muted-foreground">
            Forgot your password?{" "}
            <Link to="/forgot-password" className="text-foreground underline underline-offset-4 hover:no-underline">
              Reset it
            </Link>
          </p>
        </div>
      </form>

      <p className="type-body text-muted-foreground">
        New to HireStream?{" "}
        <Link to="/register" state={location.state} className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
