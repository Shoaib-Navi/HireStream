import { useState } from "react";
import { BellRing, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ALERT_FREQUENCIES } from "@/lib/constants";
import { getErrorMessage } from "@/lib/errors";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useDeleteJobAlertMutation, useGetJobAlertsQuery, useUpdateJobAlertMutation } from "../api";

// Each row keeps its own request state, so changing one alert doesn't disable the others
const AlertRow = ({ alert, onDelete }) => {
  const [updateAlert, { isLoading }] = useUpdateJobAlertMutation();
  const switchId = `alert-${alert._id}`;

  const update = async (changes, message) => {
    try {
      await updateAlert({ id: alert._id, ...changes }).unwrap();
      toast.success(message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className={cn("min-w-0 space-y-1 transition-opacity", !alert.isActive && "opacity-60")}>
        <h2 className="type-h4 break-words text-foreground">{alert.summary}</h2>
        <p className="type-caption text-muted-foreground">
          {alert.isActive ? `Checked ${formatRelativeTime(alert.lastCheckedAt)}` : "Paused"} · Created{" "}
          {formatRelativeTime(alert.createdAt)}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <Select
          value={alert.frequency}
          disabled={isLoading}
          onValueChange={(frequency) => update({ frequency }, `You'll get this alert ${frequency}`)}
        >
          <SelectTrigger size="sm" aria-label="How often">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {ALERT_FREQUENCIES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label htmlFor={switchId} className="type-caption flex h-8 items-center gap-2 px-2 text-muted-foreground">
          <Switch
            id={switchId}
            checked={alert.isActive}
            disabled={isLoading}
            onCheckedChange={(isActive) => update({ isActive }, isActive ? "Alert resumed" : "Alert paused")}
          />
          {alert.isActive ? "On" : "Off"}
        </label>

        <Button asChild variant="ghost" size="sm">
          <Link to={alert.link}>View jobs</Link>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          aria-label="Delete alert"
          onClick={() => onDelete(alert)}
        >
          <Trash2 />
        </Button>
      </div>
    </article>
  );
};

const JobAlertsPage = () => {
  useDocumentTitle("Job alerts");
  const { data: alerts = [], isLoading, isError, error, refetch } = useGetJobAlertsQuery();
  const [deleteAlert, { isLoading: deleting }] = useDeleteJobAlertMutation();
  const [alertToDelete, setAlertToDelete] = useState(null);

  const confirmDelete = async () => {
    try {
      await deleteAlert(alertToDelete._id).unwrap();
      toast.success("Job alert deleted");
      setAlertToDelete(null);
    } catch (apiError) {
      toast.error(getErrorMessage(apiError));
    }
  };

  const renderAlerts = () => {
    if (isLoading) {
      return (
        <div className="grid gap-3" role="status" aria-label="Loading job alerts">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      );
    }
    if (isError) return <ErrorState title="Couldn't load your job alerts" error={error} onRetry={refetch} />;
    if (alerts.length === 0) {
      return (
        <EmptyState
          icon={BellRing}
          title="No job alerts yet"
          description="Search for jobs, then choose Create alert to get new matches by email."
          action={
            <Button asChild>
              <Link to="/jobs">Find jobs</Link>
            </Button>
          }
        />
      );
    }
    return (
      <div className="grid gap-3">
        {alerts.map((alert) => (
          <AlertRow key={alert._id} alert={alert} onDelete={setAlertToDelete} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Job alerts"
        description="Saved searches. We email you and add a notification when new jobs match."
      />
      {renderAlerts()}

      <ConfirmDialog
        open={Boolean(alertToDelete)}
        onOpenChange={(open) => !open && setAlertToDelete(null)}
        title="Delete this job alert?"
        description={alertToDelete ? `You'll stop getting new jobs for ${alertToDelete.summary}.` : undefined}
        confirmLabel="Delete alert"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default JobAlertsPage;
