import { useState } from "react";
import { BellOff, CheckCheck } from "lucide-react";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import LoadingButton from "@/components/common/LoadingButton";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import { PageLoader } from "@/components/common/Spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { cleanParams } from "@/lib/query";
import { cn } from "@/lib/utils";
import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation } from "../api";
import NotificationItem from "../components/NotificationItem";
import { useOpenNotification } from "../hooks/useOpenNotification";

const PAGE_SIZE = 20;

const NotificationsPage = () => {
  useDocumentTitle("Notifications");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, error, refetch } = useGetNotificationsQuery(
    cleanParams({ unread: filter === "unread" ? "true" : "", page, limit: PAGE_SIZE }),
  );
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const openNotification = useOpenNotification();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  const changeFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const renderList = () => {
    if (isLoading) return <PageLoader />;
    if (isError) return <ErrorState title="Couldn't load notifications" error={error} onRetry={refetch} />;
    if (notifications.length === 0) {
      return (
        <EmptyState
          icon={BellOff}
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description="Updates about your applications and jobs will show up here."
        />
      );
    }
    return (
      <ul className={cn("divide-y rounded-xl border bg-card p-2 transition-opacity", isFetching && "opacity-60")}>
        {notifications.map((notification) => (
          <li key={notification._id} className="py-1 first:pt-0 last:pb-0">
            <NotificationItem notification={notification} onOpen={openNotification} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates about applications and hiring activity."
        actions={
          unreadCount > 0 && (
            <LoadingButton variant="outline" loading={markingAll} onClick={() => markAllRead()}>
              <CheckCheck /> Mark all as read
            </LoadingButton>
          )
        }
      />

      <Tabs value={filter} onValueChange={changeFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread{unreadCount > 0 && ` (${unreadCount})`}</TabsTrigger>
        </TabsList>
      </Tabs>

      {renderList()}

      <Pagination page={page} totalPages={data?.meta?.totalPages} onPageChange={setPage} />
    </div>
  );
};

export default NotificationsPage;
