import {
    Building2,
    CheckCircle,
    Clock3,
    AlertCircle,
} from "lucide-react";

import { residentialFlats } from "../../data/floorData";
import { useFlat } from "../../context/FlatContext";

function FloorPreview() {
    const { flatStatuses } = useFlat();

    // ======================================================
    // Residential Flats with Actual Saved Status
    // ======================================================

    const flatsWithStatus = residentialFlats.map((flat) => {
        const savedStatus = flatStatuses.find(
            (item) => item.number === flat.number
        );

        return {
            ...flat,
            status: savedStatus?.status ?? flat.status,
        };
    });

    // ======================================================
    // Floor Data
    // ======================================================

    const floors = Array.from(
        { length: 10 },
        (_, index) => {
            const floorNumber = index + 1;

            const floorFlats = flatsWithStatus.filter(
                (flat) => flat.floor === floorNumber
            );

            const total = floorFlats.length;

            const booked = floorFlats.filter(
                (flat) => flat.status === "booked"
            ).length;

            const hold = floorFlats.filter(
                (flat) => flat.status === "hold"
            ).length;

            const available = floorFlats.filter(
                (flat) => flat.status === "available"
            ).length;

            // Booked + Hold = occupied/blocked inventory
            const occupied = booked + hold;

            const percentage =
                total > 0
                    ? Math.round(
                          (occupied / total) * 100
                      )
                    : 0;

            let color = "bg-green-500";

            let icon = (
                <CheckCircle
                    className="text-green-600"
                    size={18}
                />
            );

            if (percentage >= 70) {
                color = "bg-red-500";

                icon = (
                    <AlertCircle
                        className="text-red-500"
                        size={18}
                    />
                );
            } else if (percentage >= 40) {
                color = "bg-yellow-500";

                icon = (
                    <Clock3
                        className="text-yellow-500"
                        size={18}
                    />
                );
            }

            return {
                floorNumber,
                name: `Floor ${floorNumber}`,
                total,
                available,
                booked,
                hold,
                occupied,
                percentage,
                color,
                icon,
            };
        }
    );

    return (
        <div className="rounded-2xl bg-white p-6 shadow">

            {/* ==================================================
                Heading
            ================================================== */}

            <div className="mb-6 flex items-center gap-2">

                <Building2
                    className="text-green-600"
                    size={22}
                />

                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Floor Preview
                    </h2>

                    <p className="text-sm text-gray-500">
                        Residential floor occupancy
                    </p>
                </div>

            </div>

            {/* ==================================================
                Floors
            ================================================== */}

            <div className="space-y-5">

                {floors.map((floor) => (

                    <div key={floor.floorNumber}>

                        {/* Floor Header */}

                        <div className="mb-2 flex items-center justify-between">

                            <div className="flex items-center gap-2">

                                {floor.icon}

                                <span className="font-medium text-gray-700">
                                    {floor.name}
                                </span>

                            </div>

                            <span className="text-sm font-semibold text-gray-600">
                                {floor.percentage}%
                            </span>

                        </div>

                        {/* Progress Bar */}

                        <div className="h-2 w-full rounded-full bg-gray-200">

                            <div
                                className={`${floor.color} h-2 rounded-full transition-all duration-500`}
                                style={{
                                    width: `${floor.percentage}%`,
                                }}
                            />

                        </div>

                        {/* Floor Stats */}

                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">

                            <span>
                                Total: {floor.total}
                            </span>

                            <span className="text-green-600">
                                Available: {floor.available}
                            </span>

                            <span className="text-red-600">
                                Booked: {floor.booked}
                            </span>

                            <span className="text-yellow-600">
                                Hold: {floor.hold}
                            </span>

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default FloorPreview;