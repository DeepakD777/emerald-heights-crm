// ==========================================================
// DashboardHeader Component
// ==========================================================
// यह Dashboard का सबसे ऊपर वाला Header है।
//
// इसमें होंगे:
// ✅ Welcome Message
// ✅ Current Date
// ✅ Search Box
// ✅ Notification Icon
// ✅ User Profile
// ==========================================================

import { Search, Bell } from "lucide-react";

function DashboardHeader() {
  // आज की Date निकाल रहे हैं
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    // Header Container
    <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-200">

      {/* Left Section */}
      <div>

        {/* Dashboard Title */}
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        {/* Welcome Message */}
        <p className="text-gray-500 mt-1">
          Welcome back 👋 Deepak
        </p>

        {/* Current Date */}
        <p className="text-sm text-green-600 mt-2">
          {today}
        </p>

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-5">

        {/* Search Box */}
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">

          <Search
            size={18}
            className="text-gray-500"
          />

          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none ml-2 w-52"
          />

        </div>

        {/* Notification Button */}
        <button className="relative p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition">

          <Bell size={20} />

          {/* Notification Dot */}
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500"></span>

        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="h-11 w-11 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">
            D
          </div>

          {/* Name */}
          <div>

            <h3 className="font-semibold text-gray-800">
              Deepak
            </h3>

            <p className="text-sm text-gray-500">
              Administrator
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DashboardHeader;