import { useState } from "react";
import Modal from "./Modal";
import BookingModal from "./BookingModal";
import { useFlat } from "../../context/FlatContext";

interface FlatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedFlat: any) => void;
    onBooking: (bookingData: any) => void;

    flat: {
        number: string;
        area: string;
        status: string;
        tower: string;
        floor: number;
        type: string;
        facing: string;
    } | null;
}

function FlatModal({
    isOpen,
    onClose,
    onSave,
    onBooking,
    flat,
}: FlatModalProps) {

    if (!flat) return null;
    const { flatStatuses } = useFlat();

    const savedStatus = flatStatuses.find(
        (item) => item.number === flat.number
    );

    const currentStatus =
        savedStatus?.status ?? flat.status;

    const [isEditing, setIsEditing] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [status, setStatus] = useState(currentStatus);

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`🏠 Flat ${flat.number}`}
            >

                <div className="space-y-6">

                    {/* Heading */}
                    <div className="flex items-center justify-between border-b pb-2">

                        <h3 className="text-lg font-semibold">
                            Flat Information
                        </h3>

                        {isEditing && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                Editing
                            </span>
                        )}

                    </div>

                    {/* Flat Details */}
                    <div className="grid grid-cols-2 gap-6">

                        <div>
                            <p className="text-sm text-gray-500">Flat Number</p>
                            <p className="text-lg font-semibold">{flat.number}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Tower</p>
                            <p className="text-lg font-semibold">{flat.tower}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Floor</p>
                            <p className="text-lg font-semibold">{flat.floor}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="text-lg font-semibold">{flat.type}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Area</p>
                            <p className="text-lg font-semibold">{flat.area}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Facing</p>
                            <p className="text-lg font-semibold">{flat.facing}</p>
                        </div>

                    </div>

                    {/* Status */}
                    <div>

                        <p className="text-sm text-gray-500">
                            Status
                        </p>

                        {!isEditing ? (

                            <span
                                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${currentStatus === "available"
                                    ? "bg-green-100 text-green-700"
                                    : currentStatus === "booked"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {currentStatus}
                            </span>

                        ) : (

                            <select
                                className="mt-2 w-full rounded-lg border px-3 py-2"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="available">Available</option>
                                <option value="hold">Hold</option>
                                <option value="booked">Booked</option>
                            </select>

                        )}

                    </div>

                    {/* Buttons */}
                    <div className="border-t pt-4 flex gap-3">

                        {!isEditing ? (

                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                                >
                                    Edit Flat
                                </button>

                                <button
                                    onClick={() => setIsBookingOpen(true)}
                                    className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                                >
                                    Booking
                                </button>
                            </>

                        ) : (

                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        onSave({
                                            ...flat,
                                            status,
                                        });

                                        setIsEditing(false);
                                    }}
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                                >
                                    Save
                                </button>

                            </>

                        )}

                    </div>

                </div>

            </Modal>


            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                flat={flat}
                onConfirm={(bookingData) => {

                    onBooking(bookingData);

                    onSave({
                        ...flat,
                        status: "booked",
                    });

                    setIsBookingOpen(false);
                    onClose();

                }}
            />

        </>


    );
}

export default FlatModal;