import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import SectionCard from "@/components/common/SectionCard";
import TagInput from "@/components/common/TagInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useUpdateMyProfileMutation } from "../api";

const ProfileBasicsForm = ({ profile }) => {
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();
  const { values, errors, handleChange, setField, setServerErrors } = useFormState({
    headline: profile.headline ?? "",
    location: profile.location ?? "",
    experienceYears: profile.experienceYears ?? "",
    bio: profile.bio ?? "",
    skills: profile.skills ?? [],
    isOpenToWork: profile.isOpenToWork ?? true,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateProfile({
        ...values,
        experienceYears: values.experienceYears === "" ? null : Number(values.experienceYears),
      }).unwrap();
      toast.success("Profile saved");
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        title="About you"
        description="The first thing recruiters see when they open your application."
        footer={
          <LoadingButton type="submit" loading={isLoading}>
            Save
          </LoadingButton>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Headline"
            htmlFor="headline"
            error={errors.headline}
            hint="e.g. Frontend developer · React & Node.js"
            className="sm:col-span-2"
          >
            <Input id="headline" name="headline" maxLength={120} value={values.headline} onChange={handleChange} aria-invalid={Boolean(errors.headline)} />
          </FormField>
          <FormField label="Location" htmlFor="location" error={errors.location}>
            <Input id="location" name="location" maxLength={100} placeholder="e.g. Bangalore" value={values.location} onChange={handleChange} />
          </FormField>
          <FormField label="Years of experience" htmlFor="experienceYears" error={errors.experienceYears}>
            <Input id="experienceYears" name="experienceYears" type="number" min={0} max={60} value={values.experienceYears} onChange={handleChange} />
          </FormField>
          <FormField label="Bio" htmlFor="bio" error={errors.bio} className="sm:col-span-2">
            <Textarea
              id="bio"
              name="bio"
              rows={5}
              maxLength={2000}
              placeholder="A few lines about what you do and what you're looking for."
              value={values.bio}
              onChange={handleChange}
            />
          </FormField>
          <FormField label="Skills" htmlFor="skills" error={errors.skills} hint="Press Enter or comma after each skill." className="sm:col-span-2">
            <TagInput id="skills" value={values.skills} onChange={(skills) => setField("skills", skills)} maxItems={50} placeholder="e.g. React" />
          </FormField>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 sm:col-span-2">
            <div>
              <Label htmlFor="isOpenToWork">Open to work</Label>
              <p className="type-caption text-muted-foreground">Let recruiters know you're looking for new opportunities.</p>
            </div>
            <Switch id="isOpenToWork" checked={values.isOpenToWork} onCheckedChange={(checked) => setField("isOpenToWork", checked)} />
          </div>
        </div>
      </SectionCard>
    </form>
  );
};

export default ProfileBasicsForm;
