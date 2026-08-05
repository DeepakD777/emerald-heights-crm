import { CheckCircle, Clock } from "lucide-react";

function RecentBookings() {
  const bookings = [
    {
      customer: "Rahul Sharma",
      unit: "A-101",
      amount: "₹12,50,000",
      status: "Paid",
    },
    {
      customer: "Priya Patel",
      unit: "C-204",
      amount: "₹18,20,000",
      status: "Pending",
    },
    {
      customer: "Aman Verma",
      unit: "B-305",
      amount: "₹15,80,000",
      status: "Paid",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Recent Bookings
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Customer</th>
              <th className="text-left py-3">Unit</th>
              <th className="text-left py-3">Amount</th>
              <th className="text-left py-3">Status</th>
            </tr>
          </thead>

          <tbody>

            {bookings.map((booking, index) => (

              <tr key={index} className="border-b">

                <td className="py-4">
                  {booking.customer}
                </td>

                <td className="py-4">
                  {booking.unit}
                </td>

                <td className="py-4 font-semibold">
                  {booking.amount}
                </td>

                <td className="py-4">

                  {booking.status === "Paid" ? (

                    <span className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle size={18} />
                      Paid
                    </span>

                  ) : (

                    <span className="flex items-center gap-2 text-orange-500 font-medium">
                      <Clock size={18} />
                      Pending
                    </span>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>
    </div>
  );
}

export default RecentBookings;