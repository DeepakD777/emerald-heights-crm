// ======================================================
// Dashboard Page
// ======================================================
// यह Dashboard का Main Page है।
//
// यहाँ हम सारे Components जोड़ेंगे।
// ======================================================

// Dashboard Header
// import DashboardHeader from "../../components/dashboard/DashboardHeader";

// Stats Card
import StatsCard from "../../components/dashboard/StatsCard";

//InventroyChart
import InventoryChart from "../../components/dashboard/InventoryChart";


import FloorPreview from "../../components/dashboard/FloorPreview";

import QuickActions from "../../components/dashboard/QuickActions";

import RecentBookings from "../../components/dashboard/RecentBookings";

import FloorMap from "../../components/dashboard/Floormap";


// Lucide Icons
import {
  Building2,
  Home,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

function Dashboard() {
  return (
    <div className="space-y-6">

      {/* ================= Dashboard Header ================= */}
      {/* <DashboardHeader /> */}

      {/* ================= Statistics Cards ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* Total Units */}
        <StatsCard
          title="Total Units"
          value="240"
          subtitle="Residential + Commercial"
          icon={<Building2 size={28} />}
          color="bg-green-600"
        />

        {/* Available Units */}
        <StatsCard
          title="Available Units"
          value="68"
          subtitle="Ready for Booking"
          icon={<Home size={28} />}
          color="bg-blue-600"
        />

        {/* Total Bookings */}
        <StatsCard
          title="Bookings"
          value="172"
          subtitle="Completed Bookings"
          icon={<CalendarDays size={28} />}
          color="bg-orange-500"
        />

        {/* Revenue */}
        <StatsCard
          title="Revenue"
          value="₹8.5 Cr"
          subtitle="Total Sales"
          icon={<IndianRupee size={28} />}
          color="bg-purple-600"
        />

      </div>
      {/* ================= Inventory Chart ================= */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

        <div className="xl:col-span-2">
          <InventoryChart />
        </div>

        <div>
          <FloorPreview />
        </div>


      </div>
      {/* Quick Actions */}
      <QuickActions />
      {/* Recent Bookings */}

      <RecentBookings />
      {/* Floor Map */}

      <FloorMap />

    </div>
  );
}

export default Dashboard;