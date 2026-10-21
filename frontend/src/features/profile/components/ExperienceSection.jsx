import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "@/hooks/useFormState";
import { ExperienceEntry } from "./ProfileEntries";
import { useUpdateMyProfileMutation } from "../api";
import EditableListSection from "./EditableListSection";

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

const ExperienceForm = ({ initialValues, errors, saving, onSubmit, onCancel }) => {
  const { values, handleChange, setField } = useFormState({
    title: initialValues?.title ?? "",
    company: initialValues?.company ?? "",
    location: initialValues?.location ?? "",
    startDate: toDateInput(initialValues?.startDate),
    endDate: toDateInput(initialValues?.endDate),
    isCurrent: initialValues?.isCurrent ?? false,
    description: initialValues?.description ?? "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...values, endDate: values.isCurrent || !values.endDate ? null : values.endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Job title" htmlFor="exp-title" error={errors.title} required>
          <Input id="exp-title" name="title" maxLength={100} value={values.title} onChange={handleChange} aria-invalid={Boolean(errors.title)} />
        </FormField>
        <FormField label="Company" htmlFor="exp-company" error={errors.company} required>
          <Input id="exp-company" name="company" maxLength={100} value={values.company} onChange={handleChange} aria-invalid={Boolean(errors.company)} />
        </FormField>
        <FormField label="Location" htmlFor="exp-location" error={errors.location} className="sm:col-span-2">
          <Input id="exp-location" name="location" maxLength={100} value={values.location} onChange={handleChange} />
        </FormField>
        <FormField label="Start date" htmlFor="exp-start" error={errors.startDate} required>
          <Input id="exp-start" name="startDate" type="date" value={values.startDate} onChange={handleChange} aria-invalid={Boolean(errors.startDate)} />
        </FormField>
        <FormField label="End date" htmlFor="exp-end" error={errors.endDate}>
          <Input id="exp-end" name="endDate" type="date" value={values.endDate} onChange={handleChange} disabled={values.isCurrent} aria-invalid={Boolean(errors.endDate)} />
        </FormField>
        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox id="exp-current" checked={values.isCurrent} onCheckedChange={(checked) => setField("isCurrent", checked === true)} />
          <Label htmlFor="exp-current" className="font-normal">
            I currently work here
          </Label>
        </div>
        <FormField label="Description" htmlFor="exp-description" error={errors.description} className="sm:col-span-2">
          <Textarea id="exp-description" name="description" rows={4} maxLength={2000} value={values.description} onChange={handleChange} />
        </FormField>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <LoadingButton type="submit" loading={saving}>
          Save
        </LoadingButton>
      </DialogFooter>
    </form>
  );
};

const ExperienceSection = ({ profile }) => {
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();

  return (
    <EditableListSection
      id="experience"
      title="Experience"
      description="Roles you've held, with the most recent first."
      addLabel="Add experience"
      emptyText="Add the roles you've held so recruiters understand your background."
      items={profile.experience ?? []}
      saving={isLoading}
      onSave={(experience) => updateProfile({ experience }).unwrap()}
      renderItem={(item) => <ExperienceEntry item={item} />}
      renderForm={({ key, ...formProps }) => <ExperienceForm key={key} {...formProps} />}
    />
  );
};

export default ExperienceSection;
