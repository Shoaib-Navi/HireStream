import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import SectionCard from "@/components/common/SectionCard";
import { Input } from "@/components/ui/input";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useUpdateMyProfileMutation } from "../api";

const LINK_FIELDS = [
  { name: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/your-name" },
  { name: "github", label: "GitHub", placeholder: "https://github.com/your-name" },
  { name: "portfolio", label: "Portfolio", placeholder: "https://your-portfolio.com" },
  { name: "website", label: "Website", placeholder: "https://…" },
];

const LinksForm = ({ profile }) => {
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();
  const { values, errors, handleChange, setServerErrors } = useFormState(
    Object.fromEntries(LINK_FIELDS.map(({ name }) => [name, profile.links?.[name] ?? ""])),
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateProfile({ links: values }).unwrap();
      toast.success("Links saved");
    } catch (error) {
      // "links.github" -> "github"
      setServerErrors({
        ...error,
        errors: (error.errors ?? []).map((item) => ({ ...item, field: item.field.replace(/^links\./, "") })),
      });
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        id="links"
        title="Links"
        description="Where recruiters can see more of your work."
        footer={
          <LoadingButton type="submit" loading={isLoading}>
            Save
          </LoadingButton>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {LINK_FIELDS.map(({ name, label, placeholder }) => (
            <FormField key={name} label={label} htmlFor={`link-${name}`} error={errors[name]}>
              <Input
                id={`link-${name}`}
                name={name}
                type="url"
                placeholder={placeholder}
                value={values[name]}
                onChange={handleChange}
                aria-invalid={Boolean(errors[name])}
              />
            </FormField>
          ))}
        </div>
      </SectionCard>
    </form>
  );
};

export default LinksForm;
