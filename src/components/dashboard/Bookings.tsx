import {
    useEffect,
    useState,
} from "react";

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

    if (status === "given") {
        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Given
            </span>
        );
    }

    if (status === "completed") {
        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Completed
            </span>
        );
    }

    if (status === "not-required") {
        return (
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                Not Required
            </span>
        );
    }

    if (status === "generated") {
        return (
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Generated
            </span>
        );
    }

    if (status === "uploaded") {
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
    ] = useState<any>(null);

    const [
        isBookingModalOpen,
        setIsBookingModalOpen,
    ] = useState(false);

    const [
        isDetailsOpen,
        setIsDetailsOpen,
    ] = useState(false);

    const [
        search,
        setSearch,
    ] = useState("");

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

        if (!bookingId) {
            return;
        }

        const booking =
            bookings.find(
                (item) =>
                    item.id ===
                    bookingId
            );

        if (!booking) {
            return;
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
                (item) =>
                    item.id ===
                    selectedBooking.id
            );

        if (latestBooking) {

            setSelectedBooking(
                latestBooking
            );
        }

    }, [
        bookings,
        selectedBooking?.id,
    ]);

    // ==================================================
    // Search
    // ==================================================

    const filteredBookings =
        bookings.filter(
            (booking) => {

                const searchText =
                    search.toLowerCase();

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
                    ).includes(
                        search
                    )
                );
            }
        );

    // ==================================================
    // Update Booking
    // ==================================================

    const handleUpdateBooking =
        async (
            updatedBooking: any
        ) => {

        if (!isAdmin) {

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
                error instanceof Error
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
            id: string
        ) => {

        if (!isAdmin) {

            alert(
                "View only access — bookings can only be deleted by an administrator."
            );

            return;
        }

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this booking?"
            );

        if (!confirmDelete) {
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
                error instanceof Error
                    ? error.message
                    : "Failed to delete booking"
            );
        }
    };

    // ==================================================
    // Open View Modal
    // ==================================================

    const handleOpenDetails = (
        booking: any
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
        booking: any
    ) => {

        if (!isAdmin) {
            return;
        }

        // Important:
        // Remove bookingId from URL so updating the
        // booking does not automatically reopen Details.

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

    if (loading) {

        return (
            <div className="rounded-2xl bg-white p-10 shadow">

                <div className="text-center text-gray-500">
                    Loading bookings...
                </div>

            </div>
        );
    }

    // ==================================================
    // Return
    // ==================================================

    return (
        <>

            <div className="rounded-2xl bg-white p-6 shadow">

                {/* ======================================
                    Header
                ====================================== */}

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h1 className="text-3xl font-bold">
                            Bookings
                        </h1>

                        {!isAdmin && (

                            <p className="mt-1 text-sm text-gray-500">
                                View only access
                            </p>
                        )}

                    </div>

                    <input
                        type="text"
                        placeholder="Search Booking..."
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
                        className="w-full rounded-lg border px-4 py-2 md:w-72"
                    />

                </div>

                {/* ======================================
                    API Error
                ====================================== */}

                {error && (

                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* ======================================
                    Table
                ====================================== */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-[1200px] border-collapse">

                        <thead>

                            <tr className="bg-gray-100">

                                <th className="border p-3 text-left">
                                    Flat
                                </th>

                                <th className="border p-3 text-left">
                                    Customer
                                </th>

                                <th className="border p-3 text-left">
                                    Mobile
                                </th>

                                <th className="border p-3 text-left">
                                    Amount
                                </th>

                                <th className="border p-3 text-left">
                                    Payment
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
                                            9
                                        }
                                        className="p-10 text-center text-gray-500"
                                    >
                                        No Bookings Found
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

                                        return (

                                            <tr
                                                key={
                                                    booking.id
                                                }
                                                className="hover:bg-gray-50"
                                            >

                                                <td className="border p-3">
                                                    {
                                                        booking.flatNumber
                                                    }
                                                </td>

                                                <td className="border p-3 font-medium">
                                                    {
                                                        booking.customerName
                                                    }
                                                </td>

                                                <td className="border p-3">
                                                    {
                                                        booking.mobile
                                                    }
                                                </td>

                                                <td className="border p-3">
                                                    ₹{" "}
                                                    {
                                                        booking.bookingAmount ||
                                                        "0"
                                                    }
                                                </td>

                                                <td className="border p-3">
                                                    {
                                                        booking.paymentMode
                                                    }
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