import { useState } from "react";
import { residentialFlats } from "../../data/floorData";
import FlatModal from "../../components/dashboard/FlatModal";
import { useFlat } from "../../context/FlatContext";
import { useBooking } from "../../context/BookingContext";

function Residential() {
    const { flatStatuses, updateFlatStatus } = useFlat();
    const { addBooking } = useBooking();

    const [selectedTower, setSelectedTower] = useState<
        "all" | "A" | "B" | "C"
    >("all");

    const [selectedFlat, setSelectedFlat] =
        useState<(typeof residentialFlats)[number] | null>(null);

    const [isFlatModalOpen, setIsFlatModalOpen] =
        useState(false);

    // ======================================================
    // Get Actual Flat Status
    // ======================================================

    const getFlatStatus = (flat: (typeof residentialFlats)[number]) => {
        const savedStatus = flatStatuses.find(
            (item) => item.number === flat.number
        );

        return savedStatus?.status ?? flat.status;
    };

    // ======================================================
    // Flats with Saved Status
    // ======================================================

    const flatsWithStatus = residentialFlats.map((flat) => ({
        ...flat,
        status: getFlatStatus(flat),
    }));

    // ======================================================
    // Tower Filter
    // ======================================================

    const filteredFlats =
        selectedTower === "all"
            ? flatsWithStatus
            : flatsWithStatus.filter(
                  (flat) => flat.tower === selectedTower
              );

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
    // Statistics
    // ======================================================

    const totalFlats = flatsWithStatus.length;

    const availableFlats = flatsWithStatus.filter(
        (flat) => flat.status === "available"
    ).length;

    const bookedFlats = flatsWithStatus.filter(
        (flat) => flat.status === "booked"
    ).length;

    const holdFlats = flatsWithStatus.filter(
        (flat) => flat.status === "hold"
    ).length;

    // ======================================================
    // Open Flat Modal
    // ======================================================

    const handleFlatClick = (
        flat: (typeof flatsWithStatus)[number]
    ) => {
        setSelectedFlat(flat);
        setIsFlatModalOpen(true);
    };

    // ======================================================
    // Close Flat Modal
    // ======================================================

    const handleCloseFlatModal = () => {
        setIsFlatModalOpen(false);
        setSelectedFlat(null);
    };

    // ======================================================
    // Save Flat Status
    // ======================================================

    const handleSaveFlat = (
    updatedFlat: (typeof flatsWithStatus)[number]
) => {
    const newStatus = updatedFlat.status as
        | "available"
        | "hold"
        | "booked";

    updateFlatStatus(
        updatedFlat.number,
        newStatus
    );

    setSelectedFlat({
        ...updatedFlat,
        status: newStatus,
    });
};

    // ======================================================
    // Booking
    // ======================================================

    const handleBooking = (bookingData: any) => {
        // Add booking to BookingContext
        addBooking(bookingData);

        // Update flat status
        updateFlatStatus(
            bookingData.flatNumber,
            "booked"
        );
    };

    return (
        <div className="space-y-6">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex items-center justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            Residential
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Residential Flat Inventory
                        </p>

                    </div>

                    <div className="text-right">

                        <p className="text-sm text-gray-500">
                            Total Flats
                        </p>

                        <p className="text-3xl font-bold text-gray-800">
                            {totalFlats}
                        </p>

                    </div>

                </div>

            </div>

            {/* ==================================================
                Statistics
            ================================================== */}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                {/* Total */}

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">
                        Total Flats
                    </p>

                    <p className="mt-2 text-2xl font-bold text-gray-800">
                        {totalFlats}
                    </p>

                </div>

                {/* Available */}

                <div className="rounded-2xl bg-green-50 p-5 shadow">

                    <p className="text-sm text-green-700">
                        Available
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-700">
                        {availableFlats}
                    </p>

                </div>

                {/* Booked */}

                <div className="rounded-2xl bg-red-50 p-5 shadow">

                    <p className="text-sm text-red-700">
                        Booked
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-700">
                        {bookedFlats}
                    </p>

                </div>

                {/* Hold */}

                <div className="rounded-2xl bg-yellow-50 p-5 shadow">

                    <p className="text-sm text-yellow-700">
                        Hold
                    </p>

                    <p className="mt-2 text-2xl font-bold text-yellow-700">
                        {holdFlats}
                    </p>

                </div>

            </div>

            {/* ==================================================
                Tower Filters
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex flex-wrap gap-3">

                    {/* All Towers */}

                    <button
                        onClick={() =>
                            setSelectedTower("all")
                        }
                        className={`rounded-lg px-5 py-2 font-medium transition ${
                            selectedTower === "all"
                                ? "bg-green-600 text-white"
                                : "border bg-white hover:bg-gray-100"
                        }`}
                    >
                        All Towers
                    </button>

                    {/* Towers */}

                    {(["A", "B", "C"] as const).map(
                        (tower) => (

                            <button
                                key={tower}
                                onClick={() =>
                                    setSelectedTower(tower)
                                }
                                className={`rounded-lg px-5 py-2 font-medium transition ${
                                    selectedTower === tower
                                        ? "bg-green-600 text-white"
                                        : "border bg-white hover:bg-gray-100"
                                }`}
                            >
                                {tower} -{" "}
                                {towerName(tower)}
                            </button>

                        )
                    )}

                </div>

            </div>

            {/* ==================================================
                Inventory
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-6">

                    <h2 className="text-xl font-bold text-gray-800">

                        {selectedTower === "all"
                            ? "All Residential Flats"
                            : `${towerName(
                                  selectedTower
                              )} - Tower ${selectedTower}`}

                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        {filteredFlats.length} flats
                    </p>

                </div>

                {/* Flats Grid */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10">

                    {filteredFlats.map((flat) => (

                        <button
                            key={flat.id}
                            type="button"
                            onClick={() =>
                                handleFlatClick(flat)
                            }
                            className={`rounded-lg border p-3 text-center transition hover:scale-105 hover:shadow-md ${getStatusColor(
                                flat.status
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

                            <p className="mt-1 text-xs capitalize">
                                {flat.status}
                            </p>

                        </button>

                    ))}

                </div>

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

            {/* ==================================================
                Flat Details Modal
            ================================================== */}

            <FlatModal
                isOpen={isFlatModalOpen}
                onClose={handleCloseFlatModal}
                flat={selectedFlat}
                onSave={handleSaveFlat}
                onBooking={handleBooking}
            />

        </div>
    );
}

export default Residential;