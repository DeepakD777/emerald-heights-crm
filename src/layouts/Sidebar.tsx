/*
========================================================

Project : Emerald Heights CRM

File : Sidebar.tsx

Purpose :

Website ka Left Sidebar

Isme Menu, Logo aur Navigation rahega.

========================================================
*/

import {
  LayoutDashboard,
  Building2,
  Store,
  Map,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

// Sidebar ke saare Menu Items
const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Residential",
    icon: Building2,
  },
  {
    title: "Commercial",
    icon: Store,
  },
  {
    title: "Floor Map",
    icon: Map,
  },
  {
    title: "Bookings",
    icon: BookOpen,
  },
  {
    title: "Customers",
    icon: Users,
  },
  {
    title: "Reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside
      className="
      w-72
      min-h-screen
      bg-[#0B5D3B]
      text-white
      flex
      flex-col
      "
    >
      {/* =========================
            Logo Section
      ========================== */}

      <div className="border-b border-green-700 p-6">

        <h1 className="text-2xl font-bold">
          EMERALD
        </h1>

        <p className="text-sm text-green-200">
          Heights & Residences
        </p>

      </div>

      {/* =========================
              Menu
      ========================== */}

      <nav className="flex-1 p-4">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.title}
              className="
              flex
              items-center
              gap-3
              w-full
              rounded-lg
              px-4
              py-3
              mb-2
              hover:bg-green-700
              transition
              "
            >

              <Icon size={20} />

              <span>

                {item.title}

              </span>

            </button>

          );

        })}

      </nav>

      {/* =========================
            Logout
      ========================== */}

      <div className="border-t border-green-700 p-4">

        <button
          className="
          flex
          items-center
          gap-3
          w-full
          rounded-lg
          px-4
          py-3
          hover:bg-red-600
          transition
          "
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;