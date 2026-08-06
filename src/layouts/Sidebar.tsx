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
  UsersRound,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

// Sidebar ke saare Menu Items
const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    title: "Residential",
    icon: Building2,
    hasArrow: true,
  },
  {
    title: "Commercial",
    icon: Store,
    hasArrow: true,
  },
  {
    title: "Notifications",
    icon: Bell,
    badge: "12",
  },

  {
    title: "Sales Team",
    icon: UsersRound,
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
              className={`
    flex
    items-center
    gap-3
    w-full
    rounded-lg
    px-4
    py-3
    mb-2
    transition
    justify-between
    ${item.active
                  ? "bg-green-700 text-white"
                  : "hover:bg-green-700 text-green-100"
                }
  `}
            >

              {/* <Icon size={20} />

              <span>

                {item.title}

              </span> */}
              <button className="flex items-center justify-between w-full px-4 py-3 mb-2 rounded-lg ...">
                <div className="flex items-center gap-3">
                  <Icon size={20} />
                  <span>{item.title}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.hasArrow && <ChevronDown size={16} />}

                  {item.badge && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
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