/*
========================================================
Project : Emerald Heights CRM

File : Navbar.tsx

Purpose :
Dashboard ka Top Navbar
========================================================
*/

import { Search, Bell } from "lucide-react";

function Navbar() {
  return (
    <header className="bg-white h-20 border-b border-gray-200 flex items-center justify-between px-8">

      {/* Left Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Emerald Heights CRM
        </h1>

        <p className="text-sm text-gray-500">
          Inventory Management System
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        {/* Search */}
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">

          <Search size={18} className="text-gray-500"/>

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2 w-52"
          />

        </div>

        {/* Notification */}
        <button className="relative">

          <Bell size={22} className="text-gray-700"/>

          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500"/>

        </button>

        {/* User */}
        <div className="flex items-center gap-3">

          <div className="h-11 w-11 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
            D
          </div>

          <div>

            <h3 className="font-semibold text-gray-800">
              Deepak Dubey
            </h3>

            <p className="text-xs text-gray-500">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;