import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Bookings from "../components/dashboard/Bookings";
import Customers from "../pages/Customers/Customers";
import Commercial from "../pages/Commercial/Commercial";
import Residential from "../pages/Residential/Residential";
import Properties from "../pages/Properties/Properties";
import Reports from "../pages/Reports/Reports";
import Notifications from "../components/dashboard/Notifications";
import FloorMap from "../components/dashboard/Floormap";
import SalesTeam from "../pages/SalesTeam/SalesTeam";
import Settings from "../pages/Settings/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            Main Application Layout
        ================================================== */}

        <Route
          path="/"
          element={<MainLayout />}
        >

          {/* Dashboard */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* Bookings */}
          <Route
            path="bookings"
            element={<Bookings />}
          />

          {/* Customers */}
          <Route
            path="customers"
            element={<Customers />}
          />

          {/* Commercial */}
          <Route
            path="commercial"
            element={<Commercial />}
          />

          {/* Residential */}
          <Route
            path="residential"
            element={<Residential />}
          />

          {/* Properties */}
          <Route
            path="properties"
            element={<Properties />}
          />

          {/* Reports */}
          <Route
            path="reports"
            element={<Reports />}
          />

          {/* Notifications */}
          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* Floor Map */}
          <Route
            path="floor-map"
            element={<FloorMap />}
          />

          {/* Sales Team */}
          <Route
            path="sales-team"
            element={<SalesTeam />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;