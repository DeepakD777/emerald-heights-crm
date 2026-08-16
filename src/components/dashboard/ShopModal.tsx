import {
    X,
    Store,
    MapPin,
    Ruler,
    Tag,
} from "lucide-react";

import {
    useAuth,
} from "../../context/AuthContext";

interface Shop {
    id: string | number;

    number: string;

    floor:
        number | string;

    floorName?: string;

    type?: string;

    area: string;

    status: string;

    isFineDine?: boolean;

    tower?: string | null;

    series?: string | null;

    phaseName?: string | null;
}

interface ShopModalProps {
    isOpen: boolean;

    onClose: () => void;

    shop: Shop | null;

    onBook: (
        shop: Shop
    ) => void;

    onStatusChange: (
        shopId:
            string | number,
        status: string
    ) => void;
}

// ======================================================
// Shop Modal
// ======================================================

function ShopModal({
    isOpen,
    onClose,
    shop,
    onBook,
    onStatusChange,
}: ShopModalProps) {

    const {
        isAdmin,
    } = useAuth();

    if (
        !isOpen ||
        !shop
    ) {
        return null;
    }

    // ==================================================
    // Frontend Status
    // ==================================================

    const currentStatus =
        shop.isFineDine
            ? "finedine"
            : String(
                shop.status
            ).toLowerCase();

    // ==================================================
    // Status Color
    // ==================================================

    const getStatusColor = (
        status: string
    ) => {

        switch (status) {

            case "finedine":
                return "bg-purple-100 text-purple-700 border-purple-200";

            case "booked":
                return "bg-red-100 text-red-700 border-red-200";

            case "hold":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";

            case "sold":
                return "bg-gray-200 text-gray-700 border-gray-300";

            default:
                return "bg-green-100 text-green-700 border-green-200";
        }
    };

    // ==================================================
    // Status Text
    // ==================================================

    const getStatusText = (
        status: string
    ) => {

        switch (status) {

            case "finedine":
                return "Fine Dine";

            case "booked":
                return "Booked";

            case "hold":
                return "On Hold";

            case "sold":
                return "Sold";

            default:
                return "Available";
        }
    };

    // ==================================================
    // Floor Label
    // ==================================================

    const getFloorLabel = () => {

        if (
            shop.floorName
        ) {
            return shop.floorName;
        }

        if (
            typeof shop.floor ===
            "string"
        ) {
            return shop.floor;
        }

        if (
            shop.floor === 0
        ) {
            return "Ground Floor";
        }

        return `${shop.floor} Floor`;
    };

    // ==================================================
    // Render
    // ==================================================

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                p-4
            "
            onClick={
                onClose
            }
        >

            <div
                className="
                    w-full
                    max-w-lg
                    rounded-2xl
                    bg-white
                    shadow-2xl
                "
                onClick={(
                    event
                ) =>
                    event.stopPropagation()
                }
            >

                {/* Header */}

                <div className="flex items-center justify-between border-b p-6">

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-xl
                                bg-green-100
                            "
                        >

                            <Store
                                size={26}
                                className="text-green-600"
                            />

                        </div>

                        <div>

                            <h2 className="text-xl font-bold text-gray-800">
                                Shop {shop.number}
                            </h2>

                            <p className="text-sm text-gray-500">
                                Commercial Property
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X
                            size={22}
                        />
                    </button>

                </div>

                {/* Details */}

                <div className="space-y-4 p-6">

                    {/* Status */}

                    <div className="rounded-xl border bg-gray-50 p-4">

                        <div className="flex items-center justify-between">

                            <div className="flex items-center gap-3">

                                <Tag
                                    size={20}
                                    className="text-gray-600"
                                />

                                <span className="font-medium text-gray-700">
                                    Status
                                </span>

                            </div>

                            <span
                                className={`
                                    rounded-full
                                    border
                                    px-4
                                    py-1
                                    text-sm
                                    font-semibold

                                    ${getStatusColor(
                                        currentStatus
                                    )}
                                `}
                            >
                                {getStatusText(
                                    currentStatus
                                )}
                            </span>

                        </div>

                        {/* Admin Status Controls */}

                        {isAdmin && (

                            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        onStatusChange(
                                            shop.id,
                                            "available"
                                        )
                                    }
                                    className={`
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        transition

                                        ${
                                            currentStatus ===
                                            "available"
                                                ? "bg-green-600 text-white"
                                                : "border border-green-300 bg-white text-green-700 hover:bg-green-50"
                                        }
                                    `}
                                >
                                    Available
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onStatusChange(
                                            shop.id,
                                            "hold"
                                        )
                                    }
                                    className={`
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        transition

                                        ${
                                            currentStatus ===
                                            "hold"
                                                ? "bg-yellow-500 text-white"
                                                : "border border-yellow-300 bg-white text-yellow-700 hover:bg-yellow-50"
                                        }
                                    `}
                                >
                                    Hold
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onStatusChange(
                                            shop.id,
                                            "booked"
                                        )
                                    }
                                    className={`
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        transition

                                        ${
                                            currentStatus ===
                                            "booked"
                                                ? "bg-red-600 text-white"
                                                : "border border-red-300 bg-white text-red-700 hover:bg-red-50"
                                        }
                                    `}
                                >
                                    Booked
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onStatusChange(
                                            shop.id,
                                            "sold"
                                        )
                                    }
                                    className={`
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        transition

                                        ${
                                            currentStatus ===
                                            "sold"
                                                ? "bg-gray-700 text-white"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                        }
                                    `}
                                >
                                    Sold
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onStatusChange(
                                            shop.id,
                                            "finedine"
                                        )
                                    }
                                    className={`
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        transition

                                        ${
                                            currentStatus ===
                                            "finedine"
                                                ? "bg-purple-600 text-white"
                                                : "border border-purple-300 bg-white text-purple-700 hover:bg-purple-50"
                                        }
                                    `}
                                >
                                    Fine Dine
                                </button>

                            </div>

                        )}

                        {/* Employee Read Only */}

                        {!isAdmin && (

                            <div
                                className="
                                    mt-4
                                    rounded-lg
                                    border
                                    border-gray-200
                                    bg-white
                                    px-3
                                    py-2
                                    text-xs
                                    text-gray-500
                                "
                            >
                                View only access
                            </div>

                        )}

                    </div>

                    {/* Floor */}

                    <div className="flex items-center justify-between rounded-xl border p-4">

                        <div className="flex items-center gap-3">

                            <MapPin
                                size={20}
                                className="text-green-600"
                            />

                            <span className="font-medium text-gray-700">
                                Floor
                            </span>

                        </div>

                        <span className="font-semibold text-gray-800">
                            {getFloorLabel()}
                        </span>

                    </div>

                    {/* Area */}

                    <div className="flex items-center justify-between rounded-xl border p-4">

                        <div className="flex items-center gap-3">

                            <Ruler
                                size={20}
                                className="text-blue-600"
                            />

                            <span className="font-medium text-gray-700">
                                Area
                            </span>

                        </div>

                        <span className="font-semibold text-gray-800">
                            {shop.area}
                        </span>

                    </div>

                    {/* Shop Number */}

                    <div className="flex items-center justify-between rounded-xl border p-4">

                        <div className="flex items-center gap-3">

                            <Store
                                size={20}
                                className="text-orange-500"
                            />

                            <span className="font-medium text-gray-700">
                                Shop Number
                            </span>

                        </div>

                        <span className="font-semibold text-gray-800">
                            {shop.number}
                        </span>

                    </div>

                </div>

                {/* Footer */}

                <div className="flex justify-end gap-3 border-t bg-gray-50 p-5">

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        className="
                            rounded-lg
                            border
                            border-gray-300
                            bg-white
                            px-5
                            py-2
                            font-medium
                            text-gray-700
                            hover:bg-gray-100
                        "
                    >
                        Close
                    </button>

                    {isAdmin &&
                        currentStatus ===
                            "available" && (

                        <button
                            type="button"
                            onClick={() =>
                                onBook(
                                    shop
                                )
                            }
                            className="
                                rounded-lg
                                bg-green-600
                                px-5
                                py-2
                                font-medium
                                text-white
                                hover:bg-green-700
                            "
                        >
                            Book Shop
                        </button>

                    )}

                </div>

            </div>

        </div>
    );
}

export default ShopModal;