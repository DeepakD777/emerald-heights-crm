import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Bookings from "../components/dashboard/Bookings";

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

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;