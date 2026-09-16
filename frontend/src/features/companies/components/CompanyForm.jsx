import { useState } from "react";
import { toast } from "sonner";
import FormField, { FIELD_LABEL } from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import SectionCard from "@/components/common/SectionCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFormState } from "@/hooks/useFormState";
import { COMPANY_SIZES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";

const NOT_SET = "not-set";

const toFormValues = (company) => ({
  name: company?.name ?? "",
  website: company?.website ?? "",
  location: company?.location ?? "",
  industry: company?.industry ?? "",
  size: company?.size ?? "",
  foundedYear: company?.foundedYear ? String(company.foundedYear) : "",
  description: company?.description ?? "",
});

const toPayload = (values) => ({
  ...values,
  size: values.size || null,
  foundedYear: values.foundedYear ? Number(values.foundedYear) : null,
});

// onSubmit(payload) should return a promise that rejects with the API error
const CompanyForm = ({ company, submitLabel, onSubmit }) => {
  const { values, errors, handleChange, setField, setServerErrors } = useFormState(toFormValues(company));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(toPayload(values));
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const textInput = (name, props = {}) => (
    <Input variant="underline" id={name} name={name} value={values[name]} onChange={handleChange} aria-invalid={Boolean(errors[name])} {...props} />
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        title="Company details"
        description="Shown to candidates next to your job posts."
        footer={
          <LoadingButton type="submit" loading={saving}>
            {submitLabel}
          </LoadingButton>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField labelClassName={FIELD_LABEL} label="Company name" htmlFor="name" error={errors.name} required className="sm:col-span-2">
            {textInput("name", { maxLength: 100, placeholder: "e.g. Acme Technologies" })}
          </FormField>
          <FormField labelClassName={FIELD_LABEL} label="Website" htmlFor="website" error={errors.website}>
            {textInput("website", { type: "url", placeholder: "https://example.com" })}
          </FormField>
          <FormField labelClassName={FIELD_LABEL} label="Location" htmlFor="location" error={errors.location}>
            {textInput("location", { maxLength: 100, placeholder: "e.g. Pune" })}
          </FormField>
          <FormField labelClassName={FIELD_LABEL} label="Industry" htmlFor="industry" error={errors.industry}>
            {textInput("industry", { maxLength: 60, placeholder: "e.g. Fintech" })}
          </FormField>
          <FormField labelClassName={FIELD_LABEL} label="Company size" htmlFor="size" error={errors.size}>
            <Select value={values.size || NOT_SET} onValueChange={(value) => setField("size", value === NOT_SET ? "" : value)}>
              <SelectTrigger variant="underline" id="size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NOT_SET}>Not specified</SelectItem>
                {COMPANY_SIZES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField labelClassName={FIELD_LABEL} label="Founded" htmlFor="foundedYear" error={errors.foundedYear}>
            {textInput("foundedYear", { type: "number", min: 1800, max: new Date().getFullYear(), placeholder: "e.g. 2015" })}
          </FormField>
          <FormField labelClassName={FIELD_LABEL} label="About the company" htmlFor="description" error={errors.description} className="sm:col-span-2">
            <Textarea
              variant="underline"
              id="description"
              name="description"
              rows={6}
              maxLength={5000}
              value={values.description}
              onChange={handleChange}
              aria-invalid={Boolean(errors.description)}
            />
          </FormField>
        </div>
      </SectionCard>
    </form>
  );
};

export default CompanyForm;
