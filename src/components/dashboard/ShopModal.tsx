import {
    X,
    Store,
    MapPin,
    Ruler,
    Tag,
} from "lucide-react";

interface Shop {
    id: string;
    number: string;
    floor: number;
    floorName: string;
    type: string;
    area: string;
    status: string;
}

interface ShopModalProps {
    isOpen: boolean;
    onClose: () => void;
    shop: Shop | null;
    onBook: (shop: Shop) => void;
}

function ShopModal({
    isOpen,
    onClose,
    shop,
    onBook,
}: ShopModalProps) {
    if (!isOpen || !shop) {
        return null;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "booked":
                return "bg-red-100 text-red-700 border-red-200";

            case "hold":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";

            default:
                return "bg-green-100 text-green-700 border-green-200";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "booked":
                return "Booked";

            case "hold":
                return "On Hold";

            default:
                return "Available";
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
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
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* Details */}
                <div className="space-y-4 p-6">

                    {/* Status */}
                    <div className="flex items-center justify-between rounded-xl border bg-gray-50 p-4">

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
                            className={`rounded-full border px-4 py-1 text-sm font-semibold ${getStatusColor(
                                shop.status
                            )}`}
                        >
                            {getStatusText(shop.status)}
                        </span>

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
                            {shop.floorName}
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
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-100"
                    >
                        Close
                    </button>

                    {shop.status === "available" && (
                        <button
                            onClick={() => onBook(shop)}
                            className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-700"
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