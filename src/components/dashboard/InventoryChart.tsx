// =========================================================
// Inventory Chart Component
// =========================================================

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";

import { residentialFlats } from "../../data/floorData";
import { useFlat } from "../../context/FlatContext";

function InventoryChart() {
    const { flatStatuses } = useFlat();

    // =====================================================
    // Residential Flats with Actual Saved Status
    // =====================================================

    const flatsWithStatus = residentialFlats.map((flat) => {

        const savedStatus = flatStatuses.find(
            (item) => item.number === flat.number
        );

        return {
            ...flat,
            status:
                savedStatus?.status ??
                flat.status,
        };
    });

    // =====================================================
    // Tower Data
    // =====================================================

    const towerData = [
        {
            tower: "Amogh",
            towerCode: "A",
            total: 100,
        },
        {
            tower: "Ekash",
            towerCode: "B",
            total: 80,
        },
        {
            tower: "Ishan",
            towerCode: "C",
            total: 120,
        },
    ];

    // =====================================================
    // Chart Data
    // =====================================================

    const data = towerData.map((tower) => {

        const towerFlats = flatsWithStatus.filter(
            (flat) =>
                flat.tower === tower.towerCode
        );

        const available = towerFlats.filter(
            (flat) =>
                flat.status === "available"
        ).length;

        const sold = towerFlats.filter(
            (flat) =>
                flat.status === "booked"
        ).length;

        const hold = towerFlats.filter(
            (flat) =>
                flat.status === "hold"
        ).length;

        return {
            tower: tower.tower,
            available,
            sold,
            hold,
        };
    });

    return (
        <div className="rounded-2xl bg-white p-6 shadow">

            {/* =================================================
                Heading
            ================================================= */}

            <div className="mb-6">

                <h2 className="text-xl font-bold text-gray-800">
                    Inventory Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Available vs Sold vs Hold Units
                </p>

            </div>

            {/* =================================================
                Chart
            ================================================= */}

            <div className="h-80">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart data={data}>

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis
                            dataKey="tower"
                        />

                        <YAxis />

                        <Tooltip />

                        {/* Available */}

                        <Bar
                            dataKey="available"
                            fill="#16a34a"
                            radius={[
                                8,
                                8,
                                0,
                                0,
                            ]}
                            name="Available"
                        />

                        {/* Sold */}

                        <Bar
                            dataKey="sold"
                            fill="#2563eb"
                            radius={[
                                8,
                                8,
                                0,
                                0,
                            ]}
                            name="Sold"
                        />

                        {/* Hold */}

                        <Bar
                            dataKey="hold"
                            fill="#f59e0b"
                            radius={[
                                8,
                                8,
                                0,
                                0,
                            ]}
                            name="Hold"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default InventoryChart;