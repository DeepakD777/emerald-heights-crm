import { useMemo, useState } from "react";

import { useFlat } from "../../context/FlatContext";
import { useBooking } from "../../context/BookingContext";

import { residentialFlats } from "../../data/floorData";

// ======================================================
// Types
// ======================================================

type MapType = "residential" | "commercial";

type Block = "A" | "B" | "C";

type ResidentialSection =
    | "a"
    | "b-phase1"
    | "b-phase2"
    | "c1";

type CommercialPhase =
    | "phase1"
    | "phase2";

type CommercialFloor = 0 | 1 | 2 | 3;

// ======================================================
// Residential Section Name
// ======================================================

function getResidentialSectionName(
    section: ResidentialSection
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
// Residential Tower Name
// ======================================================

function getTowerName(
    section: ResidentialSection
) {
    switch (section) {
        case "a":
            return "Amogh";

        case "b-phase1":
        case "b-phase2":
            return "Ekash";

        case "c1":
            return "Ishan";

        default:
            return "";
    }
}

// ======================================================
// Residential PDF
// ======================================================

function getResidentialMapFile(
    section: ResidentialSection
) {
    switch (section) {
        case "a":
            return "/floor-maps/cluster-a.pdf";

        case "b-phase1":
        case "b-phase2":
            return "/floor-maps/cluster-b.pdf";

        case "c1":
            return "/floor-maps/cluster-c.pdf";

        default:
            return "/floor-maps/cluster-a.pdf";
    }
}

// ======================================================
// Commercial PDF
// ======================================================
//
// IMPORTANT:
//
// Commercial PDF 1:
// Ground + First Floor
//
// Commercial PDF 2:
// Second + Third Floor
//
// #page=1 / #page=2 is used so the selected
// floor opens directly in the PDF viewer.
// ======================================================

function getCommercialMapFile(
    floor: CommercialFloor
) {
    switch (floor) {
        case 0:
            return "/floor-maps/commercial-g1.pdf#page=1";

        case 1:
            return "/floor-maps/commercial-g1.pdf#page=2";

        case 2:
            return "/floor-maps/commercial-23.pdf#page=1";

        case 3:
            return "/floor-maps/commercial-23.pdf#page=2";

        default:
            return "/floor-maps/commercial-g1.pdf#page=1";
    }
}

// ======================================================
// Commercial Floor Name
// ======================================================

function getCommercialFloorName(
    floor: CommercialFloor
) {
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
            return "Ground Floor";
    }
}

// ======================================================
// Commercial Shop Count
// ======================================================

function getCommercialShopCount(
    phase: CommercialPhase,
    floor: CommercialFloor
) {
    // ----------------------------------------------
    // Phase 1
    // ----------------------------------------------

    if (phase === "phase1") {
        return 54;
    }

    // ----------------------------------------------
    // Phase 2
    // ----------------------------------------------

    switch (floor) {
        case 0:
            return 84;

        case 1:
            return 87;

        case 2:
            return 87;

        case 3:
            return 86;

        default:
            return 0;
    }
}

// ======================================================
// Commercial Phase Name
// ======================================================

function getCommercialPhaseName(
    phase: CommercialPhase
) {
    switch (phase) {
        case "phase1":
            return "Phase 1 Commercial Hub";

        case "phase2":
            return "Phase 2 Commercial 1";

        default:
            return "";
    }
}

// ======================================================
// Floor Map
// ======================================================

function FloorMap() {

    // ==================================================
    // Main Map Type
    // ==================================================

    const [mapType, setMapType] =
        useState<MapType>("residential");

    // ==================================================
    // Residential State
    // ==================================================

    const [selectedBlock, setSelectedBlock] =
        useState<Block>("A");

    const [selectedSection, setSelectedSection] =
        useState<ResidentialSection>("a");

    const [selectedFloor, setSelectedFloor] =
        useState<number>(1);

    // ==================================================
    // Commercial State
    // ==================================================

    const [selectedCommercialPhase, setSelectedCommercialPhase] =
        useState<CommercialPhase>("phase1");

    const [selectedCommercialFloor, setSelectedCommercialFloor] =
        useState<CommercialFloor>(0);

    // ==================================================
    // Context
    // ==================================================

    const {
        flatStatuses,
    } = useFlat();

    const {
        bookings,
    } = useBooking();

    // ==================================================
    // Current Residential Tower
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
    // Residential Flats
    // ==================================================

    const sectionFlats = useMemo(() => {

        return residentialFlats.filter(
            (flat) =>
                flat.tower === currentTower
        );

    }, [currentTower]);

    // ==================================================
    // Residential Available Floors
    // ==================================================

    const availableFloors = useMemo(() => {

        return Array.from(
            new Set(
                sectionFlats.map(
                    (flat) => flat.floor
                )
            )
        ).sort(
            (a, b) => a - b
        );

    }, [sectionFlats]);

    // ==================================================
    // Residential Flat Status
    // ==================================================

    const getFlatStatus = (flat: any) => {

        const booking = bookings.find(
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
    // Residential Current Floor
    // ==================================================

    const floorFlats = useMemo(() => {

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
    // Residential Statistics
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
    // Commercial Statistics
    // ==================================================

    const commercialTotal =
        getCommercialShopCount(
            selectedCommercialPhase,
            selectedCommercialFloor
        );

    // Currently the supplied commercial inventory
    // starts with all shops available.

    const commercialAvailable =
        commercialTotal;

    const commercialBooked = 0;

    const commercialHold = 0;

    // ==================================================
    // Residential Block Change
    // ==================================================

    const handleBlockChange = (
        block: Block
    ) => {

        setSelectedBlock(block);

        setSelectedFloor(1);

        if (block === "A") {
            setSelectedSection("a");
        }

        if (block === "B") {
            setSelectedSection("b-phase1");
        }

        if (block === "C") {
            setSelectedSection("c1");
        }
    };

    // ==================================================
    // Commercial Phase Change
    // ==================================================

    const handleCommercialPhaseChange = (
        phase: CommercialPhase
    ) => {

        setSelectedCommercialPhase(
            phase
        );

        setSelectedCommercialFloor(
            0
        );
    };

    // ==================================================
    // Current Map File
    // ==================================================

    const mapFile =
        mapType === "residential"
            ? getResidentialMapFile(
                selectedSection
            )
            : getCommercialMapFile(
                selectedCommercialFloor
            );

    // ==================================================
    // Current Map Title
    // ==================================================

    const mapTitle =
        mapType === "residential"
            ? getResidentialSectionName(
                selectedSection
            )
            : getCommercialPhaseName(
                selectedCommercialPhase
            );

    // ==================================================
    // Current Map Subtitle
    // ==================================================

    const mapSubtitle =
        mapType === "residential"
            ? `${getTowerName(
                selectedSection
            )} • Floor ${selectedFloor}`
            : `${getCommercialFloorName(
                selectedCommercialFloor
            )}`;

    // ==================================================
    // Open Full Map
    // ==================================================

    const openFullMap = () => {

        window.open(
            mapFile,
            "_blank",
            "noopener,noreferrer"
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
                    Floor Map
                </h2>

                <p className="mt-1 text-gray-500">
                    {mapType === "residential"
                        ? `${getResidentialSectionName(
                            selectedSection
                        )} • Floor ${selectedFloor}`
                        : `${getCommercialPhaseName(
                            selectedCommercialPhase
                        )} • ${getCommercialFloorName(
                            selectedCommercialFloor
                        )}`}
                </p>

            </div>

            {/* ==================================================
                Residential / Commercial Toggle
            ================================================== */}

            <div className="mb-6">

                <p className="mb-2 text-sm font-medium text-gray-600">
                    Select Property Type
                </p>

                <div className="flex flex-wrap gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            setMapType(
                                "residential"
                            )
                        }
                        className={`
                            rounded-lg
                            border
                            px-6
                            py-2
                            font-medium
                            transition-all
                            duration-200

                            ${
                                mapType ===
                                "residential"

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
                        Residential
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setMapType(
                                "commercial"
                            )
                        }
                        className={`
                            rounded-lg
                            border
                            px-6
                            py-2
                            font-medium
                            transition-all
                            duration-200

                            ${
                                mapType ===
                                "commercial"

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
                        Commercial
                    </button>

                </div>

            </div>

            {/* ==================================================
                RESIDENTIAL
            ================================================== */}

            {mapType === "residential" && (

                <>

                    {/* ==========================================
                        Block Selector
                    ========================================== */}

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

                                            ${
                                                selectedBlock ===
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

                                        {
                                            block === "A"
                                                ? "Amogh"
                                                : block === "B"
                                                    ? "Ekash"
                                                    : "Ishan"
                                        }

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        B Phase Selector
                    ========================================== */}

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

                                        setSelectedFloor(1);

                                    }}
                                    className={`
                                        rounded-lg
                                        border
                                        px-5
                                        py-2
                                        font-medium
                                        transition-all
                                        duration-200

                                        ${
                                            selectedSection ===
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

                                        setSelectedFloor(1);

                                    }}
                                    className={`
                                        rounded-lg
                                        border
                                        px-5
                                        py-2
                                        font-medium
                                        transition-all
                                        duration-200

                                        ${
                                            selectedSection ===
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


                    {/* ==========================================
                        A Info
                    ========================================== */}

                    {selectedBlock === "A" && (

                        <div className="mb-5">

                            <p className="mb-2 text-sm font-medium text-gray-600">
                                Tower
                            </p>

                            <div
                                className="
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
                                "
                            >

                                A Block - Amogh

                                <span className="ml-2 text-xs opacity-80">
                                    100 Flats
                                </span>

                            </div>

                        </div>

                    )}


                    {/* ==========================================
                        C Info
                    ========================================== */}

                    {selectedBlock === "C" && (

                        <div className="mb-5">

                            <p className="mb-2 text-sm font-medium text-gray-600">
                                Tower
                            </p>

                            <div
                                className="
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
                                "
                            >

                                C1 Tower

                                <span className="ml-2 text-xs opacity-80">
                                    90 Flats
                                </span>

                            </div>

                        </div>

                    )}


                    {/* ==========================================
                        Residential Floor Selector
                    ========================================== */}

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

                                            ${
                                                selectedFloor ===
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


                    {/* ==========================================
                        Residential Statistics
                    ========================================== */}

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

                </>
            )}


            {/* ==================================================
                COMMERCIAL
            ================================================== */}

            {mapType === "commercial" && (

                <>

                    {/* ==========================================
                        Commercial Phase
                    ========================================== */}

                    <div className="mb-5">

                        <p className="mb-2 text-sm font-medium text-gray-600">
                            Select Phase
                        </p>

                        <div className="flex flex-wrap gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    handleCommercialPhaseChange(
                                        "phase1"
                                    )
                                }
                                className={`
                                    rounded-lg
                                    border
                                    px-5
                                    py-2
                                    font-medium
                                    transition-all
                                    duration-200

                                    ${
                                        selectedCommercialPhase ===
                                        "phase1"

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
                                    216 Shops
                                </span>

                            </button>


                            <button
                                type="button"
                                onClick={() =>
                                    handleCommercialPhaseChange(
                                        "phase2"
                                    )
                                }
                                className={`
                                    rounded-lg
                                    border
                                    px-5
                                    py-2
                                    font-medium
                                    transition-all
                                    duration-200

                                    ${
                                        selectedCommercialPhase ===
                                        "phase2"

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

                                Phase 2 / Commercial 1

                                <span className="ml-2 text-xs opacity-80">
                                    344 Shops
                                </span>

                            </button>

                        </div>

                    </div>


                    {/* ==========================================
                        Commercial Floor
                    ========================================== */}

                    <div className="mb-6">

                        <p className="mb-2 text-sm font-medium text-gray-600">
                            Select Floor
                        </p>

                        <div className="flex flex-wrap gap-2">

                            {(
                                [
                                    {
                                        value: 0,
                                        label: "Ground Floor",
                                    },
                                    {
                                        value: 1,
                                        label: "1st Floor",
                                    },
                                    {
                                        value: 2,
                                        label: "2nd Floor",
                                    },
                                    {
                                        value: 3,
                                        label: "3rd Floor",
                                    },
                                ] as {
                                    value: CommercialFloor;
                                    label: string;
                                }[]
                            ).map(
                                (floor) => (

                                    <button
                                        key={floor.value}
                                        type="button"
                                        onClick={() =>
                                            setSelectedCommercialFloor(
                                                floor.value
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

                                            ${
                                                selectedCommercialFloor ===
                                                floor.value

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

                                        {floor.label}

                                    </button>

                                )
                            )}

                        </div>

                    </div>


                    {/* ==========================================
                        Commercial Statistics
                    ========================================== */}

                    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">

                        <div className="rounded-xl bg-gray-50 p-4">

                            <p className="text-sm text-gray-500">
                                Total Shops
                            </p>

                            <p className="mt-1 text-2xl font-bold text-gray-800">
                                {commercialTotal}
                            </p>

                        </div>


                        <div className="rounded-xl bg-green-50 p-4">

                            <p className="text-sm text-green-600">
                                Available
                            </p>

                            <p className="mt-1 text-2xl font-bold text-green-700">
                                {commercialAvailable}
                            </p>

                        </div>


                        <div className="rounded-xl bg-red-50 p-4">

                            <p className="text-sm text-red-600">
                                Booked
                            </p>

                            <p className="mt-1 text-2xl font-bold text-red-700">
                                {commercialBooked}
                            </p>

                        </div>


                        <div className="rounded-xl bg-yellow-50 p-4">

                            <p className="text-sm text-yellow-600">
                                Hold
                            </p>

                            <p className="mt-1 text-2xl font-bold text-yellow-700">
                                {commercialHold}
                            </p>

                        </div>

                    </div>

                </>
            )}


            {/* ==================================================
                ORIGINAL CLIENT MAP
            ================================================== */}

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-gray-50
                "
            >

                {/* ==============================================
                    Map Header
                ============================================== */}

                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        border-b
                        bg-white
                        p-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    <div>

                        <h3 className="text-lg font-bold text-gray-800">
                            {mapTitle}
                        </h3>

                        <p className="text-sm text-gray-500">
                            {mapSubtitle}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={openFullMap}
                        className="
                            rounded-lg
                            bg-green-600
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-white
                            shadow-sm
                            transition-all
                            duration-200
                            hover:bg-green-700
                            hover:shadow-md
                        "
                    >
                        Open Full Map
                    </button>

                </div>


                {/* ==============================================
                    PDF Viewer
                ============================================== */}

                <div className="h-[700px] w-full bg-gray-200">

                    <iframe
                        key={mapFile}
                        src={mapFile}
                        title={
                            mapType === "residential"
                                ? `${getResidentialSectionName(
                                    selectedSection
                                )} - Floor ${selectedFloor}`
                                : `${getCommercialPhaseName(
                                    selectedCommercialPhase
                                )} - ${getCommercialFloorName(
                                    selectedCommercialFloor
                                )}`
                        }
                        className="h-full w-full border-0"
                    />

                </div>

            </div>


            {/* ==================================================
                Map Information
            ================================================== */}

            <div
                className="
                    mt-4
                    rounded-xl
                    border
                    border-blue-100
                    bg-blue-50
                    p-4
                "
            >

                <p className="text-sm text-blue-800">

                    <span className="font-semibold">
                        Floor Plan:
                    </span>{" "}

                    Original client-provided architectural
                    floor plan is displayed without modification.

                </p>

            </div>

        </div>
    );
}

export default FloorMap;