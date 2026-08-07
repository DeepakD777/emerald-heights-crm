import { useEffect, useState } from "react";
import Modal from "./Modal";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (bookingData: any) => void;
    booking?: any;
    mode?: "create" | "edit";

    flat: {
        number: string;
        tower: string;
        floor: number;
        status?: string;
    } | null;
}

function BookingModal({
    isOpen,
    onClose,
    onConfirm,
    flat,
    booking,
    mode = "create",
}: BookingModalProps) {
    if (!flat) return null;

    const [formData, setFormData] = useState({
        customerName: "",
        mobile: "",
        email: "",
        address: "",
        aadhar: "",
        pan: "",
        bookingAmount: "",
        paymentMode: "Cash",
        bookingDate: "",
        remarks: "",
    });
    useEffect(() => {

        if (mode === "edit" && booking) {

            setFormData({
                customerName: booking.customerName,
                mobile: booking.mobile,
                email: booking.email,
                address: booking.address,
                aadhar: booking.aadhar,
                pan: booking.pan,
                bookingAmount: booking.bookingAmount,
                paymentMode: booking.paymentMode,
                bookingDate: booking.bookingDate,
                remarks: booking.remarks,
            });

        }

    }, [booking, mode]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                mode === "edit"
                    ? `Edit Booking - ${flat.number}`
                    : `Booking - ${flat.number}`
            }
        >
            <div className="space-y-5">

                {/* Flat Info */}
                <div className="rounded-lg bg-gray-100 p-4">
                    <p><strong>Flat:</strong> {flat.number}</p>
                    <p><strong>Tower:</strong> {flat.tower}</p>
                    <p><strong>Floor:</strong> {flat.floor}</p>
                </div>

                {/* Customer Name */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Customer Name
                    </label>
                    <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2"
                    />
                </div>

                {/* Mobile */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Mobile Number
                    </label>
                    <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2"
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Address
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2"
                        rows={3}
                    />
                </div>

                {/* Aadhar & PAN */}
                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Aadhar Number
                        </label>

                        <input
                            type="text"
                            name="aadhar"
                            value={formData.aadhar}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            PAN Number
                        </label>

                        <input
                            type="text"
                            name="pan"
                            value={formData.pan}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                </div>

                {/* Amount & Payment */}
                <div className="grid grid-cols-2 gap-4">

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Booking Amount
                        </label>

                        <input
                            type="number"
                            name="bookingAmount"
                            value={formData.bookingAmount}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Payment Mode
                        </label>

                        <select
                            name="paymentMode"
                            value={formData.paymentMode}
                            onChange={handleChange}
                            className="w-full rounded-lg border p-2"
                        >
                            <option>Cash</option>
                            <option>UPI</option>
                            <option>Cheque</option>
                            <option>Bank Transfer</option>
                        </select>
                    </div>

                </div>

                {/* Booking Date */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Booking Date
                    </label>

                    <input
                        type="date"
                        name="bookingDate"
                        value={formData.bookingDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2"
                    />
                </div>

                {/* Remarks */}
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Remarks
                    </label>

                    <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        className="w-full rounded-lg border p-2"
                        rows={3}
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 border-t pt-4">

                    <button
                        onClick={onClose}
                        className="rounded-lg bg-gray-500 px-5 py-2 text-white"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {

                            if (!formData.customerName || !formData.mobile) {
                                alert("Customer Name and Mobile Number are required.");
                                return;
                            }

                            onConfirm({
                                id: booking?.id ?? crypto.randomUUID(),
                                ...formData,
                                flatNumber: flat.number,
                                tower: flat.tower,
                                floor: flat.floor,
                                status: "booked",
                            });

                            onClose();

                        }}
                        className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                    >
                        {mode === "edit"
                            ? "Update Booking"
                            : "Confirm Booking"}
                    </button>

                </div>

            </div>
        </Modal>
    );
}

export default BookingModal;