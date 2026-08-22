import ExcelJS from "exceljs";

// ======================================================
// Types
// ======================================================

type BookingRecord = any;

type PropertyType =
    | "RESIDENTIAL"
    | "COMMERCIAL";

export type InstallmentExcelPropertyFilter =
    | "ALL"
    | "RESIDENTIAL"
    | "COMMERCIAL";

export interface InstallmentExcelExportOptions {
    propertyType?: InstallmentExcelPropertyFilter;
    fromDate?: string;
    toDate?: string;
}

// ======================================================
// Constants
// ======================================================

const RUPEE_FORMAT =
    '₹#,##0.00';

const DATE_FORMAT =
    "dd-mmm-yyyy";

const HEADER_FILL =
    "0B5D3B";

const SECTION_FILL =
    "DDF3E8";

const BORDER_COLOR =
    "D1D5DB";

// ======================================================
// Money Helpers
// ======================================================

const roundMoney = (
    value: number
) => {

    return Math.round(
        (
            value +
            Number.EPSILON
        ) *
        100
    ) / 100;
};

const toNumber = (
    value: unknown
) => {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const normalized =
        String(value)
            .replace(/₹/g, "")
            .replace(/,/g, "")
            .trim();

    const parsed =
        Number(normalized);

    return Number.isFinite(parsed)
        ? parsed
        : 0;
};

// ======================================================
// Property Type
// ======================================================

const getPropertyType = (
    booking: BookingRecord
): PropertyType => {

    const rawType =
        String(
            booking?.propertyType ??
            ""
        )
            .trim()
            .toUpperCase();

    if (
        rawType ===
        "COMMERCIAL"
    ) {
        return "COMMERCIAL";
    }

    if (
        rawType ===
        "RESIDENTIAL"
    ) {
        return "RESIDENTIAL";
    }

    const tower =
        String(
            booking?.tower ??
            ""
        )
            .trim()
            .toLowerCase();

    if (
        tower.includes(
            "commercial"
        )
    ) {
        return "COMMERCIAL";
    }

    return "RESIDENTIAL";
};

// ======================================================
// Booking Status
// ======================================================

const getBookingStatus = (
    booking: BookingRecord
) => {

    const status =
        String(
            booking?.status ??
            ""
        )
            .trim()
            .toLowerCase();

    if (
        status === "booked" ||
        status === "confirmed"
    ) {
        return "BOOKED";
    }

    if (
        status ===
        "cancelled"
    ) {
        return "CANCELLED";
    }

    if (
        status ===
        "completed"
    ) {
        return "COMPLETED";
    }

    if (
        status ===
        "pending"
    ) {
        return "PENDING";
    }

    return status
        ? status.toUpperCase()
        : "UNKNOWN";
};

// ======================================================
// Booking Helpers
// ======================================================

const getFinalSaleValue = (
    booking: BookingRecord
) => {

    const afterDiscount =
        toNumber(
            booking?.afterDiscountAmount
        );

    if (
        afterDiscount >
        0
    ) {
        return roundMoney(
            afterDiscount
        );
    }

    const total =
        toNumber(
            booking?.totalAmount
        );

    const discount =
        toNumber(
            booking?.discount
        );

    return roundMoney(
        Math.max(
            total -
            discount,
            0
        )
    );
};

const getEmployeeName = (
    booking: BookingRecord
) => {

    return (
        booking
            ?.assignedEmployee
            ?.name ||
        "Unassigned"
    );
};

const getInstallmentDisplayName = (
    sequence: number
) => {

    return sequence === 1
        ? "Booking Amount"
        : `Installment ${sequence - 1}`;
};

const getInstallmentStages = (
    booking: BookingRecord
): any[] => {

    return Array.isArray(
        booking?.installmentStages
    )
        ? booking.installmentStages
        : [];
};

// ======================================================
// Date Helpers
// ======================================================

const toExcelDate = (
    value: unknown
): Date | string => {

    if (!value) {
        return "-";
    }

    const date =
        new Date(
            String(value)
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date;
};

const getDateKey = (
    value: unknown
) => {

    if (!value) {
        return "";
    }

    const date =
        new Date(
            String(value)
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    return `${year}-${month}-${day}`;
};

const isPaymentInDateRange = (
    payment: any,
    fromDate?: string,
    toDate?: string
) => {

    if (
        !fromDate &&
        !toDate
    ) {
        return true;
    }

    const paymentDay =
        getDateKey(
            payment?.paymentDate
        );

    if (!paymentDay) {
        return false;
    }

    if (
        fromDate &&
        paymentDay <
        fromDate
    ) {
        return false;
    }

    if (
        toDate &&
        paymentDay >
        toDate
    ) {
        return false;
    }

    return true;
};

// ======================================================
// Payment Flattening
// ======================================================

interface FlattenedPayment {
    booking: BookingRecord;
    stage: any;
    payment: any;
}

const getAllPayments = (
    bookings: BookingRecord[]
): FlattenedPayment[] => {

    const result:
        FlattenedPayment[] =
        [];

    bookings.forEach(
        (
            booking
        ) => {

            getInstallmentStages(
                booking
            ).forEach(
                (
                    stage
                ) => {

                    const payments =
                        Array.isArray(
                            stage?.payments
                        )
                            ? stage.payments
                            : [];

                    payments.forEach(
                        (
                            payment: any
                        ) => {

                            result.push({
                                booking,
                                stage,
                                payment,
                            });
                        }
                    );
                }
            );
        }
    );

    return result;
};

// ======================================================
// Exact Financial Calculations
// ======================================================

const getStageLifetimeReceived = (
    stage: any
) => {

    const payments =
        Array.isArray(
            stage?.payments
        )
            ? stage.payments
            : [];

    return roundMoney(
        payments.reduce(
            (
                total:
                    number,
                payment:
                    any
            ) =>
                total +
                toNumber(
                    payment?.amount
                ),
            0
        )
    );
};

const getBookingLifetimeReceived = (
    booking: BookingRecord
) => {

    return roundMoney(
        getInstallmentStages(
            booking
        ).reduce(
            (
                total:
                    number,
                stage:
                    any
            ) =>
                total +
                getStageLifetimeReceived(
                    stage
                ),
            0
        )
    );
};

const getInstallmentPlannedTotal = (
    booking: BookingRecord
) => {

    return roundMoney(
        getInstallmentStages(
            booking
        ).reduce(
            (
                total:
                    number,
                stage:
                    any
            ) =>
                total +
                toNumber(
                    stage?.plannedAmount
                ),
            0
        )
    );
};

const getExactRemaining = (
    booking: BookingRecord
) => {

    return roundMoney(
        Math.max(
            getFinalSaleValue(
                booking
            ) -
            getBookingLifetimeReceived(
                booking
            ),
            0
        )
    );
};

const getSystemRemaining = (
    booking: BookingRecord
) => {

    if (
        booking?.remainingAmount ===
        null ||
        booking?.remainingAmount ===
        undefined ||
        String(
            booking.remainingAmount
        ).trim() ===
        ""
    ) {
        return getExactRemaining(
            booking
        );
    }

    return roundMoney(
        toNumber(
            booking.remainingAmount
        )
    );
};

// ======================================================
// Stage Status
// ======================================================

const getExactStageStatus = (
    stage: any
) => {

    const planned =
        roundMoney(
            toNumber(
                stage?.plannedAmount
            )
        );

    const received =
        getStageLifetimeReceived(
            stage
        );

    const balance =
        roundMoney(
            Math.max(
                planned -
                received,
                0
            )
        );

    if (
        balance <=
        0
    ) {
        return "PAID";
    }

    if (
        received >
        0
    ) {
        return "PARTIAL";
    }

    return "PENDING";
};

// ======================================================
// Current Installment
// ======================================================

const getCurrentInstallment = (
    booking: BookingRecord
) => {

    const backendCurrent =
        booking
            ?.installmentSummary
            ?.currentInstallment;

    if (
        backendCurrent
    ) {
        return {
            name:
                getInstallmentDisplayName(
                    Number(
                        backendCurrent
                            .sequence
                    )
                ),

            status:
                String(
                    backendCurrent
                        .status ??
                    "-"
                ),
        };
    }

    const stages =
        getInstallmentStages(
            booking
        );

    const current =
        stages.find(
            (
                stage
            ) =>
                getExactStageStatus(
                    stage
                ) !==
                "PAID"
        );

    if (current) {
        return {
            name:
                getInstallmentDisplayName(
                    Number(
                        current.sequence
                    )
                ),

            status:
                getExactStageStatus(
                    current
                ),
        };
    }

    const lastStage =
        stages[
        stages.length -
        1
        ];

    if (lastStage) {
        return {
            name:
                getInstallmentDisplayName(
                    Number(
                        lastStage.sequence
                    )
                ),

            status:
                getExactStageStatus(
                    lastStage
                ),
        };
    }

    return {
        name: "-",
        status: "-",
    };
};

// ======================================================
// Excel Styling
// ======================================================

const applyTitle = (
    worksheet:
        ExcelJS.Worksheet,
    title:
        string,
    lastColumn:
        number
) => {

    worksheet.mergeCells(
        1,
        1,
        1,
        lastColumn
    );

    const cell =
        worksheet.getCell(
            1,
            1
        );

    cell.value =
        title;

    cell.font = {
        bold: true,
        size: 18,
        color: {
            argb:
                "FFFFFFFF",
        },
    };

    cell.fill = {
        type:
            "pattern",

        pattern:
            "solid",

        fgColor: {
            argb:
                `FF${HEADER_FILL}`,
        },
    };

    cell.alignment = {
        vertical:
            "middle",

        horizontal:
            "center",
    };

    worksheet.getRow(
        1
    ).height =
        32;
};

const applyGeneratedInfo = (
    worksheet:
        ExcelJS.Worksheet,
    lastColumn:
        number,
    options:
        InstallmentExcelExportOptions
) => {

    worksheet.mergeCells(
        2,
        1,
        2,
        lastColumn
    );

    const property =
        options.propertyType ===
            "RESIDENTIAL"
            ? "Residential"
            : options.propertyType ===
                "COMMERCIAL"
                ? "Commercial"
                : "All Projects";

    const dateText =
        options.fromDate ||
            options.toDate
            ? `${options.fromDate || "Start"} to ${options.toDate || "End"}`
            : "All Payment Dates";

    const cell =
        worksheet.getCell(
            2,
            1
        );

    cell.value =
        `Generated: ${new Date().toLocaleString(
            "en-IN"
        )} | ${property} | Payment Date: ${dateText}`;

    cell.font = {
        italic:
            true,

        size:
            10,

        color: {
            argb:
                "FF6B7280",
        },
    };

    cell.alignment = {
        horizontal:
            "center",

        wrapText:
            true,
    };
};

const styleSectionHeader = (
    worksheet:
        ExcelJS.Worksheet,
    rowNumber:
        number,
    title:
        string,
    lastColumn:
        number
) => {

    worksheet.mergeCells(
        rowNumber,
        1,
        rowNumber,
        lastColumn
    );

    const cell =
        worksheet.getCell(
            rowNumber,
            1
        );

    cell.value =
        title;

    cell.font = {
        bold:
            true,

        size:
            12,

        color: {
            argb:
                "FF0B5D3B",
        },
    };

    cell.fill = {
        type:
            "pattern",

        pattern:
            "solid",

        fgColor: {
            argb:
                `FF${SECTION_FILL}`,
        },
    };

    cell.alignment = {
        vertical:
            "middle",
    };

    worksheet.getRow(
        rowNumber
    ).height =
        24;
};

const styleHeaderRow = (
    row:
        ExcelJS.Row
) => {

    row.eachCell(
        (
            cell
        ) => {

            cell.font = {
                bold:
                    true,

                color: {
                    argb:
                        "FFFFFFFF",
                },
            };

            cell.fill = {
                type:
                    "pattern",

                pattern:
                    "solid",

                fgColor: {
                    argb:
                        `FF${HEADER_FILL}`,
                },
            };

            cell.alignment = {
                vertical:
                    "middle",

                horizontal:
                    "center",

                wrapText:
                    true,
            };

            cell.border = {
                top: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },

                left: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },

                bottom: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },

                right: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },
            };
        }
    );

    row.height =
        30;
};

const styleDataRow = (
    row:
        ExcelJS.Row
) => {

    row.eachCell(
        {
            includeEmpty:
                true,
        },
        (
            cell
        ) => {

            cell.alignment = {
                vertical:
                    "middle",

                wrapText:
                    true,
            };

            cell.border = {
                top: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },

                left: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },

                bottom: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },

                right: {
                    style:
                        "thin",

                    color: {
                        argb:
                            `FF${BORDER_COLOR}`,
                    },
                },
            };
        }
    );
};

// ======================================================
// Table Writer
// ======================================================

interface TableOptions {
    headers:
    string[];

    rows:
    unknown[][];

    widths:
    number[];

    currencyColumns?:
    number[];

    dateColumns?:
    number[];
}

const writeTable = (
    worksheet:
        ExcelJS.Worksheet,
    startRow:
        number,
    options:
        TableOptions
) => {

    const header =
        worksheet.getRow(
            startRow
        );

    header.values =
        options.headers;

    styleHeaderRow(
        header
    );

    options.widths.forEach(
        (
            width,
            index
        ) => {

            worksheet
                .getColumn(
                    index +
                    1
                )
                .width =
                width;
        }
    );

    let currentRow =
        startRow +
        1;

    options.rows.forEach(
        (
            values
        ) => {

            const row =
                worksheet.getRow(
                    currentRow
                );

            values.forEach(
                (
                    value,
                    index
                ) => {

                    row.getCell(
                        index +
                        1
                    ).value =
                        value as
                        ExcelJS.CellValue;
                }
            );

            styleDataRow(
                row
            );

            options
                .currencyColumns
                ?.forEach(
                    (
                        column
                    ) => {

                        row.getCell(
                            column
                        ).numFmt =
                            RUPEE_FORMAT;
                    }
                );

            options
                .dateColumns
                ?.forEach(
                    (
                        column
                    ) => {

                        const cell =
                            row.getCell(
                                column
                            );

                        if (
                            cell.value instanceof
                            Date
                        ) {
                            cell.numFmt =
                                DATE_FORMAT;
                        }
                    }
                );

            currentRow +=
                1;
        }
    );

    if (
        options.rows.length ===
        0
    ) {

        worksheet.mergeCells(
            currentRow,
            1,
            currentRow,
            options.headers.length
        );

        const cell =
            worksheet.getCell(
                currentRow,
                1
            );

        cell.value =
            "No records found";

        cell.font = {
            italic:
                true,

            color: {
                argb:
                    "FF6B7280",
            },
        };

        cell.alignment = {
            horizontal:
                "center",
        };

        currentRow +=
            1;
    }

    worksheet.autoFilter = {
        from: {
            row:
                startRow,

            column:
                1,
        },

        to: {
            row:
                Math.max(
                    currentRow -
                    1,
                    startRow
                ),

            column:
                options
                    .headers
                    .length,
        },
    };

    return currentRow;
};

// ======================================================
// Export
// ======================================================

export const exportInstallmentReportExcel =
    async (
        bookings:
            BookingRecord[],
        options:
            InstallmentExcelExportOptions =
            {}
    ) => {

        const propertyFilter =
            options.propertyType ??
            "ALL";

        const sourceBookings =
            Array.isArray(
                bookings
            )
                ? bookings
                : [];

        // ----------------------------------------------
        // Project filter
        // ----------------------------------------------

        const propertyBookings =
            sourceBookings.filter(
                (
                    booking
                ) =>
                    propertyFilter ===
                    "ALL" ||
                    getPropertyType(
                        booking
                    ) ===
                    propertyFilter
            );

        // ----------------------------------------------
        // Every immutable payment
        // ----------------------------------------------

        const allPayments =
            getAllPayments(
                propertyBookings
            );

        // ----------------------------------------------
        // Payment Date filter
        // ----------------------------------------------

        const periodPayments =
            allPayments
                .filter(
                    (
                        item
                    ) =>
                        isPaymentInDateRange(
                            item.payment,
                            options.fromDate,
                            options.toDate
                        )
                )
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const aTime =
                            new Date(
                                a.payment
                                    ?.paymentDate ??
                                0
                            ).getTime();

                        const bTime =
                            new Date(
                                b.payment
                                    ?.paymentDate ??
                                0
                            ).getTime();

                        return (
                            aTime -
                            bTime
                        );
                    }
                );

        // ----------------------------------------------
        // Bookings included in summary
        // Date Range -> only bookings having payment
        // All Dates  -> all bookings having installment plan
        // ----------------------------------------------

        let summaryBookings:
            BookingRecord[];

        if (
            options.fromDate ||
            options.toDate
        ) {

            const ids =
                new Set(
                    periodPayments.map(
                        (
                            item
                        ) =>
                            String(
                                item.booking
                                    ?.id
                            )
                    )
                );

            summaryBookings =
                propertyBookings.filter(
                    (
                        booking
                    ) =>
                        ids.has(
                            String(
                                booking?.id
                            )
                        )
                );

        } else {

            summaryBookings =
                propertyBookings.filter(
                    (
                        booking
                    ) =>
                        getInstallmentStages(
                            booking
                        ).length >
                        0
                );
        }

        summaryBookings =
            [...summaryBookings]
                .sort(
                    (
                        a,
                        b
                    ) => {

                        const projectCompare =
                            String(
                                a?.tower ??
                                ""
                            ).localeCompare(
                                String(
                                    b?.tower ??
                                    ""
                                ),
                                undefined,
                                {
                                    numeric:
                                        true,
                                }
                            );

                        if (
                            projectCompare !==
                            0
                        ) {
                            return projectCompare;
                        }

                        return String(
                            a?.flatNumber ??
                            ""
                        ).localeCompare(
                            String(
                                b?.flatNumber ??
                                ""
                            ),
                            undefined,
                            {
                                numeric:
                                    true,
                            }
                        );
                    }
                );

        // ----------------------------------------------
        // Period payment amount per booking
        // ----------------------------------------------

        const periodReceivedByBooking =
            new Map<
                string,
                number
            >();

        periodPayments.forEach(
            (
                item
            ) => {

                const bookingId =
                    String(
                        item.booking
                            ?.id
                    );

                const previous =
                    periodReceivedByBooking
                        .get(
                            bookingId
                        ) ??
                    0;

                periodReceivedByBooking
                    .set(
                        bookingId,
                        roundMoney(
                            previous +
                            toNumber(
                                item.payment
                                    ?.amount
                            )
                        )
                    );
            }
        );

        // ----------------------------------------------
        // Period payment amount per stage
        // ----------------------------------------------

        const periodReceivedByStage =
            new Map<
                string,
                number
            >();

        periodPayments.forEach(
            (
                item
            ) => {

                const stageId =
                    String(
                        item.stage
                            ?.id
                    );

                const previous =
                    periodReceivedByStage
                        .get(
                            stageId
                        ) ??
                    0;

                periodReceivedByStage
                    .set(
                        stageId,
                        roundMoney(
                            previous +
                            toNumber(
                                item.payment
                                    ?.amount
                            )
                        )
                    );
            }
        );

        // ----------------------------------------------
        // Running totals for Payment History
        // ----------------------------------------------

        const runningByPaymentId =
            new Map<
                string,
                {
                    runningReceived:
                    number;

                    remainingAfterPayment:
                    number;
                }
            >();

        const paymentsByBooking =
            new Map<
                string,
                FlattenedPayment[]
            >();

        allPayments.forEach(
            (
                item
            ) => {

                const bookingId =
                    String(
                        item.booking
                            ?.id
                    );

                if (
                    !paymentsByBooking
                        .has(
                            bookingId
                        )
                ) {
                    paymentsByBooking
                        .set(
                            bookingId,
                            []
                        );
                }

                paymentsByBooking
                    .get(
                        bookingId
                    )!
                    .push(
                        item
                    );
            }
        );

        paymentsByBooking.forEach(
            (
                items
            ) => {

                items.sort(
                    (
                        a,
                        b
                    ) => {

                        const dateDiff =
                            new Date(
                                a.payment
                                    ?.paymentDate ??
                                0
                            ).getTime() -
                            new Date(
                                b.payment
                                    ?.paymentDate ??
                                0
                            ).getTime();

                        if (
                            dateDiff !==
                            0
                        ) {
                            return dateDiff;
                        }

                        return new Date(
                            a.payment
                                ?.createdAt ??
                            0
                        ).getTime() -
                            new Date(
                                b.payment
                                    ?.createdAt ??
                                0
                            ).getTime();
                    }
                );

                let running =
                    0;

                items.forEach(
                    (
                        item
                    ) => {

                        running =
                            roundMoney(
                                running +
                                toNumber(
                                    item.payment
                                        ?.amount
                                )
                            );

                        const finalSale =
                            getFinalSaleValue(
                                item.booking
                            );

                        runningByPaymentId
                            .set(
                                String(
                                    item.payment
                                        ?.id
                                ),
                                {
                                    runningReceived:
                                        running,

                                    remainingAfterPayment:
                                        roundMoney(
                                            Math.max(
                                                finalSale -
                                                running,
                                                0
                                            )
                                        ),
                                }
                            );
                    }
                );
            }
        );

        // ==================================================
        // Workbook
        // ==================================================

        const workbook =
            new ExcelJS
                .Workbook();

        workbook.creator =
            "Emerald Heights CRM";

        workbook.company =
            "Emerald Heights";

        workbook.created =
            new Date();

        workbook.modified =
            new Date();

        // ==================================================
        // 1. Installment Summary
        // ==================================================

        const summaryHeaders = [
            "Property Type",
            "Tower / Project",
            "Unit",
            "Booking Code",
            "Customer",
            "Mobile",
            "Booking Status",
            "Booking Date",
            "Final Sale Value",
            "Installment Plan Total",
            "Period Received",
            "Lifetime Received",
            "Exact Remaining",
            "System Remaining",
            "Reconciliation Difference",
            "Current Installment",
            "Current Status",
            "Sales Member",
        ];

        const summarySheet =
            workbook.addWorksheet(
                "Installment Summary",
                {
                    views: [
                        {
                            state:
                                "frozen",

                            ySplit:
                                12,
                        },
                    ],
                }
            );

        applyTitle(
            summarySheet,
            "EMERALD HEIGHTS - INSTALLMENT REPORT",
            summaryHeaders.length
        );

        applyGeneratedInfo(
            summarySheet,
            summaryHeaders.length,
            options
        );

        const totalFinalSale =
            roundMoney(
                summaryBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getFinalSaleValue(
                            booking
                        ),
                    0
                )
            );

        const totalPlan =
            roundMoney(
                summaryBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getInstallmentPlannedTotal(
                            booking
                        ),
                    0
                )
            );

        const totalPeriodReceived =
            roundMoney(
                periodPayments.reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        toNumber(
                            item.payment
                                ?.amount
                        ),
                    0
                )
            );

        const totalLifetimeReceived =
            roundMoney(
                summaryBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getBookingLifetimeReceived(
                            booking
                        ),
                    0
                )
            );

        const totalExactRemaining =
            roundMoney(
                summaryBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getExactRemaining(
                            booking
                        ),
                    0
                )
            );

        styleSectionHeader(
            summarySheet,
            4,
            "Exact Financial Summary",
            summaryHeaders.length
        );

        const metricHeader =
            summarySheet.getRow(
                5
            );

        metricHeader.values = [
            "Bookings",
            "Payments in Period",
            "Final Sale Value",
            "Installment Plan Total",
            "Period Received",
            "Lifetime Received",
            "Exact Remaining",
        ];

        styleHeaderRow(
            metricHeader
        );

        const metricRow =
            summarySheet.getRow(
                6
            );

        metricRow.values = [
            summaryBookings.length,
            periodPayments.length,
            totalFinalSale,
            totalPlan,
            totalPeriodReceived,
            totalLifetimeReceived,
            totalExactRemaining,
        ];

        styleDataRow(
            metricRow
        );

        [
            3,
            4,
            5,
            6,
            7,
        ].forEach(
            (
                column
            ) => {

                metricRow.getCell(
                    column
                ).numFmt =
                    RUPEE_FORMAT;
            }
        );

        summarySheet
            .getColumn(
                1
            )
            .width =
            18;

        summarySheet
            .getColumn(
                2
            )
            .width =
            20;

        summarySheet
            .getColumn(
                3
            )
            .width =
            20;

        summarySheet
            .getColumn(
                4
            )
            .width =
            22;

        summarySheet
            .getColumn(
                5
            )
            .width =
            22;

        summarySheet
            .getColumn(
                6
            )
            .width =
            22;

        summarySheet
            .getColumn(
                7
            )
            .width =
            22;

        styleSectionHeader(
            summarySheet,
            9,
            "Booking Wise Installment Summary",
            summaryHeaders.length
        );

        writeTable(
            summarySheet,
            10,
            {
                headers:
                    summaryHeaders,

                rows:
                    summaryBookings.map(
                        (
                            booking
                        ) => {

                            const bookingId =
                                String(
                                    booking?.id
                                );

                            const current =
                                getCurrentInstallment(
                                    booking
                                );

                            const exactRemaining =
                                getExactRemaining(
                                    booking
                                );

                            const systemRemaining =
                                getSystemRemaining(
                                    booking
                                );

                            return [
                                getPropertyType(
                                    booking
                                ),

                                booking
                                    ?.tower ||
                                "-",

                                booking
                                    ?.flatNumber ||
                                "-",

                                booking
                                    ?.bookingCode ||
                                "-",

                                booking
                                    ?.customerName ||
                                "-",

                                booking
                                    ?.mobile ||
                                "-",

                                getBookingStatus(
                                    booking
                                ),

                                toExcelDate(
                                    booking
                                        ?.bookingDate
                                ),

                                getFinalSaleValue(
                                    booking
                                ),

                                getInstallmentPlannedTotal(
                                    booking
                                ),

                                periodReceivedByBooking
                                    .get(
                                        bookingId
                                    ) ??
                                0,

                                getBookingLifetimeReceived(
                                    booking
                                ),

                                exactRemaining,

                                systemRemaining,

                                roundMoney(
                                    systemRemaining -
                                    exactRemaining
                                ),

                                current.name,

                                current.status,

                                getEmployeeName(
                                    booking
                                ),
                            ];
                        }
                    ),

                widths: [
                    18,
                    20,
                    14,
                    18,
                    24,
                    16,
                    16,
                    16,
                    20,
                    22,
                    20,
                    20,
                    20,
                    20,
                    22,
                    20,
                    18,
                    24,
                ],

                currencyColumns: [
                    9,
                    10,
                    11,
                    12,
                    13,
                    14,
                    15,
                ],

                dateColumns: [
                    8,
                ],
            }
        );

        // ==================================================
        // 2. Installment Breakdown
        // ==================================================

        const breakdownHeaders = [
            "Property Type",
            "Tower / Project",
            "Unit",
            "Booking Code",
            "Customer",
            "Stage No.",
            "Installment",
            "Planned Amount",
            "Period Received",
            "Lifetime Received",
            "Balance",
            "Status",
            "Last Payment Date",
        ];

        const breakdownSheet =
            workbook.addWorksheet(
                "Installment Breakdown",
                {
                    views: [
                        {
                            state:
                                "frozen",

                            ySplit:
                                4,
                        },
                    ],
                }
            );

        applyTitle(
            breakdownSheet,
            "INSTALLMENT STAGE BREAKDOWN",
            breakdownHeaders.length
        );

        applyGeneratedInfo(
            breakdownSheet,
            breakdownHeaders.length,
            options
        );

        const breakdownRows:
            unknown[][] =
            [];

        summaryBookings.forEach(
            (
                booking
            ) => {

                getInstallmentStages(
                    booking
                ).forEach(
                    (
                        stage
                    ) => {

                        const planned =
                            roundMoney(
                                toNumber(
                                    stage
                                        ?.plannedAmount
                                )
                            );

                        const lifetimeReceived =
                            getStageLifetimeReceived(
                                stage
                            );

                        const balance =
                            roundMoney(
                                Math.max(
                                    planned -
                                    lifetimeReceived,
                                    0
                                )
                            );

                        const stagePayments =
                            Array.isArray(
                                stage
                                    ?.payments
                            )
                                ? stage.payments
                                : [];

                        const lastPayment =
                            [...stagePayments]
                                .sort(
                                    (
                                        a,
                                        b
                                    ) =>
                                        new Date(
                                            b
                                                ?.paymentDate ??
                                            0
                                        ).getTime() -
                                        new Date(
                                            a
                                                ?.paymentDate ??
                                            0
                                        ).getTime()
                                )[0];

                        breakdownRows.push([
                            getPropertyType(
                                booking
                            ),

                            booking
                                ?.tower ||
                            "-",

                            booking
                                ?.flatNumber ||
                            "-",

                            booking
                                ?.bookingCode ||
                            "-",

                            booking
                                ?.customerName ||
                            "-",

                            stage
                                ?.sequence ??
                            "-",

                            getInstallmentDisplayName(
                                Number(
                                    stage
                                        ?.sequence ??
                                    0
                                )
                            ),

                            planned,

                            periodReceivedByStage
                                .get(
                                    String(
                                        stage
                                            ?.id
                                    )
                                ) ??
                            0,

                            lifetimeReceived,

                            balance,

                            getExactStageStatus(
                                stage
                            ),

                            lastPayment
                                ? toExcelDate(
                                    lastPayment
                                        .paymentDate
                                )
                                : "-",
                        ]);
                    }
                );
            }
        );

        styleSectionHeader(
            breakdownSheet,
            3,
            `Installment Stages: ${breakdownRows.length}`,
            breakdownHeaders.length
        );

        writeTable(
            breakdownSheet,
            4,
            {
                headers:
                    breakdownHeaders,

                rows:
                    breakdownRows,

                widths: [
                    18,
                    20,
                    14,
                    18,
                    24,
                    12,
                    20,
                    20,
                    20,
                    20,
                    20,
                    14,
                    18,
                ],

                currencyColumns: [
                    8,
                    9,
                    10,
                    11,
                ],

                dateColumns: [
                    13,
                ],
            }
        );

        // ==================================================
        // 3. Payment History
        // ==================================================

        const paymentHeaders = [
            "Payment Date",
            "Property Type",
            "Tower / Project",
            "Unit",
            "Booking Code",
            "Customer",
            "Installment",
            "Planned Amount",
            "Amount Received",
            "Payment Mode",
            "Reference No.",
            "Remarks",
            "Running Received",
            "Remaining After Payment",
            "Sales Member",
            "Booking Status",
        ];

        const paymentSheet =
            workbook.addWorksheet(
                "Payment History",
                {
                    views: [
                        {
                            state:
                                "frozen",

                            ySplit:
                                4,
                        },
                    ],
                }
            );

        applyTitle(
            paymentSheet,
            "INSTALLMENT PAYMENT HISTORY",
            paymentHeaders.length
        );

        applyGeneratedInfo(
            paymentSheet,
            paymentHeaders.length,
            options
        );

        styleSectionHeader(
            paymentSheet,
            3,
            `Payments in Selected Period: ${periodPayments.length} | Total Received: ₹${totalPeriodReceived.toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits:
                        2,

                    maximumFractionDigits:
                        2,
                }
            )}`,
            paymentHeaders.length
        );

        writeTable(
            paymentSheet,
            4,
            {
                headers:
                    paymentHeaders,

                rows:
                    periodPayments.map(
                        (
                            item
                        ) => {

                            const running =
                                runningByPaymentId
                                    .get(
                                        String(
                                            item.payment
                                                ?.id
                                        )
                                    );

                            return [
                                toExcelDate(
                                    item.payment
                                        ?.paymentDate
                                ),

                                getPropertyType(
                                    item.booking
                                ),

                                item.booking
                                    ?.tower ||
                                "-",

                                item.booking
                                    ?.flatNumber ||
                                "-",

                                item.booking
                                    ?.bookingCode ||
                                "-",

                                item.booking
                                    ?.customerName ||
                                "-",

                                getInstallmentDisplayName(
                                    Number(
                                        item.stage
                                            ?.sequence ??
                                        0
                                    )
                                ),

                                roundMoney(
                                    toNumber(
                                        item.stage
                                            ?.plannedAmount
                                    )
                                ),

                                roundMoney(
                                    toNumber(
                                        item.payment
                                            ?.amount
                                    )
                                ),

                                item.payment
                                    ?.paymentMode ||
                                "-",

                                item.payment
                                    ?.referenceNo ||
                                "-",

                                item.payment
                                    ?.remarks ||
                                "-",

                                running
                                    ?.runningReceived ??
                                0,

                                running
                                    ?.remainingAfterPayment ??
                                getExactRemaining(
                                    item.booking
                                ),

                                getEmployeeName(
                                    item.booking
                                ),

                                getBookingStatus(
                                    item.booking
                                ),
                            ];
                        }
                    ),

                widths: [
                    18,
                    18,
                    20,
                    14,
                    18,
                    24,
                    20,
                    20,
                    20,
                    18,
                    20,
                    32,
                    20,
                    24,
                    24,
                    16,
                ],

                currencyColumns: [
                    8,
                    9,
                    13,
                    14,
                ],

                dateColumns: [
                    1,
                ],
            }
        );

        // ==================================================
        // Download
        // ==================================================

        const buffer =
            await workbook
                .xlsx
                .writeBuffer();

        const blob =
            new Blob(
                [
                    buffer as
                    BlobPart,
                ],
                {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const anchor =
            document.createElement(
                "a"
            );

        const today =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );

        const datePart =
            options.fromDate ||
                options.toDate
                ? `${options.fromDate || "Start"}_to_${options.toDate || "End"}`
                : "All_Dates";

        anchor.href =
            url;

        anchor.download =
            `Emerald_Heights_Installment_Report_${datePart}_${today}.xlsx`;

        document.body
            .appendChild(
                anchor
            );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
            url
        );
    };