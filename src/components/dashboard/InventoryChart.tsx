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
  Legend,
} from "recharts";

import { residentialFlats } from "../../data/floorData";
import { commercialShops } from "../../data/commercialData";

import { useFlat } from "../../context/FlatContext";

function InventoryChart() {
  const { flatStatuses } = useFlat();

  // =====================================================
  // Residential Flats with Actual Saved Status
  // =====================================================

  const residentialWithStatus = residentialFlats.map((flat) => {
    const savedStatus = flatStatuses.find(
      (item) => item.number === flat.number
    );

    return {
      ...flat,
      status: savedStatus?.status ?? flat.status,
    };
  });

  // =====================================================
  // Residential Inventory
  // =====================================================

  const residentialAvailable = residentialWithStatus.filter(
    (flat) => flat.status === "available"
  ).length;

  const residentialBooked = residentialWithStatus.filter(
    (flat) => flat.status === "booked"
  ).length;

  const residentialHold = residentialWithStatus.filter(
    (flat) => flat.status === "hold"
  ).length;

  // =====================================================
  // Commercial Inventory
  // =====================================================

  const commercialAvailable = commercialShops.filter(
    (shop) => shop.status === "available"
  ).length;

  const commercialBooked = commercialShops.filter(
    (shop) => shop.status === "booked"
  ).length;

  const commercialHold = commercialShops.filter(
    (shop) => shop.status === "hold"
  ).length;

  // =====================================================
  // Chart Data
  // =====================================================

  const data = [
    {
      category: "Residential",
      available: residentialAvailable,
      hold: residentialHold,
      booked: residentialBooked,
    },
    {
      category: "Commercial",
      available: commercialAvailable,
      hold: commercialHold,
      booked: commercialBooked,
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Inventory Overview
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Available vs Booked vs Hold Units
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="category" />

            <YAxis />

            <Tooltip />

            <Legend />

            {/* Available */}
            <Bar
              dataKey="available"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
              name="Available"
            />

            {/* Hold */}
            <Bar
              dataKey="hold"
              fill="#f59e0b"
              radius={[8, 8, 0, 0]}
              name="Hold"
            />

            {/* Booked */}
            <Bar
              dataKey="booked"
              fill="#ef4444"
              radius={[8, 8, 0, 0]}
              name="Booked"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default InventoryChart;