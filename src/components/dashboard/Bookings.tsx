import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useBooking } from "../../context/BookingContext";
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
    } = useBooking();

    // ==================================================
    // States
    // ==================================================

    const [selectedBooking, setSelectedBooking] =
        useState<any>(null);

    const [isBookingModalOpen, setIsBookingModalOpen] =
        useState(false);

    const [isDetailsOpen, setIsDetailsOpen] =
        useState(false);

    const [search, setSearch] =
        useState("");
    const [searchParams] = useSearchParams();

    useEffect(() => {

        const bookingId =
            searchParams.get("bookingId");

        if (!bookingId) return;

        const booking =
            bookings.find(
                (item) => item.id === bookingId
            );

        if (!booking) return;

        setSelectedBooking(booking);
        setIsDetailsOpen(true);

    }, [searchParams, bookings]);

    // ==================================================
    // Search
    // ==================================================

    const filteredBookings =
        bookings.filter((booking) => {

            const searchText =
                search.toLowerCase();

            return (
                booking.flatNumber
                    .toLowerCase()
                    .includes(searchText) ||

                booking.customerName
                    .toLowerCase()
                    .includes(searchText) ||

                booking.mobile
                    .includes(search)
            );

        });

    // ==================================================
    // Update Booking
    // ==================================================

    const handleUpdateBooking = (
        updatedBooking: any
    ) => {

        updateBooking(
            updatedBooking
        );

        setSelectedBooking(
            updatedBooking
        );

        setIsBookingModalOpen(
            false
        );

    };

    // ==================================================
    // Delete Booking
    // ==================================================

    const handleDeleteBooking = (
        id: string
    ) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this booking?"
            );

        if (!confirmDelete) return;

        deleteBooking(id);

    };

    // ==================================================
    // Return
    // ==================================================

    return (
        <>

            <div className="rounded-2xl bg-white p-6 shadow">

                {/* ==================================================
                    Header
                ================================================== */}

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <h1 className="text-3xl font-bold">
                        Bookings
                    </h1>

                    <input
                        type="text"
                        placeholder="Search Booking..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border px-4 py-2 md:w-72"
                    />

                </div>

                {/* ==================================================
                    Table
                ================================================== */}

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

                                {/* ==================================================
                                    Agreement To Sell
                                ================================================== */}

                                <th className="border p-3 text-left">
                                    Agreement to Sell
                                </th>

                                {/* ==================================================
                                    Tripartite Agreement
                                ================================================== */}

                                <th className="border p-3 text-left">
                                    Tripartite Agreement
                                </th>

                                <th className="border p-3 text-center">
                                    Actions
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredBookings.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={9}
                                        className="p-10 text-center text-gray-500"
                                    >
                                        No Bookings Found
                                    </td>

                                </tr>

                            ) : (

                                filteredBookings.map(
                                    (booking) => {

                                        // ==================================================
                                        // Agreement Status
                                        // ==================================================

                                        const agreementStatus =
                                            booking.documents
                                                ?.agreementToSell
                                                ?.status ||
                                            "pending";

                                        // ==================================================
                                        // Tripartite Status
                                        // ==================================================

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

                                                {/* ==================================================
                                                    Flat
                                                ================================================== */}

                                                <td className="border p-3">

                                                    {
                                                        booking.flatNumber
                                                    }

                                                </td>

                                                {/* ==================================================
                                                    Customer
                                                ================================================== */}

                                                <td className="border p-3 font-medium">

                                                    {
                                                        booking.customerName
                                                    }

                                                </td>

                                                {/* ==================================================
                                                    Mobile
                                                ================================================== */}

                                                <td className="border p-3">

                                                    {
                                                        booking.mobile
                                                    }

                                                </td>

                                                {/* ==================================================
                                                    Amount
                                                ================================================== */}

                                                <td className="border p-3">

                                                    ₹{" "}

                                                    {
                                                        booking.bookingAmount ||
                                                        "0"
                                                    }

                                                </td>

                                                {/* ==================================================
                                                    Payment
                                                ================================================== */}

                                                <td className="border p-3">

                                                    {
                                                        booking.paymentMode
                                                    }

                                                </td>

                                                {/* ==================================================
                                                    Booking Date
                                                ================================================== */}

                                                <td className="border p-3">

                                                    {
                                                        booking.bookingDate ||
                                                        "-"
                                                    }

                                                </td>

                                                {/* ==================================================
                                                    Agreement To Sell
                                                ================================================== */}

                                                <td className="border p-3">

                                                    <DocumentStatusBadge
                                                        status={
                                                            agreementStatus
                                                        }
                                                    />

                                                </td>

                                                {/* ==================================================
                                                    Tripartite Agreement
                                                ================================================== */}

                                                <td className="border p-3">

                                                    <DocumentStatusBadge
                                                        status={
                                                            tripartiteStatus
                                                        }
                                                    />

                                                </td>

                                                {/* ==================================================
                                                    Actions
                                                ================================================== */}

                                                <td className="border p-3">

                                                    <div className="flex justify-center gap-2">

                                                        {/* View */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setSelectedBooking(
                                                                    booking
                                                                );

                                                                setIsDetailsOpen(
                                                                    true
                                                                );

                                                            }}
                                                            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                                        >
                                                            View
                                                        </button>

                                                        {/* Edit */}

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setSelectedBooking(
                                                                    booking
                                                                );

                                                                setIsBookingModalOpen(
                                                                    true
                                                                );

                                                            }}
                                                            className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                                                        >
                                                            Edit
                                                        </button>

                                                        {/* Delete */}

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

            {/* ==================================================
                Booking Details Modal
            ================================================== */}

            <BookingDetailsModal
                isOpen={isDetailsOpen}
                onClose={() =>
                    setIsDetailsOpen(false)
                }
                booking={selectedBooking}
                onUpdate={handleUpdateBooking}
            />

            {/* ==================================================
                Booking Edit Modal
            ================================================== */}

            <BookingModal
                isOpen={
                    isBookingModalOpen
                }
                onClose={() =>
                    setIsBookingModalOpen(
                        false
                    )
                }
                onConfirm={
                    handleUpdateBooking
                }
                flat={
                    selectedBooking
                        ? {
                            number:
                                selectedBooking.flatNumber,

                            tower:
                                selectedBooking.tower,

                            floor:
                                selectedBooking.floor,

                            status:
                                selectedBooking.status,
                        }
                        : null
                }
                booking={
                    selectedBooking
                }
                mode="edit"
            />

        </>
    );
}

export default Bookings;