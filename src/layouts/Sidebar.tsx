import {
    NavLink,
    useNavigate,
} from "react-router-dom";

import type {
    ElementType,
} from "react";

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
    Building,
} from "lucide-react";

import {
    useBooking,
} from "../context/BookingContext";

import {
    useAuth,
} from "../context/AuthContext";

// ======================================================
// Types
// ======================================================

interface MenuItem {
    title: string;
    path: string;
    icon: ElementType;
    hasArrow?: boolean;
    adminOnly?: boolean;
}

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

// ======================================================
// Menu
// ======================================================

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
        title: "Properties",
        path: "/properties",
        icon: Building,
        adminOnly: true,
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
        title: "Sales Team",
        path: "/sales-team",
        icon: UsersRound,
    },
    {
        title: "Reports",
        path: "/reports",
        icon: BarChart3,
    },
    {
        title: "Notifications",
        path: "/notifications",
        icon: Bell,
    },
    {
        title: "Settings",
        path: "/settings",
        icon: Settings,
    },
];

// ======================================================
// Sidebar
// ======================================================

function Sidebar({
    isOpen = false,
    onClose,
}: SidebarProps) {

    const navigate =
        useNavigate();

    const {
        bookings,
    } = useBooking();

    const {
        user,
        isAdmin,
        logout,
    } = useAuth();

    // ==================================================
    // Notification Count
    // ==================================================

    let notificationCount = 0;

    bookings.forEach((booking) => {

        const requisitionStatus =
            booking.documents
                ?.requisitionLetter
                ?.status ??
            "pending";

        if (
            requisitionStatus !== "given" &&
            requisitionStatus !== "completed"
        ) {
            notificationCount++;
        }

        const agreementStatus =
            booking.documents
                ?.agreementToSell
                ?.status ??
            "pending";

        if (
            agreementStatus !== "given" &&
            agreementStatus !== "completed"
        ) {
            notificationCount++;
        }

        const tripartite =
            booking.documents
                ?.tripartiteAgreement;

        const tripartiteRequired =
            tripartite?.required === true;

        const tripartiteStatus =
            tripartite
                ?.document
                ?.status ??
            "pending";

        if (
            tripartiteRequired &&
            tripartiteStatus !== "completed"
        ) {
            notificationCount++;
        }
    });

    // ==================================================
    // Visible Menu
    // ==================================================

    const visibleMenuItems =
        menuItems.filter(
            (item) => {

                if (
                    item.adminOnly &&
                    !isAdmin
                ) {
                    return false;
                }

                return true;
            }
        );

    // ==================================================
    // Logout
    // ==================================================

    const handleLogout = () => {

        logout();

        onClose?.();

        navigate(
            "/login",
            {
                replace: true,
            }
        );
    };

    // ==================================================
    // Role Label
    // ==================================================

    const roleLabel =
        isAdmin
            ? "Administrator"
            : user?.role
                ? String(user.role)
                    .replaceAll("_", " ")
                : "Employee";

    // ==================================================
    // UI
    // ==================================================

    return (
        <>

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

                    ${
                        isOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >

                {/* Logo */}

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

                        <h1 className="text-2xl font-bold tracking-wide">
                            EMERALD
                        </h1>

                        <p className="text-sm text-green-200">
                            Heights & Residences
                        </p>

                    </div>

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

                {/* User */}

                <div
                    className="
                        border-b
                        border-green-800
                        px-5
                        py-4
                    "
                >
                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-green-700
                                font-bold
                            "
                        >
                            {String(
                                user?.name ?? "U"
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold">
                                {user?.name ?? "User"}
                            </p>

                            <p className="truncate text-xs capitalize text-green-300">
                                {roleLabel.toLowerCase()}
                            </p>

                        </div>

                    </div>
                </div>

                {/* Menu */}

                <nav
                    className="
                        flex-1
                        overflow-y-auto
                        p-4
                    "
                >

                    {visibleMenuItems.map((item) => {

                        const Icon =
                            item.icon;

                        const isNotification =
                            item.path === "/notifications";

                        return (
                            <NavLink
                                key={item.title}
                                to={item.path}
                                end={
                                    item.path === "/"
                                }
                                onClick={() =>
                                    onClose?.()
                                }
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

                                <div className="flex items-center gap-3">

                                    <Icon size={20} />

                                    <span>
                                        {item.title}
                                    </span>

                                </div>

                                <div className="flex items-center gap-2">

                                    {item.hasArrow && (
                                        <ChevronDown
                                            size={16}
                                        />
                                    )}

                                    {isNotification &&
                                        notificationCount > 0 && (

                                        <span
                                            className="
                                                flex
                                                h-5
                                                min-w-5
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-red-500
                                                px-1.5
                                                text-[11px]
                                                font-bold
                                                text-white
                                            "
                                        >
                                            {notificationCount}
                                        </span>

                                    )}

                                </div>

                            </NavLink>
                        );
                    })}

                </nav>

                {!isAdmin && (
                    <div className="px-4 pb-3">

                        <div
                            className="
                                rounded-lg
                                border
                                border-green-700
                                bg-green-800
                                px-3
                                py-2.5
                                text-center
                                text-xs
                                font-semibold
                                text-green-100
                            "
                        >
                            View Only Access
                        </div>

                    </div>
                )}

                {/* Logout */}

                <div
                    className="
                        border-t
                        border-green-700
                        p-4
                    "
                >
                    <button
                        type="button"
                        onClick={handleLogout}
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