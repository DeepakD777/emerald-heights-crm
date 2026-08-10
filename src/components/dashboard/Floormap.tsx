import { useMemo, useState } from "react";

import { useFlat } from "../../context/FlatContext";
import { useBooking } from "../../context/BookingContext";

import { residentialFlats } from "../../data/floorData";

import FlatModal from "./FlatModal";

type Tower = "A" | "B" | "C";

// ======================================================
// Status Color
// ======================================================

function getColor(status: string) {
    switch (status) {
        case "available":
            return "bg-green-100 border-green-400 text-green-700";

        case "booked":
            return "bg-red-100 border-red-400 text-red-700";

        case "hold":
            return "bg-yellow-100 border-yellow-400 text-yellow-700";

        default:
            return "bg-gray-100 border-gray-300 text-gray-700";
    }
}

// ======================================================
// Tower Name
// ======================================================

function getTowerName(tower: Tower) {
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
}

// ======================================================
// Floor Map
// ======================================================

function FloorMap() {

    const [selectedTower, setSelectedTower] =
        useState<Tower>("A");

    const [selectedFloor, setSelectedFloor] =
        useState<number>(1);

    const [selectedFlat, setSelectedFlat] =
        useState<any>(null);

    const [isOpen, setIsOpen] =
        useState(false);

    const {
        addBooking,
        bookings,
    } = useBooking();

    const {
        flatStatuses,
        updateFlatStatus,
    } = useFlat();

    // ==================================================
    // Actual Flat Status
    // ==================================================

    const getFlatStatus = (flat: any) => {

        const booking = bookings.find(
            (booking: any) =>
                booking.flatNumber === flat.number
        );

        if (booking) {
            return "booked";
        }

        const savedStatus =
            flatStatuses.find(
                (item) =>
                    item.number === flat.number
            );

        if (savedStatus) {
            return savedStatus.status;
        }

        return flat.status;
    };

    // ==================================================
    // Selected Floor Flats
    // ==================================================

    const floorFlats = useMemo(() => {

        return residentialFlats.filter(
            (flat) =>
                flat.tower === selectedTower &&
                flat.floor === selectedFloor
        );

    }, [selectedTower, selectedFloor]);

    // ==================================================
    // Floor Statistics
    // ==================================================

    const availableCount =
        floorFlats.filter(
            (flat) =>
                getFlatStatus(flat) === "available"
        ).length;

    const bookedCount =
        floorFlats.filter(
            (flat) =>
                getFlatStatus(flat) === "booked"
        ).length;

    const holdCount =
        floorFlats.filter(
            (flat) =>
                getFlatStatus(flat) === "hold"
        ).length;

    // ==================================================
    // Open Flat
    // ==================================================

    const openFlat = (flat: any) => {

        setSelectedFlat({
            ...flat,
            status: getFlatStatus(flat),
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

        addBooking(bookingData);

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
    // Split Flats Into Two Rows
    // ==================================================

    const firstRow =
        floorFlats.slice(
            0,
            Math.ceil(
                floorFlats.length / 2
            )
        );

    const secondRow =
        floorFlats.slice(
            Math.ceil(
                floorFlats.length / 2
            )
        );

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
                    w-full
                    min-w-[150px]
                    rounded-xl
                    border-2
                    p-3
                    text-center
                    transition-all
                    duration-200
                    hover:-translate-y-1
                    hover:shadow-lg
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
                    {getTowerName(selectedTower)}
                    {" - Tower "}
                    {selectedTower}
                    {" • "}
                    Floor {selectedFloor}
                </p>

            </div>

            {/* ==================================================
                Tower Selector
            ================================================== */}

            <div className="mb-5">

                <p className="mb-2 text-sm font-medium text-gray-600">
                    Select Tower
                </p>

                <div className="flex flex-wrap gap-3">

                    {(
                        ["A", "B", "C"] as Tower[]
                    ).map(
                        (tower) => (

                            <button
                                key={tower}
                                type="button"
                                onClick={() => {

                                    setSelectedTower(
                                        tower
                                    );

                                    setSelectedFloor(
                                        1
                                    );
                                }}
                                className={`
                                    rounded-lg
                                    px-5
                                    py-2
                                    font-medium
                                    transition

                                    ${
                                        selectedTower ===
                                        tower
                                            ? "bg-green-600 text-white"
                                            : "border bg-white text-gray-700 hover:bg-gray-100"
                                    }
                                `}
                            >
                                Tower {tower} -{" "}
                                {getTowerName(tower)}
                            </button>

                        )
                    )}

                </div>

            </div>

            {/* ==================================================
                Floor Selector
            ================================================== */}

            <div className="mb-6">

                <p className="mb-2 text-sm font-medium text-gray-600">
                    Select Floor
                </p>

                <div className="flex flex-wrap gap-2">

                    {Array.from(
                        { length: 10 },
                        (_, index) =>
                            index + 1
                    ).map(
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
                                    transition

                                    ${
                                        selectedFloor ===
                                        floor
                                            ? "bg-blue-600 text-white"
                                            : "border bg-white text-gray-700 hover:bg-gray-100"
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
                FLOOR MAP
            ================================================== */}

            <div className="overflow-x-auto rounded-2xl border bg-gray-50 p-5">

                {/* Map Header */}

                <div className="mb-6 text-center">

                    <h3 className="text-lg font-bold text-gray-800">
                        Tower {selectedTower} -{" "}
                        {getTowerName(selectedTower)}
                    </h3>

                    <p className="text-sm text-gray-500">
                        Floor {selectedFloor}
                    </p>

                </div>

                {/* ==================================================
                    Actual Floor Layout
                ================================================== */}

                <div className="mx-auto min-w-[850px] max-w-[1100px]">

                    {/* Top Row */}

                    <div className="grid grid-cols-5 gap-4">

                        {firstRow.map(
                            renderFlat
                        )}

                    </div>

                    {/* ==================================================
                        Corridor
                    ================================================== */}

                    <div className="my-4 flex h-12 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white">

                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">
                            Common Passage
                        </span>

                    </div>

                    {/* Bottom Row */}

                    <div className="grid grid-cols-5 gap-4">

                        {secondRow.map(
                            renderFlat
                        )}

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
                isOpen={isOpen}
                onClose={() =>
                    setIsOpen(false)
                }
                onSave={handleSaveFlat}
                onBooking={handleBooking}
                flat={selectedFlat}
            />

        </div>
    );
}

export default FloorMap;