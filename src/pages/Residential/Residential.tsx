import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";

import { residentialFlats } from "../../data/floorData";
import { useFlat } from "../../context/FlatContext";
import { useBooking } from "../../context/BookingContext";

type Tower = "all" | "A" | "B" | "C";
type Status = "all" | "available" | "hold" | "booked";

function Residential() {
    const { flatStatuses } = useFlat();
    const { bookings } = useBooking();

    // ======================================================
    // Filters
    // ======================================================

    const [search, setSearch] = useState("");

    const [selectedTower, setSelectedTower] =
        useState<Tower>("all");

    const [selectedFloor, setSelectedFloor] =
        useState("all");

    const [selectedType, setSelectedType] =
        useState("all");

    const [selectedFacing, setSelectedFacing] =
        useState("all");

    const [selectedStatus, setSelectedStatus] =
        useState<Status>("all");

    // ======================================================
    // Tower Name
    // ======================================================

    const towerName = (tower: string) => {
        switch (tower) {
            case "A":
                return "Amogh";

            case "B":
                return "Ekash";

            case "C":
                return "Ishan";

            default:
                return "";
        }
    };

    // ======================================================
    // Actual Flat Status
    // ======================================================

    const getFlatStatus = (flat: any) => {
        const booking = bookings.find(
            (booking: any) =>
                booking.flatNumber === flat.number
        );

        if (booking) {
            return "booked";
        }

        const savedStatus = flatStatuses.find(
            (item) =>
                item.number === flat.number
        );

        if (savedStatus) {
            return savedStatus.status;
        }

        return flat.status;
    };

    // ======================================================
    // Status Color
    // ======================================================

    const getStatusColor = (status: string) => {
        switch (status) {
            case "booked":
                return "bg-red-100 border-red-400 text-red-700";

            case "hold":
                return "bg-yellow-100 border-yellow-400 text-yellow-700";

            default:
                return "bg-green-100 border-green-400 text-green-700";
        }
    };

    // ======================================================
    // Dynamic Filter Options
    // ======================================================

    const floors = useMemo(() => {
        return Array.from(
            new Set(
                residentialFlats.map(
                    (flat: any) => flat.floor
                )
            )
        ).sort((a, b) => Number(a) - Number(b));
    }, []);

    const unitTypes = useMemo(() => {
        return Array.from(
            new Set(
                residentialFlats.map(
                    (flat: any) => flat.type
                )
            )
        ).filter(Boolean);
    }, []);

    const facings = useMemo(() => {
        return Array.from(
            new Set(
                residentialFlats.map(
                    (flat: any) => flat.facing
                )
            )
        ).filter(Boolean);
    }, []);

    // ======================================================
    // Filter Flats
    // ======================================================

    const filteredFlats = useMemo(() => {
        const searchText =
            search.trim().toLowerCase();

        return residentialFlats.filter(
            (flat: any) => {

                const status =
                    getFlatStatus(flat);

                const matchesSearch =
                    !searchText ||
                    String(flat.number)
                        .toLowerCase()
                        .includes(searchText) ||
                    String(flat.tower)
                        .toLowerCase()
                        .includes(searchText) ||
                    String(flat.floor)
                        .toLowerCase()
                        .includes(searchText) ||
                    String(flat.type || "")
                        .toLowerCase()
                        .includes(searchText) ||
                    String(flat.facing || "")
                        .toLowerCase()
                        .includes(searchText);

                const matchesTower =
                    selectedTower === "all" ||
                    flat.tower === selectedTower;

                const matchesFloor =
                    selectedFloor === "all" ||
                    String(flat.floor) === selectedFloor;

                const matchesType =
                    selectedType === "all" ||
                    flat.type === selectedType;

                const matchesFacing =
                    selectedFacing === "all" ||
                    flat.facing === selectedFacing;

                const matchesStatus =
                    selectedStatus === "all" ||
                    status === selectedStatus;

                return (
                    matchesSearch &&
                    matchesTower &&
                    matchesFloor &&
                    matchesType &&
                    matchesFacing &&
                    matchesStatus
                );
            }
        );
    }, [
        search,
        selectedTower,
        selectedFloor,
        selectedType,
        selectedFacing,
        selectedStatus,
        flatStatuses,
        bookings,
    ]);

    // ======================================================
    // Statistics
    // ======================================================

    const totalFlats =
        filteredFlats.length;

    const availableFlats =
        filteredFlats.filter(
            (flat: any) =>
                getFlatStatus(flat) === "available"
        ).length;

    const bookedFlats =
        filteredFlats.filter(
            (flat: any) =>
                getFlatStatus(flat) === "booked"
        ).length;

    const holdFlats =
        filteredFlats.filter(
            (flat: any) =>
                getFlatStatus(flat) === "hold"
        ).length;

    // ======================================================
    // Reset Filters
    // ======================================================

    const resetFilters = () => {
        setSearch("");
        setSelectedTower("all");
        setSelectedFloor("all");
        setSelectedType("all");
        setSelectedFacing("all");
        setSelectedStatus("all");
    };

    return (
        <div className="space-y-6">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Residential
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Live inventory of all residential flats
                        </p>
                    </div>

                    {/* Search */}

                    <div className="relative w-full lg:w-80">

                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search flat no, tower, floor..."
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 outline-none focus:border-green-500"
                        />

                    </div>

                </div>

            </div>

            {/* ==================================================
                Statistics
            ================================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                <div className="rounded-2xl bg-white p-5 shadow">
                    <p className="text-sm text-gray-500">
                        Total Flats
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-800">
                        {totalFlats}
                    </p>
                </div>

                <div className="rounded-2xl bg-green-50 p-5 shadow">
                    <p className="text-sm text-green-700">
                        Available
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-700">
                        {availableFlats}
                    </p>
                </div>

                <div className="rounded-2xl bg-yellow-50 p-5 shadow">
                    <p className="text-sm text-yellow-700">
                        Hold
                    </p>

                    <p className="mt-2 text-2xl font-bold text-yellow-700">
                        {holdFlats}
                    </p>
                </div>

                <div className="rounded-2xl bg-red-50 p-5 shadow">
                    <p className="text-sm text-red-700">
                        Booked
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-700">
                        {bookedFlats}
                    </p>
                </div>

            </div>

            {/* ==================================================
                Filters
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-4 flex items-center justify-between">

                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            Filters
                        </h2>

                        <p className="text-sm text-gray-500">
                            Filter residential inventory
                        </p>
                    </div>

                    <button
                        onClick={resetFilters}
                        className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>

                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">

                    {/* Tower */}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Tower
                        </label>

                        <select
                            value={selectedTower}
                            onChange={(e) =>
                                setSelectedTower(
                                    e.target.value as Tower
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
                        >
                            <option value="all">
                                All Towers
                            </option>

                            <option value="A">
                                A - Amogh
                            </option>

                            <option value="B">
                                B - Ekash
                            </option>

                            <option value="C">
                                C - Ishan
                            </option>
                        </select>
                    </div>

                    {/* Floor */}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Floor
                        </label>

                        <select
                            value={selectedFloor}
                            onChange={(e) =>
                                setSelectedFloor(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
                        >
                            <option value="all">
                                All Floors
                            </option>

                            {floors.map((floor) => (
                                <option
                                    key={String(floor)}
                                    value={String(floor)}
                                >
                                    Floor {floor}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Unit Type */}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Unit Type
                        </label>

                        <select
                            value={selectedType}
                            onChange={(e) =>
                                setSelectedType(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
                        >
                            <option value="all">
                                All Types
                            </option>

                            {unitTypes.map((type) => (
                                <option
                                    key={String(type)}
                                    value={String(type)}
                                >
                                    {String(type)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Facing */}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-600">
                            Facing
                        </label>

                        <select
                            value={selectedFacing}
                            onChange={(e) =>
                                setSelectedFacing(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-green-500"
                        >
                            <option value="all">
                                All Facing
                            </option>

                            {facings.map((facing) => (
                                <option
                                    key={String(facing)}
                                    value={String(facing)}
                                >
                                    {String(facing)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}

                    <div>
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

                </div>

            </div>

            {/* ==================================================
                Inventory
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6 flex items-center justify-between">

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Residential Flats
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Showing {filteredFlats.length} of{" "}
                            {residentialFlats.length} flats
                        </p>
                    </div>

                </div>

                {filteredFlats.length === 0 ? (

                    <div className="rounded-xl border border-dashed p-12 text-center">

                        <p className="text-lg font-semibold text-gray-700">
                            No Flats Found
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your filters.
                        </p>

                        <button
                            onClick={resetFilters}
                            className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                            Reset Filters
                        </button>

                    </div>

                ) : (

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">

                        {filteredFlats.map((flat: any) => {

                            const status =
                                getFlatStatus(flat);

                            return (

                                <div
                                    key={flat.id}
                                    className={`rounded-lg border p-3 text-center transition hover:scale-105 ${getStatusColor(
                                        status
                                    )}`}
                                >

                                    <p className="font-bold">
                                        {flat.number}
                                    </p>

                                    <p className="mt-1 text-xs">
                                        Floor {flat.floor}
                                    </p>

                                    <p className="mt-1 text-xs">
                                        {flat.area}
                                    </p>

                                    <p className="mt-1 text-xs">
                                        {flat.type}
                                    </p>

                                    <p className="mt-1 text-xs">
                                        {flat.facing}
                                    </p>

                                    <p className="mt-1 text-xs font-semibold capitalize">
                                        {status}
                                    </p>

                                </div>

                            );
                        })}

                    </div>

                )}

            </div>

            {/* ==================================================
                Legend
            ================================================== */}

            <div className="rounded-2xl bg-white p-5 shadow">

                <div className="flex flex-wrap gap-6 text-sm">

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

        </div>
    );
}

export default Residential;