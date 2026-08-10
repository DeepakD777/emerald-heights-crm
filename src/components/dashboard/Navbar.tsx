import {
    Bell,
    Menu,
    Search,
    AlertTriangle,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useBooking } from "../../context/BookingContext";

interface NavbarProps {
    onMenuClick?: () => void;
}

function Navbar({
    onMenuClick,
}: NavbarProps) {

    const navigate = useNavigate();

    const { bookings } = useBooking();

    const [
        isNotificationsOpen,
        setIsNotificationsOpen,
    ] = useState(false);

    // ======================================================
    // Pending Agreement To Sell
    // ======================================================
    // Agreement is considered pending until it is
    // explicitly marked as "given".
    // ======================================================

    const pendingAgreementBookings =
        bookings.filter((booking) => {

            const status =
                booking.documents
                    ?.agreementToSell
                    ?.status;

            return status !== "given";

        });

    const notificationCount =
        pendingAgreementBookings.length;

    // ======================================================
    // View Booking
    // ======================================================

    const handleViewBooking = (
        bookingId: string
    ) => {

        console.log(
            "Opening booking:",
            bookingId
        );

        setIsNotificationsOpen(
            false
        );

        navigate("/bookings");

    };

    // ======================================================
    // Toggle Notifications
    // ======================================================

    const handleNotificationClick = () => {

        setIsNotificationsOpen(
            (previous) => !previous
        );

    };

    // ======================================================
    // Component
    // ======================================================

    return (

        <header
            className="
                relative
                z-[100]
                flex
                h-20
                items-center
                justify-between
                border-b
                bg-white
                px-4
                sm:px-6
            "
        >

            {/* ==================================================
                LEFT SECTION
            ================================================== */}

            <div className="flex items-center gap-3">

                {/* Mobile Menu */}

                <button
                    type="button"
                    onClick={onMenuClick}
                    className="
                        rounded-lg
                        p-2
                        text-gray-700
                        hover:bg-gray-100
                        lg:hidden
                    "
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                {/* Brand */}

                <div>

                    <h1
                        className="
                            text-lg
                            font-bold
                            text-gray-800
                            sm:text-2xl
                        "
                    >
                        Emerald Heights CRM
                    </h1>

                    <p
                        className="
                            hidden
                            text-sm
                            text-gray-500
                            sm:block
                        "
                    >
                        Inventory Management System
                    </p>

                </div>

            </div>

            {/* ==================================================
                RIGHT SECTION
            ================================================== */}

            <div
                className="
                    flex
                    items-center
                    gap-2
                    sm:gap-5
                "
            >

                {/* ==================================================
                    SEARCH
                ================================================== */}

                <div
                    className="
                        hidden
                        items-center
                        rounded-lg
                        bg-gray-100
                        px-3
                        py-2
                        md:flex
                    "
                >

                    <Search
                        size={18}
                        className="text-gray-500"
                    />

                    <input
                        type="text"
                        placeholder="Search..."
                        className="
                            ml-2
                            w-40
                            bg-transparent
                            text-sm
                            outline-none
                            lg:w-52
                        "
                    />

                </div>

                {/* ==================================================
                    NOTIFICATIONS
                ================================================== */}

                <div className="relative">

                    {/* Notification Button */}

                    <button
                        type="button"
                        onClick={
                            handleNotificationClick
                        }
                        className="
                            relative
                            z-[110]
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-lg
                            hover:bg-gray-100
                        "
                        aria-label="Notifications"
                        aria-expanded={
                            isNotificationsOpen
                        }
                    >

                        <Bell
                            size={22}
                            className="text-gray-700"
                        />

                        {/* Notification Count */}

                        {notificationCount > 0 && (

                            <span
                                className="
                                    absolute
                                    -right-1
                                    -top-1
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-500
                                    px-1
                                    text-[10px]
                                    font-bold
                                    text-white
                                "
                            >
                                {notificationCount}
                            </span>

                        )}

                    </button>

                    {/* ==================================================
                        NOTIFICATION DROPDOWN
                    ================================================== */}

                    {isNotificationsOpen && (

                        <div
                            className="
                                fixed
                                right-4
                                top-[72px]
                                z-[9999]
                                w-[360px]
                                max-w-[calc(100vw-32px)]
                                overflow-hidden
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                shadow-2xl
                            "
                        >

                            {/* ==================================================
                                HEADER
                            ================================================== */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    px-4
                                    py-3
                                "
                            >

                                <div>

                                    <h3
                                        className="
                                            font-semibold
                                            text-gray-800
                                        "
                                    >
                                        Notifications
                                    </h3>

                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                        "
                                    >
                                        {notificationCount}{" "}
                                        pending item
                                        {notificationCount !== 1
                                            ? "s"
                                            : ""}
                                    </p>

                                </div>

                                <Bell
                                    size={18}
                                    className="text-gray-500"
                                />

                            </div>

                            {/* ==================================================
                                NO NOTIFICATIONS
                            ================================================== */}

                            {notificationCount === 0 ? (

                                <div
                                    className="
                                        px-4
                                        py-8
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
                                        "
                                    >

                                        <Bell
                                            size={22}
                                            className="text-green-600"
                                        />

                                    </div>

                                    <p
                                        className="
                                            font-medium
                                            text-gray-700
                                        "
                                    >
                                        All caught up
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        No pending Agreement to Sell.
                                    </p>

                                </div>

                            ) : (

                                /* ==================================================
                                    PENDING AGREEMENTS
                                ================================================== */

                                <div
                                    className="
                                        max-h-[420px]
                                        overflow-y-auto
                                    "
                                >

                                    {pendingAgreementBookings.map(
                                        (booking) => {

                                            const agreementStatus =
                                                booking
                                                    .documents
                                                    ?.agreementToSell
                                                    ?.status ||
                                                "pending";

                                            return (

                                                <div
                                                    key={
                                                        booking.id
                                                    }
                                                    className="
                                                        border-b
                                                        border-gray-100
                                                        last:border-b-0
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            gap-3
                                                            px-4
                                                            py-4
                                                        "
                                                    >

                                                        {/* Warning Icon */}

                                                        <div
                                                            className="
                                                                flex
                                                                h-10
                                                                w-10
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-full
                                                                bg-yellow-100
                                                            "
                                                        >

                                                            <AlertTriangle
                                                                size={20}
                                                                className="
                                                                    text-yellow-600
                                                                "
                                                            />

                                                        </div>

                                                        {/* Content */}

                                                        <div
                                                            className="
                                                                min-w-0
                                                                flex-1
                                                            "
                                                        >

                                                            <p
                                                                className="
                                                                    font-semibold
                                                                    text-gray-800
                                                                "
                                                            >
                                                                Agreement to Sell Pending
                                                            </p>

                                                            <p
                                                                className="
                                                                    mt-1
                                                                    text-sm
                                                                    text-gray-600
                                                                "
                                                            >
                                                                Customer:{" "}
                                                                <span
                                                                    className="
                                                                        font-medium
                                                                    "
                                                                >
                                                                    {
                                                                        booking.customerName
                                                                    }
                                                                </span>
                                                            </p>

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    text-gray-600
                                                                "
                                                            >
                                                                Flat:{" "}
                                                                <span
                                                                    className="
                                                                        font-medium
                                                                    "
                                                                >
                                                                    {
                                                                        booking.flatNumber
                                                                    }
                                                                </span>
                                                            </p>

                                                            <p
                                                                className="
                                                                    mt-1
                                                                    text-xs
                                                                    text-yellow-700
                                                                "
                                                            >
                                                                Status:{" "}
                                                                <span
                                                                    className="
                                                                        font-semibold
                                                                        capitalize
                                                                    "
                                                                >
                                                                    {
                                                                        agreementStatus
                                                                    }
                                                                </span>
                                                            </p>

                                                            {/* View Booking */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleViewBooking(
                                                                        booking.id
                                                                    )
                                                                }
                                                                className="
                                                                    mt-3
                                                                    rounded-lg
                                                                    bg-green-600
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-medium
                                                                    text-white
                                                                    hover:bg-green-700
                                                                "
                                                            >
                                                                View Booking
                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>

                                            );

                                        }
                                    )}

                                </div>

                            )}

                        </div>

                    )}

                </div>

                {/* ==================================================
                    USER
                ================================================== */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-green-700
                            font-bold
                            text-white
                        "
                    >
                        D
                    </div>

                    <div className="hidden sm:block">

                        <h3
                            className="
                                font-semibold
                                text-gray-800
                            "
                        >
                            Deepak Dubey
                        </h3>

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Administrator
                        </p>

                    </div>

                </div>

            </div>

        </header>

    );
}

export default Navbar;