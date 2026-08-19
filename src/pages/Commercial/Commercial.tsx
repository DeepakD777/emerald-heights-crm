import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    RotateCcw,
    Search,
} from "lucide-react";

import ShopModal from "../../components/dashboard/ShopModal";
import BookingModal from "../../components/dashboard/BookingModal";

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

type CommercialSection =
    | "Commercial"
    | "Commercial 1";

type Floor =
    | "Ground Floor"
    | "1st Floor"
    | "2nd Floor"
    | "3rd Floor";

type FloorFilter =
    | "all"
    | Floor;

type Status =
    | "all"
    | "available"
    | "hold"
    | "booked"
    | "sold"
    | "finedine";

// ======================================================
// Constants
// ======================================================

const FLOORS: Floor[] = [
    "Ground Floor",
    "1st Floor",
    "2nd Floor",
    "3rd Floor",
];

// ======================================================
// Helpers
// ======================================================

const getFrontendStatus = (
    property: Property
) => {
    if (
        property.isFineDine
    ) {
        return "finedine";
    }

    return String(
        property.status
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

const getShopColor = (
    status: string
) => {
    if (
        status ===
        "finedine"
    ) {
        return `
            bg-purple-50
            border-purple-500
            text-purple-700
            hover:bg-purple-100
            hover:border-purple-600
        `;
    }

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

    if (
        status ===
        "sold"
    ) {
        return `
            bg-gray-100
            border-gray-500
            text-gray-700
            hover:bg-gray-200
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

const getStatusText = (
    status: string
) => {
    if (
        status ===
        "finedine"
    ) {
        return "FINE DINE";
    }

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

    if (
        status ===
        "sold"
    ) {
        return "SOLD";
    }

    return "AVAILABLE";
};

// ======================================================
// Commercial
// ======================================================

function Commercial() {

    // ==================================================
    // Backend Shops
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
        selectedSection,
        setSelectedSection,
    ] = useState<CommercialSection>(
        "Commercial"
    );

    const [
        selectedFloor,
        setSelectedFloor,
    ] = useState<FloorFilter>(
        "all"
    );

    // ==================================================
    // Filters
    // ==================================================

    const [
        selectedStatus,
        setSelectedStatus,
    ] = useState<Status>(
        "all"
    );

    const [
        search,
        setSearch,
    ] = useState("");

    // ==================================================
    // Selected Shop
    // ==================================================

    const [
        selectedShop,
        setSelectedShop,
    ] = useState<any>(
        null
    );

    // ==================================================
    // Modal States
    // ==================================================

    const [
        isShopModalOpen,
        setIsShopModalOpen,
    ] = useState(false);

    const [
        isBookingModalOpen,
        setIsBookingModalOpen,
    ] = useState(false);

    // ==================================================
    // Backend Mapping
    //
    // UI Commercial   -> Phase 1
    // UI Commercial 1 -> Phase 2
    // ==================================================

    const backendPhase =
        selectedSection ===
            "Commercial"
            ? "Phase 1"
            : "Phase 2";

    // ==================================================
    // Load
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
                }

                setError("");

                const response =
                    await getProperties({
                        type:
                            "COMMERCIAL",
                    });

                setProperties(
                    response.data
                );

            } catch (err) {

                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to load commercial inventory";

                setError(
                    message
                );

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

    useEffect(() => {
        void loadProperties(
            true
        );
    }, []);

    useAutoRefresh(
        loadProperties,
        5000
    );

    // ==================================================
    // Current Section Shops
    // ==================================================

    const sectionShops =
        useMemo(() => {

            return properties
                .filter(
                    (property) =>
                        property.type ===
                        "COMMERCIAL" &&
                        property.phase ===
                        backendPhase
                )
                .sort(
                    naturalSort
                );

        }, [
            properties,
            backendPhase,
        ]);

    // ==================================================
    // Section Totals
    // ==================================================

    const commercialTotal =
        properties.filter(
            (property) =>
                property.type ===
                "COMMERCIAL" &&
                property.phase ===
                "Phase 1"
        ).length;

    const commercial1Total =
        properties.filter(
            (property) =>
                property.type ===
                "COMMERCIAL" &&
                property.phase ===
                "Phase 2"
        ).length;

    // ==================================================
    // Section Status Counts
    // ==================================================

    const sectionTotal =
        sectionShops.length;

    const sectionAvailable =
        sectionShops.filter(
            (property) =>
                getFrontendStatus(
                    property
                ) ===
                "available"
        ).length;

    const sectionBooked =
        sectionShops.filter(
            (property) =>
                getFrontendStatus(
                    property
                ) ===
                "booked"
        ).length;

    const sectionHold =
        sectionShops.filter(
            (property) =>
                getFrontendStatus(
                    property
                ) ===
                "hold"
        ).length;

    const sectionSold =
        sectionShops.filter(
            (property) =>
                getFrontendStatus(
                    property
                ) ===
                "sold"
        ).length;

    const sectionFineDine =
        sectionShops.filter(
            (property) =>
                getFrontendStatus(
                    property
                ) ===
                "finedine"
        ).length;

    // ==================================================
    // Floor Total
    // ==================================================

    const getFloorTotal = (
        floor: Floor
    ) => {
        return sectionShops.filter(
            (property) =>
                property.floor ===
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

            return sectionShops.filter(
                (property) => {

                    if (
                        selectedFloor !==
                        "all" &&
                        property.floor !==
                        selectedFloor
                    ) {
                        return false;
                    }

                    const frontendStatus =
                        getFrontendStatus(
                            property
                        );

                    if (
                        selectedStatus !==
                        "all" &&
                        frontendStatus !==
                        selectedStatus
                    ) {
                        return false;
                    }

                    if (
                        searchText &&
                        !String(
                            property.unitNumber ??
                            ""
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
            sectionShops,
            selectedFloor,
            selectedStatus,
            search,
        ]);

    // ==================================================
    // Zig-Zag
    // ==================================================

    const zigZagRows =
        useMemo(() => {

            return chunkArray(
                filteredShops,
                4
            );

        }, [
            filteredShops,
        ]);

    // ==================================================
    // Property -> Modal Shape
    // ==================================================

    const mapPropertyToShop = (
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

            phase:
                property.phase ===
                    "Phase 1"
                    ? 1
                    : 2,

            phaseName:
                property.phase,

            sectionName:
                property.phase ===
                    "Phase 1"
                    ? "Commercial"
                    : "Commercial 1",

            floor:
                property.floor,

            series:
                property.series,

            tower:
                property.tower,

            area:
                property.area
                    ? `${property.area} sqft`
                    : "Area not set",

            price:
                property.price,

            status:
                getFrontendStatus(
                    property
                ),

            isFineDine:
                property.isFineDine,

            type:
                "Commercial",
        };
    };

    // ==================================================
    // Open Shop
    // ==================================================

    const handleShopClick = (
        property: Property
    ) => {
        setSelectedShop(
            mapPropertyToShop(
                property
            )
        );

        setIsShopModalOpen(
            true
        );
    };

    // ==================================================
    // Status Change
    // ==================================================

    const handleStatusChange =
        async (
            shopId:
                string | number,
            newStatus: string
        ) => {
            try {

                const id =
                    String(
                        shopId
                    );

                const normalized =
                    String(
                        newStatus
                    ).toLowerCase();

                if (
                    normalized ===
                    "finedine"
                ) {
                    await updateProperty(
                        id,
                        {
                            isFineDine:
                                true,
                        }
                    );

                } else {

                    const status =
                        normalized
                            .toUpperCase() as
                        PropertyStatus;

                    await updateProperty(
                        id,
                        {
                            status,
                            isFineDine:
                                false,
                        }
                    );
                }

                await loadProperties();

                setIsShopModalOpen(
                    false
                );

                setSelectedShop(
                    null
                );

            } catch (err) {

                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to update shop";

                alert(
                    message
                );
            }
        };

    // ==================================================
    // Book Shop
    // ==================================================

    const handleBookShop = (
        shop: any
    ) => {
        if (
            !shop ||
            shop.status ===
            "booked" ||
            shop.status ===
            "sold" ||
            shop.status ===
            "hold"
        ) {
            return;
        }

        if (
            shop.isFineDine
        ) {
            alert(
                "This shop is reserved for Fine Dine and cannot be booked."
            );

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

    const handleConfirmBooking =
    async (
        bookingData: any
    ) => {

        if (
            !selectedShop
        ) {
            return;
        }

        try {

            await createBooking({

                // BookingModal ki saari filled fields
                ...bookingData,

                // Correct selected commercial property
                propertyId:
                    selectedShop.propertyId ??
                    selectedShop.id,

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

            setIsBookingModalOpen(
                false
            );

            setSelectedShop(
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
    // Reset
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
    // Change Section
    // ==================================================

    const handleSectionChange = (
        section:
            CommercialSection
    ) => {
        setSelectedSection(
            section
        );

        resetFilters();
    };

    // ==================================================
    // Heading
    // ==================================================

    const currentHeading =
        selectedFloor ===
            "all"
            ? selectedSection
            : `${selectedSection} - ${selectedFloor}`;

    // ==================================================
    // Loading
    // ==================================================

    if (
        loading
    ) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow">

                <p className="text-gray-600">
                    Loading commercial inventory...
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
                    {error}
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
    // Render
    // ==================================================

    return (
        <div className="space-y-6">

            {/* ==========================================
                Header
            ========================================== */}

            <div>

                <h1 className="text-2xl font-bold text-gray-800">
                    Commercial
                </h1>

                <p className="mt-1 text-gray-500">
                    Commercial Shop Inventory
                </p>

            </div>

            {/* ==========================================
                Commercial Section
            ========================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <h2 className="text-lg font-bold text-gray-800">
                    Select Commercial Section
                </h2>

                <p className="mb-4 mt-1 text-sm text-gray-500">
                    Select Commercial or Commercial 1
                </p>

                <div className="flex flex-wrap gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            handleSectionChange(
                                "Commercial"
                            )
                        }
                        className={`
                            rounded-xl
                            border
                            px-6
                            py-3
                            font-semibold
                            transition-all

                            ${selectedSection ===
                                "Commercial"
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
                        Commercial

                        <span className="ml-2 text-xs opacity-80">
                            {commercialTotal} Shops
                        </span>

                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            handleSectionChange(
                                "Commercial 1"
                            )
                        }
                        className={`
                            rounded-xl
                            border
                            px-6
                            py-3
                            font-semibold
                            transition-all

                            ${selectedSection ===
                                "Commercial 1"
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
                        Commercial 1

                        <span className="ml-2 text-xs opacity-80">
                            {commercial1Total} Shops
                        </span>

                    </button>

                </div>

            </div>

            {/* ==========================================
                Summary
            ========================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">
                        Total Shops
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-800">
                        {sectionTotal}
                    </p>

                </div>

                <div className="rounded-2xl bg-green-50 p-5">

                    <p className="text-sm text-green-700">
                        Available
                    </p>

                    <p className="mt-1 text-3xl font-bold text-green-700">
                        {sectionAvailable}
                    </p>

                </div>

                <div className="rounded-2xl bg-red-50 p-5">

                    <p className="text-sm text-red-700">
                        Booked
                    </p>

                    <p className="mt-1 text-3xl font-bold text-red-700">
                        {sectionBooked}
                    </p>

                </div>

                <div className="rounded-2xl bg-yellow-50 p-5">

                    <p className="text-sm text-yellow-700">
                        Hold
                    </p>

                    <p className="mt-1 text-3xl font-bold text-yellow-700">
                        {sectionHold}
                    </p>

                </div>

                <div className="rounded-2xl bg-gray-100 p-5">

                    <p className="text-sm text-gray-600">
                        Sold
                    </p>

                    <p className="mt-1 text-3xl font-bold text-gray-700">
                        {sectionSold}
                    </p>

                </div>

                <div className="rounded-2xl bg-purple-50 p-5">

                    <p className="text-sm text-purple-700">
                        Fine Dine
                    </p>

                    <p className="mt-1 text-3xl font-bold text-purple-700">
                        {sectionFineDine}
                    </p>

                </div>

            </div>

            {/* ==========================================
                Floor Selector
            ========================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <p className="mb-3 text-sm font-medium text-gray-600">
                    Select Floor
                </p>

                <div className="flex flex-wrap gap-3">

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

                            ${selectedFloor ===
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

                    {FLOORS.map(
                        (floor) => (

                            <button
                                key={
                                    floor
                                }
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

                                    ${selectedFloor ===
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

                                {floor}

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

            {/* ==========================================
                Search / Status
            ========================================== */}

            <div className="rounded-2xl bg-white p-5 shadow">

                <div className="flex flex-col gap-4 md:flex-row md:items-end">

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
                                onChange={(
                                    event
                                ) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Search shop number..."
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

                            <option value="finedine">
                                Fine Dine
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
                Shop Map
            ========================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6 text-center">

                    <h2 className="text-xl font-bold text-gray-800">
                        {currentHeading}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {filteredShops.length} Shops
                    </p>

                </div>

                {filteredShops.length ===
                    0 ? (

                    <div className="rounded-xl border border-dashed p-12 text-center">

                        <p className="text-lg font-semibold text-gray-700">
                            No Shops Found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your filters.
                        </p>

                        <button
                            type="button"
                            onClick={
                                resetFilters
                            }
                            className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white"
                        >
                            Reset Filters
                        </button>

                    </div>

                ) : (

                    <div
                        className="
                            max-h-[650px]
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
                                            h-[110px]
                                            w-full
                                        "
                                    >

                                        {row.map(
                                            (
                                                property,
                                                columnIndex
                                            ) => {

                                                const status =
                                                    getFrontendStatus(
                                                        property
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
                                                            handleShopClick(
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
                                                            h-[110px]
                                                            w-[155px]

                                                            flex-col
                                                            items-center
                                                            justify-center

                                                            rounded-xl
                                                            border-2
                                                            p-3
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

                                                            ${getShopColor(
                                                            status
                                                        )}
                                                        `}
                                                    >

                                                        <span className="text-base font-bold">
                                                            {
                                                                property.unitNumber
                                                            }
                                                        </span>

                                                        <span className="mt-2 text-xs">
                                                            {property.area
                                                                ? `${property.area} sqft`
                                                                : "Area not set"}
                                                        </span>

                                                        <span className="mt-2 text-xs font-bold uppercase">
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

                <div className="mt-6 flex flex-wrap justify-center gap-6 border-t pt-5 text-sm">

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

                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-purple-500" />
                        Fine Dine
                    </div>

                </div>

            </div>

            {/* ==========================================
                Shop Modal
            ========================================== */}

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
                    selectedShop
                }
                onBook={
                    handleBookShop
                }
                onStatusChange={
                    handleStatusChange
                }
            />

            {/* ==========================================
                Booking Modal
            ========================================== */}

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
                                selectedShop.tower ??
                                selectedSection,

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