import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useLoginMutation } from "../api";

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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="type-h1 text-foreground">Welcome back</h1>
        <p className="type-body text-muted-foreground">Log in to continue to HireStream.</p>
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
        <FormField label="Password" htmlFor="password" error={errors.password}>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
          />
        </FormField>
        <LoadingButton type="submit" size="lg" className="w-full" loading={isLoading}>
          Log in
        </LoadingButton>
      </form>

      <p className="type-body text-center text-muted-foreground">
        New to HireStream?{" "}
        <Link to="/register" state={location.state} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
