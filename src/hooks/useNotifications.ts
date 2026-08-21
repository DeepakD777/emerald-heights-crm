import {
    useCallback,
    useEffect,
    useState,
} from "react";

import type {
    BackendNotification,
} from "../services/notificationService";

import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "../services/notificationService";

// ======================================================
// Hook
// ======================================================

export function useNotifications() {

    const [
        notifications,
        setNotifications,
    ] =
        useState<
            BackendNotification[]
        >([]);

    const [
        loading,
        setLoading,
    ] =
        useState(true);

    // ==================================================
    // Load Notifications
    // ==================================================

    const refreshNotifications =
        useCallback(
            async () => {

                try {

                    const data =
                        await getNotifications();

                    setNotifications(
                        data
                    );

                } catch (
                error
                ) {

                    console.error(
                        "Load notifications error:",
                        error
                    );

                } finally {

                    setLoading(
                        false
                    );
                }
            },
            []
        );

    // ==================================================
    // Initial Load + Auto Refresh
    // ==================================================

    useEffect(
        () => {

            void refreshNotifications();

            const interval =
                window.setInterval(
                    () => {

                        void refreshNotifications();

                    },
                    5000
                );

            return () => {

                window.clearInterval(
                    interval
                );
            };

        },
        [
            refreshNotifications,
        ]
    );

    // ==================================================
    // Unread Count
    // ==================================================

    const unreadCount =
        notifications.filter(
            (
                notification
            ) =>
                !notification.isRead
        ).length;

    // ==================================================
    // Mark One Read
    // ==================================================

    const markAsRead =
        async (
            notificationId:
                string
        ) => {

            await markNotificationAsRead(
                notificationId
            );

            await refreshNotifications();
        };

    // ==================================================
    // Mark All Read
    // ==================================================

    const markAllAsRead =
        async () => {

            await markAllNotificationsAsRead();

            await refreshNotifications();
        };

    // ==================================================
    // Return
    // ==================================================

    return {
        notifications,
        unreadCount,
        loading,

        refreshNotifications,
        markAsRead,
        markAllAsRead,
    };
}