import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Building2,
    Home,
} from "lucide-react";

import {
    useSearchParams,
} from "react-router-dom";

import {
    useBooking,
} from "../../context/BookingContext";


import {
    useAuth,
} from "../../context/AuthContext";

import BookingDetailsModal from "./BookingDetailsModal";
import BookingModal from "./BookingModal";

// ======================================================
// Types
// ======================================================

type BookingSection =
    | "RESIDENTIAL"
    | "COMMERCIAL";

// ======================================================
// Document Status Badge
// ======================================================

function DocumentStatusBadge({
    status,
}: {
    status:
    | "pending"
    | "generated"
    | "uploaded"
    | "given"
    | "completed"
    | "not-required";
}) {

    if (
        status ===
        "given"
    ) {

        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Given
            </span>
        );
    }

    if (
        status ===
        "completed"
    ) {

        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Completed
            </span>
        );
    }

    if (
        status ===
        "not-required"
    ) {

        return (
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                Not Required
            </span>
        );
    }

    if (
        status ===
        "generated"
    ) {

        return (
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Generated
            </span>
        );
    }

    if (
        status ===
        "uploaded"
    ) {

        return (
            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                Uploaded
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            Pending
        </span>
    );
}

// ======================================================
// Amount Mode Badge
// ======================================================

function RemainingModeBadge({
    mode,
}: {
    mode?:
    | "AUTO"
    | "MANUAL";
}) {

    if (
        mode ===
        "MANUAL"
    ) {

        return (
            <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                Manual
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Auto
        </span>
    );
}

// ======================================================
// Finance Type Badge
// ======================================================

function FinanceTypeBadge({
    type,
}: {
    type?:
    | "FINANCE"
    | "CASH"
    | null;
}) {

    if (
        type ===
        "FINANCE"
    ) {

        return (
            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                Finance
            </span>
        );
    }

    if (
        type ===
        "CASH"
    ) {

        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Cash
            </span>
        );
    }

    return (
        <span className="text-sm text-gray-400">
            -
        </span>
    );
}

// ======================================================
// Amount Formatter
// ======================================================

const formatAmount = (
    value:
        | string
        | number
        | null
        | undefined
) => {

    if (
        value ===
        null ||
        value ===
        undefined ||
        String(
            value
        ).trim() ===
        ""
    ) {

        return "₹0";
    }

    const parsed =
        Number(
            value
        );

    if (
        Number.isNaN(
            parsed
        )
    ) {

        return `₹${value}`;
    }

    return `₹${parsed.toLocaleString(
        "en-IN"
    )}`;
};

// ======================================================
// Bookings
// ======================================================

function Bookings() {

    const {
        bookings,
        updateBooking,
        deleteBooking,
        loading,
        error,
    } = useBooking();

    const {
        isAdmin,
    } = useAuth();

    const [
        selectedBooking,
        setSelectedBooking,
    ] = useState<any>(
        null
    );

    const [
        isBookingModalOpen,
        setIsBookingModalOpen,
    ] = useState(
        false
    );

    const [
        isDetailsOpen,
        setIsDetailsOpen,
    ] = useState(
        false
    );

    const [
        search,
        setSearch,
    ] = useState(
        ""
    );

    const [
        activeSection,
        setActiveSection,
    ] =
        useState<BookingSection>(
            "RESIDENTIAL"
        );

    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();

    // ==================================================
    // Clear Booking Query Parameter
    // ==================================================

    const clearBookingQueryParam =
        () => {

            if (
                !searchParams.has(
                    "bookingId"
                )
            ) {

                return;
            }

            const nextParams =
                new URLSearchParams(
                    searchParams
                );

            nextParams.delete(
                "bookingId"
            );

            setSearchParams(
                nextParams,
                {
                    replace:
                        true,
                }
            );
        };

    // ==================================================
    // Open Booking From URL
    // ==================================================

    useEffect(() => {

        const bookingId =
            searchParams.get(
                "bookingId"
            );

        if (
            !bookingId
        ) {

            return;
        }

        const booking =
            bookings.find(
                (
                    item
                ) =>
                    item.id ===
                    bookingId
            );

        if (
            !booking
        ) {

            return;
        }

        if (
            booking.propertyType ===
            "COMMERCIAL"
        ) {

            setActiveSection(
                "COMMERCIAL"
            );

        } else if (
            booking.propertyType ===
            "RESIDENTIAL"
        ) {

            setActiveSection(
                "RESIDENTIAL"
            );
        }

        setSelectedBooking(
            booking
        );

        setIsDetailsOpen(
            true
        );

    }, [
        searchParams,
        bookings,
    ]);

    // ==================================================
    // Keep Selected Booking Synced
    // ==================================================

    useEffect(() => {

        if (
            !selectedBooking?.id
        ) {

            return;
        }

        const latestBooking =
            bookings.find(
                (
                    item
                ) =>
                    item.id ===
                    selectedBooking.id
            );

        if (
            latestBooking
        ) {

            setSelectedBooking(
                latestBooking
            );
        }

    }, [
        bookings,
        selectedBooking?.id,
    ]);

    // ==================================================
    // Counts
    // ==================================================

    const residentialCount =
        useMemo(
            () =>
                bookings.filter(
                    (
                        booking
                    ) =>
                        !booking.archivedAt &&
                        booking.propertyType ===
                        "RESIDENTIAL"
                ).length,
            [
                bookings,
            ]
        );

    const commercialCount =
        useMemo(
            () =>
                bookings.filter(
                    (
                        booking
                    ) =>
                        !booking.archivedAt &&
                        booking.propertyType ===
                        "COMMERCIAL"
                ).length,
            [
                bookings,
            ]
        );

    // ==================================================
    // Filter By Section + Search
    // ==================================================

    const filteredBookings =
        useMemo(
            () => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();

                return bookings.filter(
                    (
                        booking
                    ) => {
                        if (
                            booking.archivedAt
                        ) {

                            return false;
                        }

                        if (
                            booking.propertyType !==
                            activeSection
                        ) {

                            return false;
                        }

                        if (
                            !searchText
                        ) {

                            return true;
                        }

                        return (
                            String(
                                booking.flatNumber ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchText
                                ) ||

                            String(
                                booking.customerName ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchText
                                ) ||

                            String(
                                booking.mobile ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchText
                                ) ||

                            String(
                                booking.bookingCode ??
                                ""
                            )
                                .toLowerCase()
                                .includes(
                                    searchText
                                )
                        );
                    }
                );
            },
            [
                bookings,
                activeSection,
                search,
            ]
        );

    // ==================================================
    // Change Section
    // ==================================================

    const handleSectionChange = (
        section:
            BookingSection
    ) => {

        setActiveSection(
            section
        );

        setSearch(
            ""
        );
    };

    // ==================================================
    // Update Booking
    // ==================================================

    const handleUpdateBooking =
        async (
            updatedBooking:
                any
        ) => {

            if (
                !isAdmin
            ) {

                alert(
                    "View only access — booking changes can only be made by an administrator."
                );

                return;
            }

            try {

                await updateBooking(
                    updatedBooking
                );

                setSelectedBooking(
                    updatedBooking
                );

                setIsBookingModalOpen(
                    false
                );

            } catch (error) {

                console.error(
                    "Booking update failed:",
                    error
                );

                alert(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to update booking"
                );
            }
        };

    // ==================================================
    // Delete Booking
    // ==================================================

    const handleDeleteBooking =
        async (
            id:
                string
        ) => {

            if (
                !isAdmin
            ) {

                alert(
                    "View only access — bookings can only be deleted by an administrator."
                );

                return;
            }

            const confirmDelete =
                window.confirm(
                    "Are you sure you want to delete this booking?"
                );

            if (
                !confirmDelete
            ) {

                return;
            }

            try {

                await deleteBooking(
                    id
                );

                if (
                    selectedBooking?.id ===
                    id
                ) {

                    setSelectedBooking(
                        null
                    );

                    setIsDetailsOpen(
                        false
                    );

                    setIsBookingModalOpen(
                        false
                    );

                    clearBookingQueryParam();
                }

            } catch (error) {

                console.error(
                    "Booking delete failed:",
                    error
                );

                alert(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to delete booking"
                );
            }
        };

    // ==================================================
    // Open View Modal
    // ==================================================

    const handleOpenDetails = (
        booking:
            any
    ) => {

        setIsBookingModalOpen(
            false
        );

        setSelectedBooking(
            booking
        );

        setIsDetailsOpen(
            true
        );
    };

    // ==================================================
    // Close View Modal
    // ==================================================

    const handleCloseDetails =
        () => {

            setIsDetailsOpen(
                false
            );

            clearBookingQueryParam();
        };

    // ==================================================
    // Open Edit Modal
    // ==================================================

    const handleOpenEdit = (
        booking:
            any
    ) => {

        if (
            !isAdmin
        ) {

            return;
        }

        clearBookingQueryParam();

        setIsDetailsOpen(
            false
        );

        setSelectedBooking(
            booking
        );

        setIsBookingModalOpen(
            true
        );
    };

    // ==================================================
    // Close Edit Modal
    // ==================================================

    const handleCloseEdit =
        () => {

            setIsBookingModalOpen(
                false
            );
        };

    // ==================================================
    // Loading
    // ==================================================

    if (
        loading
    ) {

        return (
            <div className="rounded-2xl bg-white p-10 shadow">

                <div className="text-center text-gray-500">
                    Loading bookings...
                </div>

            </div>
        );
    }

    // ==================================================
    // Dynamic Labels
    // ==================================================

    const unitLabel =
        activeSection ===
            "RESIDENTIAL"
            ? "Flat"
            : "Shop";

    const emptyLabel =
        activeSection ===
            "RESIDENTIAL"
            ? "No Residential Bookings Found"
            : "No Commercial Bookings Found";

    // ==================================================
    // Return
    // ==================================================

    return (
        <>

            <div className="rounded-2xl bg-white p-6 shadow">

                {/* ======================================
                    Header
                ====================================== */}

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-900">
                            Bookings
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Manage residential and commercial booking records.
                        </p>

                        {!isAdmin && (

                            <p className="mt-1 text-sm font-medium text-amber-600">
                                View only access
                            </p>

                        )}

                    </div>

                    <input
                        type="text"
                        placeholder={`Search ${unitLabel}, customer, mobile or booking code...`}
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        className="
                            w-full
                            rounded-xl
                            border
                            border-gray-300
                            px-4
                            py-2.5
                            outline-none
                            transition
                            focus:border-green-600
                            focus:ring-2
                            focus:ring-green-100
                            lg:w-[380px]
                        "
                    />

                </div>

                {/* ======================================
                    Residential / Commercial Tabs
                ====================================== */}

                <div
                    className="
                        mb-6
                        grid
                        grid-cols-2
                        gap-2
                        rounded-2xl
                        bg-gray-100
                        p-1.5
                        sm:inline-grid
                        sm:min-w-[460px]
                    "
                >

                    <button
                        type="button"
                        onClick={() =>
                            handleSectionChange(
                                "RESIDENTIAL"
                            )
                        }
                        className={`
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            transition
                            ${activeSection ===
                                "RESIDENTIAL"
                                ? "bg-white text-green-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                            }
                        `}
                    >

                        <Home
                            size={18}
                        />

                        Residential

                        <span
                            className={`
                                rounded-full
                                px-2
                                py-0.5
                                text-xs
                                ${activeSection ===
                                    "RESIDENTIAL"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                                }
                            `}
                        >
                            {
                                residentialCount
                            }
                        </span>

                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleSectionChange(
                                "COMMERCIAL"
                            )
                        }
                        className={`
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            transition
                            ${activeSection ===
                                "COMMERCIAL"
                                ? "bg-white text-green-700 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                            }
                        `}
                    >

                        <Building2
                            size={18}
                        />

                        Commercial

                        <span
                            className={`
                                rounded-full
                                px-2
                                py-0.5
                                text-xs
                                ${activeSection ===
                                    "COMMERCIAL"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-200 text-gray-600"
                                }
                            `}
                        >
                            {
                                commercialCount
                            }
                        </span>

                    </button>

                </div>

                {/* ======================================
                    API Error
                ====================================== */}

                {error && (

                    <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>

                )}

                {/* ======================================
                    Table
                ====================================== */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1700px] border-collapse">

                        <thead>

                            <tr className="bg-gray-100">

                                <th className="border p-3 text-left">
                                    {
                                        unitLabel
                                    }
                                </th>
                                <th className="border p-3 text-left">
                                    Floor
                                </th>

                                <th className="border p-3 text-left">
                                    Customer
                                </th>

                                <th className="border p-3 text-left">
                                    Mobile
                                </th>

                                <th className="border p-3 text-left">
                                    Booking Amount
                                </th>

                                <th className="border p-3 text-left">
                                    Remaining Amount
                                </th>
                                <th className="border p-3 text-left">
                                    Current Installment
                                </th>

                                <th className="border p-3 text-left">
                                    Calculation
                                </th>

                                <th className="border p-3 text-left">
                                    Finance Type
                                </th>

                                <th className="border p-3 text-left">
                                    Booking Date
                                </th>

                                <th className="border p-3 text-left">
                                    Agreement to Sell
                                </th>

                                <th className="border p-3 text-left">
                                    Tripartite Agreement
                                </th>

                                <th className="border p-3 text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredBookings.length ===
                                0 ? (

                                <tr>

                                    <td
                                        colSpan={
                                            13
                                        }
                                        className="p-10 text-center text-gray-500"
                                    >
                                        {
                                            emptyLabel
                                        }
                                    </td>

                                </tr>

                            ) : (

                                filteredBookings.map(
                                    (
                                        booking
                                    ) => {

                                        const agreementStatus =
                                            booking.documents
                                                ?.agreementToSell
                                                ?.status ||
                                            "pending";

                                        const tripartite =
                                            booking.documents
                                                ?.tripartiteAgreement;

                                        const tripartiteStatus =
                                            tripartite?.required
                                                ? (
                                                    tripartite
                                                        .document
                                                        ?.status ===
                                                        "completed"
                                                        ? "completed"
                                                        : "pending"
                                                )
                                                : "not-required";
                                        const currentInstallment =
                                            booking
                                                .installmentSummary
                                                ?.currentInstallment ??
                                            null;

                                        return (

                                            <tr
                                                key={
                                                    booking.id
                                                }
                                                className="hover:bg-gray-50"
                                            >

                                                <td className="border p-3 font-semibold text-gray-800">
                                                    {
                                                        booking.flatNumber ||
                                                        "-"
                                                    }
                                                </td>
                                                <td className="border p-3">
                                                    {
                                                        booking.floor === 0
                                                            ? "Ground Floor"
                                                            : `Floor ${booking.floor ?? "-"}`
                                                    }
                                                </td>

                                                <td className="border p-3">
                                                    <div className="font-medium">
                                                        {
                                                            booking.customerName ||
                                                            "-"
                                                        }
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-500">
                                                        {
                                                            booking.floor === 0
                                                                ? "Ground Floor"
                                                                : `Floor: ${booking.floor ?? "-"}`
                                                        }
                                                    </div>
                                                </td>

                                                <td className="border p-3">
                                                    {
                                                        booking.mobile ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="border p-3 font-semibold">
                                                    {
                                                        formatAmount(
                                                            booking.bookingAmount
                                                        )
                                                    }
                                                </td>

                                                <td className="border p-3 font-semibold">
                                                    {
                                                        booking.remainingAmount
                                                            ? formatAmount(
                                                                booking.remainingAmount
                                                            )
                                                            : "-"
                                                    }
                                                </td>
                                                <td className="border p-3">

                                                    {
                                                        currentInstallment
                                                            ? (

                                                                <div className="min-w-[180px]">

                                                                    <div className="font-semibold text-gray-800">
                                                                        {
                                                                            currentInstallment
                                                                                .stageName
                                                                        }
                                                                    </div>

                                                                    <div className="mt-1 flex flex-wrap items-center gap-2">

                                                                        <span
                                                                            className={`
                                inline-flex
                                rounded-full
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                ${currentInstallment
                                                                                    .status ===
                                                                                    "PAID"
                                                                                    ? "bg-green-100 text-green-700"
                                                                                    : currentInstallment
                                                                                        .status ===
                                                                                        "PARTIAL"
                                                                                        ? "bg-amber-100 text-amber-700"
                                                                                        : "bg-gray-100 text-gray-600"
                                                                                }
                            `}
                                                                        >
                                                                            {
                                                                                currentInstallment
                                                                                    .status
                                                                            }
                                                                        </span>

                                                                        <span className="text-xs text-gray-500">
                                                                            {
                                                                                formatAmount(
                                                                                    currentInstallment
                                                                                        .paidAmount
                                                                                )
                                                                            }
                                                                            {" / "}
                                                                            {
                                                                                formatAmount(
                                                                                    currentInstallment
                                                                                        .plannedAmount
                                                                                )
                                                                            }
                                                                        </span>

                                                                    </div>

                                                                </div>
                                                            )
                                                            : (

                                                                <span className="text-sm text-gray-400">
                                                                    No Payment
                                                                </span>
                                                            )
                                                    }

                                                </td>

                                                <td className="border p-3">

                                                    <RemainingModeBadge
                                                        mode={
                                                            booking.remainingAmountMode
                                                        }
                                                    />

                                                </td>

                                                <td className="border p-3">

                                                    <FinanceTypeBadge
                                                        type={
                                                            booking.financeType
                                                        }
                                                    />

                                                </td>

                                                <td className="border p-3">
                                                    {
                                                        booking.bookingDate ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="border p-3">

                                                    <DocumentStatusBadge
                                                        status={
                                                            agreementStatus as any
                                                        }
                                                    />

                                                </td>

                                                <td className="border p-3">

                                                    <DocumentStatusBadge
                                                        status={
                                                            tripartiteStatus as any
                                                        }
                                                    />

                                                </td>

                                                <td className="border p-3">

                                                    <div className="flex justify-center gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleOpenDetails(
                                                                    booking
                                                                )
                                                            }
                                                            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                                        >
                                                            View
                                                        </button>

                                                        {isAdmin && (
                                                            <>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenEdit(
                                                                            booking
                                                                        )
                                                                    }
                                                                    className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteBooking(
                                                                            booking.id
                                                                        )
                                                                    }
                                                                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </button>

                                                            </>
                                                        )}

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ==========================================
                Booking Details
            ========================================== */}

            <BookingDetailsModal
                isOpen={
                    isDetailsOpen
                }
                onClose={
                    handleCloseDetails
                }
                booking={
                    selectedBooking
                }
                onUpdate={
                    handleUpdateBooking
                }
            />

            {/* ==========================================
                Booking Edit
            ========================================== */}

            {isAdmin && (

                <BookingModal
                    isOpen={
                        isBookingModalOpen
                    }
                    onClose={
                        handleCloseEdit
                    }
                    onConfirm={
                        handleUpdateBooking
                    }
                    flat={
                        selectedBooking
                            ? {
                                number:
                                    selectedBooking
                                        .flatNumber,

                                tower:
                                    selectedBooking
                                        .tower,

                                floor:
                                    selectedBooking
                                        .floor,

                                status:
                                    selectedBooking
                                        .status,
                            }
                            : null
                    }
                    booking={
                        selectedBooking
                    }
                    mode="edit"
                />

            )}

        </>
    );
}

export default Bookings;