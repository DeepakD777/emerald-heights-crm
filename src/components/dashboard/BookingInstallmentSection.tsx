import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getAuthToken,
} from "../../services/api";

import {
    useBooking,
} from "../../context/BookingContext";

// ======================================================
// Props
// ======================================================

interface BookingInstallmentSectionProps {
    booking: any;
    readOnly?: boolean;
    isAdmin: boolean;
}

// ======================================================
// Helpers
// ======================================================

const formatCurrency = (
    value:
        number |
        string |
        null |
        undefined
) => {

    const amount =
        Number(
            value ??
            0
        );

    return `₹${amount.toLocaleString(
        "en-IN",
        {
            maximumFractionDigits:
                2,
        }
    )}`;
};

const formatDate = (
    value:
        string |
        null |
        undefined
) => {

    if (
        !value
    ) {

        return "-";
    }

    const date =
        new Date(
            value
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",
        }
    );
};

const getStatusClasses = (
    status:
        string
) => {

    switch (
        status
    ) {

        case "PAID":

            return "bg-green-100 text-green-700 border-green-200";

        case "PARTIAL":

            return "bg-amber-100 text-amber-700 border-amber-200";

        default:

            return "bg-gray-100 text-gray-600 border-gray-200";
    }
};

// ======================================================
// Component
// ======================================================

function BookingInstallmentSection({
    booking,
    readOnly = false,
    isAdmin,
}: BookingInstallmentSectionProps) {

    const {
        refreshBookings,
    } = useBooking();

    // ==================================================
    // Local Installment Data
    // ==================================================

    const [
        installmentStages,
        setInstallmentStages,
    ] =
        useState<any[]>(
            booking
                ?.installmentStages ??
            []
        );

    const [
        installmentSummary,
        setInstallmentSummary,
    ] =
        useState<any>(
            booking
                ?.installmentSummary ??
            {
                totalPlannedAmount:
                    0,

                totalReceivedAmount:
                    0,

                totalBalanceAmount:
                    0,

                currentInstallment:
                    null,
            }
        );

    // ==================================================
    // Payment Form
    // ==================================================

    const [
        selectedInstallmentId,
        setSelectedInstallmentId,
    ] =
        useState(
            ""
        );

    const [
        amount,
        setAmount,
    ] =
        useState(
            ""
        );

    const [
        paymentDate,
        setPaymentDate,
    ] =
        useState(
            new Date()
                .toISOString()
                .split(
                    "T"
                )[0]
        );

    const [
        paymentMode,
        setPaymentMode,
    ] =
        useState(
            "Cash"
        );

    const [
        referenceNo,
        setReferenceNo,
    ] =
        useState(
            ""
        );

    const [
        remarks,
        setRemarks,
    ] =
        useState(
            ""
        );

    const [
        saving,
        setSaving,
    ] =
        useState(
            false
        );

    const [
        error,
        setError,
    ] =
        useState<
            string |
            null
        >(
            null
        );

    const [
        successMessage,
        setSuccessMessage,
    ] =
        useState<
            string |
            null
        >(
            null
        );

    // ==================================================
    // Sync When Booking Changes
    // ==================================================

    useEffect(
        () => {

            setInstallmentStages(
                booking
                    ?.installmentStages ??
                []
            );

            setInstallmentSummary(
                booking
                    ?.installmentSummary ??
                {
                    totalPlannedAmount:
                        0,

                    totalReceivedAmount:
                        0,

                    totalBalanceAmount:
                        0,

                    currentInstallment:
                        null,
                }
            );

            setSelectedInstallmentId(
                ""
            );

            setAmount(
                ""
            );

            setError(
                null
            );

            setSuccessMessage(
                null
            );

        },
        [
            booking?.id,
        ]
    );

    // ==================================================
    // Selectable Stages
    // PAID stages are disabled from new payment entry
    // PARTIAL stages remain selectable
    // ==================================================

    const selectableStages =
        useMemo(
            () =>
                installmentStages
                    .filter(
                        (
                            stage
                        ) =>
                            stage
                                .status !==
                            "PAID"
                    ),
            [
                installmentStages,
            ]
        );

    const selectedStage =
        useMemo(
            () =>
                installmentStages
                    .find(
                        (
                            stage
                        ) =>
                            stage.id ===
                            selectedInstallmentId
                    ) ??
                null,
            [
                installmentStages,
                selectedInstallmentId,
            ]
        );

    // ==================================================
    // Add Installment Payment
    // ==================================================

    const handleAddPayment =
        async () => {

            if (
                !isAdmin ||
                readOnly
            ) {

                return;
            }

            setError(
                null
            );

            setSuccessMessage(
                null
            );

            if (
                !selectedInstallmentId
            ) {

                setError(
                    "Please select an installment stage."
                );

                return;
            }

            const parsedAmount =
                Number(
                    amount
                );

            if (
                !Number.isFinite(
                    parsedAmount
                ) ||
                parsedAmount <=
                0
            ) {

                setError(
                    "Please enter a valid received amount."
                );

                return;
            }

            if (
                selectedStage &&
                parsedAmount >
                Number(
                    selectedStage
                        .balanceAmount ??
                    0
                )
            ) {

                setError(
                    `Amount cannot exceed stage balance ${formatCurrency(
                        selectedStage
                            .balanceAmount
                    )}.`
                );

                return;
            }

            const token =
                getAuthToken();

            if (
                !token
            ) {

                setError(
                    "Login session expired. Please login again."
                );

                return;
            }

            try {

                setSaving(
                    true
                );

                const response =
                    await fetch(
                        `http://localhost:5000/api/bookings/${booking.id}/installment-payments`,
                        {
                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`,
                            },

                            body:
                                JSON.stringify(
                                    {
                                        installmentId:
                                            selectedInstallmentId,

                                        amount:
                                            parsedAmount,

                                        paymentDate:
                                            paymentDate ||
                                            undefined,

                                        paymentMode:
                                            paymentMode ||
                                            undefined,

                                        referenceNo:
                                            referenceNo
                                                .trim() ||
                                            undefined,

                                        remarks:
                                            remarks
                                                .trim() ||
                                            undefined,
                                    }
                                ),
                        }
                    );

                const result =
                    await response
                        .json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to add installment payment"
                    );
                }

                // ------------------------------------------
                // Update modal immediately
                // ------------------------------------------

                setInstallmentStages(
                    Array.isArray(
                        result
                            .data
                            ?.installmentStages
                    )
                        ? result
                            .data
                            .installmentStages
                        : []
                );

                setInstallmentSummary(
                    result
                        .data
                        ?.installmentSummary ??
                    {
                        totalPlannedAmount:
                            0,

                        totalReceivedAmount:
                            0,

                        totalBalanceAmount:
                            0,

                        currentInstallment:
                            null,
                    }
                );

                // ------------------------------------------
                // Refresh BookingContext
                // Booking table will receive fresh data
                // ------------------------------------------

                await refreshBookings();

                // ------------------------------------------
                // Reset Form
                // ------------------------------------------

                setSelectedInstallmentId(
                    ""
                );

                setAmount(
                    ""
                );

                setReferenceNo(
                    ""
                );

                setRemarks(
                    ""
                );

                setSuccessMessage(
                    "Installment payment added successfully."
                );

            } catch (
                error
            ) {

                console.error(
                    "Add installment payment error:",
                    error
                );

                setError(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to add installment payment"
                );

            } finally {

                setSaving(
                    false
                );
            }
        };

    // ==================================================
    // No Installment Data
    // ==================================================

    if (
        installmentStages
            .length ===
        0
    ) {

        return (

            <div>

                <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
                    Installment & Payment Tracking
                </h3>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    No installment plan is available for this booking.
                </div>

            </div>
        );
    }

    // ==================================================
    // UI
    // ==================================================

    return (

        <div>

            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-green-700">
                Installment & Payment Tracking
            </h3>

            <div className="space-y-5">

                {/* ==========================================
                    Summary Cards
                ========================================== */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Planned Amount
                        </p>

                        <p className="mt-1 text-lg font-bold text-gray-800">
                            {
                                formatCurrency(
                                    installmentSummary
                                        ?.totalPlannedAmount
                                )
                            }
                        </p>

                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                        <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                            Total Received
                        </p>

                        <p className="mt-1 text-lg font-bold text-green-700">
                            {
                                formatCurrency(
                                    installmentSummary
                                        ?.totalReceivedAmount
                                )
                            }
                        </p>

                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                        <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                            Remaining
                        </p>

                        <p className="mt-1 text-lg font-bold text-amber-700">
                            {
                                formatCurrency(
                                    installmentSummary
                                        ?.totalBalanceAmount
                                )
                            }
                        </p>

                    </div>

                </div>

                {/* ==========================================
                    Current Installment
                ========================================== */}

                <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                        Current / Latest Installment
                    </p>

                    {
                        installmentSummary
                            ?.currentInstallment
                            ? (

                                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                    <div>

                                        <p className="font-bold text-gray-800">
                                            {
                                                installmentSummary
                                                    .currentInstallment
                                                    .stageName
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            Paid{" "}
                                            {
                                                formatCurrency(
                                                    installmentSummary
                                                        .currentInstallment
                                                        .paidAmount
                                                )
                                            }
                                            {" "}of{" "}
                                            {
                                                formatCurrency(
                                                    installmentSummary
                                                        .currentInstallment
                                                        .plannedAmount
                                                )
                                            }
                                        </p>

                                    </div>

                                    <span
                                        className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                            installmentSummary
                                                .currentInstallment
                                                .status
                                        )}`}
                                    >
                                        {
                                            installmentSummary
                                                .currentInstallment
                                                .status
                                        }
                                    </span>

                                </div>
                            )
                            : (

                                <p className="mt-2 text-sm text-gray-600">
                                    No installment payment has been received yet.
                                </p>
                            )
                    }

                </div>

                {/* ==========================================
                    Admin Payment Entry
                ========================================== */}

                {
                    isAdmin &&
                    !readOnly && (

                        <div className="rounded-xl border border-gray-200 bg-white p-4">

                            <div className="mb-4">

                                <h4 className="font-bold text-gray-800">
                                    Add Payment
                                </h4>

                                <p className="mt-1 text-sm text-gray-500">
                                    Select the installment stage and enter the amount received.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div className="sm:col-span-2">

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Installment Stage
                                    </label>

                                    <select
                                        value={
                                            selectedInstallmentId
                                        }
                                        onChange={
                                            (
                                                event
                                            ) => {

                                                setSelectedInstallmentId(
                                                    event
                                                        .target
                                                        .value
                                                );

                                                setAmount(
                                                    ""
                                                );

                                                setError(
                                                    null
                                                );
                                            }
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                                    >
                                        <option value="">
                                            Select installment stage
                                        </option>

                                        {
                                            selectableStages
                                                .map(
                                                    (
                                                        stage
                                                    ) => (

                                                        <option
                                                            key={
                                                                stage.id
                                                            }
                                                            value={
                                                                stage.id
                                                            }
                                                        >
                                                            {
                                                                stage.sequence
                                                            }
                                                            .{" "}
                                                            {
                                                                stage.stageName
                                                            }
                                                            {" — Balance "}
                                                            {
                                                                formatCurrency(
                                                                    stage
                                                                        .balanceAmount
                                                                )
                                                            }
                                                        </option>
                                                    )
                                                )
                                        }

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Amount Received
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            amount
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setAmount(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        placeholder="Enter received amount"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                                    />

                                    {
                                        selectedStage && (

                                            <p className="mt-1 text-xs text-gray-500">
                                                Stage balance:{" "}
                                                {
                                                    formatCurrency(
                                                        selectedStage
                                                            .balanceAmount
                                                    )
                                                }
                                            </p>
                                        )
                                    }

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Payment Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            paymentDate
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setPaymentDate(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Payment Mode
                                    </label>

                                    <select
                                        value={
                                            paymentMode
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setPaymentMode(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                                    >
                                        <option value="Cash">
                                            Cash
                                        </option>

                                        <option value="Cheque">
                                            Cheque
                                        </option>

                                        <option value="Bank Transfer">
                                            Bank Transfer
                                        </option>

                                        <option value="UPI">
                                            UPI
                                        </option>

                                        <option value="Finance">
                                            Finance
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Reference No.
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            referenceNo
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setReferenceNo(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        placeholder="Optional"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                                    />

                                </div>

                                <div className="sm:col-span-2">

                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Remarks
                                    </label>

                                    <textarea
                                        rows={
                                            2
                                        }
                                        value={
                                            remarks
                                        }
                                        onChange={
                                            (
                                                event
                                            ) =>
                                                setRemarks(
                                                    event
                                                        .target
                                                        .value
                                                )
                                        }
                                        placeholder="Optional payment remarks"
                                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-500"
                                    />

                                </div>

                            </div>

                            {
                                error && (

                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {
                                            error
                                        }
                                    </div>
                                )
                            }

                            {
                                successMessage && (

                                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                                        {
                                            successMessage
                                        }
                                    </div>
                                )
                            }

                            <div className="mt-4 flex justify-end">

                                <button
                                    type="button"
                                    disabled={
                                        saving ||
                                        !selectedInstallmentId ||
                                        !amount
                                    }
                                    onClick={
                                        handleAddPayment
                                    }
                                    className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {
                                        saving
                                            ? "Saving..."
                                            : "Add Payment"
                                    }
                                </button>

                            </div>

                        </div>
                    )
                }

                {/* ==========================================
                    Employee / Read Only Notice
                ========================================== */}

                {
                    (
                        !isAdmin ||
                        readOnly
                    ) && (

                        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                            Installment information is view only.
                        </div>
                    )
                }

                {/* ==========================================
                    Installment Stage List
                ========================================== */}

                <div className="space-y-3">

                    {
                        installmentStages
                            .map(
                                (
                                    stage
                                ) => (

                                    <div
                                        key={
                                            stage.id
                                        }
                                        className="rounded-xl border border-gray-200 bg-white p-4"
                                    >

                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-2">

                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                                                        {
                                                            stage.sequence
                                                        }
                                                    </span>

                                                    <p className="font-semibold text-gray-800">
                                                        {
                                                            stage.stageName
                                                        }
                                                    </p>

                                                </div>

                                                <p className="mt-2 text-sm text-gray-500">
                                                    {
                                                        stage.percentage
                                                    }
                                                    % of sale value
                                                </p>

                                            </div>

                                            <span
                                                className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                    stage.status
                                                )}`}
                                            >
                                                {
                                                    stage.status
                                                }
                                            </span>

                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Planned
                                                </p>

                                                <p className="font-semibold text-gray-800">
                                                    {
                                                        formatCurrency(
                                                            stage
                                                                .plannedAmount
                                                        )
                                                    }
                                                </p>

                                            </div>

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Paid
                                                </p>

                                                <p className="font-semibold text-green-700">
                                                    {
                                                        formatCurrency(
                                                            stage
                                                                .paidAmount
                                                        )
                                                    }
                                                </p>

                                            </div>

                                            <div>

                                                <p className="text-xs text-gray-500">
                                                    Balance
                                                </p>

                                                <p className="font-semibold text-amber-700">
                                                    {
                                                        formatCurrency(
                                                            stage
                                                                .balanceAmount
                                                        )
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                        {/* ==================================
                                            Payment History
                                        ================================== */}

                                        {
                                            Array.isArray(
                                                stage.payments
                                            ) &&
                                            stage
                                                .payments
                                                .length >
                                            0 && (

                                                <div className="mt-4 border-t border-gray-100 pt-3">

                                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                        Payment History
                                                    </p>

                                                    <div className="space-y-2">

                                                        {
                                                            stage
                                                                .payments
                                                                .map(
                                                                    (
                                                                        payment:
                                                                        any
                                                                    ) => (

                                                                        <div
                                                                            key={
                                                                                payment.id
                                                                            }
                                                                            className="flex flex-col gap-1 rounded-lg bg-gray-50 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                                                                        >

                                                                            <div>

                                                                                <p className="font-semibold text-gray-800">
                                                                                    {
                                                                                        formatCurrency(
                                                                                            payment
                                                                                                .amount
                                                                                        )
                                                                                    }
                                                                                </p>

                                                                                <p className="text-xs text-gray-500">
                                                                                    {
                                                                                        formatDate(
                                                                                            payment
                                                                                                .paymentDate
                                                                                        )
                                                                                    }
                                                                                    {
                                                                                        payment
                                                                                            .paymentMode
                                                                                            ? ` • ${payment.paymentMode}`
                                                                                            : ""
                                                                                    }
                                                                                </p>

                                                                            </div>

                                                                            {
                                                                                payment
                                                                                    .referenceNo && (

                                                                                    <p className="text-xs text-gray-500">
                                                                                        Ref:{" "}
                                                                                        {
                                                                                            payment
                                                                                                .referenceNo
                                                                                        }
                                                                                    </p>
                                                                                )
                                                                            }

                                                                        </div>
                                                                    )
                                                                )
                                                        }

                                                    </div>

                                                </div>
                                            )
                                        }

                                    </div>
                                )
                            )
                    }

                </div>

            </div>

        </div>
    );
}

export default BookingInstallmentSection;