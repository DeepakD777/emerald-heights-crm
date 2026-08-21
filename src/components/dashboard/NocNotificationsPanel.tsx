import {
    AlertTriangle,
    Bell,
    Eye,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import {
    useBooking,
} from "../../context/BookingContext";

import {
    useNotifications,
} from "../../hooks/useNotifications";

import {
    buildNocNotificationItems,
} from "../../utils/nocNotificationAdapter";

// ======================================================
// Status Style
// ======================================================

const getStatusClasses = (
    status: string
) => {

    switch (
        status.toLowerCase()
    ) {

        case "approved":
            return (
                "bg-green-100 text-green-700"
            );

        case "rejected":
            return (
                "bg-red-100 text-red-700"
            );

        case "in process":
            return (
                "bg-blue-100 text-blue-700"
            );

        case "pending":
        default:
            return (
                "bg-yellow-100 text-yellow-700"
            );
    }
};

// ======================================================
// NOC Notifications Panel
// ======================================================

function NocNotificationsPanel() {

    const navigate =
        useNavigate();

    const {
        bookings,
    } =
        useBooking();

    const {
        notifications:
            backendNotifications,

        loading,
    } =
        useNotifications();

    const nocNotifications =
        buildNocNotificationItems(
            backendNotifications,
            bookings
        );

    const handleViewBooking = (
        bookingId: string
    ) => {

        if (
            !bookingId
        ) {

            alert(
                "Unable to locate this booking."
            );

            return;
        }

        navigate(
            `/bookings?bookingId=${bookingId}`
        );
    };

    return (

        <div className="rounded-2xl bg-white p-6 shadow-sm">

            {/* ==============================================
                Header
            ============================================== */}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h2 className="text-xl font-bold text-gray-800">
                        NOC Notifications
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        NOC requests that currently require administrative attention.
                    </p>

                </div>

                <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    {nocNotifications.length} Pending
                </span>

            </div>

            {/* ==============================================
                Loading
            ============================================== */}

            {loading ? (

                <div className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 text-center text-sm text-gray-500">
                    Loading NOC notifications...
                </div>

            ) : nocNotifications.length ===
                0 ? (

                /* ==========================================
                    Empty
                ========================================== */

                <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-10 text-center">

                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">

                        <Bell
                            size={24}
                            className="text-green-600"
                        />

                    </div>

                    <h3 className="font-semibold text-green-800">
                        No pending NOC alerts
                    </h3>

                    <p className="mt-1 text-sm text-green-700">
                        There are currently no NOC requests requiring attention.
                    </p>

                </div>

            ) : (

                /* ==========================================
                    List
                ========================================== */

                <div className="overflow-hidden rounded-xl border border-gray-200">

                    {/* Desktop Header */}

                    <div className="hidden grid-cols-6 gap-4 border-b bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600 md:grid">

                        <div>
                            Customer
                        </div>

                        <div>
                            Unit
                        </div>

                        <div>
                            Type
                        </div>

                        <div>
                            Status
                        </div>

                        <div>
                            Alert
                        </div>

                        <div>
                            Action
                        </div>

                    </div>

                    {/* Rows */}

                    {nocNotifications.map(
                        (
                            notification
                        ) => (

                            <div
                                key={
                                    notification.id
                                }
                                className="grid grid-cols-1 gap-4 border-b p-5 last:border-b-0 md:grid-cols-6 md:items-center"
                            >

                                {/* Customer */}

                                <div>

                                    <p className="text-xs text-gray-500 md:hidden">
                                        Customer
                                    </p>

                                    <p className="font-semibold text-gray-800">
                                        {
                                            notification.customerName
                                        }
                                    </p>

                                </div>

                                {/* Unit */}

                                <div>

                                    <p className="text-xs text-gray-500 md:hidden">
                                        Unit
                                    </p>

                                    <span className="inline-block rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-700">
                                        {
                                            notification.flatNumber
                                        }
                                    </span>

                                </div>

                                {/* Type */}

                                <div>

                                    <p className="text-xs text-gray-500 md:hidden">
                                        Type
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">

                                        <AlertTriangle
                                            size={15}
                                            className="text-orange-600"
                                        />

                                        NOC

                                    </div>

                                </div>

                                {/* Status */}

                                <div>

                                    <p className="text-xs text-gray-500 md:hidden">
                                        Status
                                    </p>

                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                            notification.status
                                        )}`}
                                    >
                                        {
                                            notification.status
                                        }
                                    </span>

                                </div>

                                {/* Message */}

                                <div className="min-w-0">

                                    <p className="text-xs text-gray-500 md:hidden">
                                        Alert
                                    </p>

                                    <p className="line-clamp-2 text-sm text-gray-600">
                                        {
                                            notification.message
                                        }
                                    </p>

                                </div>

                                {/* Action */}

                                <div>

                                    <button
                                        type="button"
                                        disabled={
                                            !notification.bookingId
                                        }
                                        onClick={() =>
                                            handleViewBooking(
                                                notification.bookingId
                                            )
                                        }
                                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                    >

                                        <Eye
                                            size={16}
                                        />

                                        View Booking

                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
}

export default NocNotificationsPanel;