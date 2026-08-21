import {
    useEffect,
    useState,
} from "react";

import Modal from "./Modal";
import BookingModal from "./BookingModal";

import {
    useAuth,
} from "../../context/AuthContext";

// ======================================================
// Types
// ======================================================

interface FlatModalProps {
    isOpen: boolean;

    onClose: () => void;

    onSave: (
        updatedFlat: any
    ) => void | Promise<void>;

    onBooking: (
        bookingData: any
    ) => void | Promise<void>;

    flat: {
        id?: string;
        propertyId?: string;
        propertyCode?: string;

        number: string;
        unitNumber?: string;

        area: string;
        status: string;

        tower: string;
        block?: string;
        phase?: string;

        floor: number;

        type: string;

        facing?: string;
        kitchen?: string;

        price?: number | null;

        isFineDine?: boolean;
    } | null;
}

// ======================================================
// Flat Modal
// ======================================================

function FlatModal({
    isOpen,
    onClose,
    onSave,
    onBooking,
    flat,
}: FlatModalProps) {

    const {
        isAdmin,
    } = useAuth();

    // ==================================================
    // Local State
    // ==================================================

    const [
        isEditing,
        setIsEditing,
    ] = useState(false);

    const [
        isBookingOpen,
        setIsBookingOpen,
    ] = useState(false);

    const [
        status,
        setStatus,
    ] = useState(
        "available"
    );

    // ==================================================
    // Backend Status
    // ==================================================

    const currentStatus =
        flat?.status ??
        "available";

    // ==================================================
    // Sync Local State
    // ==================================================

    useEffect(() => {

        setStatus(
            currentStatus
        );

        setIsEditing(
            false
        );

        setIsBookingOpen(
            false
        );

    }, [
        currentStatus,
        flat?.number,
    ]);

    // ==================================================
    // No Flat
    // ==================================================

    if (!flat) {
        return null;
    }

    // ==================================================
    // Status Style
    // ==================================================

    const getStatusStyle = () => {

        switch (
        currentStatus
        ) {

            case "booked":
                return `
                    bg-red-100
                    text-red-700
                `;

            case "hold":
                return `
                    bg-yellow-100
                    text-yellow-700
                `;

            case "sold":
                return `
                    bg-gray-200
                    text-gray-700
                `;

            default:
                return `
                    bg-green-100
                    text-green-700
                `;
        }
    };

    // ==================================================
    // Save Changes
    // ==================================================

    const handleSave =
        async () => {

            if (!isAdmin) {
                return;
            }

            await onSave({
                ...flat,
                status,
            });

            setIsEditing(
                false
            );
        };

    // ==================================================
    // Booking Confirm
    // ==================================================

    const handleBookingConfirm =
        async (
            bookingData: any
        ) => {

            if (!isAdmin) {
                return;
            }

            await onBooking(
                bookingData
            );

            setIsBookingOpen(
                false
            );

            onClose();
        };

    // ==================================================
    // Render
    // ==================================================

    return (
        <>

            <Modal
                isOpen={
                    isOpen
                }
                onClose={
                    onClose
                }
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

                        {isAdmin &&
                            isEditing && (

                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                    Editing
                                </span>

                            )}

                    </div>



                    {/* Flat Details */}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

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
                                Block
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.block || "-"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Tower / Project
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.tower || "-"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Floor
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                Floor {flat.floor}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Facing
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.facing || "-"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Kitchen
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.kitchen || "-"}
                            </p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">
                                Area
                            </p>

                            <p className="mt-1 text-lg font-semibold">
                                {flat.area || "Area not set"}
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

                    </div>

                    {/* Status */}

                    <div>

                        <p className="mb-2 text-sm text-gray-500">
                            Status
                        </p>

                        {!isAdmin ||
                            !isEditing ? (

                            <span
                                className={`
                                    inline-block
                                    rounded-full
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    capitalize

                                    ${getStatusStyle()}
                                `}
                            >
                                {currentStatus}
                            </span>

                        ) : (

                            <select
                                value={
                                    status
                                }
                                onChange={(
                                    event
                                ) =>
                                    setStatus(
                                        event.target.value
                                    )
                                }
                                className="
                                    w-full
                                    rounded-lg
                                    border
                                    px-3
                                    py-2
                                    outline-none
                                    focus:border-blue-500
                                "
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

                                <option value="sold">
                                    Sold
                                </option>

                            </select>

                        )}

                    </div>

                    {/* Actions */}

                    <div className="border-t pt-4">

                        {isAdmin ? (

                            <div className="flex flex-wrap gap-3">

                                {!isEditing ? (

                                    <>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setIsEditing(
                                                    true
                                                )
                                            }
                                            className="
                                                rounded-lg
                                                bg-blue-600
                                                px-5
                                                py-2
                                                text-white
                                                transition
                                                hover:bg-blue-700
                                            "
                                        >
                                            Edit Flat
                                        </button>

                                        {currentStatus ===
                                            "available" && (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIsBookingOpen(
                                                            true
                                                        )
                                                    }
                                                    className="
                                                    rounded-lg
                                                    bg-green-600
                                                    px-5
                                                    py-2
                                                    text-white
                                                    transition
                                                    hover:bg-green-700
                                                "
                                                >
                                                    Book Flat
                                                </button>

                                            )}

                                        {currentStatus ===
                                            "booked" && (

                                                <span className="rounded-lg bg-red-100 px-5 py-2 font-medium text-red-700">
                                                    Already Booked
                                                </span>

                                            )}

                                        {currentStatus ===
                                            "hold" && (

                                                <span className="rounded-lg bg-yellow-100 px-5 py-2 font-medium text-yellow-700">
                                                    Flat On Hold
                                                </span>

                                            )}

                                        {currentStatus ===
                                            "sold" && (

                                                <span className="rounded-lg bg-gray-200 px-5 py-2 font-medium text-gray-700">
                                                    Flat Sold
                                                </span>

                                            )}

                                    </>

                                ) : (

                                    <>

                                        <button
                                            type="button"
                                            onClick={() => {

                                                setStatus(
                                                    currentStatus
                                                );

                                                setIsEditing(
                                                    false
                                                );
                                            }}
                                            className="
                                                rounded-lg
                                                bg-gray-500
                                                px-5
                                                py-2
                                                text-white
                                                transition
                                                hover:bg-gray-600
                                            "
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            onClick={
                                                handleSave
                                            }
                                            className="
                                                rounded-lg
                                                bg-blue-600
                                                px-5
                                                py-2
                                                text-white
                                                transition
                                                hover:bg-blue-700
                                            "
                                        >
                                            Save Changes
                                        </button>

                                    </>

                                )}

                            </div>

                        ) : (

                            <div
                                className="
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-gray-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-gray-600
                                "
                            >
                                View only access — property changes can only be made by an administrator.
                            </div>

                        )}

                    </div>

                </div>

            </Modal>

            {/* Booking Modal - ADMIN ONLY */}

            {isAdmin && (

                <BookingModal
                    isOpen={
                        isBookingOpen
                    }
                    onClose={() =>
                        setIsBookingOpen(
                            false
                        )
                    }
                    flat={{
                        number:
                            flat.number,

                        tower:
                            flat.tower,

                        floor:
                            flat.floor,

                        status:
                            currentStatus,
                    }}
                    onConfirm={
                        handleBookingConfirm
                    }
                />

            )}

        </>
    );
}

export default FlatModal;