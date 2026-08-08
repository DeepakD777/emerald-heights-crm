// ======================================================
// Dashboard Page
// ======================================================

import StatsCard from "../../components/dashboard/StatsCard";
import InventoryChart from "../../components/dashboard/InventoryChart";
import FloorPreview from "../../components/dashboard/FloorPreview";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentBookings from "../../components/dashboard/RecentBookings";
import FloorMap from "../../components/dashboard/Floormap";

import { useBooking } from "../../context/BookingContext";
import { useFlat } from "../../context/FlatContext";

import { residentialFlats } from "../../data/floorData";
import { commercialShops } from "../../data/commercialData";

import {
    Building2,
    Home,
    CalendarDays,
    IndianRupee,
} from "lucide-react";

function Dashboard() {
    const { bookings } = useBooking();
    const { flatStatuses } = useFlat();

    // ======================================================
    // Residential Units
    // ======================================================

    const residentialUnits =
        residentialFlats.length;

    // ======================================================
    // Commercial Units
    // ======================================================

    const commercialUnits =
        commercialShops.length;

    // ======================================================
    // Total Units
    // ======================================================

    const totalUnits =
        residentialUnits + commercialUnits;

    // ======================================================
    // Residential Status
    // ======================================================

    const residentialWithStatus =
        residentialFlats.map((flat) => {

            const savedStatus =
                flatStatuses.find(
                    (item) =>
                        item.number === flat.number
                );

            return {
                ...flat,
                status:
                    savedStatus?.status ??
                    flat.status,
            };
        });

    const residentialBooked =
        residentialWithStatus.filter(
            (flat) =>
                flat.status === "booked"
        ).length;

    const residentialHold =
        residentialWithStatus.filter(
            (flat) =>
                flat.status === "hold"
        ).length;

    // ======================================================
    // Commercial Status
    // ======================================================

    const commercialBooked =
        commercialShops.filter(
            (shop) =>
                shop.status === "booked"
        ).length;

    const commercialHold =
        commercialShops.filter(
            (shop) =>
                shop.status === "hold"
        ).length;

    // ======================================================
    // Total Booked / Hold
    // ======================================================

    const bookedUnits =
        residentialBooked +
        commercialBooked;

    const holdUnits =
        residentialHold +
        commercialHold;

    // ======================================================
    // Available Units
    // ======================================================

    const availableUnits =
        totalUnits -
        bookedUnits -
        holdUnits;

    // ======================================================
    // Revenue
    // ======================================================

    const revenue =
        bookings.reduce(
            (total, booking) =>
                total +
                (
                    Number(
                        booking.bookingAmount
                    ) || 0
                ),
            0
        );

    return (
        <div className="space-y-6">

            {/* ==================================================
                Statistics Cards
            ================================================== */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                {/* Total Units */}

                <StatsCard
                    title="Total Units"
                    value={totalUnits}
                    subtitle="Residential + Commercial"
                    icon={
                        <Building2 size={28} />
                    }
                    color="bg-green-600"
                />

                {/* Available Units */}

                <StatsCard
                    title="Available Units"
                    value={availableUnits}
                    subtitle="Ready for Booking"
                    icon={
                        <Home size={28} />
                    }
                    color="bg-blue-600"
                />

                {/* Total Bookings */}

                <StatsCard
                    title="Bookings"
                    value={bookings.length}
                    subtitle="Completed Bookings"
                    icon={
                        <CalendarDays
                            size={28}
                        />
                    }
                    color="bg-orange-500"
                />

                {/* Revenue */}

                <StatsCard
                    title="Revenue"
                    value={`₹${revenue.toLocaleString(
                        "en-IN"
                    )}`}
                    subtitle="Total Sales"
                    icon={
                        <IndianRupee
                            size={28}
                        />
                    }
                    color="bg-purple-600"
                />

            </div>

            {/* ==================================================
                Inventory + Floor Preview
            ================================================== */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                <div className="xl:col-span-2">

                    <InventoryChart />

                </div>

                <div>

                    <FloorPreview />

                </div>

            </div>

            {/* ==================================================
                Quick Actions
            ================================================== */}

            <QuickActions />

            {/* ==================================================
                Recent Bookings
            ================================================== */}

            <RecentBookings />

            {/* ==================================================
                Floor Map
            ================================================== */}

            <FloorMap />

        </div>
    );
}

export default Dashboard;