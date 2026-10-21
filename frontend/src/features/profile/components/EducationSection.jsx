import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFormState } from "@/hooks/useFormState";
import { useUpdateMyProfileMutation } from "../api";
import EditableListSection from "./EditableListSection";

const toYearOrNull = (value) => (value === "" ? null : Number(value));

const EducationForm = ({ initialValues, errors, saving, onSubmit, onCancel }) => {
  const { values, handleChange } = useFormState({
    institution: initialValues?.institution ?? "",
    degree: initialValues?.degree ?? "",
    fieldOfStudy: initialValues?.fieldOfStudy ?? "",
    startYear: initialValues?.startYear ?? "",
    endYear: initialValues?.endYear ?? "",
    grade: initialValues?.grade ?? "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...values, startYear: toYearOrNull(values.startYear), endYear: toYearOrNull(values.endYear) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Institution" htmlFor="edu-institution" error={errors.institution} required className="sm:col-span-2">
          <Input id="edu-institution" name="institution" maxLength={150} value={values.institution} onChange={handleChange} aria-invalid={Boolean(errors.institution)} />
        </FormField>
        <FormField label="Degree" htmlFor="edu-degree" error={errors.degree} required>
          <Input id="edu-degree" name="degree" maxLength={100} placeholder="e.g. B.Tech" value={values.degree} onChange={handleChange} aria-invalid={Boolean(errors.degree)} />
        </FormField>
        <FormField label="Field of study" htmlFor="edu-field" error={errors.fieldOfStudy}>
          <Input id="edu-field" name="fieldOfStudy" maxLength={100} placeholder="e.g. Computer Science" value={values.fieldOfStudy} onChange={handleChange} />
        </FormField>
        <FormField label="Start year" htmlFor="edu-start" error={errors.startYear}>
          <Input id="edu-start" name="startYear" type="number" min={1950} max={2100} value={values.startYear} onChange={handleChange} />
        </FormField>
        <FormField label="End year" htmlFor="edu-end" error={errors.endYear}>
          <Input id="edu-end" name="endYear" type="number" min={1950} max={2100} value={values.endYear} onChange={handleChange} aria-invalid={Boolean(errors.endYear)} />
        </FormField>
        <FormField label="Grade" htmlFor="edu-grade" error={errors.grade} hint="Optional, e.g. 8.4 CGPA">
          <Input id="edu-grade" name="grade" maxLength={30} value={values.grade} onChange={handleChange} />
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

const EducationSection = ({ profile }) => {
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();

  return (
    <EditableListSection
      id="education"
      title="Education"
      description="Degrees, diplomas and certifications."
      addLabel="Add education"
      emptyText="Add your education to round out your profile."
      items={profile.education ?? []}
      saving={isLoading}
      onSave={(education) => updateProfile({ education }).unwrap()}
      renderItem={(item) => (
        <>
          <p className="type-h4 text-foreground">{item.institution}</p>
          <p className="type-body text-muted-foreground">
            {item.degree}
            {item.fieldOfStudy && `, ${item.fieldOfStudy}`}
          </p>
          {(item.startYear || item.endYear) && (
            <p className="type-caption text-muted-foreground">
              {item.startYear ?? "—"} – {item.endYear ?? "Present"}
              {item.grade && ` · ${item.grade}`}
            </p>
          )}
        </>
      )}
      renderForm={({ key, ...formProps }) => <EducationForm key={key} {...formProps} />}
    />
  );
};

export default EducationSection;
