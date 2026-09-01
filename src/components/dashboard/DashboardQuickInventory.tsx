import { useEffect, useMemo, useState } from "react";

import { Building2, Store } from "lucide-react";

import FlatModal from "./FlatModal";
import ShopModal from "./ShopModal";
import BookingModal from "./BookingModal";

import { getProperties, updateProperty } from "../../services/propertyService";

import type { Property, PropertyStatus } from "../../services/propertyService";

import { createBooking } from "../../services/bookingService";

import { useAutoRefresh } from "../../hooks/useAutoRefresh";

// ======================================================
// Types
// ======================================================

type InventoryType = "residential" | "commercial";

type ResidentialBlock = "A Block" | "B Block" | "C1 Tower";

type ResidentialSection = "B" | "B1";

type CommercialSection = "Commercial" | "Commercial 1";

type CommercialFloor = "Ground Floor" | "1st Floor" | "2nd Floor" | "3rd Floor";

type DashboardQuickInventoryProps = {
  onInventoryChanged?: () => void | Promise<void>;
};

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

const COMMERCIAL_FLOORS: CommercialFloor[] = [
  "Ground Floor",
  "1st Floor",
  "2nd Floor",
  "3rd Floor",
];

// ======================================================
// Helpers
// ======================================================

function chunkArray<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

function naturalSort(a: Property, b: Property) {
  return String(a.unitNumber ?? "").localeCompare(
    String(b.unitNumber ?? ""),
    undefined,
    {
      numeric: true,
      sensitivity: "base",
    },
  );
}

function getUnitNumericValue(property: Property) {
  const rawValue = String(property.unitNumber ?? "");

  const match = rawValue.match(/(\d+)$/);

  if (!match) {
    return null;
  }

  const value = Number(match[1]);

  return Number.isFinite(value) ? value : null;
}

function getVisualStatus(property: Property) {
  if (property.isFineDine) {
    return "finedine";
  }

  return String(property.status).toLowerCase();
}

// ======================================================
// Unit Color
// ======================================================

function getUnitColor(property: Property, section?: CommercialSection) {
  const status = getVisualStatus(property);

  // ==================================================
  // COMMERCIAL 1
  // Exact palette from Commercial.tsx
  //
  // Available -> Teal
  // Hold      -> Orange
  // Booked    -> Rose
  // Sold      -> Slate
  // Fine Dine -> Indigo
  // ==================================================

  if (property.type === "COMMERCIAL" && section === "Commercial 1") {
    switch (status) {
      case "finedine":
        return `
                    border-indigo-500
                    bg-indigo-50
                    text-indigo-700
                    hover:bg-indigo-100
                    hover:border-indigo-600
                    dark:bg-indigo-950/60
                    dark:border-indigo-700
                    dark:text-indigo-300
                    dark:hover:bg-indigo-900/70
                    dark:hover:border-indigo-600
                `;

      case "booked":
        return `
                    border-rose-500
                    bg-rose-50
                    text-rose-700
                    hover:bg-rose-100
                    hover:border-rose-600
                    dark:bg-rose-950/60
                    dark:border-rose-700
                    dark:text-rose-300
                    dark:hover:bg-rose-900/70
                    dark:hover:border-rose-600
                `;

      case "hold":
        return `
                    border-orange-500
                    bg-orange-50
                    text-orange-700
                    hover:bg-orange-100
                    hover:border-orange-600
                    dark:bg-orange-950/60
                    dark:border-orange-700
                    dark:text-orange-300
                    dark:hover:bg-orange-900/70
                    dark:hover:border-orange-600
                `;

      case "sold":
        return `
                    border-slate-500
                    bg-slate-100
                    text-slate-700
                    hover:bg-slate-200
                    hover:border-slate-600
                    dark:bg-slate-800
                    dark:border-slate-600
                    dark:text-slate-200
                    dark:hover:bg-slate-700
                    dark:hover:border-slate-500
                `;

      default:
        return `
                    border-teal-500
                    bg-teal-50
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
  }

  // ==================================================
  // Residential + Commercial
  // Existing palette
  // ==================================================

  switch (status) {
    case "booked":
      return `
                border-red-400
                bg-red-50
                text-red-700
                hover:bg-red-100
                dark:bg-red-950/60
                dark:border-red-700
                dark:text-red-300
                dark:hover:bg-red-900/70
            `;

    case "hold":
      return `
                border-yellow-400
                bg-yellow-50
                text-yellow-700
                hover:bg-yellow-100
                dark:bg-yellow-950/60
                dark:border-yellow-700
                dark:text-yellow-300
                dark:hover:bg-yellow-900/70
            `;

    case "sold":
      return `
                border-gray-500
                bg-gray-100
                text-gray-700
                hover:bg-gray-200
                dark:bg-gray-800
                dark:border-gray-600
                dark:text-gray-200
                dark:hover:bg-gray-700
            `;

    case "finedine":
      return `
                border-purple-500
                bg-purple-50
                text-purple-700
                hover:bg-purple-100
                dark:bg-purple-950/60
                dark:border-purple-700
                dark:text-purple-300
                dark:hover:bg-purple-900/70
            `;

    default:
      return `
                border-green-400
                bg-green-50
                text-green-700
                hover:bg-green-100
                dark:bg-green-950/60
                dark:border-green-700
                dark:text-green-300
                dark:hover:bg-green-900/70
            `;
  }
}

function getStatusLabel(property: Property) {
  if (property.isFineDine) {
    return "FINE DINE";
  }

  switch (String(property.status).toUpperCase()) {
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

// ======================================================
// Component
// ======================================================

function DashboardQuickInventory({
  onInventoryChanged,
}: DashboardQuickInventoryProps) {
  // ==================================================
  // Inventory
  // ==================================================

  const [properties, setProperties] = useState<Property[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==================================================
  // Main Type
  // ==================================================

  const [inventoryType, setInventoryType] =
    useState<InventoryType>("residential");

  // ==================================================
  // Residential Navigation
  // ==================================================

  const [residentialBlock, setResidentialBlock] =
    useState<ResidentialBlock>("A Block");

  const [residentialSection, setResidentialSection] =
    useState<ResidentialSection>("B");

  const [residentialFloor, setResidentialFloor] = useState(1);

  // ==================================================
  // Commercial Navigation
  // ==================================================

  const [commercialSection, setCommercialSection] =
    useState<CommercialSection>("Commercial");

  const [commercialFloor, setCommercialFloor] =
    useState<CommercialFloor>("Ground Floor");

  // ==================================================
  // Selected Property
  // ==================================================

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  const [selectedFlat, setSelectedFlat] = useState<any>(null);

  const [selectedShop, setSelectedShop] = useState<any>(null);

  // ==================================================
  // Modals
  // ==================================================

  const [flatModalOpen, setFlatModalOpen] = useState(false);

  const [shopModalOpen, setShopModalOpen] = useState(false);

  const [commercialBookingOpen, setCommercialBookingOpen] = useState(false);

  // ==================================================
  // Load Inventory
  // ==================================================

  const loadInventory = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      setError("");

      const response = await getProperties();

      setProperties(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadInventory(true);
  }, []);

  useAutoRefresh(loadInventory, 5000);

  const refreshEverything = async () => {
    await loadInventory();

    if (onInventoryChanged) {
      await onInventoryChanged();
    }
  };

  // ==================================================
  // Residential Counts
  // ==================================================

  const residentialBlockCounts = useMemo(() => {
    return {
      "A Block": properties.filter(
        (property) =>
          property.type === "RESIDENTIAL" && property.block === "A Block",
      ).length,

      "B Block": properties.filter(
        (property) =>
          property.type === "RESIDENTIAL" && property.block === "B Block",
      ).length,

      "C1 Tower": properties.filter(
        (property) =>
          property.type === "RESIDENTIAL" && property.block === "C1 Tower",
      ).length,
    };
  }, [properties]);

  const bCount = properties.filter(
    (property) =>
      property.type === "RESIDENTIAL" &&
      property.block === "B Block" &&
      property.phase === "Phase 1",
  ).length;

  const b1Count = properties.filter(
    (property) =>
      property.type === "RESIDENTIAL" &&
      property.block === "B Block" &&
      property.phase === "Phase 2",
  ).length;

  const selectedBPhase = residentialSection === "B" ? "Phase 1" : "Phase 2";

  // ==================================================
  // Residential Floors
  // ==================================================

  const residentialFloors = useMemo(() => {
    const values = properties
      .filter((property) => {
        if (property.type !== "RESIDENTIAL") {
          return false;
        }

        if (property.block !== residentialBlock) {
          return false;
        }

        if (residentialBlock === "B Block") {
          return property.phase === selectedBPhase;
        }

        return true;
      })
      .map((property) => Number(property.floor))
      .filter((floor) => Number.isFinite(floor));

    return Array.from(new Set(values)).sort((a, b) => a - b);
  }, [properties, residentialBlock, selectedBPhase]);

  // ==================================================
  // Residential Current Floor
  // ==================================================

  const residentialProperties = useMemo(() => {
    return properties
      .filter((property) => {
        if (property.type !== "RESIDENTIAL") {
          return false;
        }

        if (property.block !== residentialBlock) {
          return false;
        }

        if (Number(property.floor) !== residentialFloor) {
          return false;
        }

        if (residentialBlock === "B Block") {
          return property.phase === selectedBPhase;
        }

        return true;
      })
      .sort(naturalSort);
  }, [properties, residentialBlock, residentialFloor, selectedBPhase]);

  // ==================================================
  // Residential Flat Map
  // ==================================================

  const residentialFlatMap = useMemo(() => {
    const map = new Map<number, Property>();

    residentialProperties.forEach((property) => {
      const value = getUnitNumericValue(property);

      if (value === null) {
        return;
      }

      map.set(value % 100, property);
    });

    return map;
  }, [residentialProperties]);

  // ==================================================
  // Commercial
  // ==================================================

  const selectedCommercialPhase =
    commercialSection === "Commercial" ? "Phase 1" : "Phase 2";

  const commercialCount = properties.filter(
    (property) =>
      property.type === "COMMERCIAL" && property.phase === "Phase 1",
  ).length;

  const commercial1Count = properties.filter(
    (property) =>
      property.type === "COMMERCIAL" && property.phase === "Phase 2",
  ).length;

  const commercialProperties = useMemo(() => {
    return properties
      .filter(
        (property) =>
          property.type === "COMMERCIAL" &&
          property.phase === selectedCommercialPhase &&
          property.floor === commercialFloor,
      )
      .sort(naturalSort);
  }, [properties, selectedCommercialPhase, commercialFloor]);

  const commercialRows = useMemo(() => {
    return chunkArray(commercialProperties, 4);
  }, [commercialProperties]);

  const getCommercialFloorCount = (floor: CommercialFloor) => {
    return properties.filter(
      (property) =>
        property.type === "COMMERCIAL" &&
        property.phase === selectedCommercialPhase &&
        property.floor === floor,
    ).length;
  };

  // ==================================================
  // Heading / Display Count
  // ==================================================

  const displayedProperties =
    inventoryType === "residential"
      ? residentialProperties
      : commercialProperties;

  const selectedBlockData = RESIDENTIAL_BLOCKS.find(
    (item) => item.value === residentialBlock,
  );

  const residentialHeading =
    residentialBlock === "B Block"
      ? `${selectedBlockData?.label} - ${residentialSection} - Floor ${residentialFloor}`
      : `${selectedBlockData?.label} - Floor ${residentialFloor}`;

  const commercialHeading = `${commercialSection} - ${commercialFloor}`;

  // ==================================================
  // Residential Modal Mapping
  // ==================================================

  const mapResidentialFlat = (property: Property) => ({
    id: property.id,

    propertyId: property.id,

    propertyCode: property.propertyCode,

    number: property.unitNumber ?? "",

    unitNumber: property.unitNumber ?? "",

    tower: property.tower ?? "",

    block: property.block ?? "",

    phase: property.phase ?? "",

    floor: Number(property.floor ?? 0),

    area: property.area ? `${property.area} sqft` : "Area not set",

    price: property.price,

    type: "Residential",

    status: String(property.status).toLowerCase(),

    isFineDine: property.isFineDine,
  });

  // ==================================================
  // Commercial Modal Mapping
  // ==================================================

  const mapCommercialShop = (property: Property) => ({
    id: property.id,

    propertyId: property.id,

    propertyCode: property.propertyCode,

    number: property.unitNumber ?? "",

    unitNumber: property.unitNumber ?? "",

    phase: property.phase === "Phase 1" ? 1 : 2,

    phaseName: property.phase,

    // Important:
    // ShopModal can identify Commercial 1 correctly.
    sectionName: property.phase === "Phase 1" ? "Commercial" : "Commercial 1",

    floor: property.floor,

    series: property.series,

    tower: property.tower,

    area: property.area ? `${property.area} sqft` : "Area not set",

    price: property.price,

    status: getVisualStatus(property),

    isFineDine: property.isFineDine,

    type: "Commercial",
  });

  // ==================================================
  // Unit Click
  // ==================================================

  const handleUnitClick = (property: Property) => {
    setSelectedProperty(property);

    if (property.type === "RESIDENTIAL") {
      setSelectedFlat(mapResidentialFlat(property));

      setFlatModalOpen(true);

      return;
    }

    setSelectedShop(mapCommercialShop(property));

    setShopModalOpen(true);
  };

  // ==================================================
  // Residential Save
  // ==================================================

  const handleResidentialSave = async (updatedFlat: any) => {
    try {
      const status = String(updatedFlat.status).toUpperCase() as PropertyStatus;

      await updateProperty(updatedFlat.id, {
        status,
      });

      await refreshEverything();

      setFlatModalOpen(false);

      setSelectedFlat(null);

      setSelectedProperty(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update flat");
    }
  };

  // ==================================================
  // Residential Booking
  // ==================================================

  const handleResidentialBooking = async (bookingData: any) => {
    if (!selectedProperty) {
      return;
    }

    try {
      await createBooking({
        ...bookingData,

        propertyId: selectedProperty.id,

        employeeId: bookingData.employeeId ?? undefined,

        status: bookingData.status ?? "CONFIRMED",
      });

      await refreshEverything();

      setFlatModalOpen(false);

      setSelectedFlat(null);

      setSelectedProperty(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Booking failed");

      throw err;
    }
  };

  // ==================================================
  // Commercial Status Change
  // ==================================================

  const handleCommercialStatusChange = async (
    shopId: string | number,
    newStatus: string,
  ) => {
    try {
      const property = properties.find((item) => item.id === String(shopId));

      if (!property) {
        return;
      }

      const normalized = String(newStatus).toLowerCase();

      if (normalized === "finedine") {
        await updateProperty(property.id, {
          isFineDine: true,
        });
      } else {
        await updateProperty(property.id, {
          status: normalized.toUpperCase() as PropertyStatus,

          isFineDine: false,
        });
      }

      await refreshEverything();

      setShopModalOpen(false);

      setSelectedShop(null);

      setSelectedProperty(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update shop");
    }
  };

  // ==================================================
  // Commercial Book
  // ==================================================

  const handleCommercialBook = (shop: any) => {
    if (!selectedProperty) {
      return;
    }

    if (selectedProperty.isFineDine) {
      alert("This shop is reserved for Fine Dine and cannot be booked.");

      return;
    }

    if (selectedProperty.status !== "AVAILABLE") {
      return;
    }

    setSelectedShop(shop);

    setShopModalOpen(false);

    setCommercialBookingOpen(true);
  };

  // ==================================================
  // Commercial Booking
  // ==================================================

  const handleCommercialBooking = async (bookingData: any) => {
    if (!selectedProperty) {
      return;
    }

    try {
      await createBooking({
        ...bookingData,

        propertyId: selectedProperty.id,

        employeeId: bookingData.employeeId ?? undefined,

        status: bookingData.status ?? "CONFIRMED",
      });

      await refreshEverything();

      setCommercialBookingOpen(false);

      setSelectedShop(null);

      setSelectedProperty(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Booking failed");
    }
  };

  // ==================================================
  // Generic Unit Card
  // ==================================================

  const renderUnitButton = (
    property: Property,
    section?: CommercialSection,
  ) => {
    return (
      <button
        key={property.id}
        type="button"
        onClick={() => handleUnitClick(property)}
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
                    focus:ring-offset-2
                    dark:focus:ring-offset-gray-950

                    ${section === "Commercial 1"
            ? "focus:ring-teal-400"
            : "focus:ring-green-400"
          }

                    ${getUnitColor(property, section)}
                `}
      >
        <span className="text-base font-bold">{property.unitNumber}</span>

        <span className="mt-2 text-xs">
          {property.area ? `${property.area} sqft` : "Area not set"}
        </span>

        <span className="mt-2 text-xs font-bold">
          {getStatusLabel(property)}
        </span>
      </button>
    );
  };

  // ==================================================
  // Residential Fixed Slot
  // ==================================================

  const renderResidentialUnit = (suffix: number) => {
    const property = residentialFlatMap.get(suffix);

    if (!property) {
      return <div key={`residential-empty-${suffix}`} className="h-[110px]" />;
    }

    return renderUnitButton(property);
  };

  // ==================================================
  // Loading
  // ==================================================

  if (loading) {
    return (
      <div className="min-w-0 rounded-2xl bg-white p-4 shadow sm:p-5 lg:p-6">
        <h2 className="text-xl font-bold text-gray-800">Quick Inventory</h2>

        <p className="mt-4 text-gray-500">Loading inventory...</p>
      </div>
    );
  }

  // ==================================================
  // Error
  // ==================================================

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-xl font-bold text-gray-800">Quick Inventory</h2>

        <p className="mt-4 font-medium text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => {
            void loadInventory(true);
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
    <>
      <div className="min-w-0 rounded-2xl bg-white p-4 shadow sm:p-5 lg:p-6">
        {/* ======================================
                    Header
                ====================================== */}
        <div className="mb-4 sm:mb-5 lg:mb-6">
          <h2 className="text-lg font-bold text-gray-800 sm:text-xl">
            Quick Inventory
          </h2>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            View, manage and book units directly from dashboard
          </p>
        </div>

        {/* ======================================
                    Main Inventory Type
                ====================================== */}

        <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:flex sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={() => setInventoryType("residential")}
            className={`
                       flex
items-center
justify-center
gap-2
rounded-xl
border
px-3
py-2.5
text-sm
font-semibold
transition
sm:px-5
sm:py-3
sm:text-base

                            ${inventoryType === "residential"
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
                                        dark:hover:bg-green-950/60
                                      `
              }
                        `}
          >
            <Building2 size={18} />
            Residential
          </button>

          <button
            type="button"
            onClick={() => setInventoryType("commercial")}
            className={`
                        flex
items-center
justify-center
gap-2
rounded-xl
border
px-3
py-2.5
text-sm
font-semibold
transition
sm:px-5
sm:py-3
sm:text-base

                            ${inventoryType === "commercial"
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
                                        dark:hover:bg-blue-950/60
                                      `
              }
                        `}
          >
            <Store size={18} />
            Commercial
          </button>
        </div>

        {/* ======================================
                    Residential Selectors
                ====================================== */}

        {inventoryType === "residential" && (
          <>
            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Select Block / Tower
              </p>

              <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
                {RESIDENTIAL_BLOCKS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      setResidentialBlock(item.value);

                      setResidentialFloor(1);

                      if (item.value === "B Block") {
                        setResidentialSection("B");
                      }
                    }}
                    className={`
                      w-full
sm:w-auto
                                                        rounded-lg
                                                        border
                                                        px-4
                                                        py-2
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
                                                        dark:hover:bg-green-950/60
                                        dark:hover:bg-green-950/60
                                                                  `
                      }
                                                    `}
                  >
                    {item.label}

                    <span className="ml-2 text-xs opacity-80">
                      {residentialBlockCounts[item.value]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {residentialBlock === "B Block" && (
              <div className="mb-5">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Select Section
                </p>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setResidentialSection("B");

                      setResidentialFloor(1);
                    }}
                    className={`
                      w-full
sm:w-auto
                                                    rounded-lg
                                                    border
                                                    px-5
                                                    py-2
                                                    text-sm
                                                    font-semibold

                                                    ${residentialSection === "B"
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
                      setResidentialSection("B1");

                      setResidentialFloor(1);
                    }}
                    className={`
                      w-full
sm:w-auto
                                                    rounded-lg
                                                    border
                                                    px-5
                                                    py-2
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

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {residentialFloors.map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => setResidentialFloor(floor)}
                    className={`
                      w-full
sm:w-auto
                                                        rounded-lg
                                                        border
                                                        px-4
                                                        py-2
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
                ))}
              </div>
            </div>
          </>
        )}

        {/* ======================================
                    Commercial Selectors
                ====================================== */}

        {inventoryType === "commercial" && (
          <>
            <div className="mb-5">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Select Commercial Section
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setCommercialSection("Commercial");

                    setCommercialFloor("Ground Floor");
                  }}
                  className={`
                    w-full
sm:w-auto
                    
                                            rounded-lg
                                            border
                                            px-4
                                            py-2
                                            text-sm
                                            font-semibold
                                            transition-all

                                            ${commercialSection === "Commercial"
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
                                        dark:hover:bg-green-950/60
                                                      `
                    }
                                        `}
                >
                  Commercial · {commercialCount}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCommercialSection("Commercial 1");

                    setCommercialFloor("Ground Floor");
                  }}
                  className={`
                    w-full
sm:w-auto
                                            rounded-lg
                                            border
                                            px-4
                                            py-2
                                            text-sm
                                            font-semibold
                                            transition-all

                                            ${commercialSection ===
                      "Commercial 1"
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
                  Commercial 1 · {commercial1Count}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-600">
                Select Floor
              </p>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {COMMERCIAL_FLOORS.map((floor) => (
                  <button
                    key={floor}
                    type="button"
                    onClick={() => setCommercialFloor(floor)}
                    className={`
                      w-full
sm:w-auto
                                                        rounded-lg
                                                        border
                                                        px-4
                                                        py-2
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
                      {getCommercialFloorCount(floor)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ======================================
                    Current Heading
                ====================================== */}

        <div className="mb-4 border-t pt-4 text-center sm:mb-5 sm:pt-5">
          <h3 className="text-base font-bold text-gray-800 sm:text-lg">
            {inventoryType === "residential"
              ? residentialHeading
              : commercialHeading}
          </h3>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            {displayedProperties.length} Units
          </p>
        </div>

        {/* ======================================
                    Inventory Map
                ====================================== */}

        <div
          className={`
                      max-h-[520px]
overflow-auto
overscroll-contain
rounded-xl
border
px-3
py-4
sm:max-h-[560px]
sm:rounded-2xl
sm:px-5
sm:py-6
lg:px-6
lg:py-8

                        ${inventoryType === "commercial" &&
              commercialSection === "Commercial 1"
              ? `
                                    border-teal-200
                                    bg-teal-50/40
                                    dark:border-teal-900
                                    dark:bg-teal-950/20
                                  `
              : `
                                    border-gray-200
                                    bg-gray-50
                                  `
            }
                    `}
        >
          {displayedProperties.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No units found.
            </div>
          ) : inventoryType === "residential" ? (
            <>
              {/* ==============================
                                        A BLOCK
                                    ============================== */}

              {residentialBlock === "A Block" && (
                <div className="mx-auto w-[1040px] min-w-[1040px]">
                  {/* Even Row */}

                  <div className="grid grid-cols-6 gap-4">
                    {[2, 4, 6].map(renderResidentialUnit)}

                    {/* LIFT */}

                    <div className="flex h-[110px] items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50">
                      <div className="text-center">
                        <p className="text-sm font-bold tracking-wide text-blue-700 dark:text-blue-300">
                          LIFT
                        </p>

                        <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                          Common Area
                        </p>
                      </div>
                    </div>

                    {[8, 10].map(renderResidentialUnit)}
                  </div>

                  {/* Common Area */}

                  <div className="my-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-300" />

                    <div className="rounded-full border border-gray-300 bg-white px-5 py-1.5 text-xs font-bold tracking-[0.18em] text-gray-500 shadow-sm">
                      COMMON AREA
                    </div>

                    <div className="h-px flex-1 bg-gray-300" />
                  </div>

                  {/* Odd Row */}

                  <div className="grid grid-cols-6 gap-4">
                    {[1, 3, 5].map(renderResidentialUnit)}

                    {/* STAIRS */}

                    <div className="flex h-[110px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="text-center">
                        <p className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">
                          STAIRS
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Common Area
                        </p>
                      </div>
                    </div>

                    {[7, 9].map(renderResidentialUnit)}
                  </div>
                </div>
              )}

              {/* ==============================
                                        B / B1
                                    ============================== */}

              {residentialBlock === "B Block" && (
                <div className="mx-auto w-[520px] min-w-[520px]">
                  {/* Even Row */}

                  <div className="grid grid-cols-2 gap-6">
                    {residentialProperties
                      .filter((property) => {
                        const value = getUnitNumericValue(property);

                        return value !== null && value % 2 === 0;
                      })
                      .sort(
                        (a, b) =>
                          (getUnitNumericValue(a) ?? 0) -
                          (getUnitNumericValue(b) ?? 0),
                      )
                      .map((property) => renderUnitButton(property))}
                  </div>

                  {/* Common Area */}

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-300" />

                    <div className="rounded-full border border-gray-300 bg-white px-5 py-1.5 text-xs font-bold tracking-[0.18em] text-gray-500 shadow-sm">
                      COMMON AREA
                    </div>

                    <div className="h-px flex-1 bg-gray-300" />
                  </div>

                  {/* Odd Row */}

                  <div className="grid grid-cols-2 gap-6">
                    {residentialProperties
                      .filter((property) => {
                        const value = getUnitNumericValue(property);

                        return value !== null && value % 2 === 1;
                      })
                      .sort(
                        (a, b) =>
                          (getUnitNumericValue(a) ?? 0) -
                          (getUnitNumericValue(b) ?? 0),
                      )
                      .map((property) => renderUnitButton(property))}
                  </div>
                </div>
              )}

              {/* ==============================
                                        C1 TOWER
                                    ============================== */}

              {residentialBlock === "C1 Tower" && (
                <div className="mx-auto w-[1180px] min-w-[1180px]">
                  {/* Even Row */}

                  <div className="grid grid-cols-7 gap-4">
                    {[2, 4, 6].map(renderResidentialUnit)}

                    {/* LIFT */}

                    <div className="flex h-[110px] items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50">
                      <div className="text-center">
                        <p className="text-sm font-bold tracking-wide text-blue-700 dark:text-blue-300">
                          LIFT
                        </p>

                        <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">
                          Common Area
                        </p>
                      </div>
                    </div>

                    {[8, 10, 12].map(renderResidentialUnit)}
                  </div>

                  {/* Common Passage */}

                  <div className="my-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-gray-300" />

                    <div className="rounded-full border border-gray-300 bg-white px-6 py-1.5 text-xs font-bold tracking-[0.18em] text-gray-500 shadow-sm">
                      COMMON PASSAGE
                    </div>

                    <div className="h-px flex-1 bg-gray-300" />
                  </div>

                  {/* Odd Row */}

                  <div className="grid grid-cols-7 gap-4">
                    {[1, 3, 5].map(renderResidentialUnit)}

                    {/* STAIRS */}

                    <div className="flex h-[110px] items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="text-center">
                        <p className="text-sm font-bold tracking-wide text-slate-700 dark:text-slate-300">
                          STAIRS
                        </p>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Common Area
                        </p>
                      </div>
                    </div>

                    {[7, 9, 11].map(renderResidentialUnit)}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ==============================
                                    COMMERCIAL
                                    Straight Rows
                                    4 Shops Per Row
                                ============================== */

            <div className="mx-auto w-[760px] min-w-[760px]">
              {commercialRows.map((row, rowIndex) => (
                <div key={rowIndex}>
                  <div className="grid grid-cols-4 gap-4">
                    {row.map((property) =>
                      renderUnitButton(property, commercialSection),
                    )}
                  </div>

                  {rowIndex < commercialRows.length - 1 && (
                    <div className="my-5 h-px w-full bg-gray-300" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ======================================
                    Legend
                ====================================== */}

        {inventoryType === "commercial" &&
          commercialSection === "Commercial 1" ? (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-gray-200 pt-4 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300 sm:mt-5 sm:gap-6 sm:text-sm">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-teal-500" />
              Available
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-orange-500" />
              Hold
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-rose-500" />
              Booked
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-slate-500" />
              Sold
            </span>

            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-indigo-500" />
              Fine Dine
            </span>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 border-t border-gray-200 pt-4 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-300 sm:mt-5 sm:gap-6 sm:text-sm">
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

            {inventoryType === "commercial" && (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-purple-500" />
                Fine Dine
              </span>
            )}
          </div>
        )}
      </div>

      {/* ==========================================
                Flat Modal
            ========================================== */}

      <FlatModal
        isOpen={flatModalOpen}
        onClose={() => {
          setFlatModalOpen(false);

          setSelectedFlat(null);

          setSelectedProperty(null);
        }}
        flat={selectedFlat}
        onSave={handleResidentialSave}
        onBooking={handleResidentialBooking}
      />

      {/* ==========================================
                Shop Modal
            ========================================== */}

      <ShopModal
        isOpen={shopModalOpen}
        onClose={() => {
          setShopModalOpen(false);

          setSelectedShop(null);

          setSelectedProperty(null);
        }}
        shop={selectedShop}
        onBook={handleCommercialBook}
        onStatusChange={handleCommercialStatusChange}
      />

      {/* ==========================================
                Commercial Booking Modal
            ========================================== */}

      <BookingModal
        isOpen={commercialBookingOpen}
        onClose={() => {
          setCommercialBookingOpen(false);

          setSelectedShop(null);

          setSelectedProperty(null);
        }}
        onConfirm={handleCommercialBooking}
        flat={
          selectedShop
            ? {
              number: selectedShop.number,

              tower: selectedShop.tower ?? commercialSection,

              floor: selectedShop.floor,

              status: selectedShop.status,
            }
            : null
        }
        mode="create"
      />
    </>
  );
}

export default DashboardQuickInventory;
