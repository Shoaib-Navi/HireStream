import { ArrowRight } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import ScrambleText from "@/components/common/ScrambleText";
import { Input } from "@/components/ui/input";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { ROLES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useRegisterMutation } from "../api";

const FIELD_LABEL = "type-label text-muted-foreground";

const ROLE_OPTIONS = [
  { value: ROLES.CANDIDATE, label: "I'm looking for a job" },
  { value: ROLES.RECRUITER, label: "I'm hiring" },
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
    <FormField label={label} htmlFor={name} error={errors[name]} labelClassName={FIELD_LABEL} required>
      <Input
        variant="underline"
        id={name}
        name={name}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
        {...props}
      />
    </FormField>
  );

  return (
    <div className="space-y-14">
      <header className="space-y-6">
        <ScrambleText text="Free to join. Takes a minute." className="type-label block text-muted-foreground" />
        <h1 className="type-display max-w-3xl">
          Got ambition?
          <span className="block text-muted-foreground">Let&apos;s start.</span>
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-10" noValidate>
        <div className="space-y-4">
          <p className="type-label text-muted-foreground">I am here to</p>
          <div role="radiogroup" aria-label="Account type" className="flex flex-wrap gap-3">
            {ROLE_OPTIONS.map(({ value, label }) => {
              const selected = values.role === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setField("role", value)}
                  className={cn(
                    "type-label rounded-md border px-5 py-3.5 transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:border-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {textField("fullName", "Your name", { autoComplete: "name", maxLength: 100, placeholder: "Enter your name" })}
          {textField("email", "Your email", { type: "email", autoComplete: "email", placeholder: "Enter your email" })}
          {textField("phone", "Your phone", { type: "tel", autoComplete: "tel", placeholder: "+91 98765 43210" })}
          <FormField label="Password" htmlFor="password" error={errors.password} labelClassName={FIELD_LABEL} required>
            <PasswordInput
              variant="underline"
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={values.password}
              onChange={handleChange}
              aria-invalid={Boolean(errors.password)}
            />
          </FormField>
        </div>

        <div className="flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center">
          <LoadingButton type="submit" size="xl" loading={isLoading}>
            Create account <ArrowRight />
          </LoadingButton>
          <p className="type-label text-muted-foreground">
            Your password needs a letter and a number.
          </p>
        </div>
      </form>

      <p className="type-body text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" state={location.state} className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
