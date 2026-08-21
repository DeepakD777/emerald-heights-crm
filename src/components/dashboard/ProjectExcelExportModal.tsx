import {
    useState,
} from "react";

import {
    CalendarDays,
    FileSpreadsheet,
    X,
} from "lucide-react";

import {
    exportProjectSummaryExcel,
} from "../../utils/exportProjectSummaryExcel";

import type {
    ExcelPropertyFilter,
} from "../../utils/exportProjectSummaryExcel";

// ======================================================
// Types
// ======================================================

interface ProjectExcelExportModalProps {
    isOpen: boolean;

    onClose: () => void;

    bookings: any[];
}

type DateFilterMode =
    | "ALL"
    | "RANGE";

// ======================================================
// Component
// ======================================================

function ProjectExcelExportModal({
    isOpen,
    onClose,
    bookings,
}: ProjectExcelExportModalProps) {

    const [
        propertyType,
        setPropertyType,
    ] =
        useState<
            ExcelPropertyFilter
        >(
            "ALL"
        );

    const [
        dateMode,
        setDateMode,
    ] =
        useState<
            DateFilterMode
        >(
            "ALL"
        );

    const [
        fromDate,
        setFromDate,
    ] =
        useState(
            ""
        );

    const [
        toDate,
        setToDate,
    ] =
        useState(
            ""
        );

    const [
        isExporting,
        setIsExporting,
    ] =
        useState(
            false
        );

    // ==================================================
    // Close
    // ==================================================

    const handleClose =
        () => {

            if (
                isExporting
            ) {
                return;
            }

            onClose();
        };

    // ==================================================
    // Export
    // ==================================================

    const handleExport =
        async () => {

            if (
                dateMode ===
                    "RANGE" &&
                fromDate &&
                toDate &&
                fromDate >
                    toDate
            ) {

                alert(
                    "From Date cannot be after To Date."
                );

                return;
            }

            try {

                setIsExporting(
                    true
                );

                await exportProjectSummaryExcel(
                    bookings,
                    {
                        propertyType,

                        fromDate:
                            dateMode ===
                                "RANGE" &&
                            fromDate
                                ? fromDate
                                : undefined,

                        toDate:
                            dateMode ===
                                "RANGE" &&
                            toDate
                                ? toDate
                                : undefined,
                    }
                );

                onClose();

            } catch (
                error
            ) {

                console.error(
                    "Excel export error:",
                    error
                );

                alert(
                    "Failed to export project summary Excel."
                );

            } finally {

                setIsExporting(
                    false
                );
            }
        };

    if (
        !isOpen
    ) {
        return null;
    }

    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* ==================================================
                    Header
                ================================================== */}

                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">

                            <FileSpreadsheet
                                size={
                                    22
                                }
                            />

                        </div>

                        <div>

                            <h2 className="text-lg font-bold text-gray-800">
                                Export Project Excel
                            </h2>

                            <p className="mt-0.5 text-sm text-gray-500">
                                Select project type and booking date range
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={
                            handleClose
                        }
                        disabled={
                            isExporting
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Close export options"
                    >

                        <X
                            size={
                                20
                            }
                        />

                    </button>

                </div>

                {/* ==================================================
                    Body
                ================================================== */}

                <div className="space-y-6 px-5 py-5 sm:px-6">

                    {/* ==================================================
                        Property Type
                    ================================================== */}

                    <div>

                        <label className="mb-3 block text-sm font-semibold text-gray-700">
                            Project Type
                        </label>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

                            {(
                                [
                                    {
                                        value:
                                            "ALL",

                                        label:
                                            "All Projects",
                                    },

                                    {
                                        value:
                                            "RESIDENTIAL",

                                        label:
                                            "Residential",
                                    },

                                    {
                                        value:
                                            "COMMERCIAL",

                                        label:
                                            "Commercial",
                                    },
                                ] as Array<{
                                    value:
                                        ExcelPropertyFilter;

                                    label:
                                        string;
                                }>
                            ).map(
                                (
                                    option
                                ) => {

                                    const selected =
                                        propertyType ===
                                        option.value;

                                    return (

                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                setPropertyType(
                                                    option.value
                                                )
                                            }
                                            disabled={
                                                isExporting
                                            }
                                            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                                selected
                                                    ? "border-green-700 bg-green-50 text-green-800 ring-1 ring-green-700"
                                                    : "border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50/40"
                                            } disabled:cursor-not-allowed disabled:opacity-60`}
                                        >

                                            {
                                                option.label
                                            }

                                        </button>

                                    );
                                }
                            )}

                        </div>

                    </div>

                    {/* ==================================================
                        Booking Date Filter
                    ================================================== */}

                    <div>

                        <div className="mb-3 flex items-center gap-2">

                            <CalendarDays
                                size={
                                    18
                                }
                                className="text-gray-500"
                            />

                            <label className="text-sm font-semibold text-gray-700">
                                Booking Date
                            </label>

                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                            <button
                                type="button"
                                onClick={() =>
                                    setDateMode(
                                        "ALL"
                                    )
                                }
                                disabled={
                                    isExporting
                                }
                                className={`rounded-xl border px-4 py-3 text-left transition ${
                                    dateMode ===
                                    "ALL"
                                        ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                                        : "border-gray-200 bg-white hover:border-green-300"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >

                                <p className={`text-sm font-semibold ${
                                    dateMode ===
                                    "ALL"
                                        ? "text-green-800"
                                        : "text-gray-700"
                                }`}>
                                    All Dates
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Export all booking dates
                                </p>

                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setDateMode(
                                        "RANGE"
                                    )
                                }
                                disabled={
                                    isExporting
                                }
                                className={`rounded-xl border px-4 py-3 text-left transition ${
                                    dateMode ===
                                    "RANGE"
                                        ? "border-green-700 bg-green-50 ring-1 ring-green-700"
                                        : "border-gray-200 bg-white hover:border-green-300"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >

                                <p className={`text-sm font-semibold ${
                                    dateMode ===
                                    "RANGE"
                                        ? "text-green-800"
                                        : "text-gray-700"
                                }`}>
                                    Date Range
                                </p>

                                <p className="mt-1 text-xs text-gray-500">
                                    Export selected booking period
                                </p>

                            </button>

                        </div>

                        {/* ==================================================
                            From / To
                        ================================================== */}

                        {
                            dateMode ===
                            "RANGE" && (

                                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

                                    <div>

                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            From Date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                fromDate
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    setFromDate(
                                                        event.target.value
                                                    )
                                            }
                                            disabled={
                                                isExporting
                                            }
                                            max={
                                                toDate ||
                                                undefined
                                            }
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                        />

                                    </div>

                                    <div>

                                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            To Date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                toDate
                                            }
                                            onChange={
                                                (
                                                    event
                                                ) =>
                                                    setToDate(
                                                        event.target.value
                                                    )
                                            }
                                            disabled={
                                                isExporting
                                            }
                                            min={
                                                fromDate ||
                                                undefined
                                            }
                                            className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                        />

                                    </div>

                                </div>

                            )
                        }

                    </div>

                    {/* ==================================================
                        Selection Preview
                    ================================================== */}

                    <div className="rounded-xl border border-green-100 bg-green-50/60 px-4 py-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                            Export Selection
                        </p>

                        <p className="mt-1 text-sm text-gray-700">

                            {
                                propertyType ===
                                    "ALL"
                                    ? "All Projects"
                                    : propertyType ===
                                        "RESIDENTIAL"
                                        ? "Residential Only"
                                        : "Commercial Only"
                            }

                            {" • "}

                            {
                                dateMode ===
                                    "ALL"
                                    ? "All Dates"
                                    : `${fromDate || "Start"} to ${toDate || "End"}`
                            }

                        </p>

                    </div>

                </div>

                {/* ==================================================
                    Footer
                ================================================== */}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                    <button
                        type="button"
                        onClick={
                            handleClose
                        }
                        disabled={
                            isExporting
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={
                            handleExport
                        }
                        disabled={
                            isExporting
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        <FileSpreadsheet
                            size={
                                18
                            }
                        />

                        {
                            isExporting
                                ? "Exporting..."
                                : "Export Excel"
                        }

                    </button>

                </div>

            </div>

        </div>
    );
}

export default ProjectExcelExportModal;
