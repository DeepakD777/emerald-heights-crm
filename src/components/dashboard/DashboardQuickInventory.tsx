import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Building2,
    Store,
} from "lucide-react";

import FlatModal from "./FlatModal";
import ShopModal from "./ShopModal";
import BookingModal from "./BookingModal";

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

type InventoryType =
    | "residential"
    | "commercial";

type ResidentialBlock =
    | "A Block"
    | "B Block"
    | "C1 Tower";

type ResidentialSection =
    | "B"
    | "B1";

type CommercialSection =
    | "Commercial"
    | "Commercial 1";

type CommercialFloor =
    | "Ground Floor"
    | "1st Floor"
    | "2nd Floor"
    | "3rd Floor";

type DashboardQuickInventoryProps = {
    onInventoryChanged?: () =>
        void | Promise<void>;
};

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

const COMMERCIAL_FLOORS:
    CommercialFloor[] = [
        "Ground Floor",
        "1st Floor",
        "2nd Floor",
        "3rd Floor",
    ];

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

function naturalSort(
    a: Property,
    b: Property
) {
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
}

function getVisualStatus(
    property: Property
) {
    if (
        property.isFineDine
    ) {
        return "finedine";
    }

    return String(
        property.status
    ).toLowerCase();
}

function getUnitColor(
    property: Property
) {
    const status =
        getVisualStatus(
            property
        );

    switch (status) {
        case "booked":
            return `
                border-red-400
                bg-red-50
                text-red-700
                hover:bg-red-100
            `;

        case "hold":
            return `
                border-yellow-400
                bg-yellow-50
                text-yellow-700
                hover:bg-yellow-100
            `;

        case "sold":
            return `
                border-gray-500
                bg-gray-100
                text-gray-700
                hover:bg-gray-200
            `;

        case "finedine":
            return `
                border-purple-500
                bg-purple-50
                text-purple-700
                hover:bg-purple-100
            `;

        default:
            return `
                border-green-400
                bg-green-50
                text-green-700
                hover:bg-green-100
            `;
    }
}

function getStatusLabel(
    property: Property
) {
    if (
        property.isFineDine
    ) {
        return "FINE DINE";
    }

    switch (
    String(
        property.status
    ).toUpperCase()
    ) {
        case "BOOKED":
            return "BOOKED";

        case "HOLD":
            return "HOLD";

        case "SOLD":
            return "SOLD";

        default:
            return "AVAILABLE";
    }
}

function DashboardQuickInventory({
    onInventoryChanged,
}: DashboardQuickInventoryProps) {

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

    const [
        inventoryType,
        setInventoryType,
    ] = useState<InventoryType>(
        "residential"
    );

    const [
        residentialBlock,
        setResidentialBlock,
    ] = useState<ResidentialBlock>(
        "A Block"
    );

    const [
        residentialSection,
        setResidentialSection,
    ] = useState<ResidentialSection>(
        "B"
    );

    const [
        residentialFloor,
        setResidentialFloor,
    ] = useState(1);

    const [
        commercialSection,
        setCommercialSection,
    ] = useState<CommercialSection>(
        "Commercial"
    );

    const [
        commercialFloor,
        setCommercialFloor,
    ] = useState<CommercialFloor>(
        "Ground Floor"
    );

    const [
        selectedProperty,
        setSelectedProperty,
    ] = useState<Property | null>(
        null
    );

    const [
        selectedFlat,
        setSelectedFlat,
    ] = useState<any>(
        null
    );

    const [
        selectedShop,
        setSelectedShop,
    ] = useState<any>(
        null
    );

    const [
        flatModalOpen,
        setFlatModalOpen,
    ] = useState(false);

    const [
        shopModalOpen,
        setShopModalOpen,
    ] = useState(false);

    const [
        commercialBookingOpen,
        setCommercialBookingOpen,
    ] = useState(false);

    const loadInventory =
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
                    await getProperties();

                setProperties(
                    response.data
                );

            } catch (err) {

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load inventory"
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

        void loadInventory(
            true
        );

    }, []);

    useAutoRefresh(
        loadInventory,
        5000
    );

    const refreshEverything =
        async () => {

            await loadInventory();

            if (
                onInventoryChanged
            ) {
                await onInventoryChanged();
            }
        };

    const residentialBlockCounts =
        useMemo(() => {

            return {
                "A Block":
                    properties.filter(
                        (property) =>
                            property.type ===
                            "RESIDENTIAL" &&
                            property.block ===
                            "A Block"
                    ).length,

                "B Block":
                    properties.filter(
                        (property) =>
                            property.type ===
                            "RESIDENTIAL" &&
                            property.block ===
                            "B Block"
                    ).length,

                "C1 Tower":
                    properties.filter(
                        (property) =>
                            property.type ===
                            "RESIDENTIAL" &&
                            property.block ===
                            "C1 Tower"
                    ).length,
            };

        }, [
            properties,
        ]);

    const bCount =
        properties.filter(
            (property) =>
                property.type ===
                "RESIDENTIAL" &&
                property.block ===
                "B Block" &&
                property.phase ===
                "Phase 1"
        ).length;

    const b1Count =
        properties.filter(
            (property) =>
                property.type ===
                "RESIDENTIAL" &&
                property.block ===
                "B Block" &&
                property.phase ===
                "Phase 2"
        ).length;

    const selectedBPhase =
        residentialSection ===
            "B"
            ? "Phase 1"
            : "Phase 2";

    const residentialFloors =
        useMemo(() => {

            const values =
                properties
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
                                residentialBlock
                            ) {
                                return false;
                            }

                            if (
                                residentialBlock ===
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
                    );

            return Array.from(
                new Set(values)
            ).sort(
                (a, b) =>
                    a - b
            );

        }, [
            properties,
            residentialBlock,
            selectedBPhase,
        ]);

    const residentialProperties =
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
                            residentialBlock
                        ) {
                            return false;
                        }

                        if (
                            Number(
                                property.floor
                            ) !==
                            residentialFloor
                        ) {
                            return false;
                        }

                        if (
                            residentialBlock ===
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
            residentialBlock,
            residentialFloor,
            selectedBPhase,
        ]);

    const selectedCommercialPhase =
        commercialSection ===
            "Commercial"
            ? "Phase 1"
            : "Phase 2";

    const commercialCount =
        properties.filter(
            (property) =>
                property.type ===
                "COMMERCIAL" &&
                property.phase ===
                "Phase 1"
        ).length;

    const commercial1Count =
        properties.filter(
            (property) =>
                property.type ===
                "COMMERCIAL" &&
                property.phase ===
                "Phase 2"
        ).length;

    const commercialProperties =
        useMemo(() => {

            return properties
                .filter(
                    (property) =>
                        property.type ===
                        "COMMERCIAL" &&
                        property.phase ===
                        selectedCommercialPhase &&
                        property.floor ===
                        commercialFloor
                )
                .sort(
                    naturalSort
                );

        }, [
            properties,
            selectedCommercialPhase,
            commercialFloor,
        ]);

    const getCommercialFloorCount = (
        floor: CommercialFloor
    ) => {

        return properties.filter(
            (property) =>
                property.type ===
                "COMMERCIAL" &&
                property.phase ===
                selectedCommercialPhase &&
                property.floor ===
                floor
        ).length;
    };

    const displayedProperties =
        inventoryType ===
            "residential"
            ? residentialProperties
            : commercialProperties;

    const zigZagRows =
        useMemo(() => {

            return chunkArray(
                displayedProperties,
                4
            );

        }, [
            displayedProperties,
        ]);

    const selectedBlockData =
        RESIDENTIAL_BLOCKS.find(
            (item) =>
                item.value ===
                residentialBlock
        );

    const residentialHeading =
        residentialBlock ===
            "B Block"
            ? `${selectedBlockData?.label} - ${residentialSection} - Floor ${residentialFloor}`
            : `${selectedBlockData?.label} - Floor ${residentialFloor}`;

    const commercialHeading =
        `${commercialSection} - ${commercialFloor}`;

    const mapResidentialFlat = (
        property: Property
    ) => ({
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
            String(
                property.status
            ).toLowerCase(),

        isFineDine:
            property.isFineDine,
    });

    const mapCommercialShop = (
        property: Property
    ) => ({
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

        floor:
            property.floor,

        phase:
            property.phase ===
                "Phase 1"
                ? 1
                : 2,

        phaseName:
            property.phase,

        tower:
            property.tower,

        series:
            property.series,

        area:
            property.area
                ? `${property.area} sqft`
                : "Area not set",

        price:
            property.price,

        status:
            String(
                property.status
            ).toLowerCase(),

        isFineDine:
            property.isFineDine,

        type:
            "Commercial",
    });

    const handleUnitClick = (
        property: Property
    ) => {

        setSelectedProperty(
            property
        );

        if (
            property.type ===
            "RESIDENTIAL"
        ) {

            setSelectedFlat(
                mapResidentialFlat(
                    property
                )
            );

            setFlatModalOpen(
                true
            );

            return;
        }

        setSelectedShop(
            mapCommercialShop(
                property
            )
        );

        setShopModalOpen(
            true
        );
    };

    const handleResidentialSave =
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

                await refreshEverything();

                setFlatModalOpen(
                    false
                );

                setSelectedFlat(
                    null
                );

                setSelectedProperty(
                    null
                );

            } catch (err) {

                alert(
                    err instanceof Error
                        ? err.message
                        : "Failed to update flat"
                );
            }
        };

    const handleResidentialBooking =
        async (
            bookingData: any
        ) => {

            if (
                !selectedProperty
            ) {
                return;
            }

            try {

                await createBooking({
                    propertyId:
                        selectedProperty.id,

                    customerName:
                        bookingData.customerName,

                    mobile:
                        bookingData.mobile,

                    email:
                        bookingData.email,

                    address:
                        bookingData.address,

                    aadhar:
                        bookingData.aadhar,

                    pan:
                        bookingData.pan,

                    bookingAmount:
                        bookingData.bookingAmount,

                    paymentMode:
                        bookingData.paymentMode,

                    bookingDate:
                        bookingData.bookingDate,

                    remarks:
                        bookingData.remarks,

                    employeeId:
                        bookingData.employeeId ??
                        undefined,

                    status:
                        bookingData.status ??
                        "CONFIRMED",
                });

                await refreshEverything();

                setFlatModalOpen(
                    false
                );

                setSelectedFlat(
                    null
                );

                setSelectedProperty(
                    null
                );

            } catch (err) {

                alert(
                    err instanceof Error
                        ? err.message
                        : "Booking failed"
                );

                throw err;
            }
        };

    const handleCommercialStatusChange =
        async (
            shopId:
                string | number,
            newStatus: string
        ) => {

            try {

                const property =
                    properties.find(
                        (item) =>
                            item.id ===
                            String(
                                shopId
                            )
                    );

                if (
                    !property
                ) {
                    return;
                }

                const normalized =
                    String(
                        newStatus
                    ).toLowerCase();

                if (
                    normalized ===
                    "finedine"
                ) {

                    await updateProperty(
                        property.id,
                        {
                            isFineDine:
                                true,
                        }
                    );

                } else {

                    await updateProperty(
                        property.id,
                        {
                            status:
                                normalized
                                    .toUpperCase() as
                                PropertyStatus,

                            isFineDine:
                                false,
                        }
                    );
                }

                await refreshEverything();

                setShopModalOpen(
                    false
                );

                setSelectedShop(
                    null
                );

                setSelectedProperty(
                    null
                );

            } catch (err) {

                alert(
                    err instanceof Error
                        ? err.message
                        : "Failed to update shop"
                );
            }
        };

    const handleCommercialBook = (
        shop: any
    ) => {

        if (
            !selectedProperty
        ) {
            return;
        }

        if (
            selectedProperty.isFineDine
        ) {

            alert(
                "This shop is reserved for Fine Dine and cannot be booked."
            );

            return;
        }

        if (
            selectedProperty.status !==
            "AVAILABLE"
        ) {
            return;
        }

        setSelectedShop(
            shop
        );

        setShopModalOpen(
            false
        );

        setCommercialBookingOpen(
            true
        );
    };

    const handleCommercialBooking =
        async (
            bookingData: any
        ) => {

            if (
                !selectedProperty
            ) {
                return;
            }

            try {

                await createBooking({
                    propertyId:
                        selectedProperty.id,

                    customerName:
                        bookingData.customerName,

                    mobile:
                        bookingData.mobile,

                    email:
                        bookingData.email,

                    address:
                        bookingData.address,

                    aadhar:
                        bookingData.aadhar,

                    pan:
                        bookingData.pan,

                    bookingAmount:
                        bookingData.bookingAmount,

                    paymentMode:
                        bookingData.paymentMode,

                    bookingDate:
                        bookingData.bookingDate,

                    remarks:
                        bookingData.remarks,

                    employeeId:
                        bookingData.employeeId ??
                        undefined,

                    status:
                        bookingData.status ??
                        "CONFIRMED",
                });

                await refreshEverything();

                setCommercialBookingOpen(
                    false
                );

                setSelectedShop(
                    null
                );

                setSelectedProperty(
                    null
                );

            } catch (err) {

                alert(
                    err instanceof Error
                        ? err.message
                        : "Booking failed"
                );
            }
        };

    if (
        loading
    ) {

        return (
            <div className="rounded-2xl bg-white p-6 shadow">

                <h2 className="text-xl font-bold text-gray-800">
                    Quick Inventory
                </h2>

                <p className="mt-4 text-gray-500">
                    Loading inventory...
                </p>

            </div>
        );
    }

    if (
        error
    ) {

        return (
            <div className="rounded-2xl bg-white p-6 shadow">

                <h2 className="text-xl font-bold text-gray-800">
                    Quick Inventory
                </h2>

                <p className="mt-4 font-medium text-red-600">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => {

                        void loadInventory(
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

    return (
        <>

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6">

                    <h2 className="text-xl font-bold text-gray-800">
                        Quick Inventory
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View, manage and book units directly from dashboard
                    </p>

                </div>

                <div className="mb-6 flex flex-wrap gap-3">

                    <button
                        type="button"
                        onClick={() =>
                            setInventoryType(
                                "residential"
                            )
                        }
                        className={`
                            flex items-center gap-2
                            rounded-xl border
                            px-5 py-3
                            font-semibold
                            transition

                            ${inventoryType ===
                                "residential"
                                ? `
                                        border-green-600
                                        bg-green-600
                                        text-white
                                      `
                                : `
                                        border-gray-300
                                        bg-white
                                        text-gray-700
                                        hover:bg-green-50
                                      `
                            }
                        `}
                    >

                        <Building2
                            size={18}
                        />

                        Residential

                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setInventoryType(
                                "commercial"
                            )
                        }
                        className={`
                            flex items-center gap-2
                            rounded-xl border
                            px-5 py-3
                            font-semibold
                            transition

                            ${inventoryType ===
                                "commercial"
                                ? `
                                        border-blue-600
                                        bg-blue-600
                                        text-white
                                      `
                                : `
                                        border-gray-300
                                        bg-white
                                        text-gray-700
                                        hover:bg-blue-50
                                      `
                            }
                        `}
                    >

                        <Store
                            size={18}
                        />

                        Commercial

                    </button>

                </div>

                {inventoryType ===
                    "residential" && (

                        <>

                            <div className="mb-5">

                                <p className="mb-2 text-sm font-medium text-gray-600">
                                    Select Block / Tower
                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {RESIDENTIAL_BLOCKS.map(
                                        (item) => (

                                            <button
                                                key={
                                                    item.value
                                                }
                                                type="button"
                                                onClick={() => {

                                                    setResidentialBlock(
                                                        item.value
                                                    );

                                                    setResidentialFloor(
                                                        1
                                                    );

                                                    if (
                                                        item.value ===
                                                        "B Block"
                                                    ) {

                                                        setResidentialSection(
                                                            "B"
                                                        );
                                                    }
                                                }}
                                                className={`
                                                    rounded-lg
                                                    border
                                                    px-4 py-2
                                                    text-sm
                                                    font-semibold
                                                    transition

                                                    ${residentialBlock ===
                                                        item.value
                                                        ? `
                                                                border-green-600
                                                                bg-green-600
                                                                text-white
                                                              `
                                                        : `
                                                                border-gray-300
                                                                bg-white
                                                                text-gray-700
                                                                hover:bg-green-50
                                                              `
                                                    }
                                                `}
                                            >

                                                {item.label}

                                                <span className="ml-2 text-xs opacity-80">

                                                    {
                                                        residentialBlockCounts[
                                                        item.value
                                                        ]
                                                    }

                                                </span>

                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                            {residentialBlock ===
                                "B Block" && (

                                    <div className="mb-5">

                                        <p className="mb-2 text-sm font-medium text-gray-600">
                                            Select Section
                                        </p>

                                        <div className="flex flex-wrap gap-2">

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setResidentialSection(
                                                        "B"
                                                    );

                                                    setResidentialFloor(
                                                        1
                                                    );

                                                }}
                                                className={`
                                                    rounded-lg
                                                    border
                                                    px-5 py-2
                                                    text-sm
                                                    font-semibold

                                                    ${residentialSection ===
                                                        "B"
                                                        ? `
                                                                border-green-600
                                                                bg-green-600
                                                                text-white
                                                              `
                                                        : `
                                                                border-gray-300
                                                                bg-white
                                                                text-gray-700
                                                              `
                                                    }
                                                `}
                                            >

                                                B · {bCount}

                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    setResidentialSection(
                                                        "B1"
                                                    );

                                                    setResidentialFloor(
                                                        1
                                                    );

                                                }}
                                                className={`
                                                    rounded-lg
                                                    border
                                                    px-5 py-2
                                                    text-sm
                                                    font-semibold

                                                    ${residentialSection ===
                                                        "B1"
                                                        ? `
                                                                border-green-600
                                                                bg-green-600
                                                                text-white
                                                              `
                                                        : `
                                                                border-gray-300
                                                                bg-white
                                                                text-gray-700
                                                              `
                                                    }
                                                `}
                                            >

                                                B1 · {b1Count}

                                            </button>

                                        </div>

                                    </div>
                                )}

                            <div className="mb-6">

                                <p className="mb-2 text-sm font-medium text-gray-600">
                                    Select Floor
                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {residentialFloors.map(
                                        (floor) => (

                                            <button
                                                key={
                                                    floor
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setResidentialFloor(
                                                        floor
                                                    )
                                                }
                                                className={`
                                                    rounded-lg
                                                    border
                                                    px-4 py-2
                                                    text-sm
                                                    font-medium

                                                    ${residentialFloor ===
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

                        </>
                    )}

                {inventoryType ===
                    "commercial" && (

                        <>

                            <div className="mb-5">

                                <p className="mb-2 text-sm font-medium text-gray-600">
                                    Select Commercial Section
                                </p>

                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setCommercialSection(
                                                "Commercial"
                                            );

                                            setCommercialFloor(
                                                "Ground Floor"
                                            );

                                        }}
                                        className={`
                                            rounded-lg
                                            border
                                            px-4 py-2
                                            text-sm
                                            font-semibold

                                            ${commercialSection ===
                                                "Commercial"
                                                ? `
                                                        border-green-600
                                                        bg-green-600
                                                        text-white
                                                      `
                                                : `
                                                        border-gray-300
                                                        bg-white
                                                        text-gray-700
                                                      `
                                            }
                                        `}
                                    >

                                        Commercial · {commercialCount}

                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {

                                            setCommercialSection(
                                                "Commercial 1"
                                            );

                                            setCommercialFloor(
                                                "Ground Floor"
                                            );

                                        }}
                                        className={`
                                            rounded-lg
                                            border
                                            px-4 py-2
                                            text-sm
                                            font-semibold

                                            ${commercialSection ===
                                                "Commercial 1"
                                                ? `
                                                        border-green-600
                                                        bg-green-600
                                                        text-white
                                                      `
                                                : `
                                                        border-gray-300
                                                        bg-white
                                                        text-gray-700
                                                      `
                                            }
                                        `}
                                    >

                                        Commercial 1 · {commercial1Count}

                                    </button>

                                </div>

                            </div>

                            <div className="mb-6">

                                <p className="mb-2 text-sm font-medium text-gray-600">
                                    Select Floor
                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {COMMERCIAL_FLOORS.map(
                                        (floor) => (

                                            <button
                                                key={
                                                    floor
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setCommercialFloor(
                                                        floor
                                                    )
                                                }
                                                className={`
                                                    rounded-lg
                                                    border
                                                    px-4 py-2
                                                    text-sm
                                                    font-medium

                                                    ${commercialFloor ===
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
                                                              `
                                                    }
                                                `}
                                            >

                                                {floor}

                                                <span className="ml-2 text-xs opacity-80">

                                                    {
                                                        getCommercialFloorCount(
                                                            floor
                                                        )
                                                    }

                                                </span>

                                            </button>
                                        )
                                    )}

                                </div>

                            </div>

                        </>
                    )}

                <div className="mb-5 border-t pt-5 text-center">

                    <h3 className="text-lg font-bold text-gray-800">

                        {
                            inventoryType ===
                                "residential"
                                ? residentialHeading
                                : commercialHeading
                        }

                    </h3>

                    <p className="mt-1 text-sm text-gray-500">

                        {displayedProperties.length} Units

                    </p>

                </div>

                <div
                    className="
                        max-h-[560px]
                        overflow-auto
                        rounded-2xl
                        border
                        bg-gray-50
                        px-6
                        py-8
                    "
                >

                    {displayedProperties.length ===
                        0 ? (

                        <div className="py-12 text-center text-gray-500">
                            No units found.
                        </div>

                    ) : (

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
                                                            handleUnitClick(
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

                                                                ${getUnitColor(
                                                            property
                                                        )
                                                            }
                                                            `}
                                                    >

                                                        <span className="text-base font-bold">

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

                                                        <span className="mt-2 text-xs font-bold">

                                                            {
                                                                getStatusLabel(
                                                                    property
                                                                )
                                                            }

                                                        </span>

                                                    </button>
                                                );
                                            }
                                        )}

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-6 border-t pt-4 text-sm">

                    <span className="flex items-center gap-2">

                        <span className="h-3 w-3 rounded bg-green-500" />

                        Available

                    </span>

                    <span className="flex items-center gap-2">

                        <span className="h-3 w-3 rounded bg-yellow-400" />

                        Hold

                    </span>

                    <span className="flex items-center gap-2">

                        <span className="h-3 w-3 rounded bg-red-500" />

                        Booked

                    </span>

                    <span className="flex items-center gap-2">

                        <span className="h-3 w-3 rounded bg-gray-500" />

                        Sold

                    </span>

                    {inventoryType ===
                        "commercial" && (

                            <span className="flex items-center gap-2">

                                <span className="h-3 w-3 rounded bg-purple-500" />

                                Fine Dine

                            </span>
                        )}

                </div>

            </div>

            <FlatModal
                isOpen={
                    flatModalOpen
                }
                onClose={() => {

                    setFlatModalOpen(
                        false
                    );

                    setSelectedFlat(
                        null
                    );

                    setSelectedProperty(
                        null
                    );

                }}
                flat={
                    selectedFlat
                }
                onSave={
                    handleResidentialSave
                }
                onBooking={
                    handleResidentialBooking
                }
            />

            <ShopModal
                isOpen={
                    shopModalOpen
                }
                onClose={() => {

                    setShopModalOpen(
                        false
                    );

                    setSelectedShop(
                        null
                    );

                    setSelectedProperty(
                        null
                    );

                }}
                shop={
                    selectedShop
                }
                onBook={
                    handleCommercialBook
                }
                onStatusChange={
                    handleCommercialStatusChange
                }
            />

            <BookingModal
                isOpen={
                    commercialBookingOpen
                }
                onClose={() => {

                    setCommercialBookingOpen(
                        false
                    );

                    setSelectedShop(
                        null
                    );

                    setSelectedProperty(
                        null
                    );

                }}
                onConfirm={
                    handleCommercialBooking
                }
                flat={
                    selectedShop
                        ? {
                            number:
                                selectedShop.number,

                            tower:
                                selectedShop.tower ??
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

        </>
    );
}

export default DashboardQuickInventory;