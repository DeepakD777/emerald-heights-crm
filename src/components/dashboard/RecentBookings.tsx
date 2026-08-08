import {
    CheckCircle,
    Clock,
} from "lucide-react";

import { useBooking } from "../../context/BookingContext";

function RecentBookings() {
    const { bookings } = useBooking();

    // Latest bookings first
    const recentBookings = [...bookings]
        .sort((a, b) => {
            const dateA = new Date(
                a.bookingDate || ""
            ).getTime();

            const dateB = new Date(
                b.bookingDate || ""
            ).getTime();

            return dateB - dateA;
        })
        .slice(0, 5);

    return (
        <div className="rounded-2xl bg-white p-6 shadow">

            {/* Header */}

            <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-800">
                    Recent Bookings
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Latest property bookings
                </p>

            </div>

            {/* Empty State */}

            {recentBookings.length === 0 ? (

                <div className="py-10 text-center text-gray-500">
                    No bookings found
                </div>

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>

                            <tr className="border-b">

                                <th className="py-3 text-left">
                                    Customer
                                </th>

                                <th className="py-3 text-left">
                                    Unit
                                </th>

                                <th className="py-3 text-left">
                                    Amount
                                </th>

                                <th className="py-3 text-left">
                                    Payment
                                </th>

                                <th className="py-3 text-left">
                                    Date
                                </th>

                                <th className="py-3 text-left">
                                    Status
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {recentBookings.map(
                                (booking) => (

                                    <tr
                                        key={booking.id}
                                        className="border-b hover:bg-gray-50"
                                    >

                                        {/* Customer */}

                                        <td className="py-4 font-medium">
                                            {booking.customerName}
                                        </td>

                                        {/* Unit */}

                                        <td className="py-4">
                                            {booking.flatNumber}
                                        </td>

                                        {/* Amount */}

                                        <td className="py-4 font-semibold">
                                            ₹
                                            {Number(
                                                booking.bookingAmount ||
                                                    0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </td>

                                        {/* Payment */}

                                        <td className="py-4">
                                            {booking.paymentMode ||
                                                "-"}
                                        </td>

                                        {/* Date */}

                                        <td className="py-4 text-sm text-gray-600">
                                            {booking.bookingDate ||
                                                "-"}
                                        </td>

                                        {/* Status */}

                                        <td className="py-4">

                                            {booking.status ===
                                            "booked" ? (

                                                <span className="flex items-center gap-2 font-medium text-green-600">

                                                    <CheckCircle
                                                        size={18}
                                                    />

                                                    Booked

                                                </span>

                                            ) : (

                                                <span className="flex items-center gap-2 font-medium text-orange-500">

                                                    <Clock
                                                        size={18}
                                                    />

                                                    {booking.status ||
                                                        "Pending"}

                                                </span>

                                            )}

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

export default RecentBookings;