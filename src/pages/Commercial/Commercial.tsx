import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";

import {
    commercialShops,
} from "../../data/commercialData";

import ShopModal from "../../components/dashboard/ShopModal";
import BookingModal from "../../components/dashboard/BookingModal";

import { useBooking } from "../../context/BookingContext";

// ======================================================
// Types
// ======================================================

type Phase = 1 | 2;

type Floor = 0 | 1 | 2 | 3;

type FloorFilter = "all" | Floor;

type Status =
    | "all"
    | "available"
    | "hold"
    | "booked";

// ======================================================
// Commercial
// ======================================================

function Commercial() {

    // ==================================================
    // Booking Context
    // ==================================================

    const {
        addBooking,
    } = useBooking();

    // ==================================================
    // Phase
    // ==================================================

    const [selectedPhase, setSelectedPhase] =
        useState<Phase>(1);

    // ==================================================
    // Floor
    // ==================================================

    const [selectedFloor, setSelectedFloor] =
        useState<FloorFilter>("all");

    // ==================================================
    // Status
    // ==================================================

    const [selectedStatus, setSelectedStatus] =
        useState<Status>("all");

    // ==================================================
    // Search
    // ==================================================

    const [search, setSearch] =
        useState("");

    // ==================================================
    // Shops
    // ==================================================
    //
    // IMPORTANT:
    // any[] intentionally used here because the existing
    // ShopModal / BookingModal have their own Shop type.
    // This avoids breaking existing modal functionality.
    //
    // ==================================================

    const [shops, setShops] =
        useState<any[]>(() => {

            const saved =
                localStorage.getItem(
                    "commercialShops"
                );

            if (!saved) {

                return commercialShops;

            }

            try {

                const parsed =
                    JSON.parse(saved);

                // --------------------------------------
                // Old data protection
                // --------------------------------------

                const isNewData =
                    Array.isArray(parsed) &&
                    parsed.some(
                        (shop: any) =>
                            shop.phase === 1 ||
                            shop.phase === 2
                    );

                if (isNewData) {

                    return parsed;

                }

                return commercialShops;

            } catch {

                return commercialShops;

            }

        });

    // ==================================================
    // Selected Shop
    // ==================================================

    const [selectedShop, setSelectedShop] =
        useState<any>(null);

    // ==================================================
    // Modals
    // ==================================================

    const [isShopModalOpen, setIsShopModalOpen] =
        useState(false);

    const [isBookingModalOpen, setIsBookingModalOpen] =
        useState(false);

    // ==================================================
    // Phase Name
    // ==================================================

    const getPhaseName = (
        phase: Phase
    ) => {

        if (phase === 1) {

            return "Phase 1 - Commercial Hub";

        }

        return "Phase 2 - Commercial 1";

    };

    // ==================================================
    // Floor Name
    // ==================================================

    const getFloorName = (
        floor: number
    ) => {

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

    // ==================================================
    // Phase Total
    // ==================================================

    const phaseTotal =
        useMemo(() => {

            return shops.filter(
                (shop) =>
                    shop.phase ===
                    selectedPhase
            ).length;

        }, [
            shops,
            selectedPhase,
        ]);

    // ==================================================
    // Phase Available
    // ==================================================

    const phaseAvailable =
        useMemo(() => {

            return shops.filter(
                (shop) =>
                    shop.phase ===
                        selectedPhase &&
                    shop.status ===
                        "available"
            ).length;

        }, [
            shops,
            selectedPhase,
        ]);

    // ==================================================
    // Phase Booked
    // ==================================================

    const phaseBooked =
        useMemo(() => {

            return shops.filter(
                (shop) =>
                    shop.phase ===
                        selectedPhase &&
                    shop.status ===
                        "booked"
            ).length;

        }, [
            shops,
            selectedPhase,
        ]);

    // ==================================================
    // Phase Hold
    // ==================================================

    const phaseHold =
        useMemo(() => {

            return shops.filter(
                (shop) =>
                    shop.phase ===
                        selectedPhase &&
                    shop.status ===
                        "hold"
            ).length;

        }, [
            shops,
            selectedPhase,
        ]);

    // ==================================================
    // Floor Total
    // ==================================================

    const getFloorTotal = (
        floor: Floor
    ) => {

        return shops.filter(
            (shop) =>
                shop.phase ===
                    selectedPhase &&
                shop.floor ===
                    floor
        ).length;

    };

    // ==================================================
    // Filtered Shops
    // ==================================================

    const filteredShops =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            return shops.filter(
                (shop) => {

                    // ----------------------------------
                    // Phase
                    // ----------------------------------

                    if (
                        shop.phase !==
                        selectedPhase
                    ) {

                        return false;

                    }

                    // ----------------------------------
                    // Floor
                    // ----------------------------------

                    if (
                        selectedFloor !==
                            "all" &&
                        shop.floor !==
                            selectedFloor
                    ) {

                        return false;

                    }

                    // ----------------------------------
                    // Status
                    // ----------------------------------

                    if (
                        selectedStatus !==
                            "all" &&
                        shop.status !==
                            selectedStatus
                    ) {

                        return false;

                    }

                    // ----------------------------------
                    // Search
                    // ----------------------------------

                    if (
                        searchText &&
                        !String(
                            shop.number
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            )
                    ) {

                        return false;

                    }

                    return true;

                }
            );

        }, [
            shops,
            selectedPhase,
            selectedFloor,
            selectedStatus,
            search,
        ]);

    // ==================================================
    // Shop Color
    // ==================================================

    const getShopColor = (
        status: string
    ) => {

        if (
            status ===
            "booked"
        ) {

            return `
                bg-red-50
                border-red-400
                text-red-700
                hover:bg-red-100
                hover:border-red-500
            `;

        }

        if (
            status ===
            "hold"
        ) {

            return `
                bg-yellow-50
                border-yellow-400
                text-yellow-700
                hover:bg-yellow-100
                hover:border-yellow-500
            `;

        }

        return `
            bg-green-50
            border-green-400
            text-green-700
            hover:bg-green-100
            hover:border-green-500
        `;

    };

    // ==================================================
    // Status Text
    // ==================================================

    const getStatusText = (
        status: string
    ) => {

        if (
            status ===
            "booked"
        ) {

            return "BOOKED";

        }

        if (
            status ===
            "hold"
        ) {

            return "HOLD";

        }

        return "AVAILABLE";

    };

    // ==================================================
    // Open Shop
    // ==================================================

    const handleShopClick = (
        shop: any
    ) => {

        setSelectedShop(
            shop
        );

        setIsShopModalOpen(
            true
        );

    };

    // ==================================================
    // Update Shop Status
    // ==================================================

    const handleStatusChange = (
        shopId: string | number,
        newStatus: string
    ) => {

        setShops(
            (previousShops) => {

                const updatedShops =
                    previousShops.map(
                        (shop) => {

                            if (
                                String(
                                    shop.id
                                ) !==
                                String(
                                    shopId
                                )
                            ) {

                                return shop;

                            }

                            return {

                                ...shop,

                                status:
                                    newStatus,

                            };

                        }
                    );

                // --------------------------------------
                // Save
                // --------------------------------------

                localStorage.setItem(
                    "commercialShops",
                    JSON.stringify(
                        updatedShops
                    )
                );

                // --------------------------------------
                // Update selected shop
                // --------------------------------------

                const updatedShop =
                    updatedShops.find(
                        (shop) =>
                            String(
                                shop.id
                            ) ===
                            String(
                                shopId
                            )
                    );

                if (
                    updatedShop
                ) {

                    setSelectedShop(
                        updatedShop
                    );

                }

                return updatedShops;

            }
        );

    };

    // ==================================================
    // Book Shop
    // ==================================================

    const handleBookShop = (
        shop: any
    ) => {

        if (
            shop?.status ===
            "booked"
        ) {

            return;

        }

        setSelectedShop(
            shop
        );

        setIsShopModalOpen(
            false
        );

        setIsBookingModalOpen(
            true
        );

    };

    // ==================================================
    // Confirm Booking
    // ==================================================

    const handleConfirmBooking = (
        bookingData: any
    ) => {

        if (
            !selectedShop
        ) {

            return;

        }

        // ----------------------------------------------
        // Add booking
        // ----------------------------------------------

        addBooking({

            ...bookingData,

            flatNumber:
                selectedShop.number,

            tower:
                "Commercial",

            floor:
                selectedShop.floor,

            status:
                "booked",

        });

        // ----------------------------------------------
        // Update shop
        // ----------------------------------------------

        setShops(
            (previousShops) => {

                const updatedShops =
                    previousShops.map(
                        (shop) => {

                            if (
                                shop.id !==
                                selectedShop.id
                            ) {

                                return shop;

                            }

                            return {

                                ...shop,

                                status:
                                    "booked",

                            };

                        }
                    );

                localStorage.setItem(
                    "commercialShops",
                    JSON.stringify(
                        updatedShops
                    )
                );

                return updatedShops;

            }
        );

        // ----------------------------------------------
        // Close
        // ----------------------------------------------

        setIsBookingModalOpen(
            false
        );

        setSelectedShop(
            null
        );

    };

    // ==================================================
    // Reset Filters
    // ==================================================

    const resetFilters = () => {

        setSelectedFloor(
            "all"
        );

        setSelectedStatus(
            "all"
        );

        setSearch("");

    };

    // ==================================================
    // Phase Change
    // ==================================================

    const handlePhaseChange = (
        phase: Phase
    ) => {

        setSelectedPhase(
            phase
        );

        resetFilters();

    };

    // ==================================================
    // Render
    // ==================================================

    return (

        <div className="space-y-6">

            {/* ==================================================
                Header
            ================================================== */}

            <div>

                <h1 className="text-2xl font-bold text-gray-800">

                    Commercial

                </h1>

                <p className="mt-1 text-gray-500">

                    Commercial Shop Inventory

                </p>

            </div>


            {/* ==================================================
                Phase Selector
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <p className="mb-3 text-sm font-medium text-gray-600">

                    Select Phase

                </p>

                <div className="flex flex-wrap gap-3">

                    {/* Phase 1 */}

                    <button
                        type="button"
                        onClick={() =>
                            handlePhaseChange(
                                1
                            )
                        }
                        className={`
                            rounded-xl
                            border
                            px-6
                            py-3
                            font-semibold
                            transition-all
                            duration-200

                            ${
                                selectedPhase ===
                                1
                                    ? `
                                        border-green-600
                                        bg-green-600
                                        text-white
                                        shadow-md
                                      `
                                    : `
                                        border-gray-300
                                        bg-white
                                        text-gray-700
                                        hover:border-green-500
                                        hover:bg-green-50
                                      `
                            }
                        `}
                    >

                        Phase 1

                        <span className="ml-2 text-xs opacity-80">

                            Commercial Hub · 216 Shops

                        </span>

                    </button>


                    {/* Phase 2 */}

                    <button
                        type="button"
                        onClick={() =>
                            handlePhaseChange(
                                2
                            )
                        }
                        className={`
                            rounded-xl
                            border
                            px-6
                            py-3
                            font-semibold
                            transition-all
                            duration-200

                            ${
                                selectedPhase ===
                                2
                                    ? `
                                        border-green-600
                                        bg-green-600
                                        text-white
                                        shadow-md
                                      `
                                    : `
                                        border-gray-300
                                        bg-white
                                        text-gray-700
                                        hover:border-green-500
                                        hover:bg-green-50
                                      `
                            }
                        `}
                    >

                        Phase 2

                        <span className="ml-2 text-xs opacity-80">

                            Commercial 1 · 344 Shops

                        </span>

                    </button>

                </div>

            </div>


            {/* ==================================================
                Summary
            ================================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                {/* Total */}

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">

                        Total Shops

                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-800">

                        {phaseTotal}

                    </p>

                </div>


                {/* Available */}

                <div className="rounded-2xl bg-green-50 p-5">

                    <p className="text-sm text-green-700">

                        Available

                    </p>

                    <p className="mt-1 text-3xl font-bold text-green-700">

                        {phaseAvailable}

                    </p>

                </div>


                {/* Booked */}

                <div className="rounded-2xl bg-red-50 p-5">

                    <p className="text-sm text-red-700">

                        Booked

                    </p>

                    <p className="mt-1 text-3xl font-bold text-red-700">

                        {phaseBooked}

                    </p>

                </div>


                {/* Hold */}

                <div className="rounded-2xl bg-yellow-50 p-5">

                    <p className="text-sm text-yellow-700">

                        Hold

                    </p>

                    <p className="mt-1 text-3xl font-bold text-yellow-700">

                        {phaseHold}

                    </p>

                </div>

            </div>


            {/* ==================================================
                Floor Selector
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <p className="mb-3 text-sm font-medium text-gray-600">

                    Select Floor

                </p>

                <div className="flex flex-wrap gap-3">

                    {/* All */}

                    <button
                        type="button"
                        onClick={() =>
                            setSelectedFloor(
                                "all"
                            )
                        }
                        className={`
                            rounded-lg
                            border
                            px-5
                            py-2.5
                            font-medium
                            transition-all

                            ${
                                selectedFloor ===
                                "all"
                                    ? `
                                        border-blue-600
                                        bg-blue-600
                                        text-white
                                      `
                                    : `
                                        border-gray-300
                                        bg-white
                                        text-gray-700
                                        hover:bg-gray-100
                                      `
                            }
                        `}
                    >

                        All Floors

                    </button>


                    {/* Floors */}

                    {(
                        [0, 1, 2, 3] as Floor[]
                    ).map(
                        (floor) => (

                            <button
                                key={floor}
                                type="button"
                                onClick={() =>
                                    setSelectedFloor(
                                        floor
                                    )
                                }
                                className={`
                                    rounded-lg
                                    border
                                    px-5
                                    py-2.5
                                    font-medium
                                    transition-all

                                    ${
                                        selectedFloor ===
                                        floor
                                            ? `
                                                border-blue-600
                                                bg-blue-600
                                                text-white
                                              `
                                            : `
                                                border-gray-300
                                                bg-white
                                                text-gray-700
                                                hover:bg-gray-100
                                              `
                                    }
                                `}
                            >

                                {getFloorName(
                                    floor
                                )}

                                <span className="ml-2 text-xs opacity-80">

                                    {getFloorTotal(
                                        floor
                                    )}

                                </span>

                            </button>

                        )
                    )}

                </div>

            </div>


            {/* ==================================================
                Search / Status
            ================================================== */}

            <div className="rounded-2xl bg-white p-5 shadow">

                <div className="flex flex-col gap-4 md:flex-row md:items-end">

                    {/* Search */}

                    <div className="flex-1">

                        <label className="mb-1 block text-sm font-medium text-gray-600">

                            Search Shop

                        </label>

                        <div className="flex items-center rounded-lg border border-gray-300 px-3 py-2.5 focus-within:border-green-500">

                            <Search
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="text"
                                value={
                                    search
                                }
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search shop number..."
                                className="ml-2 w-full outline-none"
                            />

                        </div>

                    </div>


                    {/* Status */}

                    <div className="w-full md:w-52">

                        <label className="mb-1 block text-sm font-medium text-gray-600">

                            Status

                        </label>

                        <select
                            value={
                                selectedStatus
                            }
                            onChange={(event) =>
                                setSelectedStatus(
                                    event.target.value as Status
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
                        >

                            <option value="all">

                                All Status

                            </option>

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

                    </div>


                    {/* Reset */}

                    <button
                        type="button"
                        onClick={
                            resetFilters
                        }
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-600 transition hover:bg-gray-100"
                    >

                        <RotateCcw
                            size={16}
                        />

                        Reset

                    </button>

                </div>

            </div>


            {/* ==================================================
                Shop Map
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6 text-center">

                    <h2 className="text-xl font-bold text-gray-800">

                        {selectedFloor ===
                            "all"
                            ? getPhaseName(
                                selectedPhase
                            )
                            : `${getPhaseName(
                                selectedPhase
                            )} - ${getFloorName(
                                selectedFloor
                            )}`}

                    </h2>

                    <p className="mt-1 text-sm text-gray-500">

                        {filteredShops.length} Shops

                    </p>

                </div>


                {/* ==================================================
                    Shop Grid
                ================================================== */}

                <div className="overflow-x-auto rounded-2xl border bg-gray-50 p-6">

                    <div
                        className="
                            mx-auto
                            flex
                            max-w-[1200px]
                            flex-wrap
                            justify-center
                            gap-4
                        "
                    >

                        {filteredShops.map(
                            (shop) => (

                                <button
                                    key={
                                        shop.id
                                    }
                                    type="button"
                                    onClick={() =>
                                        handleShopClick(
                                            shop
                                        )
                                    }
                                    className={`
                                        h-[110px]
                                        w-[150px]
                                        min-w-[150px]
                                        max-w-[150px]

                                        flex
                                        flex-col
                                        items-center
                                        justify-center

                                        rounded-xl
                                        border-2
                                        p-3
                                        text-center

                                        cursor-pointer

                                        transition-all
                                        duration-200
                                        ease-out

                                        hover:-translate-y-1
                                        hover:scale-[1.03]
                                        hover:shadow-lg

                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-green-400
                                        focus:ring-offset-2

                                        ${getShopColor(
                                            shop.status
                                        )}
                                    `}
                                >

                                    <span className="text-base font-bold">

                                        {
                                            shop.number
                                        }

                                    </span>


                                    <span className="mt-2 text-xs">

                                        {
                                            shop.area
                                        }

                                    </span>


                                    <span className="mt-2 text-xs font-bold uppercase">

                                        {getStatusText(
                                            shop.status
                                        )}

                                    </span>

                                </button>

                            )
                        )}

                    </div>

                </div>


                {/* ==================================================
                    Legend
                ================================================== */}

                <div className="mt-6 flex flex-wrap gap-6 border-t pt-5 text-sm">

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
                Shop Modal
            ================================================== */}

            <ShopModal
                isOpen={
                    isShopModalOpen
                }

                onClose={() => {

                    setIsShopModalOpen(
                        false
                    );

                    setSelectedShop(
                        null
                    );

                }}

                shop={
                    selectedShop as any
                }

                onBook={
                    handleBookShop
                }

                onStatusChange={
                    handleStatusChange
                }
            />


            {/* ==================================================
                Booking Modal
            ================================================== */}

            <BookingModal
                isOpen={
                    isBookingModalOpen
                }

                onClose={() => {

                    setIsBookingModalOpen(
                        false
                    );

                    setSelectedShop(
                        null
                    );

                }}

                onConfirm={
                    handleConfirmBooking
                }

                flat={
                    selectedShop
                        ? {

                            number:
                                selectedShop.number,

                            tower:
                                "Commercial",

                            floor:
                                selectedShop.floor,

                            status:
                                selectedShop.status,

                        }
                        : null
                }

                mode="create"
            />

        </div>

    );

}

export default Commercial;