
import { NavLink } from "react-router-dom";

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
interface MenuItem {
  title: string;
  path: string;
  icon: any;
  hasArrow?: boolean;
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Residential",
    path: "/residential",
    icon: Building2,
    hasArrow: true,
  },
  {
    title: "Commercial",
    path: "/commercial",
    icon: Store,
    hasArrow: true,
  },
  {
    title: "Notifications",
    path: "/notifications",
    icon: Bell,
    badge: "12",
  },
  {
    title: "Sales Team",
    path: "/sales-team",
    icon: UsersRound,
  },
  {
    title: "Floor Map",
    path: "/floor-map",
    icon: Map,
  },
  {
    title: "Bookings",
    path: "/bookings",
    icon: BookOpen,
  },
  {
    title: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar() {
  return (
    <aside className="w-72 min-h-screen bg-[#0B5D3B] text-white flex flex-col">

      {/* Logo */}

      <div className="border-b border-green-700 p-6">

        <h1 className="text-2xl font-bold">
          EMERALD
        </h1>

        <p className="text-sm text-green-200">
          Heights & Residences
        </p>

      </div>

      {/* Menu */}

      <nav className="flex-1 p-4">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `
    flex
    items-center
    justify-between
    w-full
    rounded-lg
    px-4
    py-3
    mb-2
    transition
    ${isActive
                  ? "bg-green-700 text-white"
                  : "hover:bg-green-700 text-green-100"
                }
    `
              }
            >
              <div className="flex items-center gap-3">

                <Icon size={20} />

                <span>{item.title}</span>

              </div>

              <div className="flex items-center gap-2">

                {item.hasArrow && (
                  <ChevronDown size={16} />
                )}

                {item.badge && (
                  <span className="rounded-full bg-green-500 px-2 py-1 text-xs text-white">
                    {item.badge}
                  </span>
                )}

              </div>

            </NavLink>

          );

        })}

      </nav>

      {/* Logout */}

      <div className="border-t border-green-700 p-4">

        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition hover:bg-red-600">

          <LogOut size={20} />

          Logout

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;