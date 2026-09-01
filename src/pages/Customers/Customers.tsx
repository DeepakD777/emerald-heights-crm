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

  agreementToSellStatus: "pending" | "generated" | "uploaded" | "given";

  tripartiteAgreementStatus: "not-required" | "pending" | "completed";
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
// Customers
// ======================================================

function Customers() {
  const { bookings } = useBooking();

  const [search, setSearch] = useState("");

  // ==================================================
  // Customer Details Modal
  // ==================================================

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // ==================================================
  // Create Unique Customers
  // ==================================================

  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    bookings.forEach((booking) => {
      // ------------------------------------------
      // Customer Identifier
      // ------------------------------------------

      const normalizedName = (booking.customerName || "").trim().toLowerCase();

      const normalizedMobile = (booking.mobile || "").trim();

      const normalizedEmail = (booking.email || "").trim().toLowerCase();

      const key = `${normalizedName}|${normalizedMobile}|${normalizedEmail}`;

      const existing = customerMap.get(key);

      const amount = Number(booking.bookingAmount) || 0;

      // ==================================================
      // Existing Customer
      // ==================================================

      if (existing) {
        // ------------------------------------------
        // Add Property
        // ------------------------------------------

        if (
          booking.flatNumber &&
          !existing.properties.includes(booking.flatNumber)
        ) {
          existing.properties.push(booking.flatNumber);
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
          booking.bookingDate > existing.latestBookingDate
        ) {
          existing.latestBookingDate = booking.bookingDate;
        }

        // ==================================================
        // Agreement To Sell Status
        // ==================================================

        const agreementStatus =
          booking.documents?.agreementToSell?.status || "pending";

        if (agreementStatus === "pending") {
          existing.agreementToSellStatus = "pending";
        } else if (agreementStatus === "given") {
          // Only mark Given if it was not
          // already found as Pending.
          if (existing.agreementToSellStatus !== "pending") {
            existing.agreementToSellStatus = "given";
          }
        } else if (agreementStatus === "uploaded") {
          if (
            existing.agreementToSellStatus !== "pending" &&
            existing.agreementToSellStatus !== "given"
          ) {
            existing.agreementToSellStatus = "uploaded";
          }
        } else if (agreementStatus === "generated") {
          if (
            existing.agreementToSellStatus !== "pending" &&
            existing.agreementToSellStatus !== "uploaded" &&
            existing.agreementToSellStatus !== "given"
          ) {
            existing.agreementToSellStatus = "generated";
          }
        }

        // ==================================================
        // Tripartite Agreement Status
        // ==================================================

        const tripartite = booking.documents?.tripartiteAgreement;

        if (tripartite?.required) {
          const tripartiteStatus = tripartite.document?.status || "pending";

          if (tripartiteStatus !== "completed") {
            existing.tripartiteAgreementStatus = "pending";
          } else if (existing.tripartiteAgreementStatus !== "pending") {
            existing.tripartiteAgreementStatus = "completed";
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
          booking.documents?.agreementToSell?.status || "pending";

        // ------------------------------------------
        // Tripartite Status
        // ------------------------------------------

        const tripartite = booking.documents?.tripartiteAgreement;

        let tripartiteStatus: "not-required" | "pending" | "completed" =
          "not-required";

        if (tripartite?.required) {
          tripartiteStatus =
            tripartite.document?.status === "completed"
              ? "completed"
              : "pending";
        }

        customerMap.set(key, {
          customerName: booking.customerName,

          mobile: booking.mobile,

          email: booking.email,

          address: booking.address,

          aadhar: booking.aadhar,

          pan: booking.pan,

          properties: booking.flatNumber ? [booking.flatNumber] : [],

          totalAmount: amount,

          bookingCount: 1,

          latestBookingDate: booking.bookingDate,

          agreementToSellStatus:
            agreementStatus === "given"
              ? "given"
              : agreementStatus === "uploaded"
                ? "uploaded"
                : agreementStatus === "generated"
                  ? "generated"
                  : "pending",

          tripartiteAgreementStatus: tripartiteStatus,
        });
      }
    });

    return Array.from(customerMap.values());
  }, [bookings]);

  // ======================================================
  // Search
  // ======================================================

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.customerName.toLowerCase().includes(searchText) ||
      customer.mobile.toLowerCase().includes(searchText) ||
      customer.email.toLowerCase().includes(searchText) ||
      customer.properties.some((property) =>
        property.toLowerCase().includes(searchText),
      )
    );
  });

  // ======================================================
  // Format Amount
  // ======================================================

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-IN");
  };

  // ======================================================
  // Open Customer Details
  // ======================================================

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);

    setIsCustomerModalOpen(true);
  };

  // ======================================================
  // Close Customer Details
  // ======================================================

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);

    setSelectedCustomer(null);
  };

  // ======================================================
  // Return
  // ======================================================

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5 lg:space-y-6">
      {/* ==================================================
                Header
            ================================================== */}

      <div className="min-w-0 rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-5 lg:p-6">
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl lg:text-3xl">
              Customers
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              Manage customers linked with bookings
            </p>
          </div>

          {/* Search */}

          <input
            type="text"
            placeholder="Search Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 sm:px-4 md:w-72"
          />
        </div>
      </div>

      {/* ==================================================
                Customer Statistics
            ================================================== */}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">
        {/* Total Customers */}

        <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Customers</p>

          <p className="mt-2 text-2xl font-bold text-gray-800 dark:text-gray-100 sm:text-3xl">
            {customers.length}
          </p>
        </div>

        {/* Total Bookings */}

        <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>

          <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400 sm:text-3xl">
            {bookings.length}
          </p>
        </div>

        {/* Total Amount */}

        <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Booking Amount</p>

          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400 sm:text-3xl">
            ₹{" "}
            {formatAmount(
              bookings.reduce(
                (total, booking) =>
                  total + (Number(booking.bookingAmount) || 0),
                0,
              ),
            )}
          </p>
        </div>
      </div>

      {/* ==================================================
                Customer Table
            ================================================== */}

      <div className="min-w-0 rounded-2xl bg-white p-4 shadow dark:bg-gray-900 sm:p-5 lg:p-6">
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 sm:text-xl">
              Customer List
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredCustomers.length} customers
            </p>
          </div>
        </div>

        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[1250px] border-collapse text-sm text-gray-700 dark:text-gray-200">
            <thead className="[&_th]:whitespace-nowrap">
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Customer</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Mobile</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Email</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Properties</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Bookings</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Total Amount</th>

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Last Booking</th>

                {/* ==================================================
                                    NEW - Agreement To Sell
                                ================================================== */}

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Agreement to Sell</th>

                {/* ==================================================
                                    NEW - Tripartite Agreement
                                ================================================== */}

                <th className="border border-gray-200 p-3 text-left dark:border-gray-700">Tripartite Agreement</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-6 text-center text-sm text-gray-500 dark:text-gray-400 sm:p-8 lg:p-10"
                  >
                    No Customers Found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={`${customer.customerName}-${customer.mobile}-${customer.email}`}
                    onClick={() => handleCustomerClick(customer)}
                    className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/30"
                  >
                    {/* Customer */}

                    <td className="border border-gray-200 p-3 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      {customer.customerName}
                    </td>

                    {/* Mobile */}

                    <td className="whitespace-nowrap border border-gray-200 p-3 dark:border-gray-700">
                      {customer.mobile || "-"}
                    </td>

                    {/* Email */}

                    <td className="border border-gray-200 p-3 dark:border-gray-700">{customer.email || "-"}</td>

                    {/* Properties */}

                    <td className="border border-gray-200 p-3 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {customer.properties.map((property) => (
                          <span
                            key={property}
                            className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950/60 dark:text-green-300"
                          >
                            {property}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Booking Count */}

                    <td className="border border-gray-200 p-3 dark:border-gray-700">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {customer.bookingCount}
                      </span>
                    </td>

                    {/* Amount */}

                    <td className="whitespace-nowrap border border-gray-200 p-3 font-semibold text-gray-800 dark:border-gray-700 dark:text-gray-100">
                      ₹ {formatAmount(customer.totalAmount)}
                    </td>

                    {/* Booking Date */}

                    <td className="whitespace-nowrap border border-gray-200 p-3 dark:border-gray-700">
                      {customer.latestBookingDate || "-"}
                    </td>

                    {/* ==================================================
                                                Agreement To Sell
                                            ================================================== */}

                    <td className="border border-gray-200 p-3 dark:border-gray-700">
                      <DocumentStatusBadge
                        status={customer.agreementToSellStatus}
                      />
                    </td>

                    {/* ==================================================
                                                Tripartite Agreement
                                            ================================================== */}

                    <td className="border border-gray-200 p-3 dark:border-gray-700">
                      <DocumentStatusBadge
                        status={customer.tripartiteAgreementStatus}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================
                Customer Details Modal
            ================================================== */}

      <CustomerDetailsModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        customer={selectedCustomer as any}
        bookings={bookings as any}
      />
    </div>
  );
}

export default Customers;
