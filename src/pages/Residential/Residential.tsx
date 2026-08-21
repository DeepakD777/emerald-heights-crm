import {
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    CSSProperties,
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
} from "../../hooks/useAutoRefresh";

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

type ResidentialFacing =
    | "North"
    | "South"
    | "East"
    | "West";

type FacingFilter =
    | "all"
    | ResidentialFacing;

type KitchenFilter =
    | "all"
    | "back-side";

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
    return String(
        status
    ).toLowerCase();
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

const getStatusColor = (
    status: string
) => {

    switch (
    status
    ) {

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

    switch (
    status
    ) {

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
// Unit Number Helper
// ======================================================

const getUnitNumericValue = (
    property: Property
) => {

    const rawValue =
        String(
            property.unitNumber ??
            ""
        );

    const match =
        rawValue.match(
            /(\d+)$/
        );

    if (
        !match
    ) {
        return null;
    }

    const value =
        Number(
            match[1]
        );

    return Number.isFinite(
        value
    )
        ? value
        : null;
};

// ======================================================
// Residential Facing Helper
// ======================================================

const getResidentialFacing = (
    property: Property
): ResidentialFacing | "" => {

    const value =
        getUnitNumericValue(
            property
        );

    if (
        value === null
    ) {
        return "";
    }

    const isEven =
        value % 2 === 0;

    // ==============================================
    // A Block - Amogh
    // Odd  -> South
    // Even -> North
    // ==============================================

    if (
        property.block ===
        "A Block"
    ) {
        return isEven
            ? "North"
            : "South";
    }

    // ==============================================
    // B Block - Ekash / B1
    // Odd  -> West
    // Even -> East
    // ==============================================

    if (
        property.block ===
        "B Block"
    ) {
        return isEven
            ? "East"
            : "West";
    }

    // ==============================================
    // C1 Tower - Ishan
    // Odd  -> East
    // Even -> West
    // ==============================================

    if (
        property.block ===
        "C1 Tower"
    ) {
        return isEven
            ? "West"
            : "East";
    }

    return "";
};

// ======================================================
// Residential Kitchen Helper
// ======================================================

const getResidentialKitchen = (
    property: Property
) => {

    const value =
        getUnitNumericValue(
            property
        );

    if (
        value === null
    ) {
        return "";
    }

    const suffix =
        value % 100;

    // ==============================================
    // A Block - Back Side Kitchen
    //
    // Floor 1 -> 101, 106, 110
    // Floor 2 -> 201, 206, 210
    // etc.
    // ==============================================

    if (
        property.block ===
        "A Block" &&
        [1, 6, 10].includes(
            suffix
        )
    ) {
        return "Back Side Kitchen";
    }

    return "";
};

// ======================================================
// Flat Card
// ======================================================

interface FlatCardProps {
    property: Property;

    onClick: () => void;

    className?: string;

    style?: CSSProperties;
}

function FlatCard({
    property,
    onClick,
    className = "",
    style,
}: FlatCardProps) {

    const status =
        normalizeStatus(
            property.status
        );

    return (

        <button
            type="button"
            onClick={
                onClick
            }
            style={
                style
            }
            className={`
                flex
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

                ${className}
            `}
        >

            <span className="text-lg font-bold">
                {
                    property.unitNumber
                }
            </span>

            <span className="mt-2 text-xs">
                {
                    property.area
                        ? `${property.area} sqft`
                        : "Area not set"
                }
            </span>

            <span className="mt-1 text-xs">
                Residential
            </span>

            <span className="mt-3 text-xs font-bold tracking-wide">
                {
                    getStatusText(
                        status
                    )
                }
            </span>

        </button>
    );
}

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
    ] =
        useState<Property[]>(
            []
        );

    const [
        loading,
        setLoading,
    ] =
        useState(
            true
        );

    const [
        error,
        setError,
    ] =
        useState(
            ""
        );

    // ==================================================
    // Navigation
    // ==================================================

    const [
        selectedBlock,
        setSelectedBlock,
    ] =
        useState<ResidentialBlock>(
            "A Block"
        );

    const [
        selectedSection,
        setSelectedSection,
    ] =
        useState<ResidentialSection>(
            "B"
        );

    const [
        selectedFloor,
        setSelectedFloor,
    ] =
        useState(
            1
        );

    // ==================================================
    // Filters
    // ==================================================

    const [
        search,
        setSearch,
    ] =
        useState(
            ""
        );

    const [
        selectedStatus,
        setSelectedStatus,
    ] =
        useState<Status>(
            "all"
        );

    const [
        selectedFacing,
        setSelectedFacing,
    ] =
        useState<FacingFilter>(
            "all"
        );

    const [
        selectedKitchen,
        setSelectedKitchen,
    ] =
        useState<KitchenFilter>(
            "all"
        );

    // ==================================================
    // Modal
    // ==================================================

    const [
        selectedFlat,
        setSelectedFlat,
    ] =
        useState<any>(
            null
        );

    const [
        isFlatModalOpen,
        setIsFlatModalOpen,
    ] =
        useState(
            false
        );

    // ==================================================
    // Internal Backend Mapping
    // ==================================================

    const selectedBPhase =
        selectedSection ===
            "B"
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

                if (
                    showLoading
                ) {
                    setLoading(
                        true
                    );

                    setError(
                        ""
                    );
                }

                const response =
                    await getProperties({
                        type:
                            "RESIDENTIAL",
                    });

                setProperties(
                    response.data
                );

                setError(
                    ""
                );

            } catch (
            err
            ) {

                const message =
                    err instanceof
                        Error
                        ? err.message
                        : "Failed to load residential inventory";

                if (
                    showLoading
                ) {

                    setError(
                        message
                    );

                } else {

                    console.error(
                        "Residential auto refresh failed:",
                        err
                    );
                }

            } finally {

                if (
                    showLoading
                ) {
                    setLoading(
                        false
                    );
                }
            }
        };

    useEffect(
        () => {
            void loadProperties(
                true
            );
        },
        []
    );

    useAutoRefresh(
        () =>
            loadProperties(
                false
            ),
        5000
    );

    // ==================================================
    // Block Counts
    // ==================================================

    const blockCounts =
        useMemo(
            () => {

                return {

                    "A Block":
                        properties.filter(
                            (
                                property
                            ) =>
                                property.block ===
                                "A Block"
                        ).length,

                    "B Block":
                        properties.filter(
                            (
                                property
                            ) =>
                                property.block ===
                                "B Block"
                        ).length,

                    "C1 Tower":
                        properties.filter(
                            (
                                property
                            ) =>
                                property.block ===
                                "C1 Tower"
                        ).length,
                };

            },
            [
                properties,
            ]
        );

    // ==================================================
    // B / B1 Counts
    // ==================================================

    const bCount =
        properties.filter(
            (
                property
            ) =>
                property.block ===
                "B Block" &&
                property.phase ===
                "Phase 1"
        ).length;

    const b1Count =
        properties.filter(
            (
                property
            ) =>
                property.block ===
                "B Block" &&
                property.phase ===
                "Phase 2"
        ).length;

    // ==================================================
    // Selected Block / Section Properties
    // ==================================================

    const sectionProperties =
        useMemo(
            () => {

                return properties
                    .filter(
                        (
                            property
                        ) => {

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

            },
            [
                properties,
                selectedBlock,
                selectedBPhase,
            ]
        );

    // ==================================================
    // Floors
    // ==================================================

    const floors =
        useMemo(
            () => {

                return Array.from(
                    new Set(
                        sectionProperties
                            .map(
                                (
                                    property
                                ) =>
                                    Number(
                                        property.floor
                                    )
                            )
                            .filter(
                                (
                                    floor
                                ) =>
                                    Number.isFinite(
                                        floor
                                    )
                            )
                    )
                ).sort(
                    (
                        a,
                        b
                    ) =>
                        a -
                        b
                );

            },
            [
                sectionProperties,
            ]
        );

    // ==================================================
    // Current Floor
    // ==================================================

    const currentFlats =
        useMemo(
            () => {

                return sectionProperties
                    .filter(
                        (
                            property
                        ) =>
                            Number(
                                property.floor
                            ) ===
                            selectedFloor
                    )
                    .sort(
                        naturalSort
                    );

            },
            [
                sectionProperties,
                selectedFloor,
            ]
        );

    // ==================================================
    // Filtered Flats
    // ==================================================

    const filteredFlats =
        useMemo(
            () => {

                const searchText =
                    search
                        .trim()
                        .toLowerCase();

                return currentFlats.filter(
                    (
                        property
                    ) => {

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

                        const matchesFacing =
                            selectedFacing ===
                            "all" ||
                            getResidentialFacing(
                                property
                            ) ===
                            selectedFacing;

                        const matchesKitchen =
                            selectedKitchen ===
                            "all" ||
                            getResidentialKitchen(
                                property
                            ) ===
                            "Back Side Kitchen";

                        return (
                            matchesSearch &&
                            matchesStatus &&
                            matchesFacing &&
                            matchesKitchen
                        );
                    }
                );

            },
            [
                currentFlats,
                search,
                selectedStatus,
                selectedFacing,
                selectedKitchen,
            ]
        );

    // ==================================================
    // Statistics
    // ==================================================

    const totalFlats =
        currentFlats.length;

    const availableFlats =
        currentFlats.filter(
            (
                property
            ) =>
                property.status ===
                "AVAILABLE"
        ).length;

    const bookedFlats =
        currentFlats.filter(
            (
                property
            ) =>
                property.status ===
                "BOOKED"
        ).length;

    const holdFlats =
        currentFlats.filter(
            (
                property
            ) =>
                property.status ===
                "HOLD"
        ).length;

    const soldFlats =
        currentFlats.filter(
            (
                property
            ) =>
                property.status ===
                "SOLD"
        ).length;

    // ==================================================
    // Selected Labels
    // ==================================================

    const selectedBlockData =
        RESIDENTIAL_BLOCKS.find(
            (
                item
            ) =>
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
    // A Block Flat Map
    // ==================================================

    const aBlockFlatMap =
        useMemo(
            () => {

                const map =
                    new Map<
                        number,
                        Property
                    >();

                filteredFlats.forEach(
                    (
                        property
                    ) => {

                        const value =
                            getUnitNumericValue(
                                property
                            );

                        if (
                            value ===
                            null
                        ) {
                            return;
                        }

                        const suffix =
                            value %
                            100;

                        map.set(
                            suffix,
                            property
                        );
                    }
                );

                return map;

            },
            [
                filteredFlats,
            ]
        );

    // ==================================================
    // Reset Filters
    // ==================================================

    const resetFilters =
        () => {

            setSearch(
                ""
            );

            setSelectedStatus(
                "all"
            );

            setSelectedFacing(
                "all"
            );

            setSelectedKitchen(
                "all"
            );
        };

    // ==================================================
    // Change Block
    // ==================================================

    const handleBlockChange = (
        block:
            ResidentialBlock
    ) => {

        setSelectedBlock(
            block
        );

        setSelectedFloor(
            1
        );

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
        section:
            ResidentialSection
    ) => {

        setSelectedSection(
            section
        );

        setSelectedFloor(
            1
        );

        resetFilters();
    };

    // ==================================================
    // Map Property to Modal
    // ==================================================

    const mapPropertyToFlat = (
        property:
            Property
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
                property.tower ||
                currentTowerName,

            block:
                property.block ??
                "",

            phase:
                property.phase ??
                "",

            facing:
                getResidentialFacing(
                    property
                ),

            kitchen:
                getResidentialKitchen(
                    property
                ),

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
        property:
            Property
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
            updatedFlat:
                any
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

            } catch (
            err
            ) {

                const message =
                    err instanceof
                        Error
                        ? err.message
                        : "Failed to update flat";

                alert(
                    message
                );
            }
        };

    // ==================================================
    // Booking
    // ==================================================

    const handleBooking =
        async (
            bookingData:
                any
        ) => {

            if (
                !selectedFlat
            ) {
                return;
            }

            try {

                await createBooking({

                    ...bookingData,

                    propertyId:
                        selectedFlat.propertyId ??
                        selectedFlat.id,

                    employeeId:
                        bookingData.employeeId ??
                        undefined,

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

            } catch (
            err
            ) {

                const message =
                    err instanceof
                        Error
                        ? err.message
                        : "Booking failed";

                alert(
                    message
                );
            }
        };

    // ==================================================
    // A Block Flat Slot
    // ==================================================

    const renderAFlat =
        (
            suffix:
                number
        ) => {

            const property =
                aBlockFlatMap.get(
                    suffix
                );

            if (
                !property
            ) {

                return (

                    <div
                        key={
                            `a-empty-${suffix}`
                        }
                        className="h-[130px]"
                    />

                );
            }

            return (

                <FlatCard
                    key={
                        property.id
                    }
                    property={
                        property
                    }
                    onClick={() =>
                        openFlat(
                            property
                        )
                    }
                    className="h-[130px] w-full"
                />

            );
        };

    // ==================================================
    // C1 Tower Flat Slot
    // ==================================================

    const renderC1Flat =
        (
            suffix:
                number
        ) => {

            const property =
                filteredFlats.find(
                    (
                        item
                    ) => {

                        const value =
                            getUnitNumericValue(
                                item
                            );

                        return (
                            value !==
                            null &&
                            value %
                            100 ===
                            suffix
                        );
                    }
                );

            if (
                !property
            ) {

                return (

                    <div
                        key={
                            `c1-empty-${suffix}`
                        }
                        className="h-[130px]"
                    />

                );
            }

            return (

                <FlatCard
                    key={
                        property.id
                    }
                    property={
                        property
                    }
                    onClick={() =>
                        openFlat(
                            property
                        )
                    }
                    className="h-[130px] w-full"
                />

            );
        };

    // ==================================================
    // Loading
    // ==================================================

    if (
        loading
    ) {

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

    if (
        error
    ) {

        return (

            <div className="rounded-2xl bg-white p-8 shadow">

                <p className="font-medium text-red-600">
                    {
                        error
                    }
                </p>

                <button
                    type="button"
                    onClick={() => {
                        void loadProperties(
                            true
                        );
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
                Select Block
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <h2 className="mb-4 text-lg font-bold text-gray-800">
                    Select Block / Tower
                </h2>

                <div className="flex flex-wrap gap-3">

                    {
                        RESIDENTIAL_BLOCKS.map(
                            (
                                item
                            ) => (

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

                                    {
                                        item.label
                                    }

                                    <span className="ml-2 text-xs opacity-80">

                                        {
                                            blockCounts[
                                            item.value
                                            ]
                                        } Flats

                                    </span>

                                </button>

                            )
                        )
                    }

                </div>

            </div>

            {/* ==================================================
                B / B1 Section
            ================================================== */}

            {
                selectedBlock ===
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
                                    {
                                        bCount
                                    } Flats
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
                                    {
                                        b1Count
                                    } Flats
                                </span>

                            </button>

                        </div>

                    </div>

                )
            }

            {/* ==================================================
                Current Section + Floors
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {
                                currentSectionName
                            }
                        </h2>

                        <p className="text-sm text-gray-500">
                            Tower: {
                                currentTowerName
                            }
                        </p>

                    </div>

                    <div className="text-sm text-gray-500">

                        Total Flats:{" "}

                        <span className="font-semibold text-gray-800">
                            {
                                sectionProperties.length
                            }
                        </span>

                    </div>

                </div>

                <div className="flex flex-wrap gap-2">

                    {
                        floors.map(
                            (
                                floor
                            ) => (

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

                                    Floor {
                                        floor
                                    }

                                </button>

                            )
                        )
                    }

                </div>

            </div>

            {/* ==================================================
                Statistics
            ================================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">
                        Total Flats
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-800">
                        {
                            totalFlats
                        }
                    </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5">

                    <p className="text-sm text-green-700">
                        Available
                    </p>

                    <p className="mt-1 text-3xl font-bold text-green-700">
                        {
                            availableFlats
                        }
                    </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5">

                    <p className="text-sm text-red-700">
                        Booked
                    </p>

                    <p className="mt-1 text-3xl font-bold text-red-700">
                        {
                            bookedFlats
                        }
                    </p>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5">

                    <p className="text-sm text-yellow-700">
                        Hold
                    </p>

                    <p className="mt-1 text-3xl font-bold text-yellow-700">
                        {
                            holdFlats
                        }
                    </p>

                </div>

                <div className="rounded-2xl bg-gray-100 p-5">

                    <p className="text-sm text-gray-600">
                        Sold
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-700">
                        {
                            soldFlats
                        }
                    </p>

                </div>

            </div>

            {/* ==================================================
    Filters
================================================== */}

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow">

                <div
                    className="
            grid
            grid-cols-1
            gap-4

            md:grid-cols-2

            xl:grid-cols-[minmax(280px,1.5fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_minmax(190px,0.9fr)_120px]
            xl:items-end
        "
                >

                    {/* Search Flat */}

                    <div className="w-full">

                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                            Search Flat
                        </label>

                        <div
                            className="
                    flex
                    h-[46px]
                    items-center
                    rounded-xl
                    border
                    border-gray-300
                    bg-gray-50
                    px-3

                    transition

                    focus-within:border-green-500
                    focus-within:bg-white
                    focus-within:ring-2
                    focus-within:ring-green-100
                "
                        >

                            <Search
                                size={18}
                                className="shrink-0 text-gray-400"
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
                                className="
                        ml-2
                        w-full
                        bg-transparent
                        text-sm
                        text-gray-800
                        outline-none
                        placeholder:text-gray-400
                    "
                            />

                        </div>

                    </div>

                    {/* Status */}

                    <div className="w-full">

                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
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
                                    event.target.value as
                                    Status
                                )
                            }
                            className="
                    h-[46px]
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-800
                    outline-none
                    transition

                    focus:border-green-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-green-100
                "
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

                    {/* Facing */}

                    <div className="w-full">

                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                            Facing
                        </label>

                        <select
                            value={
                                selectedFacing
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedFacing(
                                    event.target.value as
                                    FacingFilter
                                )
                            }
                            className="
                    h-[46px]
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-800
                    outline-none
                    transition

                    focus:border-green-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-green-100
                "
                        >

                            <option value="all">
                                All Facing
                            </option>

                            <option value="North">
                                North
                            </option>

                            <option value="South">
                                South
                            </option>

                            <option value="East">
                                East
                            </option>

                            <option value="West">
                                West
                            </option>

                        </select>

                    </div>

                    {/* Kitchen */}

                    <div className="w-full">

                        <label className="mb-1.5 block text-sm font-medium text-gray-600">
                            Kitchen
                        </label>

                        <select
                            value={
                                selectedKitchen
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedKitchen(
                                    event.target.value as
                                    KitchenFilter
                                )
                            }
                            className="
                    h-[46px]
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-gray-50
                    px-3
                    text-sm
                    text-gray-800
                    outline-none
                    transition

                    focus:border-green-500
                    focus:bg-white
                    focus:ring-2
                    focus:ring-green-100
                "
                        >

                            <option value="all">
                                All Kitchen
                            </option>

                            <option value="back-side">
                                Back Side Kitchen
                            </option>

                        </select>

                    </div>

                    {/* Reset */}

                    <button
                        type="button"
                        onClick={
                            resetFilters
                        }
                        className="
                flex
                h-[46px]
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                text-sm
                font-semibold
                text-gray-600
                transition

                hover:border-gray-400
                hover:bg-gray-50

                md:col-span-2
                xl:col-span-1
            "
                    >

                        <RotateCcw
                            size={16}
                        />

                        Reset

                    </button>

                </div>

            </div>

            {/* ==================================================
                Flats
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6 text-center">

                    <h2 className="text-xl font-bold text-gray-800">
                        {
                            currentSectionName
                        }
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Floor {
                            selectedFloor
                        }
                    </p>

                </div>

                {
                    filteredFlats.length ===
                        0 ? (

                        <div className="rounded-xl border border-dashed p-12 text-center">

                            <p className="text-lg font-semibold text-gray-700">
                                No Flats Found
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                Try changing your filters.
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

                            {
                                selectedBlock ===
                                    "A Block"
                                    ? (

                                        // ==================================
                                        // A BLOCK - AMOGH
                                        // ==================================

                                        <div className="mx-auto w-[1040px] min-w-[1040px]">

                                            {/* Even Row */}

                                            <div className="grid grid-cols-6 gap-4">

                                                {
                                                    [
                                                        2,
                                                        4,
                                                        6,
                                                    ].map(
                                                        renderAFlat
                                                    )
                                                }

                                                {/* STAIRS */}

                                                <div className="flex h-[130px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100">

                                                    <div className="text-center">

                                                        <p className="text-sm font-bold tracking-wide text-slate-700">
                                                            STAIRS
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Common Area
                                                        </p>

                                                    </div>

                                                </div>

                                                {
                                                    [
                                                        8,
                                                        10,
                                                    ].map(
                                                        renderAFlat
                                                    )
                                                }

                                            </div>

                                            {/* COMMON AREA */}

                                            <div className="my-5 flex items-center gap-4">

                                                <div className="h-px flex-1 bg-gray-300" />

                                                <div className="rounded-full border border-gray-300 bg-white px-5 py-1.5 text-xs font-bold tracking-[0.18em] text-gray-500 shadow-sm">
                                                    COMMON AREA
                                                </div>

                                                <div className="h-px flex-1 bg-gray-300" />

                                            </div>

                                            {/* Odd Row */}

                                            <div className="grid grid-cols-6 gap-4">

                                                {
                                                    [
                                                        1,
                                                        3,
                                                        5,
                                                    ].map(
                                                        renderAFlat
                                                    )
                                                }

                                                {/* GARDEN */}

                                                <div className="flex h-[130px] items-center justify-center rounded-xl border-2 border-dashed border-green-300 bg-green-100">

                                                    <div className="text-center">

                                                        <p className="text-sm font-bold tracking-wide text-green-800">
                                                            GARDEN
                                                        </p>

                                                        <p className="mt-1 text-xs text-green-600">
                                                            Common Area
                                                        </p>

                                                    </div>

                                                </div>

                                                {
                                                    [
                                                        7,
                                                        9,
                                                    ].map(
                                                        renderAFlat
                                                    )
                                                }

                                            </div>

                                        </div>

                                    )
                                    : (

                                        selectedBlock ===
                                            "B Block"
                                            ? (

                                                // ==================================
                                                // B BLOCK / B1 - EKASH
                                                // ==================================

                                                <div className="mx-auto w-[520px] min-w-[520px]">

                                                    {/* Even Row */}

                                                    <div className="grid grid-cols-2 gap-6">

                                                        {
                                                            filteredFlats
                                                                .filter(
                                                                    (
                                                                        property
                                                                    ) => {

                                                                        const value =
                                                                            getUnitNumericValue(
                                                                                property
                                                                            );

                                                                        return (
                                                                            value !==
                                                                            null &&
                                                                            value %
                                                                            2 ===
                                                                            0
                                                                        );
                                                                    }
                                                                )
                                                                .sort(
                                                                    (
                                                                        a,
                                                                        b
                                                                    ) =>
                                                                        (
                                                                            getUnitNumericValue(
                                                                                a
                                                                            ) ??
                                                                            0
                                                                        ) -
                                                                        (
                                                                            getUnitNumericValue(
                                                                                b
                                                                            ) ??
                                                                            0
                                                                        )
                                                                )
                                                                .map(
                                                                    (
                                                                        property
                                                                    ) => (

                                                                        <FlatCard
                                                                            key={
                                                                                property.id
                                                                            }
                                                                            property={
                                                                                property
                                                                            }
                                                                            onClick={() =>
                                                                                openFlat(
                                                                                    property
                                                                                )
                                                                            }
                                                                            className="h-[130px] w-full"
                                                                        />

                                                                    )
                                                                )
                                                        }

                                                    </div>

                                                    {/* COMMON AREA */}

                                                    <div className="my-6 flex items-center gap-4">

                                                        <div className="h-px flex-1 bg-gray-300" />

                                                        <div
                                                            className="
                                                                rounded-full
                                                                border
                                                                border-gray-300
                                                                bg-white
                                                                px-5
                                                                py-1.5
                                                                text-xs
                                                                font-bold
                                                                tracking-[0.18em]
                                                                text-gray-500
                                                                shadow-sm
                                                            "
                                                        >
                                                            COMMON AREA
                                                        </div>

                                                        <div className="h-px flex-1 bg-gray-300" />

                                                    </div>

                                                    {/* Odd Row */}

                                                    <div className="grid grid-cols-2 gap-6">

                                                        {
                                                            filteredFlats
                                                                .filter(
                                                                    (
                                                                        property
                                                                    ) => {

                                                                        const value =
                                                                            getUnitNumericValue(
                                                                                property
                                                                            );

                                                                        return (
                                                                            value !==
                                                                            null &&
                                                                            value %
                                                                            2 ===
                                                                            1
                                                                        );
                                                                    }
                                                                )
                                                                .sort(
                                                                    (
                                                                        a,
                                                                        b
                                                                    ) =>
                                                                        (
                                                                            getUnitNumericValue(
                                                                                a
                                                                            ) ??
                                                                            0
                                                                        ) -
                                                                        (
                                                                            getUnitNumericValue(
                                                                                b
                                                                            ) ??
                                                                            0
                                                                        )
                                                                )
                                                                .map(
                                                                    (
                                                                        property
                                                                    ) => (

                                                                        <FlatCard
                                                                            key={
                                                                                property.id
                                                                            }
                                                                            property={
                                                                                property
                                                                            }
                                                                            onClick={() =>
                                                                                openFlat(
                                                                                    property
                                                                                )
                                                                            }
                                                                            className="h-[130px] w-full"
                                                                        />

                                                                    )
                                                                )
                                                        }

                                                    </div>

                                                </div>

                                            )
                                            : (

                                                // ==================================
                                                // C1 TOWER - ISHAN
                                                // ==================================

                                                <div className="mx-auto w-[1180px] min-w-[1180px]">

                                                    {/* Even Row */}

                                                    <div className="grid grid-cols-7 gap-4">

                                                        {
                                                            [
                                                                2,
                                                                4,
                                                                6,
                                                            ].map(
                                                                renderC1Flat
                                                            )
                                                        }

                                                        {/* STAIRS */}

                                                        <div
                                                            className="
                                                                flex
                                                                h-[130px]
                                                                items-center
                                                                justify-center
                                                                rounded-xl
                                                                border-2
                                                                border-dashed
                                                                border-slate-300
                                                                bg-slate-100
                                                            "
                                                        >

                                                            <div className="text-center">

                                                                <p className="text-sm font-bold tracking-wide text-slate-700">
                                                                    STAIRS
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    Common Area
                                                                </p>

                                                            </div>

                                                        </div>

                                                        {
                                                            [
                                                                8,
                                                                10,
                                                                12,
                                                            ].map(
                                                                renderC1Flat
                                                            )
                                                        }

                                                    </div>

                                                    {/* COMMON PASSAGE */}

                                                    <div className="my-5 flex items-center gap-4">

                                                        <div className="h-px flex-1 bg-gray-300" />

                                                        <div
                                                            className="
                                                                rounded-full
                                                                border
                                                                border-gray-300
                                                                bg-white
                                                                px-6
                                                                py-1.5
                                                                text-xs
                                                                font-bold
                                                                tracking-[0.18em]
                                                                text-gray-500
                                                                shadow-sm
                                                            "
                                                        >
                                                            COMMON PASSAGE
                                                        </div>

                                                        <div className="h-px flex-1 bg-gray-300" />

                                                    </div>

                                                    {/* Odd Row */}

                                                    <div className="grid grid-cols-7 gap-4">

                                                        {
                                                            [
                                                                1,
                                                                3,
                                                                5,
                                                            ].map(
                                                                renderC1Flat
                                                            )
                                                        }

                                                        {/* LIFT */}

                                                        <div
                                                            className="
                                                                flex
                                                                h-[130px]
                                                                items-center
                                                                justify-center
                                                                rounded-xl
                                                                border-2
                                                                border-dashed
                                                                border-blue-300
                                                                bg-blue-50
                                                            "
                                                        >

                                                            <div className="text-center">

                                                                <p className="text-sm font-bold tracking-wide text-blue-700">
                                                                    LIFT
                                                                </p>

                                                                <p className="mt-1 text-xs text-blue-500">
                                                                    Common Area
                                                                </p>

                                                            </div>

                                                        </div>

                                                        {
                                                            [
                                                                7,
                                                                9,
                                                                11,
                                                            ].map(
                                                                renderC1Flat
                                                            )
                                                        }

                                                    </div>

                                                </div>

                                            )
                                    )
                            }

                        </div>

                    )
                }

                {/* ==================================================
                    Legend
                ================================================== */}

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

            {/* ==================================================
                Modal
            ================================================== */}

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