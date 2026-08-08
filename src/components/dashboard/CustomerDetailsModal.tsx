import { X, User, Phone, Mail, MapPin, FileText, Building2 } from "lucide-react";

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
        (booking) =>
            booking.mobile === customer.mobile
    );

    // ======================================================
    // Total Booking Amount
    // ======================================================

    const totalAmount = customerBookings.reduce(
        (total, booking) =>
            total + (Number(booking.bookingAmount) || 0),
        0
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
                return "bg-green-100 text-green-700";

            case "hold":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >

                {/* ==================================================
            Header
        ================================================== */}

                <div className="flex items-center justify-between border-b p-6">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                            <User
                                size={28}
                                className="text-green-600"
                            />
                        </div>

                        <div>

                            <h2 className="text-2xl font-bold text-gray-800">
                                {customer.customerName}
                            </h2>

                            <p className="text-sm text-gray-500">
                                Customer Profile
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>

                </div>

                {/* ==================================================
            Customer Information
        ================================================== */}

                <div className="p-6">

                    <h3 className="mb-4 text-lg font-bold text-gray-800">
                        Customer Information
                    </h3>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* Mobile */}
                        <div className="rounded-xl border bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2">
                                <Phone
                                    size={18}
                                    className="text-green-600"
                                />

                                <span className="text-sm text-gray-500">
                                    Mobile Number
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {customer.mobile || "-"}
                            </p>

                        </div>

                        {/* Email */}
                        <div className="rounded-xl border bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2">
                                <Mail
                                    size={18}
                                    className="text-blue-600"
                                />

                                <span className="text-sm text-gray-500">
                                    Email
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {customer.email || "-"}
                            </p>

                        </div>

                        {/* Address */}
                        <div className="rounded-xl border bg-gray-50 p-4 md:col-span-2">

                            <div className="mb-2 flex items-center gap-2">
                                <MapPin
                                    size={18}
                                    className="text-orange-500"
                                />

                                <span className="text-sm text-gray-500">
                                    Address
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {customer.address || "-"}
                            </p>

                        </div>

                        {/* Aadhar */}
                        <div className="rounded-xl border bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2">
                                <FileText
                                    size={18}
                                    className="text-purple-600"
                                />

                                <span className="text-sm text-gray-500">
                                    Aadhar Number
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {customer.aadhar || "-"}
                            </p>

                        </div>

                        {/* PAN */}
                        <div className="rounded-xl border bg-gray-50 p-4">

                            <div className="mb-2 flex items-center gap-2">
                                <FileText
                                    size={18}
                                    className="text-red-500"
                                />

                                <span className="text-sm text-gray-500">
                                    PAN Number
                                </span>
                            </div>

                            <p className="font-semibold text-gray-800">
                                {customer.pan || "-"}
                            </p>

                        </div>

                    </div>

                    {/* ==================================================
              Booking Summary
          ================================================== */}

                    <div className="mt-8">

                        <h3 className="mb-4 text-lg font-bold text-gray-800">
                            Booking Summary
                        </h3>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                            <div className="rounded-xl bg-blue-50 p-5">

                                <p className="text-sm text-blue-600">
                                    Total Bookings
                                </p>

                                <p className="mt-2 text-3xl font-bold text-blue-700">
                                    {customerBookings.length}
                                </p>

                            </div>

                            <div className="rounded-xl bg-green-50 p-5">

                                <p className="text-sm text-green-600">
                                    Total Amount
                                </p>

                                <p className="mt-2 text-2xl font-bold text-green-700">
                                    ₹ {formatAmount(totalAmount)}
                                </p>

                            </div>

                            <div className="rounded-xl bg-purple-50 p-5">

                                <p className="text-sm text-purple-600">
                                    Properties
                                </p>

                                <p className="mt-2 text-3xl font-bold text-purple-700">
                                    {customerBookings.length}
                                </p>

                            </div>

                        </div>

                    </div>

                    {/* ==================================================
              Booking History
          ================================================== */}

                    <div className="mt-8">

                        <h3 className="mb-4 text-lg font-bold text-gray-800">
                            Booking History
                        </h3>

                        <div className="overflow-x-auto rounded-xl border">

                            <table className="w-full border-collapse">

                                <thead>

                                    <tr className="bg-gray-100">

                                        <th className="border-b p-3 text-left">
                                            Property
                                        </th>

                                        <th className="border-b p-3 text-left">
                                            Type
                                        </th>

                                        <th className="border-b p-3 text-left">
                                            Amount
                                        </th>

                                        <th className="border-b p-3 text-left">
                                            Payment
                                        </th>

                                        <th className="border-b p-3 text-left">
                                            Date
                                        </th>

                                        <th className="border-b p-3 text-left">
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {customerBookings.map((booking) => (

                                        <tr
                                            key={booking.id}
                                            className="hover:bg-gray-50"
                                        >

                                            {/* Property */}
                                            <td className="border-b p-3">

                                                <div className="flex items-center gap-2">

                                                    <Building2
                                                        size={18}
                                                        className="text-green-600"
                                                    />

                                                    <div>

                                                        <p className="font-semibold">
                                                            {booking.flatNumber}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {booking.tower}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* Type */}
                                            <td className="border-b p-3">

                                                {booking.tower === "Commercial"
                                                    ? "Commercial"
                                                    : "Residential"}

                                            </td>

                                            {/* Amount */}
                                            <td className="border-b p-3 font-semibold">
                                                ₹ {booking.bookingAmount}
                                            </td>

                                            {/* Payment */}
                                            <td className="border-b p-3">
                                                {booking.paymentMode || "-"}
                                            </td>

                                            {/* Date */}
                                            <td className="border-b p-3">
                                                {booking.bookingDate || "-"}
                                            </td>

                                            {/* Status */}
                                            <td className="border-b p-3">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                                                        booking.status
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

                        <h3 className="mb-3 text-lg font-bold text-gray-800">
                            Remarks
                        </h3>

                        <div className="rounded-xl border bg-gray-50 p-4">

                            {customerBookings.some(
                                (booking) => booking.remarks
                            ) ? (

                                <div className="space-y-2">

                                    {customerBookings.map(
                                        (booking) =>
                                            booking.remarks && (
                                                <p
                                                    key={booking.id}
                                                    className="text-sm text-gray-700"
                                                >
                                                    <strong>
                                                        {booking.flatNumber}:
                                                    </strong>{" "}
                                                    {booking.remarks}
                                                </p>
                                            )
                                    )}

                                </div>

                            ) : (

                                <p className="text-sm text-gray-500">
                                    No remarks available.
                                </p>

                            )}

                        </div>

                    </div>

                </div>

                {/* ==================================================
            Footer
        ================================================== */}

                <div className="flex justify-end border-t bg-gray-50 p-5">

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