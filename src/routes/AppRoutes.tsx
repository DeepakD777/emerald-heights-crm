import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Bookings from "../components/dashboard/Bookings";
import Customers from "../pages/Customers/Customers";
import Commercial from "../pages/Commercial/Commercial";
import Residential from "../pages/Residential/Residential";
import Properties from "../pages/Properties/properties";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<MainLayout />}>

          <Route index element={<Dashboard />} />

          <Route
            path="bookings"
            element={<Bookings />}
          />
          <Route
            path="customers"
            element={<Customers />}
          />
          <Route
            path="commercial"
            element={<Commercial />}
          />
          <Route
            path="residential"
            element={<Residential />}
          />
          <Route
            path="properties"
            element={<Properties />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;