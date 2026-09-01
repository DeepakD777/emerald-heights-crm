import { useEffect, useMemo, useState } from "react";

import { RotateCcw, Search } from "lucide-react";

import ShopModal from "../../components/dashboard/ShopModal";
import BookingModal from "../../components/dashboard/BookingModal";

import { getProperties, updateProperty } from "../../services/propertyService";

import type { Property, PropertyStatus } from "../../services/propertyService";

import { createBooking } from "../../services/bookingService";

import { useAutoRefresh } from "../../hooks/useAutoRefresh";

// ======================================================
// Types
// ======================================================

type CommercialSection = "Commercial" | "Commercial 1";

type Floor = "Ground Floor" | "1st Floor" | "2nd Floor" | "3rd Floor";

type FloorFilter = "all" | Floor;

type Status = "all" | "available" | "hold" | "booked" | "sold" | "finedine";

// ======================================================
// Constants
// ======================================================

const FLOORS: Floor[] = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"];

// ======================================================
// Helpers
// ======================================================

const getFrontendStatus = (property: Property) => {
    if (property.isFineDine) {
        return "finedine";
    }

    return String(property.status).toLowerCase();
};

const naturalSort = (a: Property, b: Property) => {
    return String(a.unitNumber ?? "").localeCompare(
        String(b.unitNumber ?? ""),
        undefined,
        {
            numeric: true,
            sensitivity: "base",
        },
    );
};

function chunkArray<T>(items: T[], size: number): T[][] {
    const rows: T[][] = [];

    for (let index = 0; index < items.length; index += size) {
        rows.push(items.slice(index, index + size));
    }

    return rows;
}

const getShopColor = (status: string, section: CommercialSection) => {
    // ==================================================
    // COMMERCIAL 1 - Separate Teal Based Palette
    // ==================================================

    if (section === "Commercial 1") {
        if (status === "finedine") {
            return `
                bg-indigo-50
                border-indigo-500
                text-indigo-700
                hover:bg-indigo-100
                hover:border-indigo-600
                dark:bg-indigo-950/60
                dark:border-indigo-700
                dark:text-indigo-300
                dark:hover:bg-indigo-900/70
                dark:hover:border-indigo-600
            `;
        }

        if (status === "booked") {
            return `
                bg-rose-50
                border-rose-500
                text-rose-700
                hover:bg-rose-100
                hover:border-rose-600
                dark:bg-rose-950/60
                dark:border-rose-700
                dark:text-rose-300
                dark:hover:bg-rose-900/70
                dark:hover:border-rose-600
            `;
        }

        if (status === "hold") {
            return `
                bg-orange-50
                border-orange-500
                text-orange-700
                hover:bg-orange-100
                hover:border-orange-600
                dark:bg-orange-950/60
                dark:border-orange-700
                dark:text-orange-300
                dark:hover:bg-orange-900/70
                dark:hover:border-orange-600
            `;
        }

        if (status === "sold") {
            return `
                bg-slate-100
                border-slate-500
                text-slate-700
                hover:bg-slate-200
                hover:border-slate-600
                dark:bg-slate-800
                dark:border-slate-600
                dark:text-slate-200
                dark:hover:bg-slate-700
                dark:hover:border-slate-500
            `;
        }

        return `
            bg-teal-50
            border-teal-500
            text-teal-700
            hover:bg-teal-100
            hover:border-teal-600
            dark:bg-teal-950/60
            dark:border-teal-700
            dark:text-teal-300
            dark:hover:bg-teal-900/70
            dark:hover:border-teal-600
        `;
    }

    // ==================================================
    // COMMERCIAL - Existing Palette
    // ==================================================

    if (status === "finedine") {
        return `
            bg-purple-50
            border-purple-500
            text-purple-700
            hover:bg-purple-100
            hover:border-purple-600
            dark:bg-purple-950/60
            dark:border-purple-700
            dark:text-purple-300
            dark:hover:bg-purple-900/70
            dark:hover:border-purple-600
        `;
    }

    if (status === "booked") {
        return `
            bg-red-50
            border-red-400
            text-red-700
            hover:bg-red-100
            hover:border-red-500
            dark:bg-red-950/60
            dark:border-red-700
            dark:text-red-300
            dark:hover:bg-red-900/70
            dark:hover:border-red-600
        `;
    }

    if (status === "hold") {
        return `
            bg-yellow-50
            border-yellow-400
            text-yellow-700
            hover:bg-yellow-100
            hover:border-yellow-500
            dark:bg-yellow-950/60
            dark:border-yellow-700
            dark:text-yellow-300
            dark:hover:bg-yellow-900/70
            dark:hover:border-yellow-600
        `;
    }

    if (status === "sold") {
        return `
            bg-gray-100
            border-gray-500
            text-gray-700
            hover:bg-gray-200
            dark:bg-gray-800
            dark:border-gray-600
            dark:text-gray-200
            dark:hover:bg-gray-700
        `;
    }

    return `
        bg-green-50
        border-green-400
        text-green-700
        hover:bg-green-100
        hover:border-green-500
        dark:bg-green-950/60
        dark:border-green-700
        dark:text-green-300
        dark:hover:bg-green-900/70
        dark:hover:border-green-600
    `;
};
const getStatusText = (status: string) => {
    if (status === "finedine") {
        return "FINE DINE";
    }

    if (status === "booked") {
        return "BOOKED";
    }

    if (status === "hold") {
        return "HOLD";
    }

    if (status === "sold") {
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

    const [properties, setProperties] = useState<Property[]>([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // ==================================================
    // Navigation
    // ==================================================

    const [selectedSection, setSelectedSection] =
        useState<CommercialSection>("Commercial");

    const [selectedFloor, setSelectedFloor] = useState<FloorFilter>("all");

    // ==================================================
    // Filters
    // ==================================================

    const [selectedStatus, setSelectedStatus] = useState<Status>("all");

    const [search, setSearch] = useState("");

    // ==================================================
    // Selected Shop
    // ==================================================

    const [selectedShop, setSelectedShop] = useState<any>(null);

    // ==================================================
    // Modal States
    // ==================================================

    const [isShopModalOpen, setIsShopModalOpen] = useState(false);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // ==================================================
    // Backend Mapping
    //
    // UI Commercial   -> Phase 1
    // UI Commercial 1 -> Phase 2
    // ==================================================

    const backendPhase = selectedSection === "Commercial" ? "Phase 1" : "Phase 2";

    // ==================================================
    // Load
    // ==================================================

    const loadProperties = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }

            setError("");

            const response = await getProperties({
                type: "COMMERCIAL",
            });

            setProperties(response.data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to load commercial inventory";

            setError(message);
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        void loadProperties(true);
    }, []);

    useAutoRefresh(loadProperties, 5000);

    // ==================================================
    // Current Section Shops
    // ==================================================

    const sectionShops = useMemo(() => {
        return properties
            .filter(
                (property) =>
                    property.type === "COMMERCIAL" && property.phase === backendPhase,
            )
            .sort(naturalSort);
    }, [properties, backendPhase]);

    // ==================================================
    // Section Totals
    // ==================================================

    const commercialTotal = properties.filter(
        (property) =>
            property.type === "COMMERCIAL" && property.phase === "Phase 1",
    ).length;

    const commercial1Total = properties.filter(
        (property) =>
            property.type === "COMMERCIAL" && property.phase === "Phase 2",
    ).length;

    // ==================================================
    // Section Status Counts
    // ==================================================

    const sectionTotal = sectionShops.length;

    const sectionAvailable = sectionShops.filter(
        (property) => getFrontendStatus(property) === "available",
    ).length;

    const sectionBooked = sectionShops.filter(
        (property) => getFrontendStatus(property) === "booked",
    ).length;

    const sectionHold = sectionShops.filter(
        (property) => getFrontendStatus(property) === "hold",
    ).length;

    const sectionSold = sectionShops.filter(
        (property) => getFrontendStatus(property) === "sold",
    ).length;

    const sectionFineDine = sectionShops.filter(
        (property) => getFrontendStatus(property) === "finedine",
    ).length;

    // ==================================================
    // Floor Total
    // ==================================================

    const getFloorTotal = (floor: Floor) => {
        return sectionShops.filter((property) => property.floor === floor).length;
    };

    // ==================================================
    // Filtered Shops
    // ==================================================

    const filteredShops = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return sectionShops.filter((property) => {
            if (selectedFloor !== "all" && property.floor !== selectedFloor) {
                return false;
            }

            const frontendStatus = getFrontendStatus(property);

            if (selectedStatus !== "all" && frontendStatus !== selectedStatus) {
                return false;
            }

            if (
                searchText &&
                !String(property.unitNumber ?? "")
                    .toLowerCase()
                    .includes(searchText)
            ) {
                return false;
            }

            return true;
        });
    }, [sectionShops, selectedFloor, selectedStatus, search]);

    // ==================================================
    // Zig-Zag
    // ==================================================

    const zigZagRows = useMemo(() => {
        return chunkArray(filteredShops, 4);
    }, [filteredShops]);

    // ==================================================
    // Property -> Modal Shape
    // ==================================================

    const mapPropertyToShop = (property: Property) => {
        return {
            id: property.id,

            propertyId: property.id,

            propertyCode: property.propertyCode,

            number: property.unitNumber ?? "",

            unitNumber: property.unitNumber ?? "",

            phase: property.phase === "Phase 1" ? 1 : 2,

            phaseName: property.phase,

            sectionName: property.phase === "Phase 1" ? "Commercial" : "Commercial 1",

            floor: property.floor,

            series: property.series,

            tower: property.tower,

            area: property.area ? `${property.area} sqft` : "Area not set",

            price: property.price,

            status: getFrontendStatus(property),

            isFineDine: property.isFineDine,

            type: "Commercial",
        };
    };

    // ==================================================
    // Open Shop
    // ==================================================

    const handleShopClick = (property: Property) => {
        setSelectedShop(mapPropertyToShop(property));

        setIsShopModalOpen(true);
    };

    // ==================================================
    // Status Change
    // ==================================================

    const handleStatusChange = async (
        shopId: string | number,
        newStatus: string,
    ) => {
        try {
            const id = String(shopId);

            const normalized = String(newStatus).toLowerCase();

            if (normalized === "finedine") {
                await updateProperty(id, {
                    isFineDine: true,
                });
            } else {
                const status = normalized.toUpperCase() as PropertyStatus;

                await updateProperty(id, {
                    status,
                    isFineDine: false,
                });
            }

            await loadProperties();

            setIsShopModalOpen(false);

            setSelectedShop(null);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to update shop";

            alert(message);
        }
    };

    // ==================================================
    // Book Shop
    // ==================================================

    const handleBookShop = (shop: any) => {
        if (
            !shop ||
            shop.status === "booked" ||
            shop.status === "sold" ||
            shop.status === "hold"
        ) {
            return;
        }

        if (shop.isFineDine) {
            alert("This shop is reserved for Fine Dine and cannot be booked.");

            return;
        }

        setSelectedShop(shop);

        setIsShopModalOpen(false);

        setIsBookingModalOpen(true);
    };

    // ==================================================
    // Confirm Booking
    // ==================================================

    const handleConfirmBooking = async (bookingData: any) => {
        if (!selectedShop) {
            return;
        }

        try {
            await createBooking({
                // BookingModal ki saari filled fields
                ...bookingData,

                // Correct selected commercial property
                propertyId: selectedShop.propertyId ?? selectedShop.id,

                // Assigned Sales Member
                employeeId: bookingData.employeeId ?? undefined,

                // New booking default status
                status: bookingData.status ?? "CONFIRMED",
            });

            await loadProperties();

            setIsBookingModalOpen(false);

            setSelectedShop(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Booking failed";

            alert(message);
        }
    };
    // ==================================================
    // Reset
    // ==================================================

    const resetFilters = () => {
        setSelectedFloor("all");

        setSelectedStatus("all");

        setSearch("");
    };

    // ==================================================
    // Change Section
    // ==================================================

    const handleSectionChange = (section: CommercialSection) => {
        setSelectedSection(section);

        resetFilters();
    };

    // ==================================================
    // Heading
    // ==================================================

    const currentHeading =
        selectedFloor === "all"
            ? selectedSection
            : `${selectedSection} - ${selectedFloor}`;

    // ==================================================
    // Loading
    // ==================================================

    if (loading) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow">
                <p className="text-gray-600">Loading commercial inventory...</p>
            </div>
        );
    }

    // ==================================================
    // Error
    // ==================================================

    if (error) {
        return (
            <div className="rounded-2xl bg-white p-8 shadow">
                <p className="font-medium text-red-600">{error}</p>

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
    // Render
    // ==================================================

    return (
        <div className="min-w-0 space-y-4 sm:space-y-5 lg:space-y-6">
            {/* ==========================================
                Header
            ========================================== */}

            <div>
                <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
                    Commercial
                </h1>

                <p className="mt-1 text-sm text-gray-500 sm:text-base">
                    Commercial Shop Inventory
                </p>
            </div>

            {/* ==========================================
                Commercial Section
            ========================================== */}

            <div className="min-w-0 rounded-2xl bg-white p-4 shadow sm:p-5 lg:p-6">
                <h2 className="text-lg font-bold text-gray-800">
                    Select Commercial Section
                </h2>

                <p className="mb-4 mt-1 text-sm text-gray-500">
                    Select Commercial or Commercial 1
                </p>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                    <button
                        type="button"
                        onClick={() => handleSectionChange("Commercial")}
                        className={`
                            w-full
sm:w-auto
                            rounded-xl
                            border
                            px-3
py-2.5
sm:px-6
sm:py-3
                            font-semibold
                            transition-all

                            ${selectedSection === "Commercial"
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
                                        dark:hover:bg-green-950/60
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
                        onClick={() => handleSectionChange("Commercial 1")}
                        className={`
                            w-full
sm:w-auto
                            rounded-xl
                            border
                           px-3
py-2.5
sm:px-6
sm:py-3
                            font-semibold
                            transition-all

                          ${selectedSection === "Commercial 1"
                                ? `
            border-teal-600
            bg-teal-600
            text-white
            shadow-md
      `
                                : `
            border-gray-300
            bg-white
            text-gray-700
            hover:border-teal-500
            hover:bg-teal-50
            dark:hover:bg-teal-950/60
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

            <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-2xl bg-white p-4 shadow sm:p-5">
                    <p className="text-sm text-gray-500">Total Shops</p>

                    <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-800">
                        {sectionTotal}
                    </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-4 dark:bg-green-950/60 sm:p-5">
                    <p className="text-sm text-green-700 dark:text-green-300">Available</p>

                    <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-300 sm:text-3xl">
                        {sectionAvailable}
                    </p>
                </div>

                <div className="rounded-2xl bg-red-50 p-4 dark:bg-red-950/60 sm:p-5">
                    <p className="text-sm text-red-700 dark:text-red-300">Booked</p>

                    <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300 sm:text-3xl">
                        {sectionBooked}
                    </p>
                </div>

                <div className="rounded-2xl bg-yellow-50 p-4 dark:bg-yellow-950/60 sm:p-5">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Hold</p>

                    <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-300 sm:text-3xl">
                        {sectionHold}
                    </p>
                </div>

                <div className="rounded-2xl bg-gray-100 p-4 sm:p-5">
                    <p className="text-sm text-gray-600">Sold</p>

                    <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-700">
                        {sectionSold}
                    </p>
                </div>

                <div className="rounded-2xl bg-purple-50 p-4 dark:bg-purple-950/60 sm:p-5">
                    <p className="text-sm text-purple-700 dark:text-purple-300">Fine Dine</p>

                    <p className="mt-1 text-2xl font-bold text-purple-700 dark:text-purple-300 sm:text-3xl">
                        {sectionFineDine}
                    </p>
                </div>
            </div>

            {/* ==========================================
                Floor Selector
            ========================================== */}

            <div className="min-w-0 rounded-2xl bg-white p-4 shadow sm:p-5 lg:p-6">
                <p className="mb-3 text-sm font-medium text-gray-600">Select Floor</p>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                    <button
                        type="button"
                        onClick={() => setSelectedFloor("all")}
                        className={`
                            w-full
sm:w-auto
                            rounded-lg
                            border
                         px-3
py-2.5
sm:px-5
                            font-medium
                            transition-all

                            ${selectedFloor === "all"
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

                    {FLOORS.map((floor) => (
                        <button
                            key={floor}
                            type="button"
                            onClick={() => setSelectedFloor(floor)}
                            className={`
                                    w-full
    sm:w-auto
    rounded-lg
    border
    px-3
    py-2.5
    sm:px-5
    font-medium
    transition-all

                                    ${selectedFloor === floor
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
                                {getFloorTotal(floor)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ==========================================
                Search / Status
            ========================================== */}

            <div className="min-w-0 rounded-2xl bg-white p-4 shadow sm:p-5">
                <div className="flex min-w-0 flex-col gap-3 sm:gap-4 md:flex-row md:items-end">
                    <div className="min-w-0 flex-1">
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Search Shop
                        </label>

                        <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus-within:border-green-500 dark:border-gray-700 dark:bg-gray-950">
                            <Search size={18} className="text-gray-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search shop number..."
                                className="ml-2 min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-gray-100"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-52">
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Status
                        </label>

                        <select
                            value={selectedStatus}
                            onChange={(event) =>
                                setSelectedStatus(event.target.value as Status)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                        >
                            <option value="all">All Status</option>

                            <option value="available">Available</option>

                            <option value="hold">Hold</option>

                            <option value="booked">Booked</option>

                            <option value="sold">Sold</option>

                            <option value="finedine">Fine Dine</option>
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 md:w-auto"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </div>
            </div>

            {/* ==========================================
                Shop Map
            ========================================== */}

            <div
                className={`
      min-w-0
rounded-2xl
border
p-4
shadow
sm:p-5
lg:p-6

        ${selectedSection === "Commercial 1"
                        ? `
                    border-teal-200
                    bg-teal-50/40
                    dark:border-teal-900
                    dark:bg-teal-950/20
                  `
                        : `
                    border-transparent
                    bg-white
                  `
                    }
    `}
            >
                <div className="mb-4 text-center sm:mb-5 lg:mb-6">
                    <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
                        {currentHeading}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                        {filteredShops.length} Shops
                    </p>
                </div>

                {filteredShops.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center sm:p-8 lg:p-12">
                        <p className="text-lg font-semibold text-gray-700">
                            No Shops Found
                        </p>

                        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                            Try changing your filters.
                        </p>

                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div
                        className="
    max-h-[520px]
    min-w-0
    overflow-auto
    overscroll-contain
    rounded-xl
    border
    bg-gray-50
    px-3
    py-4

    sm:max-h-[580px]
    sm:rounded-2xl
    sm:px-5
    sm:py-6

    lg:max-h-[650px]
    lg:px-6
    lg:py-8
"
                    >
                        <div
                            className="
        mx-auto
        w-[760px]
        min-w-[760px]
    "
                        >
                            {zigZagRows.map((row, rowIndex) => (
                                <div key={rowIndex}>
                                    {/* ==========================================
                    STRAIGHT SHOP ROW
                ========================================== */}

                                    <div className="grid grid-cols-4 gap-4">
                                        {row.map((property) => {
                                            const status = getFrontendStatus(property);

                                            return (
                                                <button
                                                    key={property.id}
                                                    type="button"
                                                    onClick={() => handleShopClick(property)}
                                                    className={`
                                        flex
                                        h-[110px]
                                        w-full

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
                                        dark:focus:ring-offset-gray-950
${getShopColor(status, selectedSection)}
                                    `}
                                                >
                                                    <span className="text-base font-bold">
                                                        {property.unitNumber}
                                                    </span>

                                                    <span className="mt-2 text-xs">
                                                        {property.area
                                                            ? `${property.area} sqft`
                                                            : "Area not set"}
                                                    </span>

                                                    <span className="mt-2 text-xs font-bold uppercase">
                                                        {getStatusText(status)}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* ==========================================
                    SIMPLE DIVIDER LINE
                ========================================== */}

                                    {rowIndex < zigZagRows.length - 1 && (
                                        <div className="my-5 h-px w-full bg-gray-300" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend */}

                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-gray-200 pt-4 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300 sm:mt-6 sm:gap-6 sm:pt-5 sm:text-sm">
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-4 w-4 rounded ${selectedSection === "Commercial 1" ? "bg-teal-500" : "bg-green-500"
                                }`}
                        />
                        Available
                    </div>

                    <div className="flex items-center gap-2">
                        <div
  className={`h-4 w-4 rounded ${
    selectedSection === "Commercial 1" ? "bg-orange-500" : "bg-yellow-400"
  }`}
/>
                        Hold
                    </div>

                    <div className="flex items-center gap-2">
                       <div
  className={`h-4 w-4 rounded ${
    selectedSection === "Commercial 1" ? "bg-rose-500" : "bg-red-500"
  }`}
/>
                        Booked
                    </div>

                    <div className="flex items-center gap-2">
                     <div
  className={`h-4 w-4 rounded ${
    selectedSection === "Commercial 1" ? "bg-slate-500" : "bg-gray-500"
  }`}
/>
                        Sold
                    </div>

                    <div className="flex items-center gap-2">
                        <div
  className={`h-4 w-4 rounded ${
    selectedSection === "Commercial 1" ? "bg-indigo-500" : "bg-purple-500"
  }`}
/>
                        Fine Dine
                    </div>
                </div>
            </div>

            {/* ==========================================
                Shop Modal
            ========================================== */}

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

            {/* ==========================================
                Booking Modal
            ========================================== */}

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

                            tower: selectedShop.tower ?? selectedSection,

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
