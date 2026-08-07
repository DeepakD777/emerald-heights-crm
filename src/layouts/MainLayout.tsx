import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "../components/dashboard/Navbar";

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1">

        <Navbar />

        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;