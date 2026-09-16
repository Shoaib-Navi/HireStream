import { useState } from "react";
import { toast } from "sonner";
import FormField, { FIELD_LABEL } from "@/components/common/FormField";
import LoadingButton from "@/components/common/LoadingButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APPLICATION_STATUS_META, RECRUITER_STATUSES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { useUpdateApplicationStatusMutation } from "../api";

// Moves an application through the pipeline with an optional message the candidate will see
const StatusUpdateForm = ({ application }) => {
  const [updateStatus, { isLoading }] = useUpdateApplicationStatusMutation();
  const [status, setStatus] = useState(RECRUITER_STATUSES.includes(application.status) ? application.status : "");
  const [note, setNote] = useState("");
  const isWithdrawn = application.status === "withdrawn";

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateStatus({ id: application._id, jobId: application.job?._id, status, note: note.trim() || undefined }).unwrap();
      toast.success(`Moved to ${APPLICATION_STATUS_META[status].label}`);
      setNote("");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isWithdrawn) {
    return <p className="type-body text-muted-foreground">The candidate withdrew this application.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField labelClassName={FIELD_LABEL} label="Status" htmlFor="application-status">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger variant="underline" id="application-status" className="w-full">
            <SelectValue placeholder="Choose a status" />
          </SelectTrigger>
          <SelectContent>
            {RECRUITER_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {APPLICATION_STATUS_META[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
      <FormField labelClassName={FIELD_LABEL} label="Message to the candidate" htmlFor="status-note" hint="Optional. Shown in their application timeline.">
        <Textarea variant="underline" id="status-note" rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
      </FormField>
      <LoadingButton type="submit" className="w-full" loading={isLoading} disabled={!status || (status === application.status && !note.trim())}>
        Update status
      </LoadingButton>
    </form>
  );
};

export default StatusUpdateForm;
