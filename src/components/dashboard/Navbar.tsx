import { Bell, Menu, Search, AlertTriangle } from "lucide-react";

import { useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useBooking } from "../../context/BookingContext";

import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";

import { buildNocNotificationItems } from "../../utils/nocNotificationAdapter";

// ======================================================
// Types
// ======================================================

interface NavbarProps {
  onMenuClick?: () => void;
}

interface NotificationItem {
  id: string;

  bookingId: string;

  customerName: string;

  flatNumber: string;

  type: "requisition" | "agreement" | "tripartite" | "noc";
  title: string;

  status: string;
}

// ======================================================
// Navbar
// ======================================================

function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();

  const { bookings } = useBooking();
  const { notifications: backendNotifications } = useNotifications();

  const { user } = useAuth();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isNotificationsOpen) {
      return;
    }

    const handleOutsideClick = (event: PointerEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isNotificationsOpen]);

  // ======================================================
  // Current Logged-In User
  // ======================================================

  const displayName = user?.name?.trim() || "User";

  const displayRole =
    user?.role?.trim() ||
    (user?.userType === "ADMIN" ? "Administrator" : "Employee");

  const avatarLetter = displayName.charAt(0).toUpperCase() || "U";

  // ======================================================
  // Build Notifications
  // ======================================================

  const notifications: NotificationItem[] = [];

  bookings.forEach((booking) => {
    // ==============================================
    // Requisition Letter
    // ==============================================

    const requisitionStatus =
      booking.documents?.requisitionLetter?.status ?? "pending";

    if (requisitionStatus !== "given" && requisitionStatus !== "completed") {
      notifications.push({
        id: `${booking.id}-requisition`,

        bookingId: booking.id,

        customerName: booking.customerName,

        flatNumber: booking.flatNumber,

        type: "requisition",

        title: "Requisition Letter Pending",

        status: requisitionStatus,
      });
    }

    // ==============================================
    // Agreement To Sell
    // ==============================================

    const agreementStatus =
      booking.documents?.agreementToSell?.status ?? "pending";

    if (agreementStatus !== "given" && agreementStatus !== "completed") {
      notifications.push({
        id: `${booking.id}-agreement`,

        bookingId: booking.id,

        customerName: booking.customerName,

        flatNumber: booking.flatNumber,

        type: "agreement",

        title: "Agreement to Sell Pending",

        status: agreementStatus,
      });
    }

    // ==============================================
    // Tripartite Agreement
    // ==============================================

    const tripartite = booking.documents?.tripartiteAgreement;

    const tripartiteRequired = tripartite?.required === true;

    const tripartiteStatus = tripartite?.document?.status ?? "pending";

    if (tripartiteRequired && tripartiteStatus !== "completed") {
      notifications.push({
        id: `${booking.id}-tripartite`,

        bookingId: booking.id,

        customerName: booking.customerName,

        flatNumber: booking.flatNumber,

        type: "tripartite",

        title: "Tripartite Agreement Pending",

        status: tripartiteStatus,
      });
    }
  });
  const nocNotifications = buildNocNotificationItems(
    backendNotifications,
    bookings,
  );

  notifications.push(...nocNotifications);

  // ======================================================
  // Notification Count
  // ======================================================

  const notificationCount = notifications.length;

  // ======================================================
  // View Booking
  // ======================================================

  const handleViewBooking = (bookingId: string) => {
    setIsNotificationsOpen(false);

    navigate(`/bookings?bookingId=${bookingId}`);
  };

  // ======================================================
  // Notification Icon
  // ======================================================

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "requisition":
        return <AlertTriangle size={20} className="text-orange-600" />;

      case "agreement":
        return <AlertTriangle size={20} className="text-yellow-600" />;

      case "tripartite":
        return <AlertTriangle size={20} className="text-blue-600" />;

      default:
        return <AlertTriangle size={20} className="text-yellow-600" />;
    }
  };

  // ======================================================
  // Notification Background
  // ======================================================

  const getNotificationBackground = (type: NotificationItem["type"]) => {
    switch (type) {
      case "requisition":
        return "bg-orange-100 dark:bg-orange-950/60";

      case "agreement":
        return "bg-yellow-100 dark:bg-yellow-950/60";

      case "tripartite":
        return "bg-blue-100 dark:bg-blue-950/60";

      default:
        return "bg-yellow-100 dark:bg-yellow-950/60";
    }
  };

  // ======================================================
  // Component
  // ======================================================

  return (
    <header
      className="
    relative
    z-[100]
    flex
    h-16
    w-full
    min-w-0
    items-center
    justify-between
    gap-2
    border-b
    bg-white
    dark:border-gray-800
    dark:bg-gray-900
    px-3
    sm:h-20
    sm:px-4
    md:px-5
    lg:px-6
"
    >
      {/* ==============================================
                LEFT SECTION
            ============================================== */}

      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {/* Mobile Menu */}

        <button
          type="button"
          onClick={onMenuClick}
          className="
                        rounded-lg
                        p-2
                        text-gray-700
                        hover:bg-gray-100
                        dark:text-gray-200
                        dark:hover:bg-gray-800
                        lg:hidden
                    "
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Brand */}

        <div className="min-w-0">
          <h1
            className="
        truncate
        text-base
        font-bold
        text-gray-800
        dark:text-gray-100
        sm:text-lg
        md:text-xl
        lg:text-2xl
    "
          >
            Emerald Heights
            <span className="hidden sm:inline"> CRM</span>
          </h1>

          <p
            className="
        hidden
        truncate
        text-xs
        text-gray-500
        dark:text-gray-400
        md:block
        lg:text-sm
    "
          >
            Inventory Management System
          </p>
        </div>
      </div>

      {/* ==============================================
                RIGHT SECTION
            ============================================== */}

      <div
        className="
    flex
    shrink-0
    items-center
    gap-1
    sm:gap-2
    md:gap-3
    lg:gap-5
"
      >
        {/* ==========================================
                    SEARCH
                ========================================== */}

        <div
          className="
    hidden
    min-w-0
    items-center
    rounded-lg
    bg-gray-100
    dark:bg-gray-800
    px-3
    py-2
    md:flex
    md:w-40
    lg:w-60
"
        >
          <Search size={18} className="text-gray-500 dark:text-gray-400" />

          <input
            type="text"
            placeholder="Search..."
            className="
    ml-2
    min-w-0
    flex-1
    bg-transparent
    text-sm
    text-gray-900
    placeholder:text-gray-500
    outline-none
    dark:text-gray-100
    dark:placeholder:text-gray-400
"
          />
        </div>

        {/* ==========================================
                    NOTIFICATIONS
                ========================================== */}

        <div ref={notificationRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((previous) => !previous)}
            className="
                            relative
                            z-[110]
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-lg
                            hover:bg-gray-100
                            dark:hover:bg-gray-800
                        "
            aria-label="Notifications"
            aria-expanded={isNotificationsOpen}
          >
            <Bell size={22} className="text-gray-700 dark:text-gray-200" />

            {notificationCount > 0 && (
              <span
                className="
                                    absolute
                                    -right-1
                                    -top-1
                                    flex
                                    h-5
                                    min-w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-red-500
                                    px-1
                                    text-[10px]
                                    font-bold
                                    text-white
                                "
              >
                {notificationCount}
              </span>
            )}
          </button>

          {/* ======================================
                        NOTIFICATION DROPDOWN
                    ====================================== */}

          {isNotificationsOpen && (
            <div
              className="
    fixed
    left-2
    right-2
    top-[68px]
    z-[9999]
    overflow-hidden
    rounded-xl
    border
    border-gray-200
    bg-white
    shadow-2xl
    dark:border-gray-700
    dark:bg-gray-900
    sm:absolute
    sm:left-auto
    sm:right-0
    sm:top-12
    sm:w-[360px]
"
            >
              {/* Header */}

              <div
                className="
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    border-gray-200
                                    px-4
                                    dark:border-gray-700
                                    py-3
                                "
              >
                <div>
                  <h3
                    className="
                                            font-semibold
                                            text-gray-800
                                            dark:text-gray-100
                                        "
                  >
                    Notifications
                  </h3>

                  <p
                    className="
                                            text-xs
                                            text-gray-500
                                            dark:text-gray-400
                                        "
                  >
                    {notificationCount} pending item
                    {notificationCount !== 1 ? "s" : ""}
                  </p>
                </div>

                <Bell size={18} className="text-gray-500 dark:text-gray-400" />
              </div>

              {/* ==================================
                                NO NOTIFICATIONS
                            ================================== */}

              {notificationCount === 0 ? (
                <div
                  className="
                                        px-4
                                        py-8
                                        text-center
                                    "
                >
                  <div
                    className="
                                            mx-auto
                                            mb-3
                                            flex
                                            h-12
                                            w-12
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-green-100
                                            dark:bg-green-950/60
                                        "
                  >
                    <Bell size={22} className="text-green-600" />
                  </div>

                  <p
                    className="
                                            font-medium
                                            text-gray-700
                                            dark:text-gray-200
                                        "
                  >
                    All caught up
                  </p>

                  <p
                    className="
                                            mt-1
                                            text-sm
                                            text-gray-500
                                            dark:text-gray-400
                                        "
                  >
                    No pending documents.
                  </p>
                </div>
              ) : (
                <div
                  className="
    max-h-[calc(100dvh-180px)]
    overflow-y-auto
    sm:max-h-[420px]
  "
                >
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="
                                                    border-b
                                                    border-gray-100
                                                    last:border-b-0
                                                    dark:border-gray-800
                                                "
                    >
                      <div
                        className="
                                                        flex
                                                        gap-3
                                                        px-4
                                                        py-4
                                                    "
                      >
                        {/* Icon */}

                        <div
                          className={`
                                                            flex
                                                            h-10
                                                            w-10
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-full

                                                            ${getNotificationBackground(
                                                              notification.type,
                                                            )}
                                                        `}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}

                        <div
                          className="
                                                            min-w-0
                                                            flex-1
                                                        "
                        >
                          <p
                            className="
                                                                font-semibold
                                                                text-gray-800
                                                                dark:text-gray-100
                                                            "
                          >
                            {notification.title}
                          </p>

                          <p
                            className="
                                                                mt-1
                                                                text-sm
                                                                text-gray-600
                                                                dark:text-gray-300
                                                            "
                          >
                            Customer:{" "}
                            <span
                              className="
                                                                    font-medium
                                                                "
                            >
                              {notification.customerName}
                            </span>
                          </p>

                          <p
                            className="
                                                                text-sm
                                                                text-gray-600
                                                                dark:text-gray-300
                                                            "
                          >
                            Flat:{" "}
                            <span
                              className="
                                                                    font-medium
                                                                "
                            >
                              {notification.flatNumber}
                            </span>
                          </p>

                          <p
                            className="
                                                                mt-1
                                                                text-xs
                                                                text-gray-500
                                                                dark:text-gray-400
                                                            "
                          >
                            Status:{" "}
                            <span
                              className="
                                                                    font-semibold
                                                                    capitalize
                                                                "
                            >
                              {notification.status}
                            </span>
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              handleViewBooking(notification.bookingId)
                            }
                            className="
                                                                mt-3
                                                                rounded-lg
                                                                bg-green-600
                                                                px-3
                                                                py-1.5
                                                                text-xs
                                                                font-medium
                                                                text-white
                                                                hover:bg-green-700
                                                            "
                          >
                            View Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ==========================================
                    CURRENT USER
                ========================================== */}

        <div
          className="
                        flex
                        items-center
                        gap-3
                    "
        >
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
                            text-white
                        "
          >
            {avatarLetter}
          </div>

          <div className="hidden sm:block">
            <h3
              className="
                                font-semibold
                                text-gray-800
                                dark:text-gray-100
                            "
            >
              {displayName}
            </h3>

            <p
              className="
                                text-xs
                                text-gray-500
                                dark:text-gray-400
                            "
            >
              {displayRole}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;