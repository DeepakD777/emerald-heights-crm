import {
    useEffect,
    useState,
} from "react";

import StatsCard from "../../components/dashboard/StatsCard";
import InventoryChart from "../../components/dashboard/InventoryChart";
import QuickActions from "../../components/dashboard/QuickActions";
import RecentBookings from "../../components/dashboard/RecentBookings";
import DashboardQuickInventory from "../../components/dashboard/DashboardQuickInventory";

import {
    getDashboardSummary,
} from "../../services/dashboardService";

import type {
    DashboardSummary,
} from "../../services/dashboardService";

import {
    getBookings,
} from "../../services/bookingService";

import type {
    Booking,
} from "../../services/bookingService";

import {
    Building2,
    Store,
    Home,
    CheckCircle,
} from "lucide-react";

function Dashboard() {

    const [
        summary,
        setSummary,
    ] = useState<DashboardSummary | null>(
        null
    );

    const [
        bookings,
        setBookings,
    ] = useState<Booking[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    // ======================================================
    // Load Dashboard
    // ======================================================

    const loadDashboard =
        async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    summaryResponse,
                    bookingsResponse,
                ] = await Promise.all([
                    getDashboardSummary(),
                    getBookings(),
                ]);

                setSummary(
                    summaryResponse.data
                );

                setBookings(
                    bookingsResponse.data
                );

            } catch (err) {

                const message =
                    err instanceof Error
                        ? err.message
                        : "Failed to load dashboard";

                setError(
                    message
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    useEffect(() => {
        loadDashboard();
    }, []);

    // ======================================================
    // Loading
    // ======================================================

    if (loading) {

        return (
            <div className="rounded-2xl bg-white p-8 shadow">

                <p className="text-gray-600">
                    Loading dashboard...
                </p>

            </div>
        );
    }

    // ======================================================
    // Error
    // ======================================================

    if (
        error ||
        !summary
    ) {

        return (
            <div className="rounded-2xl bg-white p-8 shadow">

                <p className="font-medium text-red-600">
                    {error || "Dashboard data not available"}
                </p>

                <button
                    type="button"
                    onClick={
                        loadDashboard
                    }
                    className="mt-4 rounded-lg bg-green-600 px-5 py-2 text-white"
                >
                    Retry
                </button>

            </div>
        );
    }

    // ======================================================
    // Values
    // ======================================================

    const residentialUnits =
        summary.properties
            .residential.total;

    const commercialUnits =
        summary.properties
            .commercial.total;

    const availableUnits =
        summary.properties
            .available;

    const bookedUnits =
        summary.properties
            .booked;

    // ======================================================
    // Render
    // ======================================================

    return (
        <div className="space-y-6">

            {/* ==========================================
                Statistics Cards
            ========================================== */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                <StatsCard
                    title="Residential Units"
                    value={
                        residentialUnits
                    }
                    subtitle="Total Residential Units"
                    icon={
                        <Building2
                            size={28}
                        />
                    }
                    color="bg-green-600"
                />

                <StatsCard
                    title="Commercial Units"
                    value={
                        commercialUnits
                    }
                    subtitle="Total Commercial Units"
                    icon={
                        <Store
                            size={28}
                        />
                    }
                    color="bg-blue-600"
                />

                <StatsCard
                    title="Total Available Units"
                    value={
                        availableUnits
                    }
                    subtitle="Ready for Booking"
                    icon={
                        <Home
                            size={28}
                        />
                    }
                    color="bg-green-600"
                />

                <StatsCard
                    title="Total Booked Units"
                    value={
                        bookedUnits
                    }
                    subtitle="Currently Booked"
                    icon={
                        <CheckCircle
                            size={28}
                        />
                    }
                    color="bg-red-500"
                />

            </div>

            {/* ==========================================
                Inventory Overview
            ========================================== */}

            <InventoryChart
                residential={
                    summary.properties
                        .residential
                }
                commercial={
                    summary.properties
                        .commercial
                }
            />

            {/* ==========================================
                Quick Actions
            ========================================== */}

            <QuickActions />

            <DashboardQuickInventory
                onInventoryChanged={
                    loadDashboard
                }
            />

            <RecentBookings
                bookings={bookings}
            />

        </div>
    );
}

export default Dashboard;