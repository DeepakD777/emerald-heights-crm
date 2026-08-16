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
        <div className="rounded-2xl bg-white p-6 shadow">

            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Inventory Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Live property inventory status
                </p>
            </div>

            <div className="h-80">

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
                        />

                        <XAxis
                            dataKey="category"
                        />

                        <YAxis />

                        <Tooltip />

                        <Legend />

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