import { useMemo, useState } from "react";
import {
    BarChart3,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    IndianRupee,
    UserRound,
} from "lucide-react";

import { useBooking } from "../../context/BookingContext";

function Reports() {
    const { bookings } = useBooking();

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
                    .trim()
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

        return Array.from(groups.values()).sort(
            (a, b) => b.amount - a.amount
        );
    }, [bookings]);
    const [openPrices, setOpenPrices] = useState<
        Record<string, boolean>
    >({});

    const togglePrice = (amount: number) => {
        const key = String(amount);

        setOpenPrices((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className="space-y-6">

            {/* ==================================================
          Header
      ================================================== */}

            <div>
                <h1 className="text-2xl font-bold text-gray-800">
                    Booking Reports
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Price-wise booking summary and customer details
                </p>
            </div>

            {/* ==================================================
          Total Bookings
      ================================================== */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Bookings
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                {bookings.length}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                All recorded bookings
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                            <CalendarDays size={28} />
                        </div>

                    </div>

                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500">
                                Different Booking Prices
                            </p>

                            <h2 className="mt-2 text-3xl font-bold text-gray-800">
                                {priceGroups.length}
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Unique booking amounts
                            </p>
                        </div>

                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-green-600">
                            <BarChart3 size={28} />
                        </div>

                    </div>

                </div>

            </div>

            {/* ==================================================
          Price-wise Booking Summary
      ================================================== */}

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="mb-6">

                    <h2 className="text-xl font-bold text-gray-800">
                        Price-wise Booking Summary
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        View bookings and customer details for each booking price
                    </p>

                </div>

                {/* Empty State */}

                {priceGroups.length === 0 ? (

                    <div className="py-12 text-center text-gray-500">
                        No bookings found
                    </div>

                ) : (

                    <div className="space-y-4">

                        {priceGroups.map((group) => {

                            const isOpen =
                                openPrices[String(group.amount)] ?? false;

                            return (
                                <div
                                    key={String(group.amount)}
                                    className="overflow-hidden rounded-xl border border-gray-200"
                                >

                                    {/* Price Header */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            togglePrice(group.amount)
                                        }
                                        className="flex w-full items-center justify-between bg-gray-50 px-5 py-4 text-left transition hover:bg-gray-100"
                                    >

                                        <div className="flex items-center gap-4">

                                            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                                <IndianRupee size={22} />
                                            </div>

                                            <div>

                                                <p className="text-lg font-bold text-gray-800">
                                                    ₹
                                                    {group.amount.toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    {group.bookings.length}{" "}
                                                    {group.bookings.length === 1
                                                        ? "Booking"
                                                        : "Bookings"}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="flex items-center gap-2 text-gray-500">

                                            <span className="hidden text-sm md:block">
                                                {isOpen
                                                    ? "Hide Details"
                                                    : "View Details"}
                                            </span>

                                            {isOpen ? (
                                                <ChevronUp size={20} />
                                            ) : (
                                                <ChevronDown size={20} />
                                            )}

                                        </div>

                                    </button>

                                    {/* Customer Details */}

                                    {isOpen && (

                                        <div className="border-t border-gray-200">

                                            <div className="overflow-x-auto">

                                                <table className="w-full min-w-[900px]">

                                                    <thead>

                                                        <tr className="border-b bg-white">

                                                            <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                Customer
                                                            </th>

                                                            <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                Mobile
                                                            </th>

                                                            <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                Unit
                                                            </th>

                                                            <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                Floor
                                                            </th>

                                                            <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                Payment
                                                            </th>

                                                            <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                Date
                                                            </th>

                                                            <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">
                                                                Status
                                                            </th>

                                                        </tr>

                                                    </thead>

                                                    <tbody>

                                                        {group.bookings.map(
                                                            (booking) => (

                                                                <tr
                                                                    key={booking.id}
                                                                    className="border-b last:border-b-0 hover:bg-gray-50"
                                                                >

                                                                    {/* Customer */}

                                                                    <td className="px-5 py-4">

                                                                        <div className="flex items-center gap-3">

                                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                                                <UserRound
                                                                                    size={18}
                                                                                />
                                                                            </div>

                                                                            <span className="font-medium text-gray-800">
                                                                                {
                                                                                    booking.customerName
                                                                                }
                                                                            </span>

                                                                        </div>

                                                                    </td>

                                                                    {/* Mobile */}

                                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                                        {booking.mobile || "-"}
                                                                    </td>

                                                                    {/* Unit */}

                                                                    <td className="px-5 py-4 font-medium text-gray-800">
                                                                        {booking.flatNumber || "-"}
                                                                    </td>

                                                                    {/* Floor */}

                                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                                        {booking.floor ?? "-"}
                                                                    </td>

                                                                    {/* Payment */}

                                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                                        {booking.paymentMode || "-"}
                                                                    </td>

                                                                    {/* Date */}

                                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                                        {booking.bookingDate || "-"}
                                                                    </td>

                                                                    {/* Status */}

                                                                    <td className="px-5 py-4">

                                                                        <span
                                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${booking.status ===
                                                                                    "booked"
                                                                                    ? "bg-green-100 text-green-700"
                                                                                    : "bg-orange-100 text-orange-700"
                                                                                }`}
                                                                        >
                                                                            {booking.status ||
                                                                                "Pending"}
                                                                        </span>

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )}

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
    );
}

export default Reports;