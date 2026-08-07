import { useBooking } from "../../context/BookingContext";
import { useState } from "react";
import BookingDetailsModal from "./BookingDetailsModal";
import BookingModal from "./BookingModal";

function Bookings() {
    const {
        bookings,
        updateBooking,
        deleteBooking,
    } = useBooking();
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const filteredBookings = bookings.filter((booking) => {
        const searchText = search.toLowerCase();


        return (
            booking.flatNumber.toLowerCase().includes(searchText) ||
            booking.customerName.toLowerCase().includes(searchText) ||
            booking.mobile.includes(search)
        );
    }); const handleUpdateBooking = (updatedBooking: any) => {
        updateBooking(updatedBooking);

        setSelectedBooking(updatedBooking);
        setIsBookingModalOpen(false);
    };
    const handleDeleteBooking = (id: string) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this booking?"
        );

        if (!confirmDelete) return;

        deleteBooking(id);

    };



    return (
        <>
            <div className="rounded-2xl bg-white p-6 shadow">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Bookings</h1>

                    <input
                        type="text"
                        placeholder="Search Booking..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="rounded-lg border px-4 py-2"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-3 text-left">Flat</th>
                                <th className="border p-3 text-left">Customer</th>
                                <th className="border p-3 text-left">Mobile</th>
                                <th className="border p-3 text-left">Amount</th>
                                <th className="border p-3 text-left">Payment</th>
                                <th className="border p-3 text-left">Booking Date</th>
                                <th className="border p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredBookings.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="p-10 text-center text-gray-500"
                                    >
                                        No Bookings Found
                                    </td>

                                </tr>

                            ) : (

                                filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50">
                                        <td className="border p-3">{booking.flatNumber}</td>
                                        <td className="border p-3">{booking.customerName}</td>
                                        <td className="border p-3">{booking.mobile}</td>
                                        <td className="border p-3">₹ {booking.bookingAmount}</td>
                                        <td className="border p-3">{booking.paymentMode}</td>
                                        <td className="border p-3">{booking.bookingDate}</td>
                                        <td className="border p-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setIsDetailsOpen(true);
                                                    }}
                                                    className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setIsBookingModalOpen(true);
                                                    }}
                                                    className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                </div>
            </div>
            <BookingDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                booking={selectedBooking}
            />
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onConfirm={handleUpdateBooking}
                flat={
                    selectedBooking
                        ? {
                            number: selectedBooking.flatNumber,
                            tower: selectedBooking.tower,
                            floor: selectedBooking.floor,
                            status: selectedBooking.status,
                        }
                        : null
                }
                booking={selectedBooking}
                mode="edit"
            />
        </>

    );
}

export default Bookings;