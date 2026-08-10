import { useMemo, useState } from "react";
import { useBooking } from "../../context/BookingContext";
import CustomerDetailsModal from "../../components/dashboard/CustomerDetailsModal";

// ======================================================
// Customer
// ======================================================

interface Customer {
    customerName: string;
    mobile: string;
    email: string;
    address: string;
    aadhar: string;
    pan: string;

    properties: string[];

    totalAmount: number;
    bookingCount: number;
    latestBookingDate: string;

    // ==================================================
    // Document Status
    // ==================================================

    agreementToSellStatus:
        | "pending"
        | "generated"
        | "uploaded"
        | "given";

    tripartiteAgreementStatus:
        | "not-required"
        | "pending"
        | "completed";
}

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
        | "not-required"
        | "completed";
}) {

    if (status === "given") {
        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Given
            </span>
        );
    }

    if (status === "completed") {
        return (
            <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Completed
            </span>
        );
    }

    if (status === "not-required") {
        return (
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                Not Required
            </span>
        );
    }

    if (status === "generated") {
        return (
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Generated
            </span>
        );
    }

    if (status === "uploaded") {
        return (
            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                Uploaded
            </span>
        );
    }

    return (
        <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            Pending
        </span>
    );
}

// ======================================================
// Customers
// ======================================================

function Customers() {

    const { bookings } = useBooking();

    const [search, setSearch] = useState("");

    // ==================================================
    // Customer Details Modal
    // ==================================================

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    const [isCustomerModalOpen, setIsCustomerModalOpen] =
        useState(false);

    // ==================================================
    // Create Unique Customers
    // ==================================================

    const customers = useMemo(() => {

        const customerMap =
            new Map<string, Customer>();

        bookings.forEach((booking) => {

            // ------------------------------------------
            // Customer Identifier
            // ------------------------------------------

            const normalizedName =
                (booking.customerName || "")
                    .trim()
                    .toLowerCase();

            const normalizedMobile =
                (booking.mobile || "").trim();

            const normalizedEmail =
                (booking.email || "")
                    .trim()
                    .toLowerCase();

            const key =
                `${normalizedName}|${normalizedMobile}|${normalizedEmail}`;

            const existing =
                customerMap.get(key);

            const amount =
                Number(booking.bookingAmount) || 0;

            // ==================================================
            // Existing Customer
            // ==================================================

            if (existing) {

                // ------------------------------------------
                // Add Property
                // ------------------------------------------

                if (
                    booking.flatNumber &&
                    !existing.properties.includes(
                        booking.flatNumber
                    )
                ) {

                    existing.properties.push(
                        booking.flatNumber
                    );

                }

                // ------------------------------------------
                // Amount
                // ------------------------------------------

                existing.totalAmount += amount;

                // ------------------------------------------
                // Booking Count
                // ------------------------------------------

                existing.bookingCount += 1;

                // ------------------------------------------
                // Latest Booking Date
                // ------------------------------------------

                if (
                    booking.bookingDate &&
                    booking.bookingDate >
                        existing.latestBookingDate
                ) {

                    existing.latestBookingDate =
                        booking.bookingDate;

                }

                // ==================================================
                // Agreement To Sell Status
                // ==================================================

                const agreementStatus =
                    booking.documents
                        ?.agreementToSell
                        ?.status || "pending";

                if (
                    agreementStatus === "pending"
                ) {

                    existing.agreementToSellStatus =
                        "pending";

                } else if (
                    agreementStatus === "given"
                ) {

                    // Only mark Given if it was not
                    // already found as Pending.
                    if (
                        existing.agreementToSellStatus !==
                        "pending"
                    ) {

                        existing.agreementToSellStatus =
                            "given";

                    }

                } else if (
                    agreementStatus === "uploaded"
                ) {

                    if (
                        existing.agreementToSellStatus !==
                            "pending" &&
                        existing.agreementToSellStatus !==
                            "given"
                    ) {

                        existing.agreementToSellStatus =
                            "uploaded";

                    }

                } else if (
                    agreementStatus === "generated"
                ) {

                    if (
                        existing.agreementToSellStatus !==
                            "pending" &&
                        existing.agreementToSellStatus !==
                            "uploaded" &&
                        existing.agreementToSellStatus !==
                            "given"
                    ) {

                        existing.agreementToSellStatus =
                            "generated";

                    }

                }

                // ==================================================
                // Tripartite Agreement Status
                // ==================================================

                const tripartite =
                    booking.documents
                        ?.tripartiteAgreement;

                if (
                    tripartite?.required
                ) {

                    const tripartiteStatus =
                        tripartite.document
                            ?.status || "pending";

                    if (
                        tripartiteStatus !==
                        "completed"
                    ) {

                        existing.tripartiteAgreementStatus =
                            "pending";

                    } else if (
                        existing.tripartiteAgreementStatus !==
                        "pending"
                    ) {

                        existing.tripartiteAgreementStatus =
                            "completed";

                    }

                }

            }

            // ==================================================
            // New Customer
            // ==================================================

            else {

                // ------------------------------------------
                // Agreement Status
                // ------------------------------------------

                const agreementStatus =
                    booking.documents
                        ?.agreementToSell
                        ?.status || "pending";

                // ------------------------------------------
                // Tripartite Status
                // ------------------------------------------

                const tripartite =
                    booking.documents
                        ?.tripartiteAgreement;

                let tripartiteStatus:
                    | "not-required"
                    | "pending"
                    | "completed" =
                    "not-required";

                if (
                    tripartite?.required
                ) {

                    tripartiteStatus =
                        tripartite.document
                            ?.status === "completed"
                            ? "completed"
                            : "pending";

                }

                customerMap.set(
                    key,
                    {

                        customerName:
                            booking.customerName,

                        mobile:
                            booking.mobile,

                        email:
                            booking.email,

                        address:
                            booking.address,

                        aadhar:
                            booking.aadhar,

                        pan:
                            booking.pan,

                        properties:
                            booking.flatNumber
                                ? [
                                    booking.flatNumber,
                                ]
                                : [],

                        totalAmount:
                            amount,

                        bookingCount:
                            1,

                        latestBookingDate:
                            booking.bookingDate,

                        agreementToSellStatus:
                            agreementStatus ===
                            "given"
                                ? "given"
                                : agreementStatus ===
                                  "uploaded"
                                ? "uploaded"
                                : agreementStatus ===
                                  "generated"
                                ? "generated"
                                : "pending",

                        tripartiteAgreementStatus:
                            tripartiteStatus,

                    }
                );

            }

        });

        return Array.from(
            customerMap.values()
        );

    }, [bookings]);

    // ======================================================
    // Search
    // ======================================================

    const filteredCustomers =
        customers.filter((customer) => {

            const searchText =
                search.toLowerCase();

            return (
                customer.customerName
                    .toLowerCase()
                    .includes(searchText) ||

                customer.mobile
                    .toLowerCase()
                    .includes(searchText) ||

                customer.email
                    .toLowerCase()
                    .includes(searchText) ||

                customer.properties.some(
                    (property) =>
                        property
                            .toLowerCase()
                            .includes(searchText)
                )
            );

        });

    // ======================================================
    // Format Amount
    // ======================================================

    const formatAmount = (
        amount: number
    ) => {

        return amount.toLocaleString(
            "en-IN"
        );

    };

    // ======================================================
    // Open Customer Details
    // ======================================================

    const handleCustomerClick = (
        customer: Customer
    ) => {

        setSelectedCustomer(
            customer
        );

        setIsCustomerModalOpen(
            true
        );

    };

    // ======================================================
    // Close Customer Details
    // ======================================================

    const handleCloseCustomerModal = () => {

        setIsCustomerModalOpen(
            false
        );

        setSelectedCustomer(
            null
        );

    };

    // ======================================================
    // Return
    // ======================================================

    return (

        <div className="space-y-6">

            {/* ==================================================
                Header
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            Customers
                        </h1>

                        <p className="mt-1 text-gray-500">
                            Manage customers linked with bookings
                        </p>

                    </div>

                    {/* Search */}

                    <input
                        type="text"
                        placeholder="Search Customer..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-green-500 md:w-72"
                    />

                </div>

            </div>

            {/* ==================================================
                Customer Statistics
            ================================================== */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* Total Customers */}

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">
                        Total Customers
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-800">
                        {customers.length}
                    </p>

                </div>

                {/* Total Bookings */}

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">
                        Total Bookings
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                        {bookings.length}
                    </p>

                </div>

                {/* Total Amount */}

                <div className="rounded-2xl bg-white p-5 shadow">

                    <p className="text-sm text-gray-500">
                        Total Booking Amount
                    </p>

                    <p className="mt-2 text-3xl font-bold text-blue-600">

                        ₹{" "}

                        {formatAmount(
                            bookings.reduce(
                                (
                                    total,
                                    booking
                                ) =>
                                    total +
                                    (
                                        Number(
                                            booking.bookingAmount
                                        ) || 0
                                    ),
                                0
                            )
                        )}

                    </p>

                </div>

            </div>

            {/* ==================================================
                Customer Table
            ================================================== */}

            <div className="rounded-2xl bg-white p-6 shadow">

                <div className="mb-5 flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-gray-800">
                            Customer List
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {filteredCustomers.length} customers
                        </p>

                    </div>

                </div>

                <div className="overflow-x-auto">

                    <table className="w-full border-collapse">

                        <thead>

                            <tr className="bg-gray-100">

                                <th className="border p-3 text-left">
                                    Customer
                                </th>

                                <th className="border p-3 text-left">
                                    Mobile
                                </th>

                                <th className="border p-3 text-left">
                                    Email
                                </th>

                                <th className="border p-3 text-left">
                                    Properties
                                </th>

                                <th className="border p-3 text-left">
                                    Bookings
                                </th>

                                <th className="border p-3 text-left">
                                    Total Amount
                                </th>

                                <th className="border p-3 text-left">
                                    Last Booking
                                </th>

                                {/* ==================================================
                                    NEW - Agreement To Sell
                                ================================================== */}

                                <th className="border p-3 text-left">
                                    Agreement to Sell
                                </th>

                                {/* ==================================================
                                    NEW - Tripartite Agreement
                                ================================================== */}

                                <th className="border p-3 text-left">
                                    Tripartite Agreement
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredCustomers.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan={9}
                                        className="p-10 text-center text-gray-500"
                                    >
                                        No Customers Found
                                    </td>

                                </tr>

                            ) : (

                                filteredCustomers.map(
                                    (customer) => (

                                        <tr
                                            key={`${customer.customerName}-${customer.mobile}-${customer.email}`}
                                            onClick={() =>
                                                handleCustomerClick(
                                                    customer
                                                )
                                            }
                                            className="cursor-pointer hover:bg-green-50"
                                        >

                                            {/* Customer */}

                                            <td className="border p-3 font-semibold text-gray-800">

                                                {
                                                    customer.customerName
                                                }

                                            </td>

                                            {/* Mobile */}

                                            <td className="border p-3">

                                                {
                                                    customer.mobile ||
                                                    "-"
                                                }

                                            </td>

                                            {/* Email */}

                                            <td className="border p-3">

                                                {
                                                    customer.email ||
                                                    "-"
                                                }

                                            </td>

                                            {/* Properties */}

                                            <td className="border p-3">

                                                <div className="flex flex-wrap gap-2">

                                                    {customer.properties.map(
                                                        (
                                                            property
                                                        ) => (

                                                            <span
                                                                key={
                                                                    property
                                                                }
                                                                className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                                                            >
                                                                {
                                                                    property
                                                                }
                                                            </span>

                                                        )
                                                    )}

                                                </div>

                                            </td>

                                            {/* Booking Count */}

                                            <td className="border p-3">

                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">

                                                    {
                                                        customer.bookingCount
                                                    }

                                                </span>

                                            </td>

                                            {/* Amount */}

                                            <td className="border p-3 font-semibold">

                                                ₹{" "}

                                                {
                                                    formatAmount(
                                                        customer.totalAmount
                                                    )
                                                }

                                            </td>

                                            {/* Booking Date */}

                                            <td className="border p-3">

                                                {
                                                    customer.latestBookingDate ||
                                                    "-"
                                                }

                                            </td>

                                            {/* ==================================================
                                                Agreement To Sell
                                            ================================================== */}

                                            <td className="border p-3">

                                                <DocumentStatusBadge
                                                    status={
                                                        customer.agreementToSellStatus
                                                    }
                                                />

                                            </td>

                                            {/* ==================================================
                                                Tripartite Agreement
                                            ================================================== */}

                                            <td className="border p-3">

                                                <DocumentStatusBadge
                                                    status={
                                                        customer.tripartiteAgreementStatus
                                                    }
                                                />

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* ==================================================
                Customer Details Modal
            ================================================== */}

            <CustomerDetailsModal
                isOpen={
                    isCustomerModalOpen
                }
                onClose={
                    handleCloseCustomerModal
                }
                customer={
                    selectedCustomer as any
                }
                bookings={
                    bookings as any
                }
            />

        </div>

    );

}

export default Customers;