import { ApiError } from "../../utils/ApiError.js";
import { paginationMeta, toPagination } from "../../utils/pagination.js";
import { Notification } from "./notification.model.js";

export const createNotification = ({ user, type, title, body, link }) =>
  Notification.create({ user, type, title, body, link });

export const listNotifications = async (userId, query) => {
  const { page, limit, skip } = toPagination(query);
  const filter = { user: userId, ...(query.unread && { readAt: null }) };

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, readAt: null }),
  ]);

  return { notifications, meta: { ...paginationMeta({ page, limit }, total), unreadCount } };
};

export const markNotificationRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw ApiError.notFound("Notification not found");
  }
  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }
  return notification;
};

export const markAllNotificationsRead = async (userId) => {
  const { modifiedCount } = await Notification.updateMany({ user: userId, readAt: null }, { readAt: new Date() });
  return modifiedCount;
};
