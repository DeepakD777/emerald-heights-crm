import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// ======================================================
// GET /api/notifications
// Logged-in user ki notifications
// ======================================================

export const getNotifications = async (
    req: Request,
    res: Response
) => {
    try {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const where =
            user.userType === "ADMIN"
                ? {
                    adminId: user.id,
                }
                : {
                    employeeId: user.id,
                };

        const notifications =
            await prisma.notification.findMany({
                where,
                orderBy: {
                    createdAt: "desc",
                },
            });

        return res.json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        console.error(
            "Get notifications error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch notifications",
        });
    }
};

// ======================================================
// GET /api/notifications/unread-count
// Bell badge ke liye
// ======================================================

export const getUnreadCount = async (
    req: Request,
    res: Response
) => {
    try {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const where =
            user.userType === "ADMIN"
                ? {
                    adminId: user.id,
                    isRead: false,
                }
                : {
                    employeeId: user.id,
                    isRead: false,
                };

        const count =
            await prisma.notification.count({
                where,
            });

        return res.json({
            success: true,
            data: {
                unreadCount: count,
            },
        });
    } catch (error) {
        console.error(
            "Get unread count error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch unread count",
        });
    }
};

// ======================================================
// PUT /api/notifications/:id/read
// Single notification mark as read
// ======================================================

export const markNotificationAsRead =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const notificationId =
                String(req.params.id);

            const notification =
                await prisma.notification.findUnique({
                    where: {
                        id: notificationId,
                    },
                });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found",
                });
            }

            const ownsNotification =
                user.userType === "ADMIN"
                    ? notification.adminId === user.id
                    : notification.employeeId ===
                    user.id;

            if (!ownsNotification) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Access denied",
                });
            }

            const updated =
                await prisma.notification.update({
                    where: {
                        id: notificationId,
                    },

                    data: {
                        isRead: true,
                    },
                });

            return res.json({
                success: true,
                message:
                    "Notification marked as read",
                data: updated,
            });
        } catch (error) {
            console.error(
                "Mark notification read error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update notification",
            });
        }
    };

// ======================================================
// PUT /api/notifications/read-all
// Current user ki sari notifications read
// ======================================================

// ======================================================
// PUT /api/notifications/read-all
// Current user ki sari unread notifications read
// ======================================================

// ======================================================
// PUT /api/notifications/read-all
// Current user ki sari unread notifications read
// ======================================================

export const markAllNotificationsAsRead = async (
    req: Request,
    res: Response
) => {
    try {
        const user = (req as any).user;

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // Current user ki unread notifications nikalo
        const notifications =
            await prisma.notification.findMany({
                where:
                    user.userType === "ADMIN"
                        ? {
                            adminId: String(user.id),
                            isRead: false,
                        }
                        : {
                            employeeId: String(user.id),
                            isRead: false,
                        },

                select: {
                    id: true,
                },
            });

        // updateMany ki jagah individual updates
        await Promise.all(
            notifications.map((notification) =>
                prisma.notification.update({
                    where: {
                        id: notification.id,
                    },
                    data: {
                        isRead: true,
                    },
                })
            )
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            data: {
                updatedCount: notifications.length,
            },
        });
    } catch (error) {
        console.error(
            "Mark all notifications read error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to update notifications",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
    }
};
// ======================================================
// DELETE /api/notifications/:id
// Optional manual delete
// ======================================================

export const deleteNotification =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const user = (req as any).user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const notificationId =
                String(req.params.id);

            const notification =
                await prisma.notification.findUnique({
                    where: {
                        id: notificationId,
                    },
                });

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found",
                });
            }

            const ownsNotification =
                user.userType === "ADMIN"
                    ? notification.adminId === user.id
                    : notification.employeeId ===
                    user.id;

            if (!ownsNotification) {
                return res.status(403).json({
                    success: false,
                    message:
                        "Access denied",
                });
            }

            await prisma.notification.delete({
                where: {
                    id: notificationId,
                },
            });

            return res.json({
                success: true,
                message:
                    "Notification deleted successfully",
            });
        } catch (error) {
            console.error(
                "Delete notification error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete notification",
            });
        }
    };