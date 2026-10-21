import { Building2, UserRound } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { ROLES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useRegisterMutation } from "../api";

const ROLE_OPTIONS = [
  { value: ROLES.CANDIDATE, title: "I'm looking for a job", description: "Build a profile and apply to jobs.", icon: UserRound },
  { value: ROLES.RECRUITER, title: "I'm hiring", description: "Post jobs and manage applicants.", icon: Building2 },
];

// After signing up the user is logged in, and AuthLayout redirects to their dashboard
const RegisterPage = () => {
  useDocumentTitle("Create an account");
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [register, { isLoading }] = useRegisterMutation();
  const { values, errors, handleChange, setField, setServerErrors } = useFormState({
    role: searchParams.get("role") === ROLES.RECRUITER ? ROLES.RECRUITER : ROLES.CANDIDATE,
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(values).unwrap();
      toast.success("Your account is ready!");
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    }
  };

  const textField = (name, label, props) => (
    <FormField label={label} htmlFor={name} error={errors[name]}>
      <Input id={name} name={name} value={values[name]} onChange={handleChange} aria-invalid={Boolean(errors[name])} {...props} />
    </FormField>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="type-h1 text-foreground">Create your account</h1>
        <p className="type-body text-muted-foreground">It's free and takes less than a minute.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div role="radiogroup" aria-label="Account type" className="grid gap-3 sm:grid-cols-2">
          {ROLE_OPTIONS.map(({ value, title, description, icon: Icon }) => {
            const selected = values.role === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setField("role", value)}
                className={cn(
                  "flex flex-col items-start gap-1.5 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected && "border-primary bg-primary-soft ring-1 ring-primary",
                )}
              >
                <Icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")} aria-hidden="true" />
                <span className="font-semibold text-foreground">{title}</span>
                <span className="type-caption text-muted-foreground">{description}</span>
              </button>
            );
          })}
        </div>

        {textField("fullName", "Full name", { autoComplete: "name", maxLength: 100 })}
        {textField("email", "Email", { type: "email", autoComplete: "email", placeholder: "you@example.com" })}
        {textField("phone", "Phone", { type: "tel", autoComplete: "tel", placeholder: "+91 98765 43210" })}
        <FormField label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters, with a letter and a number.">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            aria-invalid={Boolean(errors.password)}
          />
        </FormField>

        <LoadingButton type="submit" size="lg" className="w-full" loading={isLoading}>
          Create account
        </LoadingButton>
      </form>

      <p className="type-body text-center text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" state={location.state} className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
