import { NavLink } from "react-router-dom";
import type { ElementType } from "react";

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
    X,
} from "lucide-react";

import { useBooking } from "../context/BookingContext";

interface MenuItem {
    title: string;
    path: string;
    icon: ElementType;
    hasArrow?: boolean;
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
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

function Sidebar({
    isOpen = false,
    onClose,
}: SidebarProps) {

    // ======================================================
    // Booking Data
    // ======================================================

    const { bookings } = useBooking();

    // ======================================================
    // Pending Agreement To Sell Count
    // ======================================================

    const pendingAgreementCount =
        bookings.filter((booking) => {

            const status =
                booking.documents
                    ?.agreementToSell
                    ?.status;

            return status !== "given";

        }).length;

    return (
        <>

            {/* ==================================================
                Mobile Overlay
            ================================================== */}

            {isOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        z-40
                        bg-black/40
                        lg:hidden
                    "
                    onClick={onClose}
                />

            )}

            {/* ==================================================
                Sidebar
            ================================================== */}

            <aside
                className={`
                    fixed
                    inset-y-0
                    left-0
                    z-50
                    flex
                    w-64
                    flex-col
                    bg-green-900
                    text-white
                    transition-transform
                    duration-300
                    lg:static
                    lg:translate-x-0
                    ${isOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                    }
                `}
            >

                {/* ==================================================
                    Logo
                ================================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        border-green-700
                        p-6
                    "
                >

                    <div>

                        <h1
                            className="
                                text-2xl
                                font-bold
                                tracking-wide
                            "
                        >
                            EMERALD
                        </h1>

                        <p
                            className="
                                text-sm
                                text-green-200
                            "
                        >
                            Heights & Residences
                        </p>

                    </div>

                    {/* Mobile Close */}

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg
                            p-2
                            hover:bg-green-800
                            lg:hidden
                        "
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* ==================================================
                    Menu
                ================================================== */}

                <nav
                    className="
                        flex-1
                        overflow-y-auto
                        p-4
                    "
                >

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        const isNotification =
                            item.path ===
                            "/notifications";

                        return (

                            <NavLink
                                key={item.title}
                                to={item.path}
                                end={
                                    item.path === "/"
                                }
                                onClick={onClose}
                                className={({
                                    isActive,
                                }) =>
                                    `
                                    mb-2
                                    flex
                                    w-full
                                    items-center
                                    justify-between
                                    rounded-lg
                                    px-4
                                    py-3
                                    transition-colors

                                    ${
                                        isActive
                                            ? "bg-green-700 text-white"
                                            : "text-green-100 hover:bg-green-800"
                                    }
                                    `
                                }
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >

                                    <Icon size={20} />

                                    <span>
                                        {item.title}
                                    </span>

                                </div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    {/* Arrow */}

                                    {item.hasArrow && (
                                        <ChevronDown
                                            size={16}
                                        />
                                    )}

                                    {/* Notification Count */}

                                    {isNotification &&
                                        pendingAgreementCount >
                                            0 && (

                                            <span
                                                className="
                                                    rounded-full
                                                    bg-red-500
                                                    px-2
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    text-white
                                                "
                                            >
                                                {
                                                    pendingAgreementCount
                                                }
                                            </span>

                                        )}

                                </div>

                            </NavLink>

                        );

                    })}

                </nav>

                {/* ==================================================
                    Logout
                ================================================== */}

                <div
                    className="
                        border-t
                        border-green-700
                        p-4
                    "
                >

                    <button
                        type="button"
                        className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-lg
                            px-4
                            py-3
                            text-green-100
                            transition
                            hover:bg-red-600
                            hover:text-white
                        "
                    >

                        <LogOut size={20} />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>

        </>
    );
}

export default Sidebar;