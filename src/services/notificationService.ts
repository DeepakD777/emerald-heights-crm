import {
    apiRequest,
} from "./api";

// ======================================================
// Types
// ======================================================

export interface BackendNotification {
    id: string;

    title: string;
    message: string;

    isRead: boolean;

    adminId?: string | null;
    employeeId?: string | null;

    createdAt: string;
}

interface NotificationsResponse {
    success: boolean;

    data:
        BackendNotification[];
}

interface UnreadCountResponse {
    success: boolean;

    data: {
        unreadCount: number;
    };
}

interface NotificationMutationResponse {
    success: boolean;

    message: string;

    data?: unknown;
}

// ======================================================
// Get Current User Notifications
// ======================================================

export async function getNotifications() {

    const response =
        await apiRequest<NotificationsResponse>(
            "/notifications"
        );

    return response.data;
}

// ======================================================
// Get Unread Count
// ======================================================

export async function getUnreadNotificationCount() {

    const response =
        await apiRequest<UnreadCountResponse>(
            "/notifications/unread-count"
        );

    return (
        response.data
            ?.unreadCount ?? 0
    );
}

// ======================================================
// Mark One As Read
// ======================================================

export async function markNotificationAsRead(
    notificationId: string
) {

    return apiRequest<NotificationMutationResponse>(
        `/notifications/${notificationId}/read`,
        {
            method: "PUT",
        }
    );
}

// ======================================================
// Mark All As Read
// ======================================================

export async function markAllNotificationsAsRead() {

    return apiRequest<NotificationMutationResponse>(
        "/notifications/read-all",
        {
            method: "PUT",
        }
    );
}

// ======================================================
// Delete Notification
// ======================================================

export async function deleteNotification(
    notificationId: string
) {

    return apiRequest<NotificationMutationResponse>(
        `/notifications/${notificationId}`,
        {
            method: "DELETE",
        }
    );
}