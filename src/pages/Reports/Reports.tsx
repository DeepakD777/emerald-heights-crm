import {
    useMemo,
    useState,
} from "react";

import {
    BarChart3,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    IndianRupee,

    FileSpreadsheet,
    UserRound,
    XCircle,
} from "lucide-react";

import {
    useBooking,
} from "../../context/BookingContext";

import {
    useAuth,
} from "../../context/AuthContext";

import BookingDetailsModal from "../../components/dashboard/BookingDetailsModal";
import ProjectExcelExportModal from "../../components/dashboard/ProjectExcelExportModal";
import InstallmentExcelExportModal from "../../components/dashboard/InstallmentExcelExportModal";
// ======================================================
// Helpers
// ======================================================

const formatDateTime = (
    value:
        string | null | undefined
) => {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit",
        }
    );
};

// ======================================================
// Status Classes
// ======================================================

const getStatusClasses = (
    status:
        string | undefined
) => {

    const normalized =
        String(
            status ?? ""
        )
            .trim()
            .toLowerCase();

    if (
        normalized ===
        "booked"
    ) {
        return (
            "bg-green-100 text-green-700"
        );
    }

    if (
        normalized ===
        "cancelled"
    ) {
        return (
            "bg-red-100 text-red-700"
        );
    }

    if (
        normalized ===
        "completed"
    ) {
        return (
            "bg-blue-100 text-blue-700"
        );
    }

    return (
        "bg-orange-100 text-orange-700"
    );
};

// ======================================================
// Status Label
// ======================================================

const getStatusLabel = (
    status:
        string | undefined
) => {

    const normalized =
        String(
            status ??
            "Pending"
        )
            .trim()
            .toLowerCase();

    if (
        normalized ===
        "cancelled"
    ) {
        return "CANCELLED";
    }

    if (
        normalized ===
        "booked"
    ) {
        return "BOOKED";
    }

    if (
        normalized ===
        "completed"
    ) {
        return "COMPLETED";
    }

    if (
        normalized ===
        "pending"
    ) {
        return "PENDING";
    }

    return String(
        status ??
        "Pending"
    )
        .toUpperCase();
};

// ======================================================
// Reports
// ======================================================

function Reports() {

    const {
        bookings,
        permanentlyDeleteBooking,
    } =
        useBooking();

    const {
        isAdmin,
    } =
        useAuth();

    // ==================================================
    // Booking Details
    // ==================================================

    const [
        selectedBooking,
        setSelectedBooking,
    ] =
        useState<any>(
            null
        );

    const [
        isDetailsOpen,
        setIsDetailsOpen,
    ] =
        useState(
            false
        );
    const [
        isExcelExportOpen,
        setIsExcelExportOpen,
    ] =
        useState(
            false
        );
    const [
        isInstallmentExportOpen,
        setIsInstallmentExportOpen,
    ] =
        useState(
            false
        );

    const handleViewDetails = (
        booking: any
    ) => {

        setSelectedBooking(
            booking
        );

        setIsDetailsOpen(
            true
        );
    };

    const handleCloseDetails =
        () => {

            setIsDetailsOpen(
                false
            );

            setSelectedBooking(
                null
            );
        };
    const handleOpenExcelExport =
        () => {

            if (
                !isAdmin
            ) {
                return;
            }

            setIsExcelExportOpen(
                true
            );
        };

    // ==================================================
    // Permanent Delete
    // Reports page only
    // ==================================================

    const handlePermanentDelete =
        async (
            booking: any
        ) => {

            if (!isAdmin) {
                return;
            }

            const bookingReference =
                booking.bookingCode ||
                booking.flatNumber ||
                "this booking";

            const confirmed =
                window.confirm(
                    `Permanently delete booking ${bookingReference}?\n\nThis booking will be removed permanently from Reports and cannot be recovered.`
                );

            if (!confirmed) {
                return;
            }

            try {

                await permanentlyDeleteBooking(
                    booking.id
                );

                if (
                    selectedBooking?.id ===
                    booking.id
                ) {

                    handleCloseDetails();
                }

            } catch (error) {

                alert(
                    error instanceof Error
                        ? error.message
                        : "Failed to permanently delete booking"
                );
            }
        };

    // ==================================================
    // Price Groups
    // ==================================================

    const priceGroups =
        useMemo(() => {

            const groups =
                new Map<
                    string,
                    {
                        amount:
                        number;

                        bookings:
                        typeof bookings;
                    }
                >();

            bookings.forEach(
                (
                    booking
                ) => {

                    const amount =
                        Number(
                            String(
                                booking
                                    .bookingAmount ||
                                ""
                            )
                                .replace(
                                    /₹/g,
                                    ""
                                )
                                .replace(
                                    /,/g,
                                    ""
                                )
                                .trim()
                        );

                    const safeAmount =
                        Number.isFinite(
                            amount
                        )
                            ? amount
                            : 0;

                    const key =
                        String(
                            safeAmount
                        );

                    if (
                        !groups.has(
                            key
                        )
                    ) {

                        groups.set(
                            key,
                            {
                                amount:
                                    safeAmount,

                                bookings:
                                    [],
                            }
                        );
                    }

                    groups
                        .get(
                            key
                        )!
                        .bookings
                        .push(
                            booking
                        );
                }
            );

            return Array.from(
                groups.values()
            ).sort(
                (
                    a,
                    b
                ) =>
                    b.amount -
                    a.amount
            );

        }, [
            bookings,
        ]);

    // ==================================================
    // Cancelled Booking History
    // ==================================================

    const cancelledBookings =
        useMemo(() => {

            return bookings
                .filter(
                    (
                        booking
                    ) =>
                        String(
                            booking.status ??
                            ""
                        )
                            .trim()
                            .toLowerCase() ===
                        "cancelled"
                )
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const aTime =
                            a.cancelledAt
                                ? new Date(
                                    a.cancelledAt
                                )
                                    .getTime()
                                : 0;

                        const bTime =
                            b.cancelledAt
                                ? new Date(
                                    b.cancelledAt
                                )
                                    .getTime()
                                : 0;

                        return (
                            bTime -
                            aTime
                        );
                    }
                );

        }, [
            bookings,
        ]);

    // ==================================================
    // Open Price Groups
    // ==================================================

    const [
        openPrices,
        setOpenPrices,
    ] =
        useState<
            Record<
                string,
                boolean
            >
        >({});

    const togglePrice = (
        amount:
            number
    ) => {

        const key =
            String(
                amount
            );

        setOpenPrices(
            (
                previous
            ) => ({
                ...previous,

                [key]:
                    !previous[
                    key
                    ],
            })
        );
    };

    // ==================================================
    // UI
    // ==================================================

    return (

        <>
            <div className="space-y-6">

                {/* ==================================================
                    Header
                ================================================== */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Booking Reports
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Booking summary, customer details and cancellation history
                        </p>

                    </div>
                    {isAdmin && (

                        <div className="flex flex-wrap gap-2">

                            <button
                                type="button"
                                onClick={
                                    handleOpenExcelExport
                                }
                                className="inline-flex w-fit items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
                            >

                                <FileSpreadsheet
                                    size={
                                        18
                                    }
                                />

                                Export Project Excel

                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsInstallmentExportOpen(
                                        true
                                    )
                                }
                                className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                            >

                                <FileSpreadsheet
                                    size={
                                        18
                                    }
                                />

                                Export Installment Report

                            </button>

                        </div>

                    )}

                </div>

                {/* ==================================================
                    Summary Cards
                ================================================== */}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                    {/* Total Bookings */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Total Bookings
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                    {
                                        bookings.length
                                    }
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    All recorded bookings
                                </p>

                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-600">

                                <CalendarDays
                                    size={
                                        28
                                    }
                                />

                            </div>

                        </div>

                    </div>

                    {/* Different Prices */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Different Booking Prices
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                    {
                                        priceGroups.length
                                    }
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    Unique booking amounts
                                </p>

                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">

                                <BarChart3
                                    size={
                                        28
                                    }
                                />

                            </div>

                        </div>

                    </div>

                    {/* Cancelled Bookings */}

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-gray-500">
                                    Cancelled Bookings
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-red-600">
                                    {
                                        cancelledBookings.length
                                    }
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    Preserved cancellation records
                                </p>

                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600">

                                <XCircle
                                    size={
                                        28
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </div>

                {/* ==================================================
                    Cancelled Booking History
                ================================================== */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-gray-800">
                                Cancelled Booking History
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Complete history of cancelled bookings with assigned sales member
                            </p>

                        </div>

                        <div className="inline-flex w-fit items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">

                            {
                                cancelledBookings.length
                            }{" "}

                            {
                                cancelledBookings.length ===
                                    1
                                    ? "Cancellation"
                                    : "Cancellations"
                            }

                        </div>

                    </div>

                    {
                        cancelledBookings.length ===
                            0
                            ? (

                                <div className="py-12 text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">

                                        <XCircle
                                            size={
                                                26
                                            }
                                        />

                                    </div>

                                    <p className="mt-4 font-medium text-gray-700">
                                        No cancelled bookings found
                                    </p>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Cancelled booking records will appear here
                                    </p>

                                </div>

                            )
                            : (

                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[1400px]">

                                        <thead>

                                            <tr className="border-b bg-gray-50">

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Booking Code
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Customer
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Mobile
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Unit
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Tower
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Floor
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Booking Date
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Cancelled At
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Assigned Sales Member
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Status
                                                </th>

                                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {
                                                cancelledBookings.map(
                                                    (
                                                        booking
                                                    ) => (

                                                        <tr
                                                            key={
                                                                booking.id
                                                            }
                                                            className="border-b last:border-b-0 hover:bg-red-50/40"
                                                        >

                                                            {/* Booking Code */}

                                                            <td className="px-5 py-4 text-sm font-medium text-gray-700">

                                                                {
                                                                    booking.bookingCode ||
                                                                    "-"
                                                                }

                                                            </td>

                                                            {/* Customer */}

                                                            <td className="px-5 py-4">

                                                                <div className="flex items-center gap-3">

                                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                                                                        <UserRound
                                                                            size={
                                                                                18
                                                                            }
                                                                        />

                                                                    </div>

                                                                    <span className="font-medium text-gray-800">

                                                                        {
                                                                            booking.customerName ||
                                                                            "-"
                                                                        }

                                                                    </span>

                                                                </div>

                                                            </td>

                                                            {/* Mobile */}

                                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                                {
                                                                    booking.mobile ||
                                                                    "-"
                                                                }

                                                            </td>

                                                            {/* Unit */}

                                                            <td className="px-5 py-4 font-semibold text-gray-800">

                                                                {
                                                                    booking.flatNumber ||
                                                                    "-"
                                                                }

                                                            </td>

                                                            {/* Tower */}

                                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                                {
                                                                    booking.tower ||
                                                                    "-"
                                                                }

                                                            </td>

                                                            {/* Floor */}

                                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                                {
                                                                    booking.floor ??
                                                                    "-"
                                                                }

                                                            </td>

                                                            {/* Booking Date */}

                                                            <td className="px-5 py-4 text-sm text-gray-600">

                                                                {
                                                                    booking.bookingDate ||
                                                                    "-"
                                                                }

                                                            </td>

                                                            {/* Cancelled At */}

                                                            <td className="px-5 py-4 text-sm font-medium text-red-700">

                                                                {
                                                                    formatDateTime(
                                                                        booking.cancelledAt
                                                                    )
                                                                }

                                                            </td>

                                                            {/* Employee */}

                                                            <td className="px-5 py-4">

                                                                {
                                                                    booking
                                                                        .assignedEmployee
                                                                        ?.name
                                                                        ? (

                                                                            <div>

                                                                                <p className="font-medium text-gray-800">

                                                                                    {
                                                                                        booking
                                                                                            .assignedEmployee
                                                                                            ?.name
                                                                                    }

                                                                                </p>

                                                                                <p className="mt-1 text-xs text-gray-500">

                                                                                    {
                                                                                        booking
                                                                                            .assignedEmployee
                                                                                            ?.role
                                                                                            ?.replace(
                                                                                                /_/g,
                                                                                                " "
                                                                                            ) ||
                                                                                        ""
                                                                                    }

                                                                                </p>

                                                                            </div>

                                                                        )
                                                                        : (

                                                                            <span className="text-sm text-gray-400">
                                                                                Unassigned
                                                                            </span>

                                                                        )
                                                                }

                                                            </td>

                                                            {/* Status */}

                                                            <td className="px-5 py-4">

                                                                <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                                    CANCELLED
                                                                </span>

                                                            </td>

                                                            {/* Actions */}

                                                            <td className="px-5 py-4">

                                                                <div className="flex flex-wrap gap-2">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleViewDetails(
                                                                                booking
                                                                            )
                                                                        }
                                                                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                                                    >
                                                                        View Details
                                                                    </button>

                                                                    {isAdmin && (

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handlePermanentDelete(
                                                                                    booking
                                                                                )
                                                                            }
                                                                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                                                        >
                                                                            Delete Booking
                                                                        </button>

                                                                    )}

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    )
                                                )
                                            }

                                        </tbody>

                                    </table>

                                </div>

                            )
                    }

                </div>

                {/* ==================================================
                    Price-wise Booking Summary
                ================================================== */}

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="mb-6">

                        <h2 className="text-xl font-bold text-gray-800">
                            Price-wise Booking Summary
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            View bookings and customer details for each booking price
                        </p>

                    </div>

                    {
                        priceGroups.length ===
                            0
                            ? (

                                <div className="py-12 text-center text-gray-500">
                                    No bookings found
                                </div>

                            )
                            : (

                                <div className="space-y-4">

                                    {
                                        priceGroups.map(
                                            (
                                                group
                                            ) => {

                                                const isOpen =
                                                    openPrices[
                                                    String(
                                                        group.amount
                                                    )
                                                    ] ??
                                                    false;

                                                return (

                                                    <div
                                                        key={
                                                            String(
                                                                group.amount
                                                            )
                                                        }
                                                        className="overflow-hidden rounded-xl border border-gray-200"
                                                    >

                                                        {/* Price Header */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                togglePrice(
                                                                    group.amount
                                                                )
                                                            }
                                                            className="flex w-full items-center justify-between bg-gray-50 px-5 py-4 text-left transition hover:bg-gray-100"
                                                        >

                                                            <div className="flex items-center gap-4">

                                                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-600">

                                                                    <IndianRupee
                                                                        size={
                                                                            22
                                                                        }
                                                                    />

                                                                </div>

                                                                <div>

                                                                    <p className="text-lg font-bold text-gray-800">

                                                                        ₹
                                                                        {
                                                                            group.amount
                                                                                .toLocaleString(
                                                                                    "en-IN"
                                                                                )
                                                                        }

                                                                    </p>

                                                                    <p className="text-sm text-gray-500">

                                                                        {
                                                                            group
                                                                                .bookings
                                                                                .length
                                                                        }{" "}

                                                                        {
                                                                            group
                                                                                .bookings
                                                                                .length ===
                                                                                1
                                                                                ? "Booking"
                                                                                : "Bookings"
                                                                        }

                                                                    </p>

                                                                </div>

                                                            </div>

                                                            <div className="flex items-center gap-2 text-gray-500">

                                                                <span className="hidden text-sm md:block">

                                                                    {
                                                                        isOpen
                                                                            ? "Hide Details"
                                                                            : "View Details"
                                                                    }

                                                                </span>

                                                                {
                                                                    isOpen
                                                                        ? (

                                                                            <ChevronUp
                                                                                size={
                                                                                    20
                                                                                }
                                                                            />

                                                                        )
                                                                        : (

                                                                            <ChevronDown
                                                                                size={
                                                                                    20
                                                                                }
                                                                            />

                                                                        )
                                                                }

                                                            </div>

                                                        </button>

                                                        {/* Individual Booking Details */}

                                                        {
                                                            isOpen &&
                                                            (

                                                                <div className="border-t border-gray-200">

                                                                    <div className="overflow-x-auto">

                                                                        <table className="w-full min-w-[1250px]">

                                                                            <thead>

                                                                                <tr className="border-b bg-white">

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Customer
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Mobile
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Unit
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Floor
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Payment
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Date
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Sales Member
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Status
                                                                                    </th>

                                                                                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                                        Actions
                                                                                    </th>

                                                                                </tr>

                                                                            </thead>

                                                                            <tbody>

                                                                                {
                                                                                    group.bookings.map(
                                                                                        (
                                                                                            booking
                                                                                        ) => (

                                                                                            <tr
                                                                                                key={
                                                                                                    booking.id
                                                                                                }
                                                                                                className="border-b last:border-b-0 hover:bg-gray-50"
                                                                                            >

                                                                                                {/* Customer */}

                                                                                                <td className="px-5 py-4">

                                                                                                    <div className="flex items-center gap-3">

                                                                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                                                                                                            <UserRound
                                                                                                                size={
                                                                                                                    18
                                                                                                                }
                                                                                                            />

                                                                                                        </div>

                                                                                                        <span className="font-medium text-gray-800">

                                                                                                            {
                                                                                                                booking.customerName ||
                                                                                                                "-"
                                                                                                            }

                                                                                                        </span>

                                                                                                    </div>

                                                                                                </td>

                                                                                                {/* Mobile */}

                                                                                                <td className="px-5 py-4 text-sm text-gray-600">

                                                                                                    {
                                                                                                        booking.mobile ||
                                                                                                        "-"
                                                                                                    }

                                                                                                </td>

                                                                                                {/* Unit */}

                                                                                                <td className="px-5 py-4 font-medium text-gray-800">

                                                                                                    {
                                                                                                        booking.flatNumber ||
                                                                                                        "-"
                                                                                                    }

                                                                                                </td>

                                                                                                {/* Floor */}

                                                                                                <td className="px-5 py-4 text-sm text-gray-600">

                                                                                                    {
                                                                                                        booking.floor ??
                                                                                                        "-"
                                                                                                    }

                                                                                                </td>

                                                                                                {/* Payment */}

                                                                                                <td className="px-5 py-4 text-sm text-gray-600">

                                                                                                    {
                                                                                                        booking.paymentMode ||
                                                                                                        "-"
                                                                                                    }

                                                                                                </td>

                                                                                                {/* Date */}

                                                                                                <td className="px-5 py-4 text-sm text-gray-600">

                                                                                                    {
                                                                                                        booking.bookingDate ||
                                                                                                        "-"
                                                                                                    }

                                                                                                </td>

                                                                                                {/* Sales Member */}

                                                                                                <td className="px-5 py-4 text-sm text-gray-600">

                                                                                                    {
                                                                                                        booking
                                                                                                            .assignedEmployee
                                                                                                            ?.name ||
                                                                                                        "Unassigned"
                                                                                                    }

                                                                                                </td>

                                                                                                {/* Status */}

                                                                                                <td className="px-5 py-4">

                                                                                                    <span
                                                                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                                                                            booking.status
                                                                                                        )}`}
                                                                                                    >

                                                                                                        {
                                                                                                            getStatusLabel(
                                                                                                                booking.status
                                                                                                            )
                                                                                                        }

                                                                                                    </span>

                                                                                                </td>

                                                                                                {/* Actions */}

                                                                                                <td className="px-5 py-4">

                                                                                                    <div className="flex flex-wrap gap-2">

                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={() =>
                                                                                                                handleViewDetails(
                                                                                                                    booking
                                                                                                                )
                                                                                                            }
                                                                                                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                                                                                        >
                                                                                                            View Details
                                                                                                        </button>

                                                                                                        {isAdmin && (

                                                                                                            <button
                                                                                                                type="button"
                                                                                                                onClick={() =>
                                                                                                                    handlePermanentDelete(
                                                                                                                        booking
                                                                                                                    )
                                                                                                                }
                                                                                                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                                                                                            >
                                                                                                                Delete
                                                                                                            </button>

                                                                                                        )}

                                                                                                    </div>

                                                                                                </td>

                                                                                            </tr>

                                                                                        )
                                                                                    )
                                                                                }

                                                                            </tbody>

                                                                        </table>

                                                                    </div>

                                                                </div>

                                                            )
                                                        }

                                                    </div>

                                                );
                                            }
                                        )
                                    }

                                </div>

                            )
                    }

                </div>

            </div>

            {/* ==================================================
                Booking Details - Reports Read Only
            ================================================== */}
            {isAdmin && (

                <>
                    <ProjectExcelExportModal
                        isOpen={
                            isExcelExportOpen
                        }
                        onClose={() =>
                            setIsExcelExportOpen(
                                false
                            )
                        }
                        bookings={
                            bookings
                        }
                    />

                    <InstallmentExcelExportModal
                        isOpen={
                            isInstallmentExportOpen
                        }
                        onClose={() =>
                            setIsInstallmentExportOpen(
                                false
                            )
                        }
                        bookings={
                            bookings
                        }
                    />
                </>

            )}
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
                readOnly={
                    true
                }
                onUpdate={() => {
                    // Reports view is intentionally read-only.
                }}
            />

        </>
    );
}

export default Reports;