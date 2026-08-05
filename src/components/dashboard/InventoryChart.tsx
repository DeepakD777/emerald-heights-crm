// =========================================================
// Inventory Chart Component
// =========================================================
// यह Dashboard का Graph है।
//
// इसमें दिखेगा:
// ✅ Available Units
// ✅ Sold Units
//
// Library:
// Recharts
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

// ===============================================
// Dummy Data
// बाद में यह Data Database (Supabase) से आएगा
// ===============================================

const data = [
  {
    floor: "A Wing",
    available: 18,
    sold: 12,
  },
  {
    floor: "B Wing",
    available: 15,
    sold: 17,
  },
  {
    floor: "C Wing",
    available: 10,
    sold: 20,
  },
  {
    floor: "D Wing",
    available: 25,
    sold: 9,
  },
  {
    floor: "E Wing",
    available: 14,
    sold: 16,
  },
];

function InventoryChart() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

      {/* Heading */}
      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-800">
          Inventory Overview
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Available vs Sold Units
        </p>

      </div>

      {/* Chart */}

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="floor" />

            <YAxis />

            <Tooltip />

            {/* Green Bars */}
            <Bar
              dataKey="available"
              fill="#16a34a"
              radius={[8, 8, 0, 0]}
            />

            {/* Blue Bars */}
            <Bar
              dataKey="sold"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default InventoryChart;