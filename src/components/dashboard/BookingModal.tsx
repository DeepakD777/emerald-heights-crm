import { useEffect, useState } from "react";

import Modal from "./Modal";
import BookingInstallmentSection from "./BookingInstallmentSection";

import { API_BASE_URL, getAuthToken } from "../../services/api";

// ======================================================
// Types
// ======================================================

interface BookingModalProps {
  isOpen: boolean;

  onClose: () => void;

  onConfirm: (bookingData: any) => void;

  booking?: any;

  mode?: "create" | "edit";

  flat: {
    number: string;
    tower: string;
    floor: number | string;
    status?: string;
    type?: string;
  } | null;
}

interface SalesMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

type RemainingAmountMode = "AUTO" | "MANUAL";

type FinanceType = "" | "FINANCE" | "CASH";

// ======================================================
// API
// ======================================================

const EMPLOYEES_API = `${API_BASE_URL}/employees`;

// ======================================================
// Empty Form
// ======================================================

const createEmptyForm = () => ({
  customerName: "",
  mobile: "",
  email: "",
  address: "",

  aadhar: "",
  pan: "",

  // Client Customer Fields
  dob: "",
  doa: "",
  profile: "",

  // Financial Details
  totalAmount: "",
  discount: "",
  afterDiscountAmount: "",

  plan: "",

  bookingAmount: "",

  // Remaining Amount
  remainingAmount: "",
  remainingAmountMode: "AUTO" as RemainingAmountMode,

  // Funding Classification
  financeType: "" as FinanceType,

  paymentMode: "Cash",

  chequeNo: "",
  bankName: "",

  // Detailed finance notes
  finance: "",
  customerNeed: "",

  bookingDate: "",
  remarks: "",

  employeeId: "",
});

// ======================================================
// Role Label
// ======================================================

const getRoleLabel = (role: string) => {
  switch (role) {
    case "SALES_MANAGER":
      return "Sales Manager";

    case "TEAM_LEADER":
      return "Team Leader";

    case "SALES_EXECUTIVE":
    case "EMPLOYEE":
      return "Sales Executive";

    default:
      return role;
  }
};

// ======================================================
// Floor Label
// ======================================================

const getFloorLabel = (floor: number | string | null | undefined) => {
  if (floor === null || floor === undefined) {
    return "-";
  }

  // ----------------------------------------------
  // Commercial floors may already arrive as text
  // e.g. "Ground Floor", "1st Floor"
  // ----------------------------------------------

  if (typeof floor === "string") {
    const trimmedFloor = floor.trim();

    if (!trimmedFloor) {
      return "-";
    }

    const normalizedFloor = trimmedFloor.toLowerCase();

    if (normalizedFloor === "ground floor" || normalizedFloor === "ground") {
      return "Ground Floor";
    }

    const numericMatch = normalizedFloor.match(
      /^(-?\d+)(?:st|nd|rd|th)?(?:\s*floor)?$/,
    );

    if (!numericMatch) {
      return trimmedFloor;
    }

    floor = Number(numericMatch[1]);
  }

  const numericFloor = Number(floor);

  if (!Number.isFinite(numericFloor)) {
    return "-";
  }

  if (numericFloor === 0) {
    return "Ground Floor";
  }

  if (numericFloor === 1) {
    return "1st Floor";
  }

  if (numericFloor === 2) {
    return "2nd Floor";
  }

  if (numericFloor === 3) {
    return "3rd Floor";
  }

  const lastDigit = numericFloor % 10;

  const lastTwoDigits = numericFloor % 100;

  let suffix = "th";

  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) {
      suffix = "st";
    } else if (lastDigit === 2) {
      suffix = "nd";
    } else if (lastDigit === 3) {
      suffix = "rd";
    }
  }

  return `${numericFloor}${suffix} Floor`;
};

// ======================================================
// Safe Number
// ======================================================

const toSafeNumber = (value: string | number | null | undefined) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

// ======================================================
// After Discount Amount
// ======================================================

const calculateAfterDiscountAmount = (
  totalAmount: string | number | null | undefined,
  discount: string | number | null | undefined,
) => {
  const total = toSafeNumber(totalAmount);

  const discountAmount = toSafeNumber(discount);

  return String(Math.max(total - discountAmount, 0));
};

// ======================================================
// Remaining Amount
// AUTO = After Discount Amount - Booking Amount
// Minimum = 0
// ======================================================

const calculateRemainingAmount = (
  afterDiscountAmount: string | number | null | undefined,
  bookingAmount: string | number | null | undefined,
  installmentSummary?: {
    totalReceivedAmount?: string | number | null;
  } | null,
) => {
  const finalAmount = toSafeNumber(afterDiscountAmount);

  const bookingReceived = toSafeNumber(bookingAmount);

  const installmentReceived = toSafeNumber(
    installmentSummary?.totalReceivedAmount,
  );

  // Existing booking:
  // installmentSummary.totalReceivedAmount already represents
  // the total amount received through the installment/payment tracking.
  //
  // New booking:
  // no installment summary exists, so booking amount is the received amount.
  const totalReceived =
    installmentSummary &&
      installmentSummary.totalReceivedAmount !== null &&
      installmentSummary.totalReceivedAmount !== undefined
      ? installmentReceived
      : bookingReceived;

  return String(Math.max(finalAmount - totalReceived, 0));
};

// ======================================================
// Component
// ======================================================

function BookingModal({
  isOpen,
  onClose,
  onConfirm,
  flat,
  booking,
  mode = "create",
}: BookingModalProps) {
  const [formData, setFormData] = useState(createEmptyForm());

  const [salesMembers, setSalesMembers] = useState<SalesMember[]>([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const [employeeError, setEmployeeError] = useState<string | null>(null);

  // ==================================================
  // Load Sales Members
  // ==================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchSalesMembers = async () => {
      try {
        setLoadingEmployees(true);

        setEmployeeError(null);

        const token = getAuthToken();

        const response = await fetch(EMPLOYEES_API, {
          headers: token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {},
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load sales members");
        }

        const employees = Array.isArray(result.data) ? result.data : [];

        setSalesMembers(
          employees.map((employee: any) => ({
            id: employee.id,

            name: employee.name,

            email: employee.email,

            role: employee.role,

            status: employee.status,
          })),
        );
      } catch (error) {
        console.error("Load sales members error:", error);

        setEmployeeError(
          error instanceof Error
            ? error.message
            : "Failed to load sales members",
        );
      } finally {
        setLoadingEmployees(false);
      }
    };

    void fetchSalesMembers();
  }, [isOpen]);

  // ==================================================
  // Fill Form
  // ==================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // ==============================================
    // Edit Booking
    // ==============================================

    if (mode === "edit" && booking) {
      const savedMode: RemainingAmountMode =
        booking.remainingAmountMode === "MANUAL" ? "MANUAL" : "AUTO";

      const savedAfterDiscountAmount = booking.afterDiscountAmount ?? "";

      const savedBookingAmount = booking.bookingAmount ?? "";
      const normalizedRemainingAmount =
        savedMode === "AUTO"
          ? calculateRemainingAmount(
            savedAfterDiscountAmount,
            savedBookingAmount,
            booking.installmentSummary,
          )
          : String(booking.remainingAmount ?? "");

      const savedFinanceType: FinanceType =
        booking.financeType === "FINANCE"
          ? "FINANCE"
          : booking.financeType === "CASH"
            ? "CASH"
            : "";

      setFormData({
        customerName: booking.customerName ?? "",

        mobile: booking.mobile ?? "",

        email: booking.email ?? "",

        address: booking.address ?? "",

        aadhar: booking.aadhar ?? "",

        pan: booking.pan ?? "",

        dob: booking.dob ?? "",

        doa: booking.doa ?? "",

        profile: booking.profile ?? "",

        totalAmount: booking.totalAmount ?? "",

        discount: booking.discount ?? "",

        afterDiscountAmount: savedAfterDiscountAmount,

        plan: booking.plan ?? "",

        bookingAmount: savedBookingAmount,

        remainingAmount: normalizedRemainingAmount,

        remainingAmountMode: savedMode,

        financeType: savedFinanceType,

        paymentMode: booking.paymentMode ?? "Cash",

        chequeNo: booking.chequeNo ?? "",

        bankName: booking.bankName ?? "",

        finance: booking.finance ?? "",

        customerNeed: booking.customerNeed ?? "",

        bookingDate: booking.bookingDate ?? "",

        remarks: booking.remarks ?? "",

        employeeId: booking.employeeId ?? booking.assignedEmployee?.id ?? "",
      });

      return;
    }

    // ==============================================
    // New Booking
    // ==============================================

    setFormData(createEmptyForm());
  }, [booking, mode, isOpen]);

  // ==================================================
  // Handle Change
  // ==================================================

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const nextData = {
        ...previous,

        [name]: value,
      };

      // ==========================================
      // Automatic After Discount Amount
      // ==========================================

      if (name === "totalAmount" || name === "discount") {
        const nextTotal = name === "totalAmount" ? value : previous.totalAmount;

        const nextDiscount = name === "discount" ? value : previous.discount;

        nextData.afterDiscountAmount = calculateAfterDiscountAmount(
          nextTotal,
          nextDiscount,
        );
      }

      // ==========================================
      // AUTO Remaining Amount
      // ==========================================

      if (nextData.remainingAmountMode === "AUTO") {
        if (
          name === "totalAmount" ||
          name === "discount" ||
          name === "bookingAmount" ||
          name === "remainingAmountMode"
        ) {
          nextData.remainingAmount = calculateRemainingAmount(
            nextData.afterDiscountAmount,
            nextData.bookingAmount,
            booking?.installmentSummary,
          );
        }
      }

      return nextData;
    });
  };

  // ==================================================
  // Submit
  // ==================================================

  const handleConfirm = () => {
    if (!flat) {
      return;
    }

    if (!formData.customerName.trim() || !formData.mobile.trim()) {
      alert("Customer Name and Mobile Number are required.");

      return;
    }

    const finalRemainingAmount =
      formData.remainingAmountMode === "AUTO"
        ? calculateRemainingAmount(
          formData.afterDiscountAmount,
          formData.bookingAmount,
          booking?.installmentSummary,
        )
        : formData.remainingAmount;

    onConfirm({
      id: booking?.id ?? crypto.randomUUID(),

      bookingCode: booking?.bookingCode,

      ...formData,

      remainingAmount: finalRemainingAmount,

      remainingAmountMode: formData.remainingAmountMode,

      financeType: formData.financeType || null,

      employeeId: formData.employeeId || null,

      flatNumber: flat.number,

      tower: flat.tower,

      floor: flat.floor,

      status: mode === "edit" ? (booking?.status ?? "booked") : "booked",

      documents: booking?.documents,

      assignedEmployee: booking?.assignedEmployee,
    });

    onClose();
  };

  // ==================================================
  // No Flat
  // ==================================================

  if (!flat) {
    return null;
  }

  // ==================================================
  // Render
  // ==================================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === "edit"
          ? `Edit Booking - ${flat.number}`
          : `Booking - ${flat.number}`
      }
    >
      <div className="space-y-6 text-gray-800 dark:text-gray-100">
        {/* ======================================
                    Flat / Shop Details
                ====================================== */}

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950/60">
          <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Property Details
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Unit No.</p>

              <p className="font-semibold text-gray-800 dark:text-gray-100">{flat.number}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Block / Tower</p>

              <p className="font-semibold text-gray-800 dark:text-gray-100">{flat.tower || "-"}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Floor</p>

              <p className="font-semibold text-gray-800 dark:text-gray-100">
                {getFloorLabel(flat.floor)}
              </p>
            </div>
          </div>
        </div>

        {flat.type?.toLowerCase() === "residential" && (
          <div className="rounded-xl border border-green-200 bg-green-50/60 p-4 dark:border-green-900 dark:bg-green-950/25">
            <h3 className="mb-3 text-sm font-semibold text-green-800 dark:text-green-300">
              Residential Area Details
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-green-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-950/60">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Carpet Area
                </p>

                <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                  1065.76 Sq Ft
                </p>
              </div>

              <div className="rounded-lg border border-green-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-950/60">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Actual Built-up Area as per Proposed
                </p>

                <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                  1132.88 Sq Ft
                </p>
              </div>

              <div className="rounded-lg border border-green-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-950/60">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Area With Balcony
                </p>

                <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">
                  1271 Sq Ft
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================
                    Relationship Manager
                ====================================== */}

        <div>
          <label className="mb-1 block text-sm font-medium">
            Relationship Manager / Assigned Sales Member
          </label>

          <select
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            disabled={loadingEmployees}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
          >
            <option value="">
              {loadingEmployees ? "Loading sales members..." : "Unassigned"}
            </option>

            {salesMembers.map((member) => (
              <option
                key={member.id}
                value={member.id}
                disabled={
                  member.status !== "ACTIVE" &&
                  member.id !== formData.employeeId
                }
              >
                {member.name}

                {" — "}

                {getRoleLabel(member.role)}

                {member.status !== "ACTIVE" ? " (Inactive)" : ""}
              </option>
            ))}
          </select>

          {employeeError ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{employeeError}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select the relationship manager responsible for this booking.
            </p>
          )}
        </div>

        {/* ======================================
                    Customer Details
                ====================================== */}

        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            Customer Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Customer Name *
              </label>

              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Mobile Number *
              </label>

              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Email ID</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Profile</label>

              <input
                type="text"
                name="profile"
                value={formData.profile}
                onChange={handleChange}
                placeholder="Customer profile"
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">DOB</label>

              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">DOA</label>

              <input
                type="date"
                name="doa"
                value={formData.doa}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">Address</label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              rows={3}
            />
          </div>
        </div>

        {/* ======================================
                    Identity Details
                ====================================== */}

        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            Identity Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Aadhar Number
              </label>

              <input
                type="text"
                name="aadhar"
                value={formData.aadhar}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                PAN Number
              </label>

              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* ======================================
                    Amount Details
                ====================================== */}

        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            Amount Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Total Amount */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Total Amount
              </label>

              <input
                type="number"
                name="totalAmount"
                min="0"
                value={formData.totalAmount}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            {/* Discount */}

            <div>
              <label className="mb-1 block text-sm font-medium">Discount</label>

              <input
                type="number"
                name="discount"
                min="0"
                value={formData.discount}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            {/* After Discount */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                After Discount Amount
              </label>

              <input
                type="number"
                name="afterDiscountAmount"
                value={formData.afterDiscountAmount}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              />

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Automatically calculated from Total Amount − Discount.
              </p>
            </div>

            {/* Booking Amount */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Booking Amount
              </label>

              <input
                type="number"
                name="bookingAmount"
                min="0"
                value={formData.bookingAmount}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            {/* Calculation Mode */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Remaining Amount Calculation
              </label>

              <select
                name="remainingAmountMode"
                value={formData.remainingAmountMode}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="AUTO">Auto</option>

                <option value="MANUAL">Manual</option>
              </select>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Auto calculates remaining balance. Manual allows admin override.
              </p>
            </div>

            {/* Remaining Amount */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Remaining Amount
              </label>

              <input
                type="number"
                name="remainingAmount"
                min="0"
                value={formData.remainingAmount}
                onChange={handleChange}
                readOnly={formData.remainingAmountMode === "AUTO"}
                className={`
                                    w-full
                                    rounded-lg
                                    border
                                    p-2
                                    ${formData.remainingAmountMode === "AUTO"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-white"
                  }
                                `}
              />

              {formData.remainingAmountMode === "AUTO" ? (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Auto: After Discount Amount − Booking Amount.
                </p>
              ) : (
                <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                  Manual mode: enter the remaining amount yourself.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ======================================
                    Plan & Payment Details
                ====================================== */}

        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            Plan & Payment Details
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Plan</label>

              <input
                type="text"
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                placeholder="Payment / booking plan"
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Payment Mode
              </label>

              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="Cash">Cash</option>

                <option value="UPI">UPI</option>

                <option value="Cheque">Cheque</option>

                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Cheque No.
              </label>

              <input
                type="text"
                name="chequeNo"
                value={formData.chequeNo}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Bank Name
              </label>

              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
        {mode === "edit" && booking && (
          <BookingInstallmentSection
            booking={booking}
            readOnly={false}
            isAdmin={true}
          />
        )}

        {/* ======================================
                    Finance & Customer Requirement
                ====================================== */}

        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            Finance & Customer Requirement
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Finance Type */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Finance Type
              </label>

              <select
                name="financeType"
                value={formData.financeType}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="">Select Finance Type</option>

                <option value="FINANCE">Finance</option>

                <option value="CASH">Cash</option>
              </select>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select whether the property is financed or self-funded/cash.
              </p>
            </div>

            {/* Detailed Finance */}

            <div>
              <label className="mb-1 block text-sm font-medium">
                Finance Details
              </label>

              <input
                type="text"
                name="finance"
                value={formData.finance}
                onChange={handleChange}
                placeholder="Bank / loan / finance details"
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>

            {/* Customer Need */}

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Customer Need
              </label>

              <input
                type="text"
                name="customerNeed"
                value={formData.customerNeed}
                onChange={handleChange}
                placeholder="Customer requirement"
                className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* ======================================
                    Booking Date
                ====================================== */}

        <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
          <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-gray-100">
            Booking Details
          </h3>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Booking Date
            </label>

            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </div>
        </div>

        {/* ======================================
                    Remarks
                ====================================== */}

        <div>
          <label className="mb-1 block text-sm font-medium">Remarks</label>

          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 outline-none focus:border-green-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            rows={3}
          />
        </div>

        {/* ======================================
                    Buttons
                ====================================== */}

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-500 px-5 py-2 text-white hover:bg-gray-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-lg bg-green-600 px-5 py-2 text-white hover:bg-green-700"
          >
            {mode === "edit" ? "Update Booking" : "Confirm Booking"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BookingModal;

