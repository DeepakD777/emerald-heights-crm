import { useEffect, useMemo, useRef, useState } from "react";

import { Building2, Home } from "lucide-react";

import { useSearchParams } from "react-router-dom";

import { useBooking } from "../../context/BookingContext";

import { useAuth } from "../../context/AuthContext";

import BookingDetailsModal from "./BookingDetailsModal";
import BookingModal from "./BookingModal";

// ======================================================
// Types
// ======================================================

type BookingSection = "RESIDENTIAL" | "COMMERCIAL";

// ======================================================
// Document Status Badge
// ======================================================

function DocumentStatusBadge({
  status,
}: {
  status:
    | "pending"
    | "generated"
    | "uploaded"
    | "given"
    | "completed"
    | "not-required";
}) {
  if (status === "given") {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
        Given
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
        Completed
      </span>
    );
  }

  if (status === "not-required") {
    return (
      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
        Not Required
      </span>
    );
  }

  if (status === "generated") {
    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
        Generated
      </span>
    );
  }

  if (status === "uploaded") {
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
        Uploaded
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300">
      Pending
    </span>
  );
}

// ======================================================
// Amount Mode Badge
// ======================================================

function RemainingModeBadge({ mode }: { mode?: "AUTO" | "MANUAL" }) {
  if (mode === "MANUAL") {
    return (
      <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
        Manual
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
      Auto
    </span>
  );
}

// ======================================================
// Finance Type Badge
// ======================================================

function FinanceTypeBadge({ type }: { type?: "FINANCE" | "CASH" | null }) {
  if (type === "FINANCE") {
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
        Finance
      </span>
    );
  }

  if (type === "CASH") {
    return (
      <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
        Cash
      </span>
    );
  }

  return <span className="text-sm text-gray-400 dark:text-gray-500">-</span>;
}

// ======================================================
// Amount Formatter
// ======================================================

const formatAmount = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "₹0";
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return `₹${value}`;
  }

  return `₹${parsed.toLocaleString("en-IN")}`;
};
const getInstallmentDisplayName = (sequence: number | null | undefined) => {
  if (sequence === 1) {
    return "Booking Amount";
  }

  if (typeof sequence === "number" && sequence > 1) {
    return `Installment ${sequence - 1}`;
  }

  return "-";
};

// ======================================================
// Bookings
// ======================================================

function Bookings() {
  const { bookings, updateBooking, deleteBooking, loading, error } =
    useBooking();

  const { isAdmin } = useAuth();

  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [activeSection, setActiveSection] =
    useState<BookingSection>("RESIDENTIAL");

  const [searchParams, setSearchParams] = useSearchParams();

  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const floatingScrollRef = useRef<HTMLDivElement | null>(null);

  const [floatingScrollbar, setFloatingScrollbar] = useState({
    visible: false,
    left: 0,
    width: 0,
    contentWidth: 0,
  });

  // ==================================================
  // Clear Booking Query Parameter
  // ==================================================

  const clearBookingQueryParam = () => {
    if (!searchParams.has("bookingId")) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("bookingId");

    setSearchParams(nextParams, {
      replace: true,
    });
  };

  // ==================================================
  // Open Booking From URL
  // ==================================================

  useEffect(() => {
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return;
    }

    const booking = bookings.find((item) => item.id === bookingId);

    if (!booking) {
      return;
    }

    if (booking.propertyType === "COMMERCIAL") {
      setActiveSection("COMMERCIAL");
    } else if (booking.propertyType === "RESIDENTIAL") {
      setActiveSection("RESIDENTIAL");
    }

    setSelectedBooking(booking);

    setIsDetailsOpen(true);
  }, [searchParams, bookings]);

  // ==================================================
  // Keep Selected Booking Synced
  // ==================================================

  useEffect(() => {
    if (!selectedBooking?.id) {
      return;
    }

    const latestBooking = bookings.find(
      (item) => item.id === selectedBooking.id,
    );

    if (latestBooking) {
      setSelectedBooking(latestBooking);
    }
  }, [bookings, selectedBooking?.id]);

  // ==================================================
  // Counts
  // ==================================================

  const residentialCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          !booking.archivedAt && booking.propertyType === "RESIDENTIAL",
      ).length,
    [bookings],
  );

  const commercialCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          !booking.archivedAt && booking.propertyType === "COMMERCIAL",
      ).length,
    [bookings],
  );

  // ==================================================
  // Filter By Section + Search
  // ==================================================

  const filteredBookings = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (booking.archivedAt) {
        return false;
      }

      if (booking.propertyType !== activeSection) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      return (
        String(booking.flatNumber ?? "")
          .toLowerCase()
          .includes(searchText) ||
        String(booking.customerName ?? "")
          .toLowerCase()
          .includes(searchText) ||
        String(booking.mobile ?? "")
          .toLowerCase()
          .includes(searchText) ||
        String(booking.bookingCode ?? "")
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [bookings, activeSection, search]);

  // ==================================================
  // Floating Horizontal Table Scrollbar
  // ==================================================

  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    const floatingScroll = floatingScrollRef.current;

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

      setFloatingScrollbar((current) => {
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
  }, [activeSection, filteredBookings.length, isAdmin]);

  // ==================================================
  // Change Section
  // ==================================================

  const handleSectionChange = (section: BookingSection) => {
    setActiveSection(section);

    setSearch("");
  };

  // ==================================================
  // Update Booking
  // ==================================================

  const handleUpdateBooking = async (updatedBooking: any) => {
    if (!isAdmin) {
      alert(
        "View only access — booking changes can only be made by an administrator.",
      );

      return;
    }

    try {
      await updateBooking(updatedBooking);

      setSelectedBooking(updatedBooking);

      setIsBookingModalOpen(false);
    } catch (error) {
      console.error("Booking update failed:", error);

      alert(
        error instanceof Error ? error.message : "Failed to update booking",
      );
    }
  };

  // ==================================================
  // Delete Booking
  // ==================================================

  const handleDeleteBooking = async (id: string) => {
    if (!isAdmin) {
      alert(
        "View only access — bookings can only be deleted by an administrator.",
      );

      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteBooking(id);

      if (selectedBooking?.id === id) {
        setSelectedBooking(null);

        setIsDetailsOpen(false);

        setIsBookingModalOpen(false);

        clearBookingQueryParam();
      }
    } catch (error) {
      console.error("Booking delete failed:", error);

      alert(
        error instanceof Error ? error.message : "Failed to delete booking",
      );
    }
  };

  // ==================================================
  // Open View Modal
  // ==================================================

  const handleOpenDetails = (booking: any) => {
    setIsBookingModalOpen(false);

    setSelectedBooking(booking);

    setIsDetailsOpen(true);
  };

  // ==================================================
  // Close View Modal
  // ==================================================

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);

    clearBookingQueryParam();
  };

  // ==================================================
  // Open Edit Modal
  // ==================================================

  const handleOpenEdit = (booking: any) => {
    if (!isAdmin) {
      return;
    }

    clearBookingQueryParam();

    setIsDetailsOpen(false);

    setSelectedBooking(booking);

    setIsBookingModalOpen(true);
  };

  // ==================================================
  // Close Edit Modal
  // ==================================================

  const handleCloseEdit = () => {
    setIsBookingModalOpen(false);
  };

  // ==================================================
  // Loading
  // ==================================================

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow dark:bg-gray-900 sm:p-8 lg:p-10">
        <div className="text-center text-gray-500 dark:text-gray-400">Loading bookings...</div>
      </div>
    );
  }

  // ==================================================
  // Dynamic Labels
  // ==================================================

  const unitLabel = activeSection === "RESIDENTIAL" ? "Flat" : "Shop";

  const emptyLabel =
    activeSection === "RESIDENTIAL"
      ? "No Residential Bookings Found"
      : "No Commercial Bookings Found";

  // ==================================================
  // Return
  // ==================================================

  return (
    <>
      <div
        className="
          min-w-0
          rounded-2xl
          bg-white
          dark:bg-gray-900
          p-4
          shadow
          sm:p-5
          lg:p-6
        "
      >
        {/* ======================================
                    Header
                ====================================== */}

        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-5 sm:gap-4 lg:mb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl lg:text-3xl">
              Bookings
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage residential and commercial booking records.
            </p>

            {!isAdmin && (
              <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                View only access
              </p>
            )}
          </div>

          <input
            type="text"
            placeholder={`Search ${unitLabel}, customer, mobile or booking code...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="
    w-full
    min-w-0
    rounded-xl
    border
    border-gray-300
    bg-white
    px-3
    py-2.5
    text-sm
    text-gray-900
    outline-none
    transition
    placeholder:text-gray-400
    focus:border-green-600
    focus:ring-2
    focus:ring-green-100
    dark:border-gray-700
    dark:bg-gray-950
    dark:text-gray-100
    dark:placeholder:text-gray-500
    dark:focus:ring-green-900/50
    sm:px-4
    lg:w-[380px]
"
          />
        </div>

        {/* ======================================
                    Residential / Commercial Tabs
                ====================================== */}

        <div
          className="
    mb-4
    grid
    min-w-0
    grid-cols-2
    gap-1.5
    rounded-2xl
    bg-gray-100
    dark:bg-gray-800
    p-1.5
    sm:mb-6
    sm:inline-grid
    sm:min-w-[460px]
    sm:gap-2
"
        >
          <button
            type="button"
            onClick={() => handleSectionChange("RESIDENTIAL")}
            className={`
                            flex
                            items-center
                            justify-center
                         gap-1.5
rounded-xl
px-2
py-2.5
text-xs
sm:gap-2
sm:px-4
sm:py-3
sm:text-sm
                            font-semibold
                            transition
                            ${
                              activeSection === "RESIDENTIAL"
                                ? "bg-white text-green-700 shadow-sm dark:bg-gray-900 dark:text-green-300"
                                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            }
                        `}
          >
            <Home size={18} />
            Residential
            <span
              className={`
                                rounded-full
                                px-2
                                py-0.5
                                text-xs
                                ${
                                  activeSection === "RESIDENTIAL"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                }
                            `}
            >
              {residentialCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSectionChange("COMMERCIAL")}
            className={`
                            flex
                            items-center
                            justify-center
                         gap-1.5
rounded-xl
px-2
py-2.5
text-xs
sm:gap-2
sm:px-4
sm:py-3
sm:text-sm
                            font-semibold
                            transition
                            ${
                              activeSection === "COMMERCIAL"
                                ? "bg-white text-green-700 shadow-sm dark:bg-gray-900 dark:text-green-300"
                                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            }
                        `}
          >
            <Building2 size={18} />
            Commercial
            <span
              className={`
                                rounded-full
                                px-2
                                py-0.5
                                text-xs
                                ${
                                  activeSection === "COMMERCIAL"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                                    : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                }
                            `}
            >
              {commercialCount}
            </span>
          </button>
        </div>

        {/* ======================================
                    API Error
                ====================================== */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </div>
        )}

        {/* ======================================
                    Table
                ====================================== */}

        <div
          ref={tableScrollRef}
          className="
            w-full
            min-w-0
            overflow-x-auto
            overscroll-x-contain
            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          <table className="w-full min-w-[1700px] border-collapse text-sm text-gray-700 dark:text-gray-200">
            <thead className="[&_th]:whitespace-nowrap">
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">{unitLabel}</th>
                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Floor</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Customer</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Mobile</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Booking Amount</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Remaining Amount</th>
                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Current Installment</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Calculation</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Finance Type</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Booking Date</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Agreement to Sell</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Tripartite Agreement</th>

                <th className="border border-gray-200 p-3 text-center dark:border-gray-700">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={13}
                    className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 sm:p-8 lg:p-10"
                  >
                    {emptyLabel}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const agreementStatus =
                    booking.documents?.agreementToSell?.status || "pending";

                  const tripartite = booking.documents?.tripartiteAgreement;

                  const tripartiteStatus = tripartite?.required
                    ? tripartite.document?.status === "completed"
                      ? "completed"
                      : "pending"
                    : "not-required";
                  const currentInstallment =
                    booking.installmentSummary?.currentInstallment ?? null;

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="border border-gray-200 p-3 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100">
                        {booking.flatNumber || "-"}
                      </td>
                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        {booking.floor === 0
                          ? "Ground Floor"
                          : `Floor ${booking.floor ?? "-"}`}
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        <div className="font-medium">
                          {booking.customerName || "-"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {booking.floor === 0
                            ? "Ground Floor"
                            : `Floor: ${booking.floor ?? "-"}`}
                        </div>
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">{booking.mobile || "-"}</td>

                      <td className="border border-gray-200 p-3 font-semibold dark:border-gray-700 dark:text-gray-100">
                        {formatAmount(booking.bookingAmount)}
                      </td>

                      <td className="border border-gray-200 p-3 font-semibold dark:border-gray-700 dark:text-gray-100">
                        {booking.remainingAmount
                          ? formatAmount(booking.remainingAmount)
                          : "-"}
                      </td>
                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        {currentInstallment ? (
                          <div className="min-w-[180px]">
                            <div className="font-semibold text-gray-800 dark:text-gray-100">
                              {getInstallmentDisplayName(
                                currentInstallment.sequence,
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span
                                className={`
                                inline-flex
                                rounded-full
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                ${
                                  currentInstallment.status === "PAID"
                                    ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300"
                                    : currentInstallment.status === "PARTIAL"
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                }
                            `}
                              >
                                {currentInstallment.status}
                              </span>

                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatAmount(currentInstallment.paidAmount)}
                                {" / "}
                                {formatAmount(currentInstallment.plannedAmount)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            No Payment
                          </span>
                        )}
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        <RemainingModeBadge
                          mode={booking.remainingAmountMode}
                        />
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        <FinanceTypeBadge type={booking.financeType} />
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        {booking.bookingDate || "-"}
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        <DocumentStatusBadge status={agreementStatus as any} />
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        <DocumentStatusBadge status={tripartiteStatus as any} />
                      </td>

                      <td className="border border-gray-200 p-3 dark:border-gray-700">
                        <div className="flex min-w-max justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(booking)}
                            className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                          >
                            View
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(booking)}
                                className="rounded bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          ref={floatingScrollRef}
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
            left: `${floatingScrollbar.left}px`,
            width: `${floatingScrollbar.width}px`,
            visibility: floatingScrollbar.visible ? "visible" : "hidden",
            pointerEvents: floatingScrollbar.visible ? "auto" : "none",
          }}
        >
          <div
            style={{
              width: `${floatingScrollbar.contentWidth}px`,
              height: "1px",
            }}
          />
        </div>
      </div>

      {/* ==========================================
                Booking Details
            ========================================== */}

      <BookingDetailsModal
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        booking={selectedBooking}
        onUpdate={handleUpdateBooking}
      />

      {/* ==========================================
                Booking Edit
            ========================================== */}

      {isAdmin && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseEdit}
          onConfirm={handleUpdateBooking}
          flat={
            selectedBooking
              ? {
                  number: selectedBooking.flatNumber,

                  tower: selectedBooking.tower,

                  floor: selectedBooking.floor,

                  status: selectedBooking.status,
                }
              : null
          }
          booking={selectedBooking}
          mode="edit"
        />
      )}
    </>
  );
}

export default Bookings;