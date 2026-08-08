import { useEffect, useState } from "react";
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
    const { flatStatuses } = useFlat();

    const [isEditing, setIsEditing] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [status, setStatus] = useState("available");

    /*
     * Saved status from FlatContext
     */
    const savedStatus = flat
        ? flatStatuses.find(
            (item) => item.number === flat.number
        )
        : null;

    const currentStatus =
        savedStatus?.status ?? flat?.status ?? "available";

    /*
     * Update local status whenever selected flat changes
     */
    useEffect(() => {
        setStatus(currentStatus);
        setIsEditing(false);
        setIsBookingOpen(false);
    }, [currentStatus, flat?.number]);

    /*
     * No flat selected
     */
    if (!flat) return null;

    const getStatusStyle = () => {
        switch (currentStatus) {
            case "booked":
                return "bg-red-100 text-red-700";

            case "hold":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-green-100 text-green-700";
        }
    };

    return (
        <>
            {/* ================================
                Flat Details Modal
            ================================= */}

            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`🏠 Flat ${flat.number}`}
            >
                <div className="space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-3">

                        <div>
                            <h3 className="text-lg font-semibold">
                                Flat Information
                            </h3>

                            <p className="text-sm text-gray-500">
                                Residential Property
                            </p>
                        </div>

                        {isEditing && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                Editing
                            </span>
                        )}

                    </div>

                    {/* Flat Details */}
                    <div className="grid grid-cols-2 gap-5">

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Flat Number
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.number}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Tower
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.tower}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Floor
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.floor}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Type
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.type}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Area
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.area}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Facing
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.facing}
                            </p>
                        </div>

                    </div>

                    {/* Status */}
                    <div>

                        <p className="mb-2 text-sm text-gray-500">
                            Status
                        </p>

                        {!isEditing ? (

                            <span
                                className={`inline-block rounded-full px-4 py-2 text-sm font-medium capitalize ${getStatusStyle()}`}
                            >
                                {currentStatus}
                            </span>

                        ) : (

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value)
                                }
                                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
                            >
                                <option value="available">
                                    Available
                                </option>

                                <option value="hold">
                                    Hold
                                </option>

                                <option value="booked">
                                    Booked
                                </option>
                            </select>

                        )}

                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 border-t pt-4">

                        {!isEditing ? (

                            <>
                                {/* Edit */}
                                <button
                                    onClick={() =>
                                        setIsEditing(true)
                                    }
                                    className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                                >
                                    Edit Flat
                                </button>

                                {/* Booking */}
                                {currentStatus === "available" && (
                                    <button
                                        onClick={() =>
                                            setIsBookingOpen(true)
                                        }
                                        className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
                                    >
                                        Book Flat
                                    </button>
                                )}

                                {/* Booked Message */}
                                {currentStatus === "booked" && (
                                    <span className="rounded-lg bg-red-100 px-5 py-2 font-medium text-red-700">
                                        Already Booked
                                    </span>
                                )}

                                {/* Hold Message */}
                                {currentStatus === "hold" && (
                                    <span className="rounded-lg bg-yellow-100 px-5 py-2 font-medium text-yellow-700">
                                        Flat On Hold
                                    </span>
                                )}

                            </>

                        ) : (

                            <>
                                {/* Cancel Edit */}
                                <button
                                    onClick={() => {
                                        setStatus(currentStatus);
                                        setIsEditing(false);
                                    }}
                                    className="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
                                >
                                    Cancel
                                </button>

                                {/* Save */}
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
                                    Save Changes
                                </button>
                            </>

                        )}

                    </div>

                </div>
            </Modal>

            {/* ================================
                Booking Modal
            ================================= */}

            <BookingModal
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                flat={{
                    number: flat.number,
                    tower: flat.tower,
                    floor: flat.floor,
                    status: currentStatus,
                }}
                onConfirm={(bookingData) => {

                    /*
                     * Add booking to BookingContext
                     */
                    onBooking(bookingData);

                    /*
                     * Update flat status
                     */
                    onSave({
                        ...flat,
                        status: "booked",
                    });

                    /*
                     * Close booking modal
                     */
                    setIsBookingOpen(false);

                    /*
                     * Close flat details modal
                     */
                    onClose();

                }}
            />

        </>
    );
}

export default FlatModal;