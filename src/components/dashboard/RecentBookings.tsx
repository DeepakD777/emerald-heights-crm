import { CheckCircle, Clock, XCircle } from "lucide-react";

import type { Booking } from "../../services/bookingService";

type RecentBookingsProps = {
  bookings: Booking[];
};

function RecentBookings({ bookings }: RecentBookingsProps) {
  const recentBookings = [...bookings]
    .sort((a, b) => {
      const dateA = new Date(a.bookingDate || "").getTime();

      const dateB = new Date(b.bookingDate || "").getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  const getStatusDisplay = (status: string) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "booked" || normalized === "confirmed") {
      return (
        <span className="flex items-center gap-2 font-medium text-green-600">
          <CheckCircle size={18} />
          Booked
        </span>
      );
    }

    if (normalized === "cancelled") {
      return (
        <span className="flex items-center gap-2 font-medium text-red-600">
          <XCircle size={18} />
          Cancelled
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2 font-medium text-orange-500">
        <Clock size={18} />

        {status || "Pending"}
      </span>
    );
  };

  return (
    <div className="min-w-0 rounded-2xl bg-white p-4 shadow sm:p-5 lg:p-6">
      <div className="mb-4 sm:mb-5 lg:mb-6">
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
          Recent Bookings
        </h2>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Latest property bookings
        </p>
      </div>

      {recentBookings.length === 0 ? (
        <div className="py-10 text-center text-gray-500">No bookings found</div>
      ) : (
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b">
                <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-gray-600 sm:py-3 sm:text-sm">
                  Customer
                </th>

                <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-gray-600 sm:py-3 sm:text-sm">
                  Unit
                </th>

                <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-gray-600 sm:py-3 sm:text-sm">
                  Amount
                </th>

                <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-gray-600 sm:py-3 sm:text-sm">
                  Payment
                </th>

                <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-gray-600 sm:py-3 sm:text-sm">
                  Date
                </th>

                <th className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-semibold text-gray-600 sm:py-3 sm:text-sm">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-medium sm:py-4">{booking.customerName}</td>

                  <td className="whitespace-nowrap px-3 py-3 text-sm sm:py-4">{booking.flatNumber}</td>

                  <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold sm:py-4">
                    ₹
                    {Number(booking.bookingAmount || 0).toLocaleString("en-IN")}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-sm sm:py-4">{booking.paymentMode || "-"}</td>

                  <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-600 sm:py-4 sm:text-sm">
                    {booking.bookingDate || "-"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3 text-sm sm:py-4">{getStatusDisplay(booking.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentBookings;
