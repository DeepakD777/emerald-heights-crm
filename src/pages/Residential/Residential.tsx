import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    RotateCcw,
    Search,
} from "lucide-react";

import FlatModal from "../../components/dashboard/FlatModal";

import {
    getProperties,
    updateProperty,
} from "../../services/propertyService";

import type {
    Property,
    PropertyStatus,
} from "../../services/propertyService";

import {
    createBooking,
} from "../../services/bookingService";
import {
    useAutoRefresh,
} from "../../hooks/useAutoRefresh"

// ======================================================
// Types
// ======================================================

type ResidentialBlock =
    | "A Block"
    | "B Block"
    | "C1 Tower";

type ResidentialSection =
    | "B"
    | "B1";

type Status =
    | "all"
    | "available"
    | "hold"
    | "booked"
    | "sold";

// ======================================================
// Constants
// ======================================================

const RESIDENTIAL_BLOCKS: {
    value: ResidentialBlock;
    label: string;
}[] = [
        {
            value: "A Block",
            label: "A Block - Amogh",
        },
        {
            value: "B Block",
            label: "B Block - Ekash",
        },
        {
            value: "C1 Tower",
            label: "C1 Tower - Ishan",
        },
    ];

// ======================================================
// Helpers
// ======================================================

const normalizeStatus = (
    status: PropertyStatus
) => {
    return String(status).toLowerCase();
};

const naturalSort = (
    a: Property,
    b: Property
) => {
    return String(
        a.unitNumber ?? ""
    ).localeCompare(
        String(
            b.unitNumber ?? ""
        ),
        undefined,
        {
            numeric: true,
            sensitivity: "base",
        }
    );
};

function chunkArray<T>(
    items: T[],
    size: number
): T[][] {
    const rows: T[][] = [];

    for (
        let index = 0;
        index < items.length;
        index += size
    ) {
        rows.push(
            items.slice(
                index,
                index + size
            )
        );
    }

    return rows;
}

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

        case "sold":
            return `
                bg-gray-100
                border-gray-500
                text-gray-700
                hover:bg-gray-200
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

const getStatusText = (
    status: string
) => {
    switch (status) {
        case "booked":
            return "BOOKED";

        case "hold":
            return "HOLD";

        case "sold":
            return "SOLD";

        default:
            return "AVAILABLE";
    }
};

// ======================================================
// Residential
// ======================================================

function Residential() {

    // ==================================================
    // Backend Inventory
    // ==================================================

    const [
        properties,
        setProperties,
    ] = useState<Property[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    // ==================================================
    // Navigation
    // ==================================================

    const [
        selectedBlock,
        setSelectedBlock,
    ] = useState<ResidentialBlock>(
        "A Block"
    );

    const [
        selectedSection,
        setSelectedSection,
    ] = useState<ResidentialSection>(
        "B"
    );

    const [
        selectedFloor,
        setSelectedFloor,
    ] = useState(1);

    // ==================================================
    // Filters
    // ==================================================

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        selectedStatus,
        setSelectedStatus,
    ] = useState<Status>(
        "all"
    );

    // ==================================================
    // Modal
    // ==================================================

    const [
        selectedFlat,
        setSelectedFlat,
    ] = useState<any>(null);

    const [
        isFlatModalOpen,
        setIsFlatModalOpen,
    ] = useState(false);

    // ==================================================
    // Internal Backend Mapping
    // ==================================================

    const selectedBPhase =
        selectedSection === "B"
            ? "Phase 1"
            : "Phase 2";

    // ==================================================
    // Fetch
    // ==================================================

    const loadProperties =
        async (
            showLoading = false
        ) => {

            try {

                if (showLoading) {
                    setLoading(true);
                    setError("");
                }

                const response =
                    await getProperties({
                        type:
                            "RESIDENTIAL",
                    });

                setProperties(
                    response.data
                );

                setError("");

            } catch (err) {

                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to load residential inventory";

                if (showLoading) {
                    setError(message);
                } else {
                    console.error(
                        "Residential auto refresh failed:",
                        err
                    );
                }

            } finally {

                if (showLoading) {
                    setLoading(false);
                }
            }
        };

    useEffect(() => {
        void loadProperties(true);
    }, []);

    useAutoRefresh(
        () => loadProperties(false),
        5000
    );

    // ==================================================
    // Block Counts
    // ==================================================

    const blockCounts =
        useMemo(() => {
            return {
                "A Block":
                    properties.filter(
                        (property) =>
                            property.block ===
                            "A Block"
                    ).length,

                "B Block":
                    properties.filter(
                        (property) =>
                            property.block ===
                            "B Block"
                    ).length,

                "C1 Tower":
                    properties.filter(
                        (property) =>
                            property.block ===
                            "C1 Tower"
                    ).length,
            };
        }, [
            properties,
        ]);

    // ==================================================
    // B / B1 Counts
    // ==================================================

    const bCount =
        properties.filter(
            (property) =>
                property.block ===
                "B Block" &&
                property.phase ===
                "Phase 1"
        ).length;

    const b1Count =
        properties.filter(
            (property) =>
                property.block ===
                "B Block" &&
                property.phase ===
                "Phase 2"
        ).length;

    // ==================================================
    // Selected Block / Section Properties
    // ==================================================

    const sectionProperties =
        useMemo(() => {

            return properties
                .filter(
                    (property) => {

                        if (
                            property.type !==
                            "RESIDENTIAL"
                        ) {
                            return false;
                        }

                        if (
                            property.block !==
                            selectedBlock
                        ) {
                            return false;
                        }

                        if (
                            selectedBlock ===
                            "B Block"
                        ) {
                            return (
                                property.phase ===
                                selectedBPhase
                            );
                        }

                        return true;
                    }
                )
                .sort(
                    naturalSort
                );

        }, [
            properties,
            selectedBlock,
            selectedBPhase,
        ]);

    // ==================================================
    // Floors
    // ==================================================

    const floors =
        useMemo(() => {

            return Array.from(
                new Set(
                    sectionProperties
                        .map(
                            (property) =>
                                Number(
                                    property.floor
                                )
                        )
                        .filter(
                            (floor) =>
                                Number.isFinite(
                                    floor
                                )
                        )
                )
            ).sort(
                (a, b) =>
                    a - b
            );

        }, [
            sectionProperties,
        ]);

    // ==================================================
    // Current Floor
    // ==================================================

    const currentFlats =
        useMemo(() => {

            return sectionProperties
                .filter(
                    (property) =>
                        Number(
                            property.floor
                        ) ===
                        selectedFloor
                )
                .sort(
                    naturalSort
                );

        }, [
            sectionProperties,
            selectedFloor,
        ]);

    // ==================================================
    // Filters
    // ==================================================

    const filteredFlats =
        useMemo(() => {

            const searchText =
                search
                    .trim()
                    .toLowerCase();

            return currentFlats.filter(
                (property) => {

                    const status =
                        normalizeStatus(
                            property.status
                        );

                    const matchesSearch =
                        !searchText ||
                        String(
                            property.unitNumber ??
                            ""
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
        ]);

    // ==================================================
    // Current Floor Statistics
    // ==================================================

    const totalFlats =
        currentFlats.length;

    const availableFlats =
        currentFlats.filter(
            (property) =>
                property.status ===
                "AVAILABLE"
        ).length;

    const bookedFlats =
        currentFlats.filter(
            (property) =>
                property.status ===
                "BOOKED"
        ).length;

    const holdFlats =
        currentFlats.filter(
            (property) =>
                property.status ===
                "HOLD"
        ).length;

    const soldFlats =
        currentFlats.filter(
            (property) =>
                property.status ===
                "SOLD"
        ).length;

    // ==================================================
    // Selected Labels
    // ==================================================

    const selectedBlockData =
        RESIDENTIAL_BLOCKS.find(
            (item) =>
                item.value ===
                selectedBlock
        );

    const currentSectionName =
        selectedBlock ===
            "B Block"
            ? `${selectedBlockData?.label} - ${selectedSection}`
            : `${selectedBlockData?.label}`;

    const currentTowerName =
        selectedBlock ===
            "A Block"
            ? "Amogh"
            : selectedBlock ===
                "C1 Tower"
                ? "Ishan"
                : selectedSection ===
                    "B1"
                    ? "B1 Tower"
                    : "Ekash";

    // ==================================================
    // Zig-Zag
    // ==================================================

    const zigZagRows =
        useMemo(() => {

            return chunkArray(
                filteredFlats,
                4
            );

        }, [
            filteredFlats,
        ]);

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
    // Change Block
    // ==================================================

    const handleBlockChange = (
        block: ResidentialBlock
    ) => {

        setSelectedBlock(
            block
        );

        setSelectedFloor(1);

        if (
            block ===
            "B Block"
        ) {
            setSelectedSection(
                "B"
            );
        }

        resetFilters();
    };

    // ==================================================
    // Change Section
    // ==================================================

    const handleSectionChange = (
        section: ResidentialSection
    ) => {

        setSelectedSection(
            section
        );

        setSelectedFloor(1);

        resetFilters();
    };

    // ==================================================
    // Map Property to Modal
    // ==================================================

    const mapPropertyToFlat = (
        property: Property
    ) => {

        return {
            id:
                property.id,

            propertyId:
                property.id,

            propertyCode:
                property.propertyCode,

            number:
                property.unitNumber ??
                "",

            unitNumber:
                property.unitNumber ??
                "",

            tower:
                property.tower ??
                "",

            block:
                property.block ??
                "",

            phase:
                property.phase ??
                "",

            floor:
                Number(
                    property.floor ??
                    0
                ),

            area:
                property.area
                    ? `${property.area} sqft`
                    : "Area not set",

            price:
                property.price,

            type:
                "Residential",

            status:
                normalizeStatus(
                    property.status
                ),

            isFineDine:
                property.isFineDine,
        };
    };

    // ==================================================
    // Open Flat
    // ==================================================

    const openFlat = (
        property: Property
    ) => {

        setSelectedFlat(
            mapPropertyToFlat(
                property
            )
        );

        setIsFlatModalOpen(
            true
        );
    };

    // ==================================================
    // Save Status
    // ==================================================

    const handleSaveFlat =
        async (
            updatedFlat: any
        ) => {

            try {

                const status =
                    String(
                        updatedFlat.status
                    ).toUpperCase() as
                    PropertyStatus;

                await updateProperty(
                    updatedFlat.id,
                    {
                        status,
                    }
                );

                await loadProperties();

                setIsFlatModalOpen(
                    false
                );

                setSelectedFlat(
                    null
                );

            } catch (err) {

                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to update flat";

                alert(message);
            }
        };

    // ==================================================
    // Booking
    // ==================================================

const handleBooking =
    async (
        bookingData: any
    ) => {

        if (
            !selectedFlat
        ) {
            return;
        }

        try {

            await createBooking({

                // ==========================================
                // IMPORTANT:
                // BookingModal ki saari filled fields
                // backend ko forward hongi.
                // ==========================================

                ...bookingData,

                // Correct selected residential property
                propertyId:
                    selectedFlat.propertyId ??
                    selectedFlat.id,

                // Assigned Sales Member
                employeeId:
                    bookingData.employeeId ??
                    undefined,

                // New booking default status
                status:
                    bookingData.status ??
                    "CONFIRMED",
            });

            await loadProperties();

            setIsFlatModalOpen(
                false
            );

            setSelectedFlat(
                null
            );

        } catch (err) {

            const message =
                err instanceof Error
                    ? err.message
                    : "Booking failed";

            alert(
                message
            );
        }
    };

    // ==================================================
    // Loading
    // ==================================================

    if (loading) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow">
                <p className="text-gray-600">
                    Loading residential inventory...
                </p>
            </div>
        );
    }

    // ==================================================
    // Error
    // ==================================================

    if (error) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow">

                <p className="font-medium text-red-600">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => {
                        void loadProperties(true);
                    }}
                    className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-white"
                >
                    Retry
                </button>

            </div>
        );
    }

    // ==================================================
    // UI
    // ==================================================

    return (
        <div className="space-y-6">

            {/* ==========================================
                Header
            ========================================== */}

            <div>

                <h1 className="text-2xl font-bold text-gray-800">
                    Residential
                </h1>

                <p className="mt-1 text-gray-500">
                    Residential Flats Inventory
                </p>

            </div>

            {/* ==========================================
                Select Block
            ========================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <h2 className="mb-4 text-lg font-bold text-gray-800">
                    Select Block / Tower
                </h2>

                <div className="flex flex-wrap gap-3">

                    {RESIDENTIAL_BLOCKS.map(
                        (item) => (

                            <button
                                key={
                                    item.value
                                }
                                type="button"
                                onClick={() =>
                                    handleBlockChange(
                                        item.value
                                    )
                                }
                                className={`
                                    rounded-xl
                                    border
                                    px-6
                                    py-3
                                    font-semibold
                                    transition-all

                                    ${selectedBlock ===
                                        item.value
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

                                {item.label}

                                <span className="ml-2 text-xs opacity-80">
                                    {
                                        blockCounts[
                                        item.value
                                        ]
                                    } Flats
                                </span>

                            </button>

                        )
                    )}

                </div>

            </div>

            {/* ==========================================
                B / B1 Section
            ========================================== */}

            {selectedBlock ===
                "B Block" && (

                    <div className="rounded-2xl bg-white p-6 shadow">

                        <div className="mb-4">

                            <h2 className="text-lg font-bold text-gray-800">
                                Select Section
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Select B or B1 section of B Block
                            </p>

                        </div>

                        <div className="flex flex-wrap gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    handleSectionChange(
                                        "B"
                                    )
                                }
                                className={`
                                rounded-xl
                                border
                                px-6
                                py-3
                                font-medium
                                transition-all

                                ${selectedSection ===
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
                                B

                                <span className="ml-2 text-xs opacity-80">
                                    {bCount} Flats
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    handleSectionChange(
                                        "B1"
                                    )
                                }
                                className={`
                                rounded-xl
                                border
                                px-6
                                py-3
                                font-medium
                                transition-all

                                ${selectedSection ===
                                        "B1"
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
                                B1

                                <span className="ml-2 text-xs opacity-80">
                                    {b1Count} Flats
                                </span>
                            </button>

                        </div>

                    </div>
                )}

            {/* ==========================================
                Current Section + Floors
            ========================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">

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
                            {sectionProperties.length}
                        </span>

                    </div>

                </div>

                <div className="flex flex-wrap gap-2">

                    {floors.map(
                        (floor) => (

                            <button
                                key={
                                    floor
                                }
                                type="button"
                                onClick={() => {
                                    setSelectedFloor(
                                        floor
                                    );

                                    resetFilters();
                                }}
                                className={`
                                    rounded-lg
                                    border
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    transition-all

                                    ${selectedFloor ===
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

            {/* ==========================================
                Statistics
            ========================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

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

                <div className="rounded-2xl bg-gray-100 p-5">

                    <p className="text-sm text-gray-600">
                        Sold
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-700">
                        {soldFlats}
                    </p>

                </div>

            </div>

            {/* ==========================================
                Filters
            ========================================== */}

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
                                value={
                                    search
                                }
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
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
                            value={
                                selectedStatus
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedStatus(
                                    event.target
                                        .value as
                                    Status
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

                            <option value="sold">
                                Sold
                            </option>

                        </select>

                    </div>

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

            {/* ==========================================
                Flats
            ========================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6 text-center">

                    <h2 className="text-xl font-bold text-gray-800">
                        {currentSectionName}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Floor {selectedFloor}
                    </p>

                </div>

                {filteredFlats.length ===
                    0 ? (

                    <div className="rounded-xl border border-dashed p-12 text-center">

                        <p className="text-lg font-semibold text-gray-700">
                            No Flats Found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or status filter.
                        </p>

                        <button
                            type="button"
                            onClick={
                                resetFilters
                            }
                            className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            Reset Filters
                        </button>

                    </div>

                ) : (

                    <div
                        className="
                            max-h-[620px]
                            overflow-auto
                            rounded-2xl
                            border
                            bg-gray-50
                            px-6
                            py-8
                        "
                    >

                        <div
                            className="
                                mx-auto
                                w-[760px]
                                min-w-[760px]
                                space-y-4
                            "
                        >

                            {zigZagRows.map(
                                (
                                    row,
                                    rowIndex
                                ) => (

                                    <div
                                        key={
                                            rowIndex
                                        }
                                        className="
                                            relative
                                            h-[130px]
                                            w-full
                                        "
                                    >

                                        {row.map(
                                            (
                                                property,
                                                columnIndex
                                            ) => {

                                                const status =
                                                    normalizeStatus(
                                                        property.status
                                                    );

                                                const baseLeft =
                                                    columnIndex *
                                                    171;

                                                const rowOffset =
                                                    rowIndex %
                                                        2 ===
                                                        1
                                                        ? 86
                                                        : 0;

                                                const left =
                                                    baseLeft +
                                                    rowOffset;

                                                return (

                                                    <button
                                                        key={
                                                            property.id
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            openFlat(
                                                                property
                                                            )
                                                        }
                                                        style={{
                                                            left:
                                                                `${left}px`,
                                                        }}
                                                        className={`
                                                            absolute
                                                            top-0

                                                            flex
                                                            h-[130px]
                                                            w-[155px]

                                                            flex-col
                                                            items-center
                                                            justify-center

                                                            rounded-xl
                                                            border-2
                                                            p-4
                                                            text-center

                                                            transition-all
                                                            duration-200

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
                                                            {
                                                                property.unitNumber
                                                            }
                                                        </span>

                                                        <span className="mt-2 text-xs">
                                                            {property.area
                                                                ? `${property.area} sqft`
                                                                : "Area not set"}
                                                        </span>

                                                        <span className="mt-1 text-xs">
                                                            Residential
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

                                )
                            )}

                        </div>

                    </div>

                )}

                {/* Legend */}

                <div className="mt-8 flex flex-wrap justify-center gap-6 border-t pt-5 text-sm">

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

                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-500" />
                        Sold
                    </div>

                </div>

            </div>

            {/* ==========================================
                Modal
            ========================================== */}

            <FlatModal
                isOpen={
                    isFlatModalOpen
                }
                onClose={() => {

                    setIsFlatModalOpen(
                        false
                    );

                    setSelectedFlat(
                        null
                    );
                }}
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