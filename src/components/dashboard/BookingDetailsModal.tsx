import Modal from "./Modal";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

function BookingDetailsModal({
  isOpen,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
    >
      <div className="space-y-6">

        {/* ================= Flat Information ================= */}
        <div>
          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Flat Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-gray-500">Flat Number</p>
              <p className="font-semibold">{booking.flatNumber}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tower</p>
              <p className="font-semibold">
                {booking.tower || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Floor</p>
              <p className="font-semibold">
                {booking.floor || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>

              <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                {booking.status || "Booked"}
              </span>

            </div>

          </div>
        </div>

        {/* ================= Customer Information ================= */}

        <div>

          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Customer Information
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Customer Name
              </p>

              <p className="font-semibold">
                {booking.customerName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Mobile Number
              </p>

              <p className="font-semibold">
                {booking.mobile}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="font-semibold">
                {booking.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Address
              </p>

              <p className="font-semibold">
                {booking.address || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ================= Documents ================= */}

        <div>

          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Documents
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Aadhar Number
              </p>

              <p className="font-semibold">
                {booking.aadhar || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                PAN Number
              </p>

              <p className="font-semibold">
                {booking.pan || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ================= Payment ================= */}

        <div>

          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Payment Details
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Booking Amount
              </p>

              <p className="font-semibold text-green-700">
                ₹ {booking.bookingAmount || "0"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment Mode
              </p>

              <p className="font-semibold">
                {booking.paymentMode}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Booking Date
              </p>

              <p className="font-semibold">
                {booking.bookingDate || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ================= Remarks ================= */}

        <div>

          <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
            Remarks
          </h3>

          <div className="rounded-lg bg-gray-50 p-4">

            <p className="text-gray-700">
              {booking.remarks || "No Remarks"}
            </p>

          </div>

        </div>

        {/* ================= Footer ================= */}

        <div className="flex justify-end border-t pt-5">

          <button
            onClick={onClose}
            className="rounded-lg bg-green-600 px-6 py-2 text-white transition hover:bg-green-700"
          >
            Close
          </button>

        </div>

      </div>
    </Modal>
  );
}

export default BookingDetailsModal;