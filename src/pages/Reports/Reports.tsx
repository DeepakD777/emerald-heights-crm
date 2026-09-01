import { useEffect, useMemo, useRef, useState } from "react";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  FileSpreadsheet,
  UserRound,
  XCircle,
} from "lucide-react";

import { useBooking } from "../../context/BookingContext";

import { useAuth } from "../../context/AuthContext";

import BookingDetailsModal from "../../components/dashboard/BookingDetailsModal";
import ProjectExcelExportModal from "../../components/dashboard/ProjectExcelExportModal";
import InstallmentExcelExportModal from "../../components/dashboard/InstallmentExcelExportModal";
// ======================================================
// Helpers
// ======================================================

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  });
};

// ======================================================
// Status Classes
// ======================================================

const getStatusClasses = (status: string | undefined) => {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "booked") {
    return "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300";
  }

  if (normalized === "cancelled") {
    return "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300";
  }

  if (normalized === "completed") {
    return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";
  }

  return "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300";
};

// ======================================================
// Status Label
// ======================================================

const getStatusLabel = (status: string | undefined) => {
  const normalized = String(status ?? "Pending")
    .trim()
    .toLowerCase();

  if (normalized === "cancelled") {
    return "CANCELLED";
  }

  if (normalized === "booked") {
    return "BOOKED";
  }

  if (normalized === "completed") {
    return "COMPLETED";
  }

  if (normalized === "pending") {
    return "PENDING";
  }

  return String(status ?? "Pending").toUpperCase();
};

// ======================================================
// Reports
// ======================================================

function Reports() {
  const { bookings, permanentlyDeleteBooking } = useBooking();

  const { isAdmin } = useAuth();

  const cancelledTableScrollRef = useRef<HTMLDivElement | null>(null);
  const cancelledFloatingScrollRef = useRef<HTMLDivElement | null>(null);

  const [cancelledFloatingScrollbar, setCancelledFloatingScrollbar] = useState({
    visible: false,
    left: 0,
    width: 0,
    contentWidth: 0,
  });

  // ==================================================
  // Booking Details
  // ==================================================

  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExcelExportOpen, setIsExcelExportOpen] = useState(false);
  const [isInstallmentExportOpen, setIsInstallmentExportOpen] = useState(false);

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);

    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);

    setSelectedBooking(null);
  };
  const handleOpenExcelExport = () => {
    if (!isAdmin) {
      return;
    }

    setIsExcelExportOpen(true);
  };

  // ==================================================
  // Permanent Delete
  // Reports page only
  // ==================================================

  const handlePermanentDelete = async (booking: any) => {
    if (!isAdmin) {
      return;
    }

    const bookingReference =
      booking.bookingCode || booking.flatNumber || "this booking";

    const confirmed = window.confirm(
      `Permanently delete booking ${bookingReference}?\n\nThis booking will be removed permanently from Reports and cannot be recovered.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await permanentlyDeleteBooking(booking.id);

      if (selectedBooking?.id === booking.id) {
        handleCloseDetails();
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete booking",
      );
    }
  };

  // ==================================================
  // Price Groups
  // ==================================================

  const priceGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        amount: number;

        bookings: typeof bookings;
      }
    >();

    bookings.forEach((booking) => {
      const amount = Number(
        String(booking.bookingAmount || "")
          .replace(/₹/g, "")
          .replace(/,/g, "")
          .trim(),
      );

      const safeAmount = Number.isFinite(amount) ? amount : 0;

      const key = String(safeAmount);

      if (!groups.has(key)) {
        groups.set(key, {
          amount: safeAmount,

          bookings: [],
        });
      }

      groups.get(key)!.bookings.push(booking);
    });

    return Array.from(groups.values()).sort((a, b) => b.amount - a.amount);
  }, [bookings]);

  // ==================================================
  // Cancelled Booking History
  // ==================================================

  const cancelledBookings = useMemo(() => {
    return bookings
      .filter(
        (booking) =>
          String(booking.status ?? "")
            .trim()
            .toLowerCase() === "cancelled",
      )
      .sort((a, b) => {
        const aTime = a.cancelledAt ? new Date(a.cancelledAt).getTime() : 0;

        const bTime = b.cancelledAt ? new Date(b.cancelledAt).getTime() : 0;

        return bTime - aTime;
      });
  }, [bookings]);

  // ==================================================
  // Cancelled History Floating Horizontal Scrollbar
  // ==================================================

  useEffect(() => {
    const tableScroll = cancelledTableScrollRef.current;
    const floatingScroll = cancelledFloatingScrollRef.current;

    if (!tableScroll || !floatingScroll) {
      return;
    }

    let syncing = false;

    const syncFloatingFromTable = () => {
      if (syncing) {
        return;
      }

      syncing = true;
      floatingScroll.scrollLeft = tableScroll.scrollLeft;

      requestAnimationFrame(() => {
        syncing = false;
      });
    };

    const syncTableFromFloating = () => {
      if (syncing) {
        return;
      }

      syncing = true;
      tableScroll.scrollLeft = floatingScroll.scrollLeft;

      requestAnimationFrame(() => {
        syncing = false;
      });
    };

    const updateFloatingScrollbar = () => {
      const rect = tableScroll.getBoundingClientRect();

      const hasHorizontalOverflow =
        tableScroll.scrollWidth > tableScroll.clientWidth + 1;

      const isTableVisible =
        rect.top < window.innerHeight - 16 && rect.bottom > 16;

      const left = Math.max(rect.left, 0);
      const width = Math.max(
        0,
        Math.min(rect.width, window.innerWidth - left),
      );

      setCancelledFloatingScrollbar((current) => {
        const next = {
          visible: hasHorizontalOverflow && isTableVisible,
          left,
          width,
          contentWidth: tableScroll.scrollWidth,
        };

        if (
          current.visible === next.visible &&
          current.left === next.left &&
          current.width === next.width &&
          current.contentWidth === next.contentWidth
        ) {
          return current;
        }

        return next;
      });
    };

    tableScroll.addEventListener("scroll", syncFloatingFromTable, {
      passive: true,
    });

    floatingScroll.addEventListener("scroll", syncTableFromFloating, {
      passive: true,
    });

    window.addEventListener("scroll", updateFloatingScrollbar, {
      passive: true,
    });

    window.addEventListener("resize", updateFloatingScrollbar);

    const resizeObserver = new ResizeObserver(updateFloatingScrollbar);

    resizeObserver.observe(tableScroll);

    const tableElement = tableScroll.firstElementChild;

    if (tableElement instanceof HTMLElement) {
      resizeObserver.observe(tableElement);
    }

    requestAnimationFrame(() => {
      updateFloatingScrollbar();
      syncFloatingFromTable();
    });

    return () => {
      tableScroll.removeEventListener("scroll", syncFloatingFromTable);
      floatingScroll.removeEventListener("scroll", syncTableFromFloating);
      window.removeEventListener("scroll", updateFloatingScrollbar);
      window.removeEventListener("resize", updateFloatingScrollbar);
      resizeObserver.disconnect();
    };
  }, [cancelledBookings.length, isAdmin]);

  // ==================================================
  // Open Price Groups
  // ==================================================

  const [openPrices, setOpenPrices] = useState<Record<string, boolean>>({});

  const togglePrice = (amount: number) => {
    const key = String(amount);

    setOpenPrices((previous) => ({
      ...previous,

      [key]: !previous[key],
    }));
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      <div className="min-w-0 space-y-4 sm:space-y-5 lg:space-y-6">
        {/* ==================================================
                    Header
                ================================================== */}

        <div className="flex min-w-0 flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl lg:text-3xl">
              Booking Reports
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Booking summary, customer details and cancellation history
            </p>
          </div>
          {isAdmin && (
            <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 md:w-auto">
              <button
                type="button"
                onClick={handleOpenExcelExport}
                className="inline-flex w-full items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
              >
                <FileSpreadsheet size={18} />
                Export Project Excel
              </button>

              <button
                type="button"
                onClick={() => setIsInstallmentExportOpen(true)}
                className="inline-flex w-full items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
              >
                <FileSpreadsheet size={18} />
                Export Installment Report
              </button>
            </div>
          )}
        </div>

        {/* ==================================================
                    Summary Cards
                ================================================== */}

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {/* Total Bookings */}

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>

                <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100 sm:text-3xl">
                  {bookings.length}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  All recorded bookings
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300">
                <CalendarDays size={28} />
              </div>
            </div>
          </div>

          {/* Different Prices */}

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Different Booking Prices
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100 sm:text-3xl">
                  {priceGroups.length}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Unique booking amounts
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-300">
                <BarChart3 size={28} />
              </div>
            </div>
          </div>

          {/* Cancelled Bookings */}

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled Bookings</p>

               <h2 className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400 sm:text-3xl">
                  {cancelledBookings.length}
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Preserved cancellation records
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300">
                <XCircle size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
                    Cancelled Booking History
                ================================================== */}

       <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5 lg:p-6">
       <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
           <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Cancelled Booking History
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Complete history of cancelled bookings with assigned sales
                member
              </p>
            </div>

            <div className="inline-flex w-fit items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {cancelledBookings.length}{" "}
              {cancelledBookings.length === 1
                ? "Cancellation"
                : "Cancellations"}
            </div>
          </div>

          {cancelledBookings.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                <XCircle size={26} />
              </div>

              <p className="mt-4 font-medium text-gray-700 dark:text-gray-300">
                No cancelled bookings found
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Cancelled booking records will appear here
              </p>
            </div>
          ) : (
           <div
              ref={cancelledTableScrollRef}
              className="
                min-w-0
                max-w-full
                overflow-x-auto
                [scrollbar-width:none]
                [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <table className="w-full min-w-[1700px] border-collapse text-sm text-gray-700 dark:text-gray-200">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-950/70">
                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Booking Code
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Mobile
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Unit
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Tower
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Floor
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Booking Date
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Cancelled At
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Assigned Sales Member
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {cancelledBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-red-50/40 dark:border-gray-800 dark:hover:bg-red-950/20"
                    >
                      {/* Booking Code */}

                      <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {booking.bookingCode || "-"}
                      </td>

                      {/* Customer */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                            <UserRound size={18} />
                          </div>

                          <span className="font-medium text-gray-800 dark:text-gray-100">
                            {booking.customerName || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Mobile */}

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {booking.mobile || "-"}
                      </td>

                      {/* Unit */}

                      <td className="px-5 py-4 font-semibold text-gray-800 dark:text-gray-100">
                        {booking.flatNumber || "-"}
                      </td>

                      {/* Tower */}

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {booking.tower || "-"}
                      </td>

                      {/* Floor */}

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {booking.floor ?? "-"}
                      </td>

                      {/* Booking Date */}

                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {booking.bookingDate || "-"}
                      </td>

                      {/* Cancelled At */}

                      <td className="px-5 py-4 text-sm font-medium text-red-700 dark:text-red-300">
                        {formatDateTime(booking.cancelledAt)}
                      </td>

                      {/* Employee */}

                      <td className="px-5 py-4">
                        {booking.assignedEmployee?.name ? (
                          <div>
                            <p className="font-medium text-gray-800 dark:text-gray-100">
                              {booking.assignedEmployee?.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {booking.assignedEmployee?.role?.replace(
                                /_/g,
                                " ",
                              ) || ""}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Status */}

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                          CANCELLED
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleViewDetails(booking)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            View Details
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete(booking)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                            >
                              Delete Booking
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div
            ref={cancelledFloatingScrollRef}
            aria-hidden="true"
            className="
              fixed
              bottom-2
              z-[80]
              h-4
              overflow-x-auto
              overflow-y-hidden
              border
              border-gray-200
              bg-white
              shadow-md
              dark:border-gray-700
              dark:bg-gray-900
            "
            style={{
              left: `${cancelledFloatingScrollbar.left}px`,
              width: `${cancelledFloatingScrollbar.width}px`,
              visibility: cancelledFloatingScrollbar.visible
                ? "visible"
                : "hidden",
              pointerEvents: cancelledFloatingScrollbar.visible
                ? "auto"
                : "none",
            }}
          >
            <div
              style={{
                width: `${cancelledFloatingScrollbar.contentWidth}px`,
                height: "1px",
              }}
            />
          </div>
        </div>

        {/* ==================================================
                    Price-wise Booking Summary
                ================================================== */}

     <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-5 lg:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              Price-wise Booking Summary
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              View bookings and customer details for each booking price
            </p>
          </div>

          {priceGroups.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              No bookings found
            </div>
          ) : (
            <div className="space-y-4">
              {priceGroups.map((group) => {
                const isOpen = openPrices[String(group.amount)] ?? false;

                return (
                  <div
                    key={String(group.amount)}
                    className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    {/* Price Header */}

                    <button
                      type="button"
                      onClick={() => togglePrice(group.amount)}
                      className="flex w-full items-center justify-between bg-gray-50 px-5 py-4 text-left transition hover:bg-gray-100 dark:bg-gray-950/70 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-300">
                          <IndianRupee size={22} />
                        </div>

                        <div>
                          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
                            ₹{group.amount.toLocaleString("en-IN")}
                          </p>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {group.bookings.length}{" "}
                            {group.bookings.length === 1
                              ? "Booking"
                              : "Bookings"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <span className="hidden text-sm md:block">
                          {isOpen ? "Hide Details" : "View Details"}
                        </span>

                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </button>

                    {/* Individual Booking Details */}

                    {isOpen && (
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[1250px] text-gray-700 dark:text-gray-200">
                            <thead>
                              <tr className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Customer
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Mobile
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Unit
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Floor
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Payment
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Date
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Sales Member
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Status
                                </th>

                                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                                  Actions
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {group.bookings.map((booking) => (
                                <tr
                                  key={booking.id}
                                  className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                >
                                  {/* Customer */}

                                  <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                                        <UserRound size={18} />
                                      </div>

                                      <span className="font-medium text-gray-800 dark:text-gray-100">
                                        {booking.customerName || "-"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Mobile */}

                                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {booking.mobile || "-"}
                                  </td>

                                  {/* Unit */}

                                  <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-100">
                                    {booking.flatNumber || "-"}
                                  </td>

                                  {/* Floor */}

                                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {booking.floor ?? "-"}
                                  </td>

                                  {/* Payment */}

                                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {booking.paymentMode || "-"}
                                  </td>

                                  {/* Date */}

                                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {booking.bookingDate || "-"}
                                  </td>

                                  {/* Sales Member */}

                                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                                    {booking.assignedEmployee?.name ||
                                      "Unassigned"}
                                  </td>

                                  {/* Status */}

                                  <td className="px-5 py-4">
                                    <span
                                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                        booking.status,
                                      )}`}
                                    >
                                      {getStatusLabel(booking.status)}
                                    </span>
                                  </td>

                                  {/* Actions */}

                                  <td className="px-5 py-4">
                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleViewDetails(booking)
                                        }
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-800"
                                      >
                                        View Details
                                      </button>

                                      {isAdmin && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handlePermanentDelete(booking)
                                          }
                                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
                Booking Details - Reports Read Only
            ================================================== */}
      {isAdmin && (
        <>
          <ProjectExcelExportModal
            isOpen={isExcelExportOpen}
            onClose={() => setIsExcelExportOpen(false)}
            bookings={bookings}
          />

          <InstallmentExcelExportModal
            isOpen={isInstallmentExportOpen}
            onClose={() => setIsInstallmentExportOpen(false)}
            bookings={bookings}
          />
        </>
      )}
      <BookingDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        booking={selectedBooking}
        readOnly={true}
        onUpdate={() => {
          // Reports view is intentionally read-only.
        }}
      />
    </>
  );
}

export default Reports;