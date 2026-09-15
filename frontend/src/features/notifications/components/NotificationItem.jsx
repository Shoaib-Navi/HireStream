import { Link } from "react-router-dom";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

// One notification row, used in the navbar menu and on the notifications page
const NotificationItem = ({ notification, onOpen, compact = false, className }) => {
  const isUnread = !notification.readAt;

  const content = (
    <>
      <span
        className={cn("mt-2 size-2 shrink-0 rounded-full", isUnread ? "bg-primary" : "bg-transparent")}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className={cn("type-body block text-foreground", isUnread && "font-medium", compact && "line-clamp-2")}>
          {notification.title}
        </span>
        {notification.body && (
          <span className={cn("type-body mt-0.5 block text-muted-foreground", compact ? "line-clamp-1" : "whitespace-pre-line")}>
            {notification.body}
          </span>
        )}
        <span className="type-caption mt-1 block text-muted-foreground">
          {formatRelativeTime(notification.createdAt)}
          {isUnread && <span className="sr-only"> · unread</span>}
        </span>
      </span>
    </>
  );

  const classes = cn("flex w-full gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-accent", className);

  return notification.link ? (
    <Link to={notification.link} onClick={() => onOpen?.(notification)} className={classes}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={() => onOpen?.(notification)} className={classes}>
      {content}
    </button>
  );
};

export default NotificationItem;
