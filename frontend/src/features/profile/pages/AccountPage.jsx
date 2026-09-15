import { toast } from "sonner";
import FileUpload from "@/components/common/FileUpload";
import FormField from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import PageHeader from "@/components/common/PageHeader";
import SectionCard from "@/components/common/SectionCard";
import UserAvatar from "@/components/common/UserAvatar";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormState } from "@/hooks/useFormState";
import { getErrorMessage } from "@/lib/errors";
import { useUpdateAccountMutation, useUploadAvatarMutation } from "../api";

// Account settings shared by candidates and recruiters
const AccountPage = () => {
  useDocumentTitle("Account");
  const { user } = useAuth();
  const [updateAccount, { isLoading: saving }] = useUpdateAccountMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const { values, errors, handleChange, setServerErrors } = useFormState({
    fullName: user.fullName,
    phone: user.phone ?? "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateAccount({ fullName: values.fullName, ...(values.phone && { phone: values.phone }) }).unwrap();
      toast.success("Account updated");
    } catch (error) {
      setServerErrors(error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      await uploadAvatar(file).unwrap();
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Account" description="Your personal details and profile photo." />

      <SectionCard title="Profile photo" description="A clear photo helps recruiters and candidates recognize you.">
        <div className="flex flex-wrap items-center gap-5">
          <UserAvatar user={user} size="xl" />
          <FileUpload
            accept="image/png,image/jpeg,image/webp,image/gif"
            onSelect={handleAvatarUpload}
            loading={uploading}
            label={user.avatar?.url ? "Change photo" : "Upload photo"}
            hint="PNG, JPG or WEBP, up to 5 MB."
          />
        </div>
      </SectionCard>

      <form onSubmit={handleSubmit} noValidate>
        <SectionCard
          title="Personal details"
          footer={
            <LoadingButton type="submit" loading={saving}>
              Save changes
            </LoadingButton>
          }
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Full name" htmlFor="fullName" error={errors.fullName} required>
              <Input id="fullName" name="fullName" autoComplete="name" maxLength={100} value={values.fullName} onChange={handleChange} aria-invalid={Boolean(errors.fullName)} />
            </FormField>
            <FormField label="Phone" htmlFor="phone" error={errors.phone}>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" value={values.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} />
            </FormField>
            <FormField label="Email" htmlFor="email" hint="Your email is used to sign in and can't be changed here." className="sm:col-span-2">
              <Input id="email" value={user.email} disabled />
            </FormField>
          </div>
        </SectionCard>
      </form>
    </div>
  );
};

export default AccountPage;
