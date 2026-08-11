import { useMemo, useState } from "react";

import { useFlat } from "../../context/FlatContext";
import { useBooking } from "../../context/BookingContext";

import { residentialFlats } from "../../data/floorData";

import FlatModal from "./FlatModal";

// ======================================================
// Types
// ======================================================

type Block = "A" | "B" | "C";

type Section =
    | "a"
    | "b-phase1"
    | "b-phase2"
    | "c1";

// ======================================================
// Status Color
// ======================================================

function getColor(status: string) {

    switch (status) {

        case "available":

            return `
                bg-green-100
                border-green-400
                text-green-700
                hover:bg-green-200
                hover:border-green-500
            `;

        case "booked":

            return `
                bg-red-100
                border-red-400
                text-red-700
                hover:bg-red-200
                hover:border-red-500
            `;

        case "hold":

            return `
                bg-yellow-100
                border-yellow-400
                text-yellow-700
                hover:bg-yellow-200
                hover:border-yellow-500
            `;

        default:

            return `
                bg-gray-100
                border-gray-300
                text-gray-700
                hover:bg-gray-200
            `;

    }

}

// ======================================================
// Section Name
// ======================================================

function getSectionName(
    section: Section
) {

    switch (section) {

        case "a":
            return "A Block - Amogh";

        case "b-phase1":
            return "B Block - Phase 1";

        case "b-phase2":
            return "B Block - Phase 2 (B1 Tower)";

        case "c1":
            return "C Block - C1 Tower";

        default:
            return "";

    }

}

// ======================================================
// Tower Name
// ======================================================

function getTowerName(
    section: Section
) {

    switch (section) {

        case "a":
            return "Amogh";

        case "b-phase1":
            return "Ekash";

        case "b-phase2":
            return "Ekash";

        case "c1":
            return "Ishan";

        default:
            return "";

    }

}

// ======================================================
// Floor Map
// ======================================================

function FloorMap() {

    // ==================================================
    // Selected Block
    // ==================================================

    const [selectedBlock, setSelectedBlock] =
        useState<Block>("A");

    // ==================================================
    // Selected Section
    // ==================================================

    const [selectedSection, setSelectedSection] =
        useState<Section>("a");

    // ==================================================
    // Selected Floor
    // ==================================================

    const [selectedFloor, setSelectedFloor] =
        useState<number>(1);

    // ==================================================
    // Selected Flat
    // ==================================================

    const [selectedFlat, setSelectedFlat] =
        useState<any>(null);

    const [isOpen, setIsOpen] =
        useState(false);

    // ==================================================
    // Booking Context
    // ==================================================

    const {
        addBooking,
        bookings,
    } = useBooking();

    // ==================================================
    // Flat Context
    // ==================================================

    const {
        flatStatuses,
        updateFlatStatus,
    } = useFlat();

    // ==================================================
    // Current Tower
    // ==================================================

    const currentTower =
        selectedSection === "a"
            ? "A"
            : selectedSection === "b-phase1"
                ? "B"
                : selectedSection === "b-phase2"
                    ? "B1"
                    : "C1";

    // ==================================================
    // Current Flats
    // ==================================================

    const sectionFlats =
        useMemo(() => {

            return residentialFlats.filter(
                (flat) =>
                    flat.tower ===
                    currentTower
            );

        }, [currentTower]);

    // ==================================================
    // Available Floors
    // ==================================================

    const availableFloors =
        useMemo(() => {

            return Array.from(
                new Set(
                    sectionFlats.map(
                        (flat) =>
                            flat.floor
                    )
                )
            ).sort(
                (a, b) =>
                    a - b
            );

        }, [sectionFlats]);

    // ==================================================
    // Actual Flat Status
    // ==================================================

    const getFlatStatus = (
        flat: any
    ) => {

        // ----------------------------------------------
        // Booking
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

        return flat.status;

    };

    // ==================================================
    // Selected Floor Flats
    // ==================================================

    const floorFlats =
        useMemo(() => {

            return sectionFlats.filter(
                (flat) =>
                    flat.floor ===
                    selectedFloor
            );

        }, [
            sectionFlats,
            selectedFloor,
        ]);

    // ==================================================
    // Floor Statistics
    // ==================================================

    const availableCount =
        floorFlats.filter(
            (flat) =>
                getFlatStatus(flat) ===
                "available"
        ).length;

    const bookedCount =
        floorFlats.filter(
            (flat) =>
                getFlatStatus(flat) ===
                "booked"
        ).length;

    const holdCount =
        floorFlats.filter(
            (flat) =>
                getFlatStatus(flat) ===
                "hold"
        ).length;

    // ==================================================
    // Open Flat
    // ==================================================

    const openFlat = (
        flat: any
    ) => {

        setSelectedFlat({

            ...flat,

            status:
                getFlatStatus(flat),

        });

        setIsOpen(true);

    };

    // ==================================================
    // Save Flat
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

        setIsOpen(false);

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

        setSelectedFlat(
            (prev: any) => {

                if (!prev) {

                    return prev;

                }

                return {

                    ...prev,

                    status: "booked",

                };

            }
        );

        setIsOpen(false);

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

        if (block === "A") {

            setSelectedSection(
                "a"
            );

        }

        if (block === "B") {

            setSelectedSection(
                "b-phase1"
            );

        }

        if (block === "C") {

            setSelectedSection(
                "c1"
            );

        }

    };

    // ==================================================
    // Flat Box
    // ==================================================

    const renderFlat = (
        flat: any
    ) => {

        const status =
            getFlatStatus(flat);

        return (

            <button
                key={flat.id}
                type="button"
                onClick={() =>
                    openFlat(flat)
                }
                className={`
h-[125px]
w-[180px]
min-w-[180px]
max-w-[180px]
                    rounded-xl
                    border-2
                    p-3

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

                    ${getColor(status)}
                `}
            >

                <p className="text-base font-bold">

                    {flat.number}

                </p>

                <p className="mt-2 text-xs">

                    {flat.area}

                </p>

                <p className="mt-1 text-xs">

                    {flat.type}

                </p>

                <p className="mt-2 text-xs font-bold uppercase">

                    {status}

                </p>

            </button>

        );

    };

    // ==================================================
    // Render
    // ==================================================

    return (

        <div className="rounded-2xl bg-white p-6 shadow">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="mb-6">

                <h2 className="text-2xl font-bold text-gray-800">

                    Residential Floor Map

                </h2>

                <p className="mt-1 text-gray-500">

                    {getSectionName(
                        selectedSection
                    )}

                    {" • "}

                    Floor {selectedFloor}

                </p>

            </div>


            {/* ==================================================
                Block Selector
            ================================================== */}

            <div className="mb-5">

                <p className="mb-2 text-sm font-medium text-gray-600">

                    Select Block

                </p>

                <div className="flex flex-wrap gap-3">

                    {(
                        ["A", "B", "C"] as Block[]
                    ).map(
                        (block) => (

                            <button
                                key={block}
                                type="button"
                                onClick={() =>
                                    handleBlockChange(
                                        block
                                    )
                                }
                                className={`
                                    rounded-lg
                                    px-5
                                    py-2
                                    font-medium
                                    transition-all
                                    duration-200

                                    ${selectedBlock ===
                                        block
                                        ? `
                                                bg-green-600
                                                text-white
                                                shadow-md
                                              `
                                        : `
                                                border
                                                bg-white
                                                text-gray-700
                                                hover:bg-gray-100
                                              `
                                    }
                                `}
                            >

                                Block {block}

                                {" - "}

                                {block === "A"
                                    ? "Amogh"
                                    : block === "B"
                                        ? "Ekash"
                                        : "Ishan"}

                            </button>

                        )
                    )}

                </div>

            </div>


            {/* ==================================================
                Phase / Tower Selector
            ================================================== */}

            {selectedBlock === "B" && (

                <div className="mb-5">

                    <p className="mb-2 text-sm font-medium text-gray-600">

                        Select Phase

                    </p>

                    <div className="flex flex-wrap gap-3">

                        <button
                            type="button"
                            onClick={() => {

                                setSelectedSection(
                                    "b-phase1"
                                );

                                setSelectedFloor(
                                    1
                                );

                            }}
                            className={`
                                rounded-lg
                                border
                                px-5
                                py-2
                                font-medium
                                transition-all
                                duration-200

                                ${selectedSection ===
                                    "b-phase1"
                                    ? `
                                            border-green-600
                                            bg-green-600
                                            text-white
                                            shadow-md
                                          `
                                    : `
                                            bg-white
                                            text-gray-700
                                            hover:bg-gray-100
                                          `
                                }
                            `}
                        >

                            Phase 1

                            <span className="ml-2 text-xs opacity-80">

                                40 Flats

                            </span>

                        </button>


                        <button
                            type="button"
                            onClick={() => {

                                setSelectedSection(
                                    "b-phase2"
                                );

                                setSelectedFloor(
                                    1
                                );

                            }}
                            className={`
                                rounded-lg
                                border
                                px-5
                                py-2
                                font-medium
                                transition-all
                                duration-200

                                ${selectedSection ===
                                    "b-phase2"
                                    ? `
                                            border-green-600
                                            bg-green-600
                                            text-white
                                            shadow-md
                                          `
                                    : `
                                            bg-white
                                            text-gray-700
                                            hover:bg-gray-100
                                          `
                                }
                            `}
                        >

                            Phase 2 / B1

                            <span className="ml-2 text-xs opacity-80">

                                40 Flats

                            </span>

                        </button>

                    </div>

                </div>

            )}


            {selectedBlock === "C" && (

                <div className="mb-5">

                    <p className="mb-2 text-sm font-medium text-gray-600">

                        Tower

                    </p>

                    <button
                        type="button"
                        onClick={() => {

                            setSelectedSection(
                                "c1"
                            );

                            setSelectedFloor(
                                1
                            );

                        }}
                        className="
                            rounded-lg
                            border
                            border-green-600
                            bg-green-600
                            px-5
                            py-2
                            font-medium
                            text-white
                            shadow-md
                        "
                    >

                        C1 Tower

                        <span className="ml-2 text-xs opacity-80">

                            90 Flats

                        </span>

                    </button>

                </div>

            )}


            {selectedBlock === "A" && (

                <div className="mb-5">

                    <p className="mb-2 text-sm font-medium text-gray-600">

                        Tower

                    </p>

                    <div className="
                        inline-flex
                        items-center
                        rounded-lg
                        border
                        border-green-600
                        bg-green-600
                        px-5
                        py-2
                        font-medium
                        text-white
                        shadow-md
                    ">

                        A Block - Amogh

                        <span className="ml-2 text-xs opacity-80">

                            100 Flats

                        </span>

                    </div>

                </div>

            )}


            {/* ==================================================
                Floor Selector
            ================================================== */}

            <div className="mb-6">

                <p className="mb-2 text-sm font-medium text-gray-600">

                    Select Floor

                </p>

                <div className="flex flex-wrap gap-2">

                    {availableFloors.map(
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
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    transition-all
                                    duration-200

                                    ${selectedFloor ===
                                        floor
                                        ? `
                                                bg-blue-600
                                                text-white
                                                shadow-md
                                              `
                                        : `
                                                border
                                                bg-white
                                                text-gray-700
                                                hover:bg-gray-100
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
                Floor Summary
            ================================================== */}

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-sm text-gray-500">

                        Total Flats

                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">

                        {floorFlats.length}

                    </p>

                </div>


                <div className="rounded-xl bg-green-50 p-4">

                    <p className="text-sm text-green-600">

                        Available

                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-700">

                        {availableCount}

                    </p>

                </div>


                <div className="rounded-xl bg-red-50 p-4">

                    <p className="text-sm text-red-600">

                        Booked

                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-700">

                        {bookedCount}

                    </p>

                </div>


                <div className="rounded-xl bg-yellow-50 p-4">

                    <p className="text-sm text-yellow-600">

                        Hold

                    </p>

                    <p className="mt-1 text-2xl font-bold text-yellow-700">

                        {holdCount}

                    </p>

                </div>

            </div>


            {/* ==================================================
                Floor Map
            ================================================== */}

            <div className="overflow-x-auto rounded-2xl border bg-gray-50 p-5">

                <div className="mb-6 text-center">

                    <h3 className="text-lg font-bold text-gray-800">

                        {getSectionName(
                            selectedSection
                        )}

                    </h3>

                    <p className="text-sm text-gray-500">

                        {getTowerName(
                            selectedSection
                        )}

                        {" • "}

                        Floor {selectedFloor}

                    </p>

                </div>


                <div className="mx-auto min-w-[850px] max-w-[1100px]">

                    {/* ==================================================
                        Flat Layout
                    ================================================== */}
                    <div
                        className="
        flex
        flex-wrap
        justify-center
        gap-4
        mx-auto
        max-w-[1100px]
    "
                    >

                        {floorFlats.map(
                            renderFlat
                        )}

                    </div>


                    {/* ==================================================
                        Common Passage
                    ================================================== */}

                    <div className="my-4 flex h-12 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">

                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">

                            Common Passage

                        </span>

                    </div>

                </div>

            </div>


            {/* ==================================================
                Legend
            ================================================== */}

            <div className="mt-6 flex flex-wrap gap-6 text-sm">

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


            {/* ==================================================
                Flat Modal
            ================================================== */}

            <FlatModal
                isOpen={
                    isOpen
                }
                onClose={() =>
                    setIsOpen(
                        false
                    )
                }
                onSave={
                    handleSaveFlat
                }
                onBooking={
                    handleBooking
                }
                flat={
                    selectedFlat
                }
            />

        </div>

    );

}

export default FloorMap;