import type {
    BackendNotification,
} from "../services/notificationService";

// ======================================================
// Types
// ======================================================

interface BookingLike {
    id: string;

    bookingCode?: string;

    customerName: string;
    flatNumber: string;
}

export interface NocNotificationItem {
    id: string;

    backendNotificationId: string;

    bookingId: string;

    customerName: string;
    flatNumber: string;

    type: "noc";

    title: string;
    message: string;

    status: string;

    isRead: boolean;

    createdAt: string;
}

// ======================================================
// NOC Status
// ======================================================

const getNocNotificationStatus = (
    notification:
        BackendNotification
) => {

    const message =
        notification.message
            .toLowerCase();

    if (
        message.includes(
            "in process"
        )
    ) {
        return "in process";
    }

    if (
        message.includes(
            "approved"
        )
    ) {
        return "approved";
    }

    if (
        message.includes(
            "requires attention"
        )
    ) {
        return "rejected";
    }

    return "pending";
};

// ======================================================
// NOC Notification Adapter
// ======================================================

export function buildNocNotificationItems(
    backendNotifications:
        BackendNotification[],

    bookings:
        BookingLike[]
): NocNotificationItem[] {

    return backendNotifications
        .filter(
            (
                notification
            ) => {

                const title =
                    notification.title
                        .toLowerCase();

                const message =
                    notification.message
                        .toLowerCase();

                return (
                    title.includes(
                        "noc"
                    ) ||
                    message.includes(
                        "noc"
                    )
                );
            }
        )
        .map(
            (
                notification
            ) => {

                const matchedBooking =
                    bookings.find(
                        (
                            booking
                        ) => {

                            if (
                                !booking.bookingCode
                            ) {
                                return false;
                            }

                            return notification
                                .message
                                .includes(
                                    booking.bookingCode
                                );
                        }
                    );

                return {
                    id:
                        `noc-${notification.id}`,

                    backendNotificationId:
                        notification.id,

                    bookingId:
                        matchedBooking?.id ??
                        "",

                    customerName:
                        matchedBooking
                            ?.customerName ??
                        "-",

                    flatNumber:
                        matchedBooking
                            ?.flatNumber ??
                        "-",

                    type:
                        "noc" as const,

                    title:
                        notification.title,

                    message:
                        notification.message,

                    status:
                        getNocNotificationStatus(
                            notification
                        ),

                    isRead:
                        notification.isRead,

                    createdAt:
                        notification.createdAt,
                };
            }
        );
}