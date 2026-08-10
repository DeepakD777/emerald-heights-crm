import { useState } from "react";

import { commercialShops } from "../../data/commercialData";

import ShopModal from "../../components/dashboard/ShopModal";
import BookingModal from "../../components/dashboard/BookingModal";

import { useBooking } from "../../context/BookingContext";

interface CommercialShop {
    id: number;
    number: string;
    floor: number;
    area: string;
    status: string;
}

function Commercial() {
    const { addBooking } = useBooking();

    // ======================================================
    // Floor Filter
    // ======================================================

    const [selectedFloor, setSelectedFloor] = useState<
        "all" | 0 | 1 | 2 | 3
    >("all");

    // ======================================================
    // Shops State
    // ======================================================

    const [shops, setShops] = useState<CommercialShop[]>(() => {
        const savedShops = localStorage.getItem("commercialShops");

        return savedShops
            ? JSON.parse(savedShops)
            : commercialShops;
    });

    // ======================================================
    // Selected Shop
    // ======================================================

    const [selectedShop, setSelectedShop] =
        useState<any>(null);

    // ======================================================
    // Modals
    // ======================================================

    const [isShopModalOpen, setIsShopModalOpen] =
        useState(false);

    const [isBookingModalOpen, setIsBookingModalOpen] =
        useState(false);

    // ======================================================
    // Floor Filter
    // ======================================================

    const filteredShops =
        selectedFloor === "all"
            ? shops
            : shops.filter(
                (shop) => shop.floor === selectedFloor
            );

    // ======================================================
    // Floor Name
    // ======================================================

    const getFloorName = (floor: number) => {
        switch (floor) {
            case 0:
                return "Ground Floor";

            case 1:
                return "1st Floor";

            case 2:
                return "2nd Floor";

            case 3:
                return "3rd Floor";

            default:
                return "";
        }
    };

    // ======================================================
    // Shop Color
    // ======================================================

    const getShopColor = (status: string) => {
        switch (status) {
            case "booked":
                return "bg-red-100 border-red-400 text-red-700";

            case "hold":
                return "bg-yellow-100 border-yellow-400 text-yellow-700";

            default:
                return "bg-green-100 border-green-400 text-green-700";
        }
    };

    // ======================================================
    // Open Shop Details
    // ======================================================

    const handleShopClick = (shop: any) => {
        setSelectedShop(shop);
        setIsShopModalOpen(true);
    };

    // ======================================================
    // Change Commercial Shop Status
    // ======================================================

    const handleStatusChange = (
        shopId: string | number,
        newStatus: string
    ) => {

        setShops((prevShops) => {

            const updatedShops = prevShops.map((shop) =>
                shop.id === shopId
                    ? {
                        ...shop,
                        status: newStatus,
                    }
                    : shop
            );

            // Save updated status
            localStorage.setItem(
                "commercialShops",
                JSON.stringify(updatedShops)
            );

            // Update currently selected shop
            const updatedSelectedShop = updatedShops.find(
                (shop) => shop.id === shopId
            );

            if (updatedSelectedShop) {
                setSelectedShop(updatedSelectedShop);
            }

            return updatedShops;
        });
    };

    // ======================================================
    // Open Booking Modal
    // ======================================================

    const handleBookShop = (shop: any) => {

        // Already booked shop ko dobara book nahi karna
        if (shop.status === "booked") {
            return;
        }

        setSelectedShop(shop);

        setIsShopModalOpen(false);

        setIsBookingModalOpen(true);
    };

    // ======================================================
    // Confirm Commercial Booking
    // ======================================================

    const handleConfirmBooking = (bookingData: any) => {

        if (!selectedShop) return;

        // ==================================================
        // Save Booking in BookingContext
        // ==================================================

        addBooking({
            ...bookingData,

            id: bookingData.id,

            flatNumber: selectedShop.number,

            tower: "Commercial",

            floor: selectedShop.floor,

            status: "booked",
        });

        // ==================================================
        // Update Shop Status
        // ==================================================

        setShops((prevShops) => {

            const updatedShops = prevShops.map((shop) => {

                if (shop.id === selectedShop.id) {
                    return {
                        ...shop,
                        status: "booked",
                    };
                }

                return shop;
            });

            // Save updated shop inventory
            localStorage.setItem(
                "commercialShops",
                JSON.stringify(updatedShops)
            );

            return updatedShops;
        });

        // ==================================================
        // Close Booking Modal
        // ==================================================

        setIsBookingModalOpen(false);

        // ==================================================
        // Clear Selected Shop
        // ==================================================

        setSelectedShop(null);
    };

    // ======================================================
    // UI
    // ======================================================

    return (
        <div className="space-y-6">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex items-center justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            Commercial
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Commercial Shop Inventory
                        </p>

                    </div>

                    <div className="text-right">

                        <p className="text-sm text-gray-500">
                            Total Shops
                        </p>

                        <p className="text-2xl font-bold text-gray-800">
                            {shops.length}
                        </p>

                    </div>

                </div>

            </div>

            {/* ==================================================
                Floor Filters
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex flex-wrap gap-3">

                    {/* All */}

                    <button
                        onClick={() => setSelectedFloor("all")}
                        className={`rounded-lg px-5 py-2 font-medium transition ${selectedFloor === "all"
                            ? "bg-green-600 text-white"
                            : "border bg-white hover:bg-gray-100"
                            }`}
                    >
                        All
                    </button>

                    {/* Floors */}

                    {[0, 1, 2, 3].map((floor) => (

                        <button
                            key={floor}
                            onClick={() =>
                                setSelectedFloor(
                                    floor as 0 | 1 | 2 | 3
                                )
                            }
                            className={`rounded-lg px-5 py-2 font-medium transition ${selectedFloor === floor
                                ? "bg-green-600 text-white"
                                : "border bg-white hover:bg-gray-100"
                                }`}
                        >
                            {getFloorName(floor)}
                        </button>

                    ))}

                </div>

            </div>

            {/* ==================================================
                Shop Inventory
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6 flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-gray-800">

                            {selectedFloor === "all"
                                ? "All Commercial Shops"
                                : getFloorName(selectedFloor)}

                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {filteredShops.length} shops
                        </p>

                    </div>

                </div>

                {/* Shop Grid */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">

                    {filteredShops.map((shop) => (

                        <div
                            key={shop.id}
                            onClick={() => handleShopClick(shop)}
                            className={`cursor-pointer rounded-lg border p-3 text-center transition hover:scale-105 ${getShopColor(
                                shop.status
                            )}`}
                        >

                            <p className="font-bold">
                                {shop.number}
                            </p>

                            <p className="mt-1 text-xs">
                                {shop.area}
                            </p>

                            <p className="mt-1 text-xs capitalize">
                                {shop.status}
                            </p>

                        </div>

                    ))}

                </div>

            </div>

            {/* ==================================================
                Legend
            ================================================== */}

            <div className="rounded-2xl bg-white p-5 shadow">

                <div className="flex flex-wrap gap-6 text-sm">

                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-green-500" />
                        Available
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-yellow-400" />
                        Hold
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-red-500" />
                        Booked
                    </div>

                </div>

            </div>

            {/* ==================================================
                Shop Details Modal
            ================================================== */}

            <ShopModal
                isOpen={isShopModalOpen}
                onClose={() => {
                    setIsShopModalOpen(false);
                    setSelectedShop(null);
                }}
                shop={selectedShop}
                onBook={handleBookShop}
                onStatusChange={handleStatusChange}
            />

            {/* ==================================================
                Booking Modal
            ================================================== */}

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false);
                    setSelectedShop(null);
                }}
                onConfirm={handleConfirmBooking}
                flat={
                    selectedShop
                        ? {
                            number: selectedShop.number,
                            tower: "Commercial",
                            floor: selectedShop.floor,
                            status: selectedShop.status,
                        }
                        : null
                }
                mode="create"
            />

        </div>
    );
}

export default Commercial;