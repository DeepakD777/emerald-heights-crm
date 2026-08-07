import { useBooking } from "../../context/BookingContext";

function Bookings() {
  const { bookings } = useBooking();

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bookings</h1>

        <input
          type="text"
          placeholder="Search Booking..."
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
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-3">{booking.flatNumber}</td>
                <td className="border p-3">{booking.customerName}</td>
                <td className="border p-3">{booking.mobile}</td>
                <td className="border p-3">₹ {booking.bookingAmount}</td>
                <td className="border p-3">{booking.paymentMode}</td>
                <td className="border p-3">{booking.bookingDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Bookings;