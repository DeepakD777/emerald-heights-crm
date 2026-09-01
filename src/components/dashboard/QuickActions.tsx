import { useState } from "react";

import {
    PlusCircle,
    Building2,
    UserPlus,
    BarChart3,
    Home,
    Store,
    BookOpen,
    X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// Quick Actions
// ======================================================

function QuickActions() {
    const navigate = useNavigate();

    const { isAdmin } = useAuth();

    const [
        isBookingTypeOpen,
        setIsBookingTypeOpen,
    ] = useState(false);

    // ====================================================
    // New Booking
    // ====================================================

    const handleNewBooking = () => {
        if (!isAdmin) {
            return;
        }

        setIsBookingTypeOpen(true);
    };

    // ====================================================
    // Residential Booking
    // ====================================================

    const handleResidentialBooking = () => {
        setIsBookingTypeOpen(false);

        navigate("/residential");
    };

    // ====================================================
    // Commercial Booking
    // ====================================================

    const handleCommercialBooking = () => {
        setIsBookingTypeOpen(false);

        navigate("/commercial");
    };

    // ====================================================
    // UI
    // ====================================================

    return (
        <>
            <div
                className="
                    min-w-0
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    dark:border-gray-700
                    dark:bg-gray-900
                    p-4
                    shadow-sm
                    sm:p-5
                    lg:p-6
                "
            >
                {/* ==================================================
                    Heading
                ================================================== */}

                <div
                    className="
                        mb-4
                        flex
                        min-w-0
                        items-start
                        justify-between
                        gap-3
                        sm:mb-5
                        lg:mb-6
                    "
                >
                    <div className="min-w-0">
                        <h2
                            className="
                                text-lg
                                font-bold
                                text-gray-800
                                sm:text-xl
                                lg:text-2xl
                            "
                        >
                            Quick Actions
                        </h2>

                        <p
                            className="
                                mt-1
                                text-xs
                                text-gray-500
                                sm:text-sm
                            "
                        >
                            {isAdmin
                                ? "Manage bookings, inventory, sales team and reports"
                                : "Quick access to CRM information"}
                        </p>
                    </div>

                    {!isAdmin && (
                        <span
                            className="
                                shrink-0
                                rounded-full
                                border
                                border-gray-200
                                bg-gray-50
                                dark:border-gray-700
                                dark:bg-gray-800
                                px-2.5
                                py-1
                                text-[11px]
                                font-semibold
                                text-gray-600
                                sm:px-3
                                sm:text-xs
                            "
                        >
                            View Only
                        </span>
                    )}
                </div>

                {/* ==================================================
                    ADMIN QUICK ACTIONS
                ================================================== */}

                {isAdmin ? (
                    <div
                        className="
                            grid
                            min-w-0
                            grid-cols-2
                            gap-3
                            sm:gap-4
                            md:grid-cols-4
                        "
                    >
                        {/* New Booking */}

                        <button
                            type="button"
                            onClick={handleNewBooking}
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-green-50
                                dark:bg-green-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-green-100
                                dark:hover:bg-green-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <PlusCircle
                                className="text-green-600 dark:text-green-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                New Booking
                            </span>
                        </button>

                        {/* Add Property */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/properties?mode=create"
                                )
                            }
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-orange-50
                                dark:bg-orange-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-orange-100
                                dark:hover:bg-orange-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <Building2
                                className="text-orange-600 dark:text-orange-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                Add Property
                            </span>
                        </button>

                        {/* Add Sales Member */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/sales-team?mode=create"
                                )
                            }
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-blue-50
                                dark:bg-blue-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-blue-100
                                dark:hover:bg-blue-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <UserPlus
                                className="text-blue-600 dark:text-blue-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                Add Sales Member
                            </span>
                        </button>

                        {/* View Reports */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/reports")
                            }
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-purple-50
                                dark:bg-purple-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-purple-100
                                dark:hover:bg-purple-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <BarChart3
                                className="text-purple-600 dark:text-purple-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                View Reports
                            </span>
                        </button>
                    </div>
                ) : (
                    /* ==================================================
                        EMPLOYEE VIEW-ONLY QUICK ACTIONS
                    ================================================== */

                    <div
                        className="
                            grid
                            min-w-0
                            grid-cols-2
                            gap-3
                            sm:gap-4
                            md:grid-cols-4
                        "
                    >
                        {/* Residential */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/residential")
                            }
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-green-50
                                dark:bg-green-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-green-100
                                dark:hover:bg-green-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <Home
                                className="text-green-600 dark:text-green-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                Residential
                            </span>
                        </button>

                        {/* Commercial */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/commercial")
                            }
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-orange-50
                                dark:bg-orange-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-orange-100
                                dark:hover:bg-orange-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <Store
                                className="text-orange-600 dark:text-orange-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                Commercial
                            </span>
                        </button>

                        {/* Bookings */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/bookings")
                            }
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-blue-50
                                dark:bg-blue-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-blue-100
                                dark:hover:bg-blue-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <BookOpen
                                className="text-blue-600 dark:text-blue-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                Bookings
                            </span>
                        </button>

                        {/* Reports */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/reports")
                            }
                            className="
                                flex
                                min-h-24
                                flex-col
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-purple-50
                                dark:bg-purple-950/60
                                p-3
                                text-center
                                transition
                                hover:-translate-y-1
                                hover:bg-purple-100
                                dark:hover:bg-purple-900/70
                                hover:shadow-md
                                sm:min-h-28
                                sm:gap-3
                                sm:p-5
                            "
                        >
                            <BarChart3
                                className="text-purple-600 dark:text-purple-400"
                                size={36}
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-gray-800
                                    sm:text-base
                                "
                            >
                                Reports
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* ====================================================
                NEW BOOKING TYPE MODAL
                Admin Only
            ==================================================== */}

            {isAdmin &&
                isBookingTypeOpen && (
                    <div
                        className="
                            fixed
                            inset-0
                            z-[100]
                            flex
                            items-center
                            justify-center
                            bg-black/50
                            p-3
                            sm:p-4
                        "
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                setIsBookingTypeOpen(
                                    false
                                );
                            }
                        }}
                    >
                        <div
                            className="
                                max-h-[calc(100dvh-24px)]
                                w-full
                                max-w-lg
                                overflow-y-auto
                                rounded-2xl
                                bg-white
                                dark:bg-gray-900
                                shadow-2xl
                            "
                        >
                            {/* Modal Header */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                    border-b
                                    border-gray-200
                                    dark:border-gray-700
                                    px-4
                                    py-4
                                    sm:px-6
                                "
                            >
                                <div className="min-w-0">
                                    <h2
                                        className="
                                            text-lg
                                            font-bold
                                            text-gray-800
                                            sm:text-xl
                                        "
                                    >
                                        New Booking
                                    </h2>

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            text-gray-500
                                            sm:text-sm
                                        "
                                    >
                                        Select property type
                                        to continue
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsBookingTypeOpen(
                                            false
                                        )
                                    }
                                    className="
                                        shrink-0
                                        rounded-lg
                                        p-2
                                        text-gray-500
                                        transition
                                        hover:bg-gray-100
                                        hover:text-gray-800
                                    "
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Property Type Selection */}

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-3
                                    p-4
                                    sm:grid-cols-2
                                    sm:gap-4
                                    sm:p-6
                                "
                            >
                                {/* Residential */}

                                <button
                                    type="button"
                                    onClick={
                                        handleResidentialBooking
                                    }
                                    className="
                                        flex
                                        min-h-32
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-3
                                        rounded-2xl
                                        border
                                        border-green-200
                                        bg-green-50
                                        dark:border-green-900
                                        dark:bg-green-950/60
                                        p-4
                                        text-center
                                        transition
                                        hover:-translate-y-1
                                        hover:border-green-300
                                        hover:bg-green-100
                                        dark:hover:border-green-700
                                        dark:hover:bg-green-900/70
                                        hover:shadow-md
                                        sm:min-h-40
                                        sm:gap-4
                                        sm:p-6
                                    "
                                >
                                    <div
                                        className="
                                            rounded-2xl
                                            bg-white
                                            dark:bg-gray-800
                                            p-3
                                            text-green-600
                                            dark:text-green-400
                                            shadow-sm
                                            sm:p-4
                                        "
                                    >
                                        <Home size={34} />
                                    </div>

                                    <div>
                                        <p className="font-bold text-gray-800">
                                            Residential
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Select an available
                                            residential unit
                                        </p>
                                    </div>
                                </button>

                                {/* Commercial */}

                                <button
                                    type="button"
                                    onClick={
                                        handleCommercialBooking
                                    }
                                    className="
                                        flex
                                        min-h-32
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-3
                                        rounded-2xl
                                        border
                                        border-orange-200
                                        bg-orange-50
                                        dark:border-orange-900
                                        dark:bg-orange-950/60
                                        p-4
                                        text-center
                                        transition
                                        hover:-translate-y-1
                                        hover:border-orange-300
                                        hover:bg-orange-100
                                        dark:hover:border-orange-700
                                        dark:hover:bg-orange-900/70
                                        hover:shadow-md
                                        sm:min-h-40
                                        sm:gap-4
                                        sm:p-6
                                    "
                                >
                                    <div
                                        className="
                                            rounded-2xl
                                            bg-white
                                            dark:bg-gray-800
                                            p-3
                                            text-orange-600
                                            dark:text-orange-400
                                            shadow-sm
                                            sm:p-4
                                        "
                                    >
                                        <Store size={34} />
                                    </div>

                                    <div>
                                        <p className="font-bold text-gray-800">
                                            Commercial
                                        </p>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Select an available
                                            commercial unit
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}

export default QuickActions;