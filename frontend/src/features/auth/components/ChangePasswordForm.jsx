import { toast } from "sonner";
import FormField, { FIELD_LABEL } from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "@/components/common/PasswordInput";
import SectionCard from "@/components/common/SectionCard";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useChangePasswordMutation } from "../api";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePasswordForm = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { values, errors, handleChange, setValues, setErrors, setServerErrors } = useFormState(EMPTY_FORM);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (values.newPassword !== values.confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }
    try {
      const { message } = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success(message);
      setValues(EMPTY_FORM);
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    }
  };

  const passwordField = (name, label, autoComplete, hint) => (
    <FormField labelClassName={FIELD_LABEL} label={label} htmlFor={name} error={errors[name]} hint={hint}>
      <PasswordInput
        variant="underline"
        id={name}
        name={name}
        autoComplete={autoComplete}
        value={values[name]}
        onChange={handleChange}
        aria-invalid={Boolean(errors[name])}
      />
    </FormField>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionCard
        title="Password"
        description="Changing your password signs you out on every other device."
        footer={
          <LoadingButton type="submit" loading={isLoading} disabled={!values.currentPassword || !values.newPassword}>
            Change password
          </LoadingButton>
        }
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]">
            {passwordField("currentPassword", "Current password", "current-password")}
          </div>
          {passwordField("newPassword", "New password", "new-password", "At least 8 characters, with a letter and a number.")}
          {passwordField("confirmPassword", "Confirm new password", "new-password")}
        </div>
      </SectionCard>
    </form>
  );
};

export default ChangePasswordForm;
