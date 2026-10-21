import { toast } from "sonner";
import CheckboxGroup from "@/components/common/CheckboxGroup";
import FormField, { FIELD_LABEL } from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import SectionCard from "@/components/common/SectionCard";
import TagInput from "@/components/common/TagInput";
import { Input } from "@/components/ui/input";
import { useFormState } from "@/hooks/useFormState";
import { EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { useUpdateMyProfileMutation } from "../api";

const PreferencesForm = ({ profile }) => {
  const [updateProfile, { isLoading }] = useUpdateMyProfileMutation();
  const preferences = profile.preferences ?? {};
  const { values, setField } = useFormState({
    employmentTypes: preferences.employmentTypes ?? [],
    workModes: preferences.workModes ?? [],
    locations: preferences.locations ?? [],
    expectedSalary: preferences.expectedSalary ?? "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateProfile({
        preferences: {
          ...values,
          expectedSalary: values.expectedSalary === "" ? null : Number(values.expectedSalary),
        },
      }).unwrap();
      toast.success("Preferences saved");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        id="preferences"
        title="Job preferences"
        description="What you're looking for next."
        footer={
          <LoadingButton type="submit" loading={isLoading}>
            Save
          </LoadingButton>
        }
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <CheckboxGroup
            legend="Job types"
            options={EMPLOYMENT_TYPES}
            value={values.employmentTypes}
            onChange={(employmentTypes) => setField("employmentTypes", employmentTypes)}
            idPrefix="pref-type"
          />
          <CheckboxGroup
            legend="Work modes"
            options={WORK_MODES}
            value={values.workModes}
            onChange={(workModes) => setField("workModes", workModes)}
            idPrefix="pref-mode"
          />
          <FormField labelClassName={FIELD_LABEL} label="Preferred locations" htmlFor="pref-locations" hint="Press Enter after each city.">
            <TagInput
              variant="underline"
              id="pref-locations"
              value={values.locations}
              onChange={(locations) => setField("locations", locations)}
              maxItems={10}
              placeholder="e.g. Pune"
            />
          </FormField>
          <FormField labelClassName={FIELD_LABEL} label="Expected salary (LPA)" htmlFor="pref-salary">
            <Input
              variant="underline"
              id="pref-salary"
              type="number"
              min={0}
              step="0.5"
              value={values.expectedSalary}
              onChange={(event) => setField("expectedSalary", event.target.value)}
            />
          </FormField>
        </div>
      </SectionCard>
    </form>
  );
};

export default PreferencesForm;
