import { useState } from "react";
import { Archive, Eye, MoreHorizontal, Pencil, Rocket, RotateCcw, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErrorMessage } from "@/lib/errors";
import { useDeleteJobMutation, useUpdateJobStatusMutation } from "../api";

const CONFIRMATIONS = {
  close: {
    title: "Close this job?",
    description: "It will disappear from the job board and stop accepting applications. You can reopen it later.",
    confirmLabel: "Close job",
  },
  delete: {
    title: "Delete this job?",
    description: "This permanently removes the job post. This can't be undone.",
    confirmLabel: "Delete job",
  },
};

// Edit, publish/close/reopen and delete actions for one of the recruiter's jobs
const JobActionsMenu = ({ job }) => {
  const [updateStatus, { isLoading: updating }] = useUpdateJobStatusMutation();
  const [deleteJob, { isLoading: deleting }] = useDeleteJobMutation();
  const [confirm, setConfirm] = useState(null);

  const changeStatus = async (status, successMessage) => {
    try {
      await updateStatus({ id: job._id, status }).unwrap();
      toast.success(successMessage);
      setConfirm(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteJob(job._id).unwrap();
      toast.success("Job deleted");
      setConfirm(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${job.title}`}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={`/recruiter/jobs/${job._id}/edit`}>
              <Pencil /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/jobs/${job._id}`}>
              <Eye /> View post
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {job.status === "draft" && (
            <DropdownMenuItem disabled={updating} onSelect={() => changeStatus("open", "Job published")}>
              <Rocket /> Publish
            </DropdownMenuItem>
          )}
          {job.status === "open" && (
            <DropdownMenuItem disabled={updating} onSelect={() => setConfirm("close")}>
              <Archive /> Close job
            </DropdownMenuItem>
          )}
          {job.status === "closed" && (
            <DropdownMenuItem disabled={updating} onSelect={() => changeStatus("open", "Job reopened")}>
              <RotateCcw /> Reopen
            </DropdownMenuItem>
          )}
          {job.applicationCount === 0 && (
            <DropdownMenuItem variant="destructive" onSelect={() => setConfirm("delete")}>
              <Trash2 /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        {...CONFIRMATIONS[confirm ?? "close"]}
        destructive={confirm === "delete"}
        loading={updating || deleting}
        onConfirm={confirm === "delete" ? handleDelete : () => changeStatus("closed", "Job closed")}
      />
    </>
  );
};

export default JobActionsMenu;
