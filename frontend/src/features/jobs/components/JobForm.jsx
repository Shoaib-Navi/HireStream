import { useState } from "react";
import { toast } from "sonner";
import FormField from "@/components/common/FormField";
import LineListInput from "@/components/common/LineListInput";
import LoadingButton from "@/components/common/LoadingButton";
import SectionCard from "@/components/common/SectionCard";
import TagInput from "@/components/common/TagInput";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "@/hooks/useFormState";
import { EMPLOYMENT_TYPES, WORK_MODES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { EMPTY_JOB_FORM, toJobFormError, toJobPayload } from "../utils/jobForm";

const EDIT = "edit";

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const SelectField = ({ id, label, value, options, onChange, error, placeholder }) => (
  <FormField label={label} htmlFor={id} error={error} required>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full" aria-invalid={Boolean(error)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </FormField>
);

// Used to post a new job (publish or save as draft) and to edit an existing one.
// onSubmit(payload) should return a promise that rejects with the API error.
const JobForm = ({ companies, initialValues, isEditing = false, onSubmit }) => {
  const { values, errors, handleChange, setField, setServerErrors } = useFormState({
    ...EMPTY_JOB_FORM,
    ...initialValues,
  });
  const [submitting, setSubmitting] = useState(null);

  // action is "open" or "draft" for new jobs, "edit" when saving changes
  const submit = async (action) => {
    setSubmitting(action);
    try {
      await onSubmit(toJobPayload(values, action === EDIT ? undefined : action));
    } catch (error) {
      setServerErrors(toJobFormError(error));
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(null);
    }
  };

  const textInput = (name, props = {}) => (
    <Input id={name} name={name} value={values[name]} onChange={handleChange} aria-invalid={Boolean(errors[name])} {...props} />
  );

  const companyOptions = companies.map((company) => ({ value: company._id, label: company.name }));

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit(isEditing ? EDIT : "open");
      }}
    >
      <SectionCard title="Basics" description="Where and how the person will work.">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            id="companyId"
            label="Company"
            value={values.companyId}
            options={companyOptions}
            onChange={(value) => setField("companyId", value)}
            error={errors.companyId}
            placeholder="Choose a company"
          />
          <FormField label="Job title" htmlFor="title" error={errors.title} required>
            {textInput("title", { placeholder: "e.g. Frontend Developer", maxLength: 120 })}
          </FormField>
          <SelectField
            id="employmentType"
            label="Job type"
            value={values.employmentType}
            options={EMPLOYMENT_TYPES}
            onChange={(value) => setField("employmentType", value)}
            error={errors.employmentType}
          />
          <SelectField
            id="workMode"
            label="Work mode"
            value={values.workMode}
            options={WORK_MODES}
            onChange={(value) => setField("workMode", value)}
            error={errors.workMode}
          />
          <FormField label="Location" htmlFor="location" error={errors.location} required>
            {textInput("location", { placeholder: "e.g. Bangalore", maxLength: 100 })}
          </FormField>
          <FormField label="Openings" htmlFor="openings" error={errors.openings}>
            {textInput("openings", { type: "number", min: 1, max: 1000 })}
          </FormField>
          <FormField label="Application deadline" htmlFor="deadline" error={errors.deadline} hint="Optional">
            {textInput("deadline", { type: "date", min: todayInputValue() })}
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Experience & salary" description="Salary is annual, in lakhs per annum (LPA). Leave it empty to hide it.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Minimum experience (years)" htmlFor="experienceMin" error={errors.experienceMin}>
            {textInput("experienceMin", { type: "number", min: 0, max: 50 })}
          </FormField>
          <FormField label="Maximum experience (years)" htmlFor="experienceMax" error={errors.experienceMax} hint="Optional">
            {textInput("experienceMax", { type: "number", min: 0, max: 50 })}
          </FormField>
          <FormField label="Minimum salary (LPA)" htmlFor="salaryMin" error={errors.salaryMin}>
            {textInput("salaryMin", { type: "number", min: 0, step: "0.5" })}
          </FormField>
          <FormField label="Maximum salary (LPA)" htmlFor="salaryMax" error={errors.salaryMax}>
            {textInput("salaryMax", { type: "number", min: 0, step: "0.5" })}
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Description" description="Help candidates understand the role and whether they're a fit.">
        <div className="grid gap-5">
          <FormField label="About the role" htmlFor="description" error={errors.description} hint="At least 30 characters." required>
            <Textarea
              id="description"
              name="description"
              rows={8}
              maxLength={10000}
              value={values.description}
              onChange={handleChange}
              aria-invalid={Boolean(errors.description)}
            />
          </FormField>
          <FormField label="Responsibilities" htmlFor="responsibilities" error={errors.responsibilities} hint="One per line.">
            <LineListInput
              id="responsibilities"
              rows={4}
              value={values.responsibilities}
              onChange={(items) => setField("responsibilities", items)}
            />
          </FormField>
          <FormField label="Requirements" htmlFor="requirements" error={errors.requirements} hint="One per line.">
            <LineListInput
              id="requirements"
              rows={4}
              value={values.requirements}
              onChange={(items) => setField("requirements", items)}
            />
          </FormField>
          <FormField label="Skills" htmlFor="skills" error={errors.skills} hint="Press Enter or comma after each skill.">
            <TagInput
              id="skills"
              value={values.skills}
              onChange={(items) => setField("skills", items)}
              placeholder="e.g. React, Node.js"
              invalid={Boolean(errors.skills)}
            />
          </FormField>
        </div>
      </SectionCard>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {isEditing ? (
          <LoadingButton type="submit" loading={submitting === EDIT}>
            Save changes
          </LoadingButton>
        ) : (
          <>
            <LoadingButton
              type="button"
              variant="outline"
              loading={submitting === "draft"}
              disabled={Boolean(submitting)}
              onClick={() => submit("draft")}
            >
              Save as draft
            </LoadingButton>
            <LoadingButton type="submit" loading={submitting === "open"} disabled={Boolean(submitting)}>
              Publish job
            </LoadingButton>
          </>
        )}
      </div>
    </form>
  );
};

export default JobForm;
