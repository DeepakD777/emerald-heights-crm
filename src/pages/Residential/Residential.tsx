import { useMemo, useState } from "react";

import { Search, RotateCcw } from "lucide-react";

import { residentialFlats } from "../../data/floorData";

import { useFlat } from "../../context/FlatContext";
import { useBooking } from "../../context/BookingContext";

import FlatModal from "../../components/dashboard/FlatModal";

// ======================================================
// Types
// ======================================================

type Block = "A" | "B" | "C";

type Phase =
    | "a"
    | "phase1"
    | "phase2"
    | "c1";

type Status =
    | "all"
    | "available"
    | "hold"
    | "booked";

// ======================================================
// Residential Page
// ======================================================

function Residential() {

    // ==================================================
    // Context
    // ==================================================

    const {
        flatStatuses,
        updateFlatStatus,
    } = useFlat();

    const {
        bookings,
        addBooking,
    } = useBooking();

    // ==================================================
    // Selected Flat
    // ==================================================

    const [selectedFlat, setSelectedFlat] =
        useState<any>(null);

    const [isFlatModalOpen, setIsFlatModalOpen] =
        useState(false);

    // ==================================================
    // Main Navigation
    // ==================================================

    const [selectedBlock, setSelectedBlock] =
        useState<Block>("A");

    const [selectedPhase, setSelectedPhase] =
        useState<Phase>("a");

    const [selectedFloor, setSelectedFloor] =
        useState(1);

    // ==================================================
    // Filters
    // ==================================================

    const [search, setSearch] =
        useState("");

    const [selectedStatus, setSelectedStatus] =
        useState<Status>("all");

    // ==================================================
    // Current Tower
    // ==================================================

    const currentTower =
        selectedPhase === "a"
            ? "A"
            : selectedPhase === "phase1"
                ? "B"
                : selectedPhase === "phase2"
                    ? "B1"
                    : "C1";

    // ==================================================
    // Current Section Name
    // ==================================================

    const currentSectionName =
        selectedPhase === "a"
            ? "A Block - Amogh"
            : selectedPhase === "phase1"
                ? "B Block - Phase 1"
                : selectedPhase === "phase2"
                    ? "B Block - Phase 2 (B1 Tower)"
                    : "C Block - C1 Tower";

    // ==================================================
    // Current Tower Name
    // ==================================================

    const currentTowerName =
        selectedPhase === "a"
            ? "Amogh"
            : selectedPhase === "phase1"
                ? "Ekash"
                : selectedPhase === "phase2"
                    ? "Ekash"
                    : "Ishan";

    // ==================================================
    // Current Tower Total
    // ==================================================

    const currentTowerTotal =
        selectedPhase === "a"
            ? 100
            : selectedPhase === "phase1"
                ? 40
                : selectedPhase === "phase2"
                    ? 40
                    : 90;

    // ==================================================
    // Floors
    // ==================================================

    const floors = useMemo(() => {

        return Array.from(
            new Set(
                residentialFlats
                    .filter(
                        (flat) =>
                            flat.tower ===
                            currentTower
                    )
                    .map(
                        (flat) =>
                            flat.floor
                    )
            )
        ).sort(
            (a, b) =>
                a - b
        );

    }, [currentTower]);

    // ==================================================
    // Actual Flat Status
    // ==================================================

    const getFlatStatus = (
        flat: any
    ) => {

        // ----------------------------------------------
        // Booking Status
        // ----------------------------------------------

        const booking =
            bookings.find(
                (booking: any) => {

                    const sameNumber =
                        booking.flatNumber ===
                        flat.number;

                    const sameTower =
                        !booking.tower ||
                        booking.tower ===
                        flat.tower;

                    return (
                        sameNumber &&
                        sameTower
                    );

                }
            );

        if (booking) {

            return "booked";

        }

        // ----------------------------------------------
        // Saved Status
        // ----------------------------------------------

        const savedStatus =
            flatStatuses.find(
                (item: any) => {

                    const sameNumber =
                        item.number ===
                        flat.number;

                    const sameTower =
                        !item.tower ||
                        item.tower ===
                        flat.tower;

                    return (
                        sameNumber &&
                        sameTower
                    );

                }
            );

        if (savedStatus) {

            return savedStatus.status;

        }

        // ----------------------------------------------
        // Default Status
        // ----------------------------------------------

        return flat.status;

    };

    // ==================================================
    // Status Color
    // ==================================================

    const getStatusColor = (
        status: string
    ) => {

        switch (status) {

            case "booked":

                return `
                    bg-red-50
                    border-red-400
                    text-red-700
                    hover:bg-red-100
                    hover:border-red-500
                `;

            case "hold":

                return `
                    bg-yellow-50
                    border-yellow-400
                    text-yellow-700
                    hover:bg-yellow-100
                    hover:border-yellow-500
                `;

            default:

                return `
                    bg-green-50
                    border-green-400
                    text-green-700
                    hover:bg-green-100
                    hover:border-green-500
                `;

        }

    };

    // ==================================================
    // Status Text
    // ==================================================

    const getStatusText = (
        status: string
    ) => {

        switch (status) {

            case "booked":
                return "BOOKED";

            case "hold":
                return "HOLD";

            default:
                return "AVAILABLE";

        }

    };

    // ==================================================
    // Current Flats
    // ==================================================

    const currentFlats = useMemo(() => {

        return residentialFlats.filter(
            (flat) => {

                const matchesTower =
                    flat.tower ===
                    currentTower;

                const matchesFloor =
                    flat.floor ===
                    selectedFloor;

                return (
                    matchesTower &&
                    matchesFloor
                );

            }
        );

    }, [
        currentTower,
        selectedFloor,
    ]);

    // ==================================================
    // Filtered Flats
    // ==================================================

    const filteredFlats =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            return currentFlats.filter(
                (flat: any) => {

                    const status =
                        getFlatStatus(
                            flat
                        );

                    const matchesSearch =
                        !searchText ||
                        String(
                            flat.number
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            );

                    const matchesStatus =
                        selectedStatus ===
                            "all" ||
                        status ===
                            selectedStatus;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );

        }, [
            currentFlats,
            search,
            selectedStatus,
            flatStatuses,
            bookings,
        ]);

    // ==================================================
    // Current Statistics
    // ==================================================

    const totalFlats =
        currentFlats.length;

    const availableFlats =
        currentFlats.filter(
            (flat) =>
                getFlatStatus(
                    flat
                ) === "available"
        ).length;

    const bookedFlats =
        currentFlats.filter(
            (flat) =>
                getFlatStatus(
                    flat
                ) === "booked"
        ).length;

    const holdFlats =
        currentFlats.filter(
            (flat) =>
                getFlatStatus(
                    flat
                ) === "hold"
        ).length;

    // ==================================================
    // Reset Filters
    // ==================================================

    const resetFilters = () => {

        setSearch("");

        setSelectedStatus(
            "all"
        );

    };

    // ==================================================
    // Block Change
    // ==================================================

    const handleBlockChange = (
        block: Block
    ) => {

        setSelectedBlock(
            block
        );

        setSelectedFloor(
            1
        );

        resetFilters();

        if (block === "A") {

            setSelectedPhase(
                "a"
            );

        }

        if (block === "B") {

            setSelectedPhase(
                "phase1"
            );

        }

        if (block === "C") {

            setSelectedPhase(
                "c1"
            );

        }

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

        setSelectedFloor(
            1
        );

        resetFilters();

    };

    // ==================================================
    // Open Flat
    // ==================================================

    const openFlat = (
        flat: any
    ) => {

        setSelectedFlat({

            ...flat,

            status:
                getFlatStatus(
                    flat
                ),

        });

        setIsFlatModalOpen(
            true
        );

    };

    // ==================================================
    // Save Flat Status
    // ==================================================

    const handleSaveFlat = (
        updatedFlat: any
    ) => {

        updateFlatStatus(

            updatedFlat.number,

            updatedFlat.status

        );

        setSelectedFlat({

            ...updatedFlat,

        });

        setIsFlatModalOpen(
            false
        );

    };

    // ==================================================
    // Booking
    // ==================================================

    const handleBooking = (
        bookingData: any
    ) => {

        addBooking(
            bookingData
        );

        updateFlatStatus(

            bookingData.flatNumber,

            "booked"

        );

        setIsFlatModalOpen(
            false
        );

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

                    Residential

                </h1>

                <p className="mt-1 text-gray-500">

                    Residential Flats Inventory

                </p>

            </div>


            {/* ==================================================
                Block Selection
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <h2 className="mb-4 text-lg font-bold text-gray-800">

                    Select Block

                </h2>

                <div className="flex flex-wrap gap-3">

                    {/* A BLOCK */}

                    <button
                        onClick={() =>
                            handleBlockChange(
                                "A"
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
                                selectedBlock ===
                                "A"
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

                        A Block

                        <span className="ml-2 text-xs opacity-80">

                            Amogh

                        </span>

                    </button>


                    {/* B BLOCK */}

                    <button
                        onClick={() =>
                            handleBlockChange(
                                "B"
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
                                selectedBlock ===
                                "B"
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

                        B Block

                        <span className="ml-2 text-xs opacity-80">

                            Ekash

                        </span>

                    </button>


                    {/* C BLOCK */}

                    <button
                        onClick={() =>
                            handleBlockChange(
                                "C"
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
                                selectedBlock ===
                                "C"
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

                        C Block

                        <span className="ml-2 text-xs opacity-80">

                            Ishan

                        </span>

                    </button>

                </div>

            </div>


            {/* ==================================================
                Phase / Tower Selection
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-4">

                    <h2 className="text-lg font-bold text-gray-800">

                        {selectedBlock === "B"
                            ? "Select Phase"
                            : selectedBlock === "C"
                                ? "Select Tower"
                                : "A Block"}

                    </h2>

                    <p className="mt-1 text-sm text-gray-500">

                        {selectedBlock === "A"
                            ? "Amogh"
                            : selectedBlock === "B"
                                ? "Select Phase of B Block"
                                : "C1 Tower"}

                    </p>

                </div>


                <div className="flex flex-wrap gap-3">

                    {/* A BLOCK */}

                    {selectedBlock === "A" && (

                        <button
                            onClick={() =>
                                handlePhaseChange(
                                    "a"
                                )
                            }
                            className={`
                                rounded-xl
                                border
                                px-5
                                py-3
                                font-medium
                                transition-all
                                duration-200
                                ${
                                    selectedPhase ===
                                    "a"
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

                            A Block - Amogh

                            <span className="ml-2 text-xs opacity-80">

                                100 Flats

                            </span>

                        </button>

                    )}


                    {/* B PHASE 1 */}

                    {selectedBlock === "B" && (

                        <button
                            onClick={() =>
                                handlePhaseChange(
                                    "phase1"
                                )
                            }
                            className={`
                                rounded-xl
                                border
                                px-5
                                py-3
                                font-medium
                                transition-all
                                duration-200
                                ${
                                    selectedPhase ===
                                    "phase1"
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

                            B Block - Phase 1

                            <span className="ml-2 text-xs opacity-80">

                                40 Flats

                            </span>

                        </button>

                    )}


                    {/* B PHASE 2 */}

                    {selectedBlock === "B" && (

                        <button
                            onClick={() =>
                                handlePhaseChange(
                                    "phase2"
                                )
                            }
                            className={`
                                rounded-xl
                                border
                                px-5
                                py-3
                                font-medium
                                transition-all
                                duration-200
                                ${
                                    selectedPhase ===
                                    "phase2"
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

                            B Block - Phase 2

                            <span className="ml-2 text-xs opacity-80">

                                B1 Tower · 40 Flats

                            </span>

                        </button>

                    )}


                    {/* C1 */}

                    {selectedBlock === "C" && (

                        <button
                            onClick={() =>
                                handlePhaseChange(
                                    "c1"
                                )
                            }
                            className={`
                                rounded-xl
                                border
                                px-5
                                py-3
                                font-medium
                                transition-all
                                duration-200
                                ${
                                    selectedPhase ===
                                    "c1"
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

                            C1 Tower

                            <span className="ml-2 text-xs opacity-80">

                                90 Flats

                            </span>

                        </button>

                    )}

                </div>

            </div>


            {/* ==================================================
                Current Section
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-5">

                    <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-gray-800">

                                {currentSectionName}

                            </h2>

                            <p className="text-sm text-gray-500">

                                Tower: {currentTowerName}

                            </p>

                        </div>

                        <div className="text-sm text-gray-500">

                            Total Flats:{" "}

                            <span className="font-semibold text-gray-800">

                                {currentTowerTotal}

                            </span>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    Floor Buttons
                ================================================== */}

                <div className="flex flex-wrap gap-2">

                    {floors.map(
                        (floor) => (

                            <button
                                key={floor}
                                onClick={() =>
                                    setSelectedFloor(
                                        floor
                                    )
                                }
                                className={`
                                    rounded-lg
                                    border
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    transition-all
                                    duration-200
                                    ${
                                        selectedFloor ===
                                        floor
                                            ? `
                                                border-blue-600
                                                bg-blue-600
                                                text-white
                                                shadow-md
                                              `
                                            : `
                                                border-gray-300
                                                bg-white
                                                text-gray-700
                                                hover:border-blue-400
                                                hover:bg-blue-50
                                              `
                                    }
                                `}
                            >

                                Floor {floor}

                            </button>

                        )
                    )}

                </div>

            </div>


            {/* ==================================================
                Floor Statistics
            ================================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">

                        Total Flats

                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-800">

                        {totalFlats}

                    </p>

                </div>


                <div className="rounded-2xl bg-green-50 p-5">

                    <p className="text-sm text-green-700">

                        Available

                    </p>

                    <p className="mt-1 text-3xl font-bold text-green-700">

                        {availableFlats}

                    </p>

                </div>


                <div className="rounded-2xl bg-red-50 p-5">

                    <p className="text-sm text-red-700">

                        Booked

                    </p>

                    <p className="mt-1 text-3xl font-bold text-red-700">

                        {bookedFlats}

                    </p>

                </div>


                <div className="rounded-2xl bg-yellow-50 p-5">

                    <p className="text-sm text-yellow-700">

                        Hold

                    </p>

                    <p className="mt-1 text-3xl font-bold text-yellow-700">

                        {holdFlats}

                    </p>

                </div>

            </div>


            {/* ==================================================
                Search + Status
            ================================================== */}

            <div className="rounded-2xl bg-white p-5 shadow">

                <div className="flex flex-col gap-4 md:flex-row md:items-end">

                    <div className="flex-1">

                        <label className="mb-1 block text-sm font-medium text-gray-600">

                            Search Flat

                        </label>

                        <div className="flex items-center rounded-lg border border-gray-300 px-3 py-2.5 focus-within:border-green-500">

                            <Search
                                size={18}
                                className="text-gray-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search flat number..."
                                className="ml-2 w-full outline-none"
                            />

                        </div>

                    </div>


                    <div className="w-full md:w-52">

                        <label className="mb-1 block text-sm font-medium text-gray-600">

                            Status

                        </label>

                        <select
                            value={selectedStatus}
                            onChange={(e) =>
                                setSelectedStatus(
                                    e.target.value as Status
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


                    <button
                        onClick={resetFilters}
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
                Floor Map
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6 text-center">

                    <h2 className="text-xl font-bold text-gray-800">

                        {currentSectionName}

                    </h2>

                    <p className="mt-1 text-sm text-gray-500">

                        Floor {selectedFloor}

                    </p>

                </div>


                {filteredFlats.length === 0 ? (

                    <div className="rounded-xl border border-dashed p-12 text-center">

                        <p className="text-lg font-semibold text-gray-700">

                            No Flats Found

                        </p>

                        <p className="mt-1 text-sm text-gray-500">

                            Try changing your search or status filter.

                        </p>

                        <button
                            onClick={resetFilters}
                            className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                        >

                            Reset Filters

                        </button>

                    </div>

                ) : (

                    <div
                        className={`
                            grid
                            grid-cols-2
                            gap-4
                            sm:grid-cols-3
                            md:grid-cols-4
                            lg:grid-cols-5
                            xl:grid-cols-6
                        `}
                    >

                        {filteredFlats.map(
                            (flat: any) => {

                                const status =
                                    getFlatStatus(
                                        flat
                                    );

                                return (

                                    <button
                                        key={flat.id}
                                        type="button"
                                        onClick={() =>
                                            openFlat(
                                                flat
                                            )
                                        }
                                        className={`
                                            flex
                                            min-h-[150px]
                                            w-full
                                            flex-col
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border-2
                                            p-4
                                            text-center
                                            cursor-pointer

                                            transition-all
                                            duration-200
                                            ease-out

                                            hover:-translate-y-1
                                            hover:scale-[1.02]
                                            hover:shadow-lg

                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-green-400
                                            focus:ring-offset-2

                                            ${getStatusColor(
                                                status
                                            )}
                                        `}
                                    >

                                        <span className="text-lg font-bold">

                                            {flat.number}

                                        </span>


                                        <span className="mt-2 text-xs">

                                            {flat.area}

                                        </span>


                                        <span className="mt-1 text-xs">

                                            {flat.type}

                                        </span>


                                        <span className="mt-3 text-xs font-bold tracking-wide">

                                            {getStatusText(
                                                status
                                            )}

                                        </span>

                                    </button>

                                );

                            }
                        )}

                    </div>

                )}


                {/* ==================================================
                    Legend
                ================================================== */}

                <div className="mt-8 flex flex-wrap gap-6 border-t pt-5 text-sm">

                    <div className="flex items-center gap-2">

                        <div className="h-4 w-4 rounded bg-green-500" />

                        <span>
                            Available
                        </span>

                    </div>


                    <div className="flex items-center gap-2">

                        <div className="h-4 w-4 rounded bg-yellow-400" />

                        <span>
                            Hold
                        </span>

                    </div>


                    <div className="flex items-center gap-2">

                        <div className="h-4 w-4 rounded bg-red-500" />

                        <span>
                            Booked
                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Flat Modal
            ================================================== */}

            <FlatModal
                isOpen={
                    isFlatModalOpen
                }
                onClose={() =>
                    setIsFlatModalOpen(
                        false
                    )
                }
                flat={
                    selectedFlat
                }
                onSave={
                    handleSaveFlat
                }
                onBooking={
                    handleBooking
                }
            />

        </div>

    );

}

export default Residential;