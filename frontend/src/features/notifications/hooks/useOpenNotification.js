import { useCallback } from "react";
import { useMarkNotificationReadMutation } from "../api";

// Marks a notification as read when it's opened
export const useOpenNotification = () => {
  const [markRead] = useMarkNotificationReadMutation();

  return useCallback(
    (notification) => {
      if (!notification.readAt) markRead(notification._id);
    },
    [markRead],
  );
};
