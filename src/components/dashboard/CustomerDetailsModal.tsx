import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Building2,
} from "lucide-react";

interface Booking {
  id: string;
  flatNumber: string;
  tower: string;
  floor: number;

  customerName: string;
  mobile: string;
  email: string;
  address: string;

  aadhar: string;
  pan: string;

  bookingAmount: string;
  paymentMode: string;
  bookingDate: string;

  remarks: string;
  status: string;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Booking | null;
  bookings: Booking[];
}

function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  bookings,
}: CustomerDetailsModalProps) {
  if (!isOpen || !customer) {
    return null;
  }

  // ======================================================
  // Customer's Bookings
  // ======================================================

  const customerBookings = bookings.filter(
    (booking) => booking.mobile === customer.mobile,
  );

  // ======================================================
  // Total Booking Amount
  // ======================================================

  const totalAmount = customerBookings.reduce(
    (total, booking) => total + (Number(booking.bookingAmount) || 0),
    0,
  );

  // ======================================================
  // Format Amount
  // ======================================================

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-IN");
  };

  // ======================================================
  // Status Color
  // ======================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300";

      case "hold":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==================================================
            Header
        ================================================== */}

        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/60">
              <User size={28} className="text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {customer.customerName}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer Profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        {/* ==================================================
            Customer Information
        ================================================== */}

        <div className="p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Mobile */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/60">
              <div className="mb-2 flex items-center gap-2">
                <Phone
                  size={18}
                  className="text-green-600 dark:text-green-400"
                />

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Mobile Number
                </span>
              </div>

              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {customer.mobile || "-"}
              </p>
            </div>

            {/* Email */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/60">
              <div className="mb-2 flex items-center gap-2">
                <Mail size={18} className="text-blue-600 dark:text-blue-400" />

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Email
                </span>
              </div>

              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {customer.email || "-"}
              </p>
            </div>

            {/* Address */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/60 md:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <MapPin
                  size={18}
                  className="text-orange-500 dark:text-orange-400"
                />

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Address
                </span>
              </div>

              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {customer.address || "-"}
              </p>
            </div>

            {/* Aadhar */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/60">
              <div className="mb-2 flex items-center gap-2">
                <FileText
                  size={18}
                  className="text-purple-600 dark:text-purple-400"
                />

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Aadhar Number
                </span>
              </div>

              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {customer.aadhar || "-"}
              </p>
            </div>

            {/* PAN */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/60">
              <div className="mb-2 flex items-center gap-2">
                <FileText
                  size={18}
                  className="text-red-500 dark:text-red-400"
                />

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  PAN Number
                </span>
              </div>

              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {customer.pan || "-"}
              </p>
            </div>
          </div>

          {/* ==================================================
              Booking Summary
          ================================================== */}

          <div className="mt-8">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
              Booking Summary
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-blue-50 p-5 dark:bg-blue-950/60">
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Total Bookings
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {customerBookings.length}
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-5 dark:bg-green-950/60">
                <p className="text-sm text-green-600 dark:text-green-300">
                  Total Amount
                </p>

                <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-300">
                  ₹ {formatAmount(totalAmount)}
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-5 dark:bg-purple-950/60">
                <p className="text-sm text-purple-600 dark:text-purple-300">
                  Properties
                </p>

                <p className="mt-2 text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {customerBookings.length}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              Booking History
          ================================================== */}

          <div className="mt-8">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
              Booking History
            </h3>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full border-collapse text-gray-700 dark:text-gray-200">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border-b border-gray-200 p-3 text-left dark:border-gray-700">
                      Property
                    </th>

                    <th className="border-b border-gray-200 p-3 text-left dark:border-gray-700">
                      Type
                    </th>

                    <th className="border-b border-gray-200 p-3 text-left dark:border-gray-700">
                      Amount
                    </th>

                    <th className="border-b border-gray-200 p-3 text-left dark:border-gray-700">
                      Payment
                    </th>

                    <th className="border-b border-gray-200 p-3 text-left dark:border-gray-700">
                      Date
                    </th>

                    <th className="border-b border-gray-200 p-3 text-left dark:border-gray-700">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {customerBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/60"
                    >
                      {/* Property */}
                      <td className="border-b border-gray-200 p-3 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={18}
                            className="text-green-600 dark:text-green-400"
                          />

                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                              {booking.flatNumber}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {booking.tower}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="border-b border-gray-200 p-3 dark:border-gray-700">
                        {booking.tower === "Commercial"
                          ? "Commercial"
                          : "Residential"}
                      </td>

                      {/* Amount */}
                      <td className="border-b border-gray-200 p-3 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100">
                        ₹ {booking.bookingAmount}
                      </td>

                      {/* Payment */}
                      <td className="border-b border-gray-200 p-3 dark:border-gray-700">
                        {booking.paymentMode || "-"}
                      </td>

                      {/* Date */}
                      <td className="border-b border-gray-200 p-3 dark:border-gray-700">
                        {booking.bookingDate || "-"}
                      </td>

                      {/* Status */}
                      <td className="border-b border-gray-200 p-3 dark:border-gray-700">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {booking.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================================================
              Remarks
          ================================================== */}

          <div className="mt-8">
            <h3 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">
              Remarks
            </h3>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/60">
              {customerBookings.some((booking) => booking.remarks) ? (
                <div className="space-y-2">
                  {customerBookings.map(
                    (booking) =>
                      booking.remarks && (
                        <p
                          key={booking.id}
                          className="text-sm text-gray-700 dark:text-gray-300"
                        >
                          <strong>{booking.flatNumber}:</strong>{" "}
                          {booking.remarks}
                        </p>
                      ),
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No remarks available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================
            Footer
        ================================================== */}

        <div className="flex justify-end border-t border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-950/60">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-600 px-6 py-2 font-medium text-white hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetailsModal;
