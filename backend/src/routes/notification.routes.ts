import { Router } from "express";

import {
    getNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "../controllers/notification.controller";

import {
    authenticate,
} from "../middleware/auth.middleware";

const router = Router();

// Current logged-in user notifications
router.get(
    "/",
    authenticate,
    getNotifications
);

// Bell badge count
router.get(
    "/unread-count",
    authenticate,
    getUnreadCount
);

// Mark all as read
router.put(
    "/read-all",
    authenticate,
    markAllNotificationsAsRead
);

// Mark single as read
router.put(
    "/:id/read",
    authenticate,
    markNotificationAsRead
);

// Delete single notification
router.delete(
    "/:id",
    authenticate,
    deleteNotification
);

export default router;