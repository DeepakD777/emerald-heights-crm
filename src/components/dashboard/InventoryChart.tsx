import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

type InventoryChartProps = {
    residential: {
        available: number;
        hold: number;
        booked: number;
        sold: number;
    };

    commercial: {
        available: number;
        hold: number;
        booked: number;
        sold: number;
    };
};

function InventoryChart({
    residential,
    commercial,
}: InventoryChartProps) {
    const data = [
        {
            category: "Residential",
            available:
                residential.available,
            hold:
                residential.hold,
            booked:
                residential.booked,
            sold:
                residential.sold,
        },
        {
            category: "Commercial",
            available:
                commercial.available,
            hold:
                commercial.hold,
            booked:
                commercial.booked,
            sold:
                commercial.sold,
        },
    ];

    return (
        <div className="min-w-0 rounded-2xl bg-white p-4 text-gray-600 shadow transition-colors dark:bg-gray-900 dark:text-gray-300 sm:p-5 lg:p-6">

            <div className="mb-4 sm:mb-5 lg:mb-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-xl">
                    Inventory Overview
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Live property inventory status
                </p>
            </div>

            <div className="h-64 min-w-0 sm:h-72 lg:h-80">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 10,
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="currentColor"
                            opacity={0.18}
                        />

                        <XAxis
                            dataKey="category"
                            axisLine={{
                                stroke:
                                    "currentColor",
                            }}
                            tickLine={{
                                stroke:
                                    "currentColor",
                            }}
                            tick={{
                                fill:
                                    "currentColor",
                            }}
                        />

                        <YAxis
                            axisLine={{
                                stroke:
                                    "currentColor",
                            }}
                            tickLine={{
                                stroke:
                                    "currentColor",
                            }}
                            tick={{
                                fill:
                                    "currentColor",
                            }}
                        />

                        <Tooltip
                            cursor={{
                                fill:
                                    "transparent",
                            }}
                            content={({
                                active,
                                payload,
                                label,
                            }) => {
                                if (
                                    !active ||
                                    !payload ||
                                    payload.length ===
                                        0
                                ) {
                                    return null;
                                }

                                return (
                                    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-950">
                                        <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                                            {label}
                                        </p>

                                        <div className="space-y-1">
                                            {payload.map(
                                                (
                                                    entry
                                                ) => (
                                                    <p
                                                        key={String(
                                                            entry.dataKey
                                                        )}
                                                        className="text-xs text-gray-600 dark:text-gray-300"
                                                    >
                                                        {entry.name}
                                                        :{" "}
                                                        <span className="font-semibold">
                                                            {entry.value}
                                                        </span>
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            }}
                        />

                        <Legend
                            wrapperStyle={{
                                color:
                                    "currentColor",
                            }}
                        />

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

                        <Bar
                            dataKey="booked"
                            fill="#ef4444"
                            radius={[
                                8,
                                8,
                                0,
                                0,
                            ]}
                            name="Booked"
                        />

                        <Bar
                            dataKey="sold"
                            fill="#6b7280"
                            radius={[
                                8,
                                8,
                                0,
                                0,
                            ]}
                            name="Sold"
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>
    );
}

export default InventoryChart;
