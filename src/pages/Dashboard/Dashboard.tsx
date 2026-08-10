// ======================================================
// Dashboard Page
// ======================================================

import { useState } from "react";

import StatsCard from "../../components/dashboard/StatsCard";
import InventoryChart from "../../components/dashboard/InventoryChart";
import FloorPreview from "../../components/dashboard/FloorPreview";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentBookings from "../../components/dashboard/RecentBookings";
import FloorMap from "../../components/dashboard/Floormap";

import { useFlat } from "../../context/FlatContext";

import { residentialFlats } from "../../data/floorData";
import { commercialShops } from "../../data/commercialData";

import {
    Building2,
    Store,
    Home,
    CheckCircle,
} from "lucide-react";

function Dashboard() {

    const { flatStatuses } = useFlat();

    // ======================================================
    // Commercial Shops
    // Read saved status from localStorage
    // ======================================================

    const [savedCommercialShops] = useState(() => {

        const savedShops =
            localStorage.getItem("commercialShops");

        if (savedShops) {
            try {
                return JSON.parse(savedShops);
            } catch (error) {
                console.error(
                    "Failed to load commercial shops:",
                    error
                );
            }
        }

        return commercialShops;
    });

    // ======================================================
    // Residential Units
    // ======================================================

    const residentialUnits =
        residentialFlats.length;

    // ======================================================
    // Commercial Units
    // ======================================================

    const commercialUnits =
        savedCommercialShops.length;

    // ======================================================
    // Total Units
    // ======================================================

    const totalUnits =
        residentialUnits +
        commercialUnits;

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

    // ======================================================
    // Residential Booked
    // ======================================================

    const residentialBooked =
        residentialWithStatus.filter(
            (flat) =>
                flat.status === "booked"
        ).length;

    // ======================================================
    // Residential Hold
    // ======================================================

    const residentialHold =
        residentialWithStatus.filter(
            (flat) =>
                flat.status === "hold"
        ).length;

    // ======================================================
    // Commercial Booked
    // ======================================================

    const commercialBooked =
        savedCommercialShops.filter(
            (shop: any) =>
                shop.status === "booked"
        ).length;

    // ======================================================
    // Commercial Hold
    // ======================================================

    const commercialHold =
        savedCommercialShops.filter(
            (shop: any) =>
                shop.status === "hold"
        ).length;

    // ======================================================
    // Total Booked Units
    // ======================================================

    const bookedUnits =
        residentialBooked +
        commercialBooked;

    // ======================================================
    // Total Hold Units
    // ======================================================

    const holdUnits =
        residentialHold +
        commercialHold;

    // ======================================================
    // Total Available Units
    // ======================================================

    const availableUnits =
        totalUnits -
        bookedUnits -
        holdUnits;

    // ======================================================
    // UI
    // ======================================================

    return (
        <div className="space-y-6">

            {/* ==================================================
                Statistics Cards
            ================================================== */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                {/* ==================================================
                    Residential Units
                ================================================== */}

                <StatsCard
                    title="Residential Units"
                    value={residentialUnits}
                    subtitle="Total Residential Units"
                    icon={
                        <Building2 size={28} />
                    }
                    color="bg-green-600"
                />

                {/* ==================================================
                    Commercial Units
                ================================================== */}

                <StatsCard
                    title="Commercial Units"
                    value={commercialUnits}
                    subtitle="Total Commercial Units"
                    icon={
                        <Store size={28} />
                    }
                    color="bg-blue-600"
                />

                {/* ==================================================
                    Available Units
                ================================================== */}

                <StatsCard
                    title="Total Available Units"
                    value={availableUnits}
                    subtitle="Ready for Booking"
                    icon={
                        <Home size={28} />
                    }
                    color="bg-green-600"
                />

                {/* ==================================================
                    Booked Units
                ================================================== */}

                <StatsCard
                    title="Total Booked Units"
                    value={bookedUnits}
                    subtitle="Currently Booked"
                    icon={
                        <CheckCircle size={28} />
                    }
                    color="bg-red-500"
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