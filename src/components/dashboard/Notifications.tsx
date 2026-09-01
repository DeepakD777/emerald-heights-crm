import { AlertTriangle, Bell, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useBooking } from "../../context/BookingContext";
import NocNotificationsPanel from "./NocNotificationsPanel"

function Notifications() {

    const navigate = useNavigate();

    const { bookings } = useBooking();

    // Agreement to Sell jo abhi customer ko given nahi hua
    const pendingAgreementBookings =
        bookings.filter((booking) => {

            const status =
                booking.documents
                    ?.agreementToSell
                    ?.status;

            return status !== "given";

        });

    const handleViewBooking = (
        bookingId: string
    ) => {

        navigate(
            `/bookings?bookingId=${bookingId}`
        );

    };

    return (

        <div className="space-y-6">

            {/* ==================================================
                Page Header
            ================================================== */}

            <div
                className="
                    rounded-2xl
                    bg-white
                    dark:bg-gray-900
                    p-6
                    shadow-sm
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div>

                        <h1
                            className="
                                text-3xl
                                font-bold
                                text-gray-800
                                dark:text-gray-100
                            "
                        >
                            Notifications
                        </h1>

                        <p
                            className="
                                mt-1
                                text-gray-500
                                dark:text-gray-400
                            "
                        >
                            Important pending actions and document alerts
                        </p>

                    </div>

                    <div
                        className="
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-full
                            bg-green-100
                            dark:bg-green-950/60
                        "
                    >

                        <Bell
                            size={24}
                            className="text-green-700 dark:text-green-300"
                        />

                    </div>

                </div>

            </div>

            {/* ==================================================
                Pending Agreement Section
            ================================================== */}

            <div
                className="
                    rounded-2xl
                    bg-white
                    dark:bg-gray-900
                    p-6
                    shadow-sm
                "
            >

                <div
                    className="
                        mb-6
                        flex
                        items-center
                        justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-gray-800
                                dark:text-gray-100
                            "
                        >
                            Pending Agreement to Sell
                        </h2>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-gray-500
                                dark:text-gray-400
                            "
                        >
                            Agreements that have not yet been marked as given to the customer.
                        </p>

                    </div>

                    <span
                        className="
                            rounded-full
                            bg-red-100
                            dark:bg-red-950/60
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-red-700
                            dark:text-red-300
                        "
                    >
                        {pendingAgreementBookings.length} Pending
                    </span>

                </div>

                {/* ==================================================
                    No Pending Notifications
                ================================================== */}

                {pendingAgreementBookings.length === 0 ? (

                    <div
                        className="
                            rounded-xl
                            border
                            border-green-200
                            bg-green-50
                            dark:border-green-900
                            dark:bg-green-950/40
                            px-6
                            py-10
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                mb-3
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-full
                                bg-green-100
                                dark:bg-green-950/60
                            "
                        >

                            <Bell
                                size={24}
                                className="text-green-600 dark:text-green-400"
                            />

                        </div>

                        <h3
                            className="
                                font-semibold
                                text-green-800
                                dark:text-green-300
                            "
                        >
                            All caught up
                        </h3>

                        <p
                            className="
                                mt-1
                                text-sm
                                text-green-700
                                dark:text-green-400
                            "
                        >
                            There are no pending Agreement to Sell documents.
                        </p>

                    </div>

                ) : (

                    /* ==================================================
                        Notification List
                    ================================================== */

                    <div
                        className="
                            overflow-hidden
                            rounded-xl
                            border
                            border-gray-200
                            dark:border-gray-700
                        "
                    >

                        {/* Table Header */}

                        <div
                            className="
                                hidden
                                grid-cols-6
                                gap-4
                                border-b
                                border-gray-200
                                bg-gray-50
                                dark:border-gray-700
                                dark:bg-gray-950/70
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-gray-600
                                dark:text-gray-300
                                md:grid
                            "
                        >

                            <div>
                                Customer
                            </div>

                            <div>
                                Flat
                            </div>

                            <div>
                                Mobile
                            </div>

                            <div>
                                Booking Amount
                            </div>

                            <div>
                                Status
                            </div>

                            <div>
                                Action
                            </div>

                        </div>

                        {/* Notification Rows */}

                        {pendingAgreementBookings.map(
                            (booking) => {

                                const agreementStatus =
                                    booking.documents
                                        ?.agreementToSell
                                        ?.status ||
                                    "pending";

                                return (

                                    <div
                                        key={booking.id}
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-4
                                            border-b
                                            border-gray-200
                                            dark:border-gray-800
                                            p-5
                                            last:border-b-0
                                            dark:hover:bg-gray-800/40
                                            md:grid-cols-6
                                            md:items-center
                                        "
                                    >

                                        {/* Customer */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                    dark:text-gray-400
                                                    md:hidden
                                                "
                                            >
                                                Customer
                                            </p>

                                            <p
                                                className="
                                                    font-semibold
                                                    text-gray-800
                                                    dark:text-gray-100
                                                "
                                            >
                                                {booking.customerName}
                                            </p>

                                        </div>

                                        {/* Flat */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                    dark:text-gray-400
                                                    md:hidden
                                                "
                                            >
                                                Flat
                                            </p>

                                            <span
                                                className="
                                                    inline-block
                                                    rounded-md
                                                    bg-green-100
                                                    dark:bg-green-950/60
                                                    px-2
                                                    py-1
                                                    text-sm
                                                    font-medium
                                                    text-green-700
                                                    dark:text-green-300
                                                "
                                            >
                                                {booking.flatNumber}
                                            </span>

                                        </div>

                                        {/* Mobile */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                    dark:text-gray-400
                                                    md:hidden
                                                "
                                            >
                                                Mobile
                                            </p>

                                            <p
                                                className="
                                                    text-sm
                                                    text-gray-700
                                                    dark:text-gray-300
                                                "
                                            >
                                                {booking.mobile || "-"}
                                            </p>

                                        </div>

                                        {/* Booking Amount */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                    dark:text-gray-400
                                                    md:hidden
                                                "
                                            >
                                                Booking Amount
                                            </p>

                                            <p
                                                className="
                                                    font-semibold
                                                    text-green-700
                                                    dark:text-green-300
                                                "
                                            >
                                                ₹{" "}
                                                {booking.bookingAmount || "0"}
                                            </p>

                                        </div>

                                        {/* Status */}

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-500
                                                    dark:text-gray-400
                                                    md:hidden
                                                "
                                            >
                                                Status
                                            </p>

                                            <span
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-1
                                                    rounded-full
                                                    bg-yellow-100
                                                    dark:bg-yellow-950/60
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    capitalize
                                                    text-yellow-700
                                                    dark:text-yellow-300
                                                "
                                            >

                                                <AlertTriangle
                                                    size={13}
                                                />

                                                {agreementStatus}

                                            </span>

                                        </div>

                                        {/* Action */}

                                        <div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleViewBooking(
                                                        booking.id
                                                    )
                                                }
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                    rounded-lg
                                                    bg-green-600
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    font-medium
                                                    text-white
                                                    hover:bg-green-700
                                                "
                                            >

                                                <Eye
                                                    size={16}
                                                />

                                                View Booking

                                            </button>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>
            <NocNotificationsPanel />
        </div>

    );
}

export default Notifications;