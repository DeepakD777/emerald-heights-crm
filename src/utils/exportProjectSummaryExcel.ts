import ExcelJS from "exceljs";

// ======================================================
// Types
// ======================================================

type BookingRecord =
    any;

type PropertyType =
    | "RESIDENTIAL"
    | "COMMERCIAL";

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

const LIGHT_FILL =
    "F7FAF8";

const BORDER_COLOR =
    "D1D5DB";

// ======================================================
// Safe Number
// ======================================================

const toNumber = (
    value:
        unknown
) => {

    if (
        value ===
        null ||
        value ===
        undefined ||
        value ===
        ""
    ) {

        return 0;
    }

    const normalized =
        String(
            value
        )
            .replace(
                /₹/g,
                ""
            )
            .replace(
                /,/g,
                ""
            )
            .trim();

    const parsed =
        Number(
            normalized
        );

    return Number.isFinite(
        parsed
    )
        ? parsed
        : 0;
};

// ======================================================
// Property Type
// ======================================================

const getPropertyType = (
    booking:
        BookingRecord
): PropertyType => {

    const propertyType =
        String(
            booking
                ?.propertyType ??
            ""
        )
            .trim()
            .toUpperCase();

    if (
        propertyType ===
        "COMMERCIAL"
    ) {

        return "COMMERCIAL";
    }

    if (
        propertyType ===
        "RESIDENTIAL"
    ) {

        return "RESIDENTIAL";
    }

    const tower =
        String(
            booking
                ?.tower ??
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
// Status
// ======================================================

const normalizeStatus = (
    value:
        unknown
) => {

    return String(
        value ??
        ""
    )
        .trim()
        .toLowerCase();
};

const getStatusLabel = (
    booking:
        BookingRecord
) => {

    const status =
        normalizeStatus(
            booking?.status
        );

    if (
        status ===
        "cancelled"
    ) {

        return "CANCELLED";
    }

    if (
        status ===
        "booked" ||
        status ===
        "confirmed"
    ) {

        return "BOOKED";
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

const isCancelledBooking = (
    booking:
        BookingRecord
) => {

    return (
        normalizeStatus(
            booking?.status
        ) ===
            "cancelled" ||
        Boolean(
            booking?.archivedAt
        )
    );
};

// ======================================================
// Amount Helpers
// ======================================================

const getBookingAmount = (
    booking:
        BookingRecord
) => {

    return toNumber(
        booking
            ?.bookingAmount
    );
};

const getFinalAmount = (
    booking:
        BookingRecord
) => {

    const afterDiscountAmount =
        toNumber(
            booking
                ?.afterDiscountAmount
        );

    if (
        afterDiscountAmount >
        0
    ) {

        return (
            afterDiscountAmount
        );
    }

    const totalAmount =
        toNumber(
            booking
                ?.totalAmount
        );

    const discount =
        toNumber(
            booking
                ?.discount
        );

    return Math.max(
        totalAmount -
        discount,
        0
    );
};

const getRemainingAmount = (
    booking:
        BookingRecord
) => {

    const rawRemaining =
        booking
            ?.remainingAmount;

    if (
        rawRemaining !==
            null &&
        rawRemaining !==
            undefined &&
        String(
            rawRemaining
        )
            .trim() !==
            ""
    ) {

        return toNumber(
            rawRemaining
        );
    }

    const finalAmount =
        getFinalAmount(
            booking
        );

    const bookingAmount =
        getBookingAmount(
            booking
        );

    if (
        finalAmount <=
        0
    ) {

        return 0;
    }

    return Math.max(
        finalAmount -
        bookingAmount,
        0
    );
};

// ======================================================
// Date Helper
// ======================================================

const toExcelDate = (
    value:
        unknown
): Date | string => {

    if (!value) {
        return "-";
    }

    const date =
        new Date(
            String(
                value
            )
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );
    }

    return date;
};

// ======================================================
// Floor Helper
// ======================================================

const getFloorLabel = (
    value:
        unknown
) => {

    const floor =
        Number(
            value
        );

    if (
        !Number.isFinite(
            floor
        )
    ) {

        return "-";
    }

    if (
        floor ===
        0
    ) {

        return "Ground Floor";
    }

    const lastTwoDigits =
        floor %
        100;

    const lastDigit =
        floor %
        10;

    let suffix =
        "th";

    if (
        lastTwoDigits <
            11 ||
        lastTwoDigits >
            13
    ) {

        if (
            lastDigit ===
            1
        ) {

            suffix =
                "st";

        } else if (
            lastDigit ===
            2
        ) {

            suffix =
                "nd";

        } else if (
            lastDigit ===
            3
        ) {

            suffix =
                "rd";
        }
    }

    return (
        `${floor}${suffix} Floor`
    );
};

// ======================================================
// Employee Helper
// ======================================================

const getEmployeeName = (
    booking:
        BookingRecord
) => {

    return (
        booking
            ?.assignedEmployee
            ?.name ||
        "Unassigned"
    );
};

const getEmployeeRole = (
    booking:
        BookingRecord
) => {

    return String(
        booking
            ?.assignedEmployee
            ?.role ??
        ""
    )
        .replace(
            /_/g,
            " "
        )
        .trim();
};

// ======================================================
// Sheet Styling
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
        bold:
            true,

        size:
            18,

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
        number
) => {

    worksheet.mergeCells(
        2,
        1,
        2,
        lastColumn
    );

    const cell =
        worksheet.getCell(
            2,
            1
        );

    cell.value =
        `Generated: ${new Date().toLocaleString(
            "en-IN"
        )}`;

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
        28;
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
        Array<
            Array<
                unknown
            >
        >;

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

    const headerRow =
        worksheet.getRow(
            startRow
        );

    headerRow.values =
        options.headers;

    styleHeaderRow(
        headerRow
    );

    options.widths
        .forEach(
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

    options.rows
        .forEach(
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
                            )
                                .numFmt =
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

        const emptyRow =
            worksheet.getRow(
                currentRow
            );

        worksheet.mergeCells(
            currentRow,
            1,
            currentRow,
            options.headers.length
        );

        emptyRow.getCell(
            1
        ).value =
            "No records found";

        emptyRow.getCell(
            1
        ).alignment = {
            horizontal:
                "center",
        };

        emptyRow.getCell(
            1
        ).font = {
            italic:
                true,

            color: {
                argb:
                    "FF6B7280",
            },
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
// Tower / Project Summary
// ======================================================

const buildProjectGroups = (
    bookings:
        BookingRecord[]
) => {

    const groups =
        new Map<
            string,
            {
                project:
                    string;

                bookingCount:
                    number;

                bookingAmount:
                    number;

                remainingAmount:
                    number;

                finalAmount:
                    number;

                employees:
                    Set<string>;
            }
        >();

    bookings.forEach(
        (
            booking
        ) => {

            const project =
                String(
                    booking
                        ?.tower ||
                    "Unspecified"
                )
                    .trim() ||
                "Unspecified";

            if (
                !groups.has(
                    project
                )
            ) {

                groups.set(
                    project,
                    {
                        project,

                        bookingCount:
                            0,

                        bookingAmount:
                            0,

                        remainingAmount:
                            0,

                        finalAmount:
                            0,

                        employees:
                            new Set<
                                string
                            >(),
                    }
                );
            }

            const group =
                groups.get(
                    project
                )!;

            group.bookingCount +=
                1;

            group.bookingAmount +=
                getBookingAmount(
                    booking
                );

            group.remainingAmount +=
                getRemainingAmount(
                    booking
                );

            group.finalAmount +=
                getFinalAmount(
                    booking
                );

            group.employees.add(
                getEmployeeName(
                    booking
                )
            );
        }
    );

    return Array.from(
        groups.values()
    )
        .sort(
            (
                a,
                b
            ) =>
                a.project.localeCompare(
                    b.project,
                    undefined,
                    {
                        numeric:
                            true,

                        sensitivity:
                            "base",
                    }
                )
        );
};

// ======================================================
// Employee Summary
// ======================================================

const buildEmployeeSummary = (
    bookings:
        BookingRecord[]
) => {

    const employees =
        new Map<
            string,
            {
                name:
                    string;

                role:
                    string;

                residential:
                    number;

                commercial:
                    number;

                total:
                    number;

                received:
                    number;

                remaining:
                    number;

                finalAmount:
                    number;
            }
        >();

    bookings.forEach(
        (
            booking
        ) => {

            const employeeName =
                getEmployeeName(
                    booking
                );

            const employeeId =
                String(
                    booking
                        ?.assignedEmployee
                        ?.id ||
                    booking
                        ?.employeeId ||
                    employeeName
                );

            if (
                !employees.has(
                    employeeId
                )
            ) {

                employees.set(
                    employeeId,
                    {
                        name:
                            employeeName,

                        role:
                            getEmployeeRole(
                                booking
                            ),

                        residential:
                            0,

                        commercial:
                            0,

                        total:
                            0,

                        received:
                            0,

                        remaining:
                            0,

                        finalAmount:
                            0,
                    }
                );
            }

            const employee =
                employees.get(
                    employeeId
                )!;

            const propertyType =
                getPropertyType(
                    booking
                );

            if (
                propertyType ===
                "RESIDENTIAL"
            ) {

                employee
                    .residential +=
                    1;

            } else {

                employee
                    .commercial +=
                    1;
            }

            employee.total +=
                1;

            employee.received +=
                getBookingAmount(
                    booking
                );

            employee.remaining +=
                getRemainingAmount(
                    booking
                );

            employee.finalAmount +=
                getFinalAmount(
                    booking
                );
        }
    );

    return Array.from(
        employees.values()
    )
        .sort(
            (
                a,
                b
            ) => {

                if (
                    b.total !==
                    a.total
                ) {

                    return (
                        b.total -
                        a.total
                    );
                }

                return a.name
                    .localeCompare(
                        b.name
                    );
            }
        );
};

// ======================================================
// Booking Row
// ======================================================

const getBookingRow = (
    booking:
        BookingRecord
) => {

    return [
        booking
            ?.bookingCode ||
        "-",

        booking
            ?.tower ||
        "-",

        booking
            ?.flatNumber ||
        "-",

        getFloorLabel(
            booking
                ?.floor
        ),

        booking
            ?.customerName ||
        "-",

        booking
            ?.mobile ||
        "-",

        getEmployeeName(
            booking
        ),

        toExcelDate(
            booking
                ?.bookingDate
        ),

        getFinalAmount(
            booking
        ),

        getBookingAmount(
            booking
        ),

        getRemainingAmount(
            booking
        ),

        booking
            ?.financeType ||
        "-",

        booking
            ?.paymentMode ||
        "-",

        getStatusLabel(
            booking
        ),
    ];
};

// ======================================================
// Export
// ======================================================

export const exportProjectSummaryExcel =
    async (
        bookings:
            BookingRecord[]
    ) => {

        const safeBookings =
            Array.isArray(
                bookings
            )
                ? bookings
                : [];

        const activeBookings =
            safeBookings.filter(
                (
                    booking
                ) =>
                    !isCancelledBooking(
                        booking
                    )
            );

        const cancelledBookings =
            safeBookings.filter(
                isCancelledBooking
            );

        const residentialBookings =
            activeBookings.filter(
                (
                    booking
                ) =>
                    getPropertyType(
                        booking
                    ) ===
                    "RESIDENTIAL"
            );

        const commercialBookings =
            activeBookings.filter(
                (
                    booking
                ) =>
                    getPropertyType(
                        booking
                    ) ===
                    "COMMERCIAL"
            );

        const totalReceived =
            activeBookings.reduce(
                (
                    total,
                    booking
                ) =>
                    total +
                    getBookingAmount(
                        booking
                    ),
                0
            );

        const totalRemaining =
            activeBookings.reduce(
                (
                    total,
                    booking
                ) =>
                    total +
                    getRemainingAmount(
                        booking
                    ),
                0
            );

        const totalFinalAmount =
            activeBookings.reduce(
                (
                    total,
                    booking
                ) =>
                    total +
                    getFinalAmount(
                        booking
                    ),
                0
            );

        const residentialGroups =
            buildProjectGroups(
                residentialBookings
            );

        const commercialGroups =
            buildProjectGroups(
                commercialBookings
            );

        const employeeSummary =
            buildEmployeeSummary(
                activeBookings
            );

        // ==================================================
        // Workbook
        // ==================================================

        const workbook =
            new ExcelJS.Workbook();

        workbook.creator =
            "Emerald Heights CRM";

        workbook.company =
            "Emerald Heights";

        workbook.created =
            new Date();

        workbook.modified =
            new Date();

        // ==================================================
        // 1. Project Summary
        // ==================================================

        const summarySheet =
            workbook.addWorksheet(
                "Project Summary",
                {
                    views: [
                        {
                            state:
                                "frozen",

                            ySplit:
                                3,
                        },
                    ],
                }
            );

        applyTitle(
            summarySheet,
            "EMERALD HEIGHTS - PROJECT SUMMARY",
            5
        );

        applyGeneratedInfo(
            summarySheet,
            5
        );

        styleSectionHeader(
            summarySheet,
            4,
            "Overall Financial & Booking Summary",
            5
        );

        const summaryHeader =
            summarySheet.getRow(
                5
            );

        summaryHeader.values = [
            "Metric",
            "Residential",
            "Commercial",
            "Total",
            "Remarks",
        ];

        styleHeaderRow(
            summaryHeader
        );

        const summaryRows = [
            [
                "Active Bookings",
                residentialBookings.length,
                commercialBookings.length,
                activeBookings.length,
                "Cancelled bookings excluded",
            ],

            [
                "Booking Amount Received",
                residentialBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getBookingAmount(
                            booking
                        ),
                    0
                ),
                commercialBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getBookingAmount(
                            booking
                        ),
                    0
                ),
                totalReceived,
                "Amount received at booking",
            ],

            [
                "Remaining Amount",
                residentialBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getRemainingAmount(
                            booking
                        ),
                    0
                ),
                commercialBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getRemainingAmount(
                            booking
                        ),
                    0
                ),
                totalRemaining,
                "Amount yet to be collected",
            ],

            [
                "Final Sale Value",
                residentialBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getFinalAmount(
                            booking
                        ),
                    0
                ),
                commercialBookings.reduce(
                    (
                        total,
                        booking
                    ) =>
                        total +
                        getFinalAmount(
                            booking
                        ),
                    0
                ),
                totalFinalAmount,
                "After discount amount",
            ],

            [
                "Cancelled Bookings",
                cancelledBookings.filter(
                    (
                        booking
                    ) =>
                        getPropertyType(
                            booking
                        ) ===
                        "RESIDENTIAL"
                ).length,

                cancelledBookings.filter(
                    (
                        booking
                    ) =>
                        getPropertyType(
                            booking
                        ) ===
                        "COMMERCIAL"
                ).length,

                cancelledBookings.length,
                "Preserved separately",
            ],
        ];

        summaryRows.forEach(
            (
                values,
                index
            ) => {

                const row =
                    summarySheet.getRow(
                        6 +
                        index
                    );

                row.values =
                    values;

                styleDataRow(
                    row
                );

                if (
                    index >=
                        1 &&
                    index <=
                        3
                ) {

                    [
                        2,
                        3,
                        4,
                    ].forEach(
                        (
                            column
                        ) => {

                            row.getCell(
                                column
                            )
                                .numFmt =
                                RUPEE_FORMAT;
                        }
                    );
                }
            }
        );

        [
            26,
            18,
            18,
            18,
            34,
        ].forEach(
            (
                width,
                index
            ) => {

                summarySheet
                    .getColumn(
                        index +
                        1
                    )
                    .width =
                    width;
            }
        );

        // --------------------------------------------------
        // Residential Tower Summary
        // --------------------------------------------------

        let summaryRow =
            13;

        styleSectionHeader(
            summarySheet,
            summaryRow,
            "Residential - Tower Wise Booking Summary",
            6
        );

        summaryRow +=
            1;

        summarySheet.getRow(
            summaryRow
        ).values = [
            "Tower",
            "Booked Flats",
            "Final Sale Value",
            "Received",
            "Remaining",
            "Sales Members",
        ];

        styleHeaderRow(
            summarySheet.getRow(
                summaryRow
            )
        );

        summaryRow +=
            1;

        residentialGroups.forEach(
            (
                group
            ) => {

                const row =
                    summarySheet.getRow(
                        summaryRow
                    );

                row.values = [
                    group.project,
                    group.bookingCount,
                    group.finalAmount,
                    group.bookingAmount,
                    group.remainingAmount,
                    Array.from(
                        group.employees
                    )
                        .sort()
                        .join(
                            ", "
                        ),
                ];

                styleDataRow(
                    row
                );

                [
                    3,
                    4,
                    5,
                ].forEach(
                    (
                        column
                    ) => {

                        row.getCell(
                            column
                        )
                            .numFmt =
                            RUPEE_FORMAT;
                    }
                );

                summaryRow +=
                    1;
            }
        );

        if (
            residentialGroups.length ===
            0
        ) {

            summarySheet.getCell(
                summaryRow,
                1
            ).value =
                "No residential bookings";

            summaryRow +=
                1;
        }

        summaryRow +=
            2;

        // --------------------------------------------------
        // Commercial Project Summary
        // Commercial / Commercial 1 separated automatically
        // --------------------------------------------------

        styleSectionHeader(
            summarySheet,
            summaryRow,
            "Commercial - Project Wise Booking Summary",
            6
        );

        summaryRow +=
            1;

        summarySheet.getRow(
            summaryRow
        ).values = [
            "Commercial Project",
            "Booked Shops",
            "Final Sale Value",
            "Received",
            "Remaining",
            "Sales Members",
        ];

        styleHeaderRow(
            summarySheet.getRow(
                summaryRow
            )
        );

        summaryRow +=
            1;

        commercialGroups.forEach(
            (
                group
            ) => {

                const row =
                    summarySheet.getRow(
                        summaryRow
                    );

                row.values = [
                    group.project,
                    group.bookingCount,
                    group.finalAmount,
                    group.bookingAmount,
                    group.remainingAmount,
                    Array.from(
                        group.employees
                    )
                        .sort()
                        .join(
                            ", "
                        ),
                ];

                styleDataRow(
                    row
                );

                [
                    3,
                    4,
                    5,
                ].forEach(
                    (
                        column
                    ) => {

                        row.getCell(
                            column
                        )
                            .numFmt =
                            RUPEE_FORMAT;
                    }
                );

                summaryRow +=
                    1;
            }
        );

        if (
            commercialGroups.length ===
            0
        ) {

            summarySheet.getCell(
                summaryRow,
                1
            ).value =
                "No commercial bookings";
        }

        summarySheet
            .getColumn(
                6
            )
            .width =
            35;

        // ==================================================
        // Common booking headers
        // ==================================================

        const bookingHeaders = [
            "Booking Code",
            "Tower / Project",
            "Unit",
            "Floor",
            "Customer",
            "Mobile",
            "Sales Member",
            "Booking Date",
            "Final Sale Value",
            "Booking Amount Received",
            "Remaining Amount",
            "Finance Type",
            "Payment Mode",
            "Status",
        ];

        const bookingWidths = [
            18,
            20,
            12,
            15,
            24,
            16,
            24,
            16,
            20,
            24,
            20,
            16,
            18,
            14,
        ];

        // ==================================================
        // 2. Residential
        // ==================================================

        const residentialSheet =
            workbook.addWorksheet(
                "Residential",
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
            residentialSheet,
            "RESIDENTIAL BOOKING DETAILS",
            bookingHeaders.length
        );

        applyGeneratedInfo(
            residentialSheet,
            bookingHeaders.length
        );

        styleSectionHeader(
            residentialSheet,
            3,
            `Active Residential Bookings: ${residentialBookings.length}`,
            bookingHeaders.length
        );

        writeTable(
            residentialSheet,
            4,
            {
                headers:
                    bookingHeaders,

                rows:
                    residentialBookings
                        .map(
                            getBookingRow
                        ),

                widths:
                    bookingWidths,

                currencyColumns: [
                    9,
                    10,
                    11,
                ],

                dateColumns: [
                    8,
                ],
            }
        );

        // ==================================================
        // 3. Commercial
        // ==================================================

        const commercialSheet =
            workbook.addWorksheet(
                "Commercial",
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
            commercialSheet,
            "COMMERCIAL BOOKING DETAILS",
            bookingHeaders.length
        );

        applyGeneratedInfo(
            commercialSheet,
            bookingHeaders.length
        );

        styleSectionHeader(
            commercialSheet,
            3,
            `Active Commercial Bookings: ${commercialBookings.length}`,
            bookingHeaders.length
        );

        writeTable(
            commercialSheet,
            4,
            {
                headers:
                    bookingHeaders,

                rows:
                    commercialBookings
                        .map(
                            getBookingRow
                        ),

                widths:
                    bookingWidths,

                currencyColumns: [
                    9,
                    10,
                    11,
                ],

                dateColumns: [
                    8,
                ],
            }
        );

        // ==================================================
        // 4. Employee Performance
        // ==================================================

        const employeeSheet =
            workbook.addWorksheet(
                "Employee Performance",
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
            employeeSheet,
            "EMPLOYEE BOOKING PERFORMANCE",
            9
        );

        applyGeneratedInfo(
            employeeSheet,
            9
        );

        styleSectionHeader(
            employeeSheet,
            3,
            "Sales Member Wise Booking & Collection Summary",
            9
        );

        writeTable(
            employeeSheet,
            4,
            {
                headers: [
                    "Sales Member",
                    "Role",
                    "Residential Bookings",
                    "Commercial Bookings",
                    "Total Bookings",
                    "Final Sale Value",
                    "Booking Amount Received",
                    "Remaining Amount",
                    "Collection %",
                ],

                rows:
                    employeeSummary.map(
                        (
                            employee
                        ) => {

                            const collectionPercentage =
                                employee
                                    .finalAmount >
                                0
                                    ? (
                                        employee
                                            .received /
                                        employee
                                            .finalAmount
                                    )
                                    : 0;

                            return [
                                employee.name,
                                employee.role ||
                                "-",
                                employee.residential,
                                employee.commercial,
                                employee.total,
                                employee.finalAmount,
                                employee.received,
                                employee.remaining,
                                collectionPercentage,
                            ];
                        }
                    ),

                widths: [
                    26,
                    22,
                    22,
                    22,
                    18,
                    20,
                    24,
                    20,
                    16,
                ],

                currencyColumns: [
                    6,
                    7,
                    8,
                ],
            }
        );

        employeeSheet.eachRow(
            (
                row,
                rowNumber
            ) => {

                if (
                    rowNumber >
                    4
                ) {

                    row.getCell(
                        9
                    ).numFmt =
                        "0.00%";
                }
            }
        );

        // ==================================================
        // 5. Customer Payments
        // ==================================================

        const customerSheet =
            workbook.addWorksheet(
                "Customer Payments",
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
            customerSheet,
            "CUSTOMER PAYMENT SUMMARY",
            15
        );

        applyGeneratedInfo(
            customerSheet,
            15
        );

        styleSectionHeader(
            customerSheet,
            3,
            "Customer Wise Received & Remaining Amount",
            15
        );

        writeTable(
            customerSheet,
            4,
            {
                headers: [
                    "Property Type",
                    "Tower / Project",
                    "Unit",
                    "Booking Code",
                    "Customer",
                    "Mobile",
                    "Booking Date",
                    "Final Sale Value",
                    "Booking Amount Received",
                    "Remaining Amount",
                    "Payment Mode",
                    "Finance Type",
                    "Sales Member",
                    "Status",
                    "Remarks",
                ],

                rows:
                    activeBookings.map(
                        (
                            booking
                        ) => [
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
                            toExcelDate(
                                booking
                                    ?.bookingDate
                            ),
                            getFinalAmount(
                                booking
                            ),
                            getBookingAmount(
                                booking
                            ),
                            getRemainingAmount(
                                booking
                            ),
                            booking
                                ?.paymentMode ||
                            "-",
                            booking
                                ?.financeType ||
                            "-",
                            getEmployeeName(
                                booking
                            ),
                            getStatusLabel(
                                booking
                            ),
                            booking
                                ?.remarks ||
                            "-",
                        ]
                    ),

                widths: [
                    18,
                    20,
                    12,
                    18,
                    24,
                    16,
                    16,
                    20,
                    24,
                    20,
                    18,
                    16,
                    24,
                    14,
                    32,
                ],

                currencyColumns: [
                    8,
                    9,
                    10,
                ],

                dateColumns: [
                    7,
                ],
            }
        );

        // ==================================================
        // 6. Cancelled Bookings
        // ==================================================

        const cancelledSheet =
            workbook.addWorksheet(
                "Cancelled Bookings",
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
            cancelledSheet,
            "CANCELLED BOOKING HISTORY",
            13
        );

        applyGeneratedInfo(
            cancelledSheet,
            13
        );

        styleSectionHeader(
            cancelledSheet,
            3,
            `Total Cancelled Bookings: ${cancelledBookings.length}`,
            13
        );

        writeTable(
            cancelledSheet,
            4,
            {
                headers: [
                    "Property Type",
                    "Booking Code",
                    "Tower / Project",
                    "Unit",
                    "Customer",
                    "Mobile",
                    "Sales Member",
                    "Booking Date",
                    "Cancelled At",
                    "Booking Amount",
                    "Remaining Amount",
                    "Payment Mode",
                    "Status",
                ],

                rows:
                    cancelledBookings.map(
                        (
                            booking
                        ) => [
                            getPropertyType(
                                booking
                            ),
                            booking
                                ?.bookingCode ||
                            "-",
                            booking
                                ?.tower ||
                            "-",
                            booking
                                ?.flatNumber ||
                            "-",
                            booking
                                ?.customerName ||
                            "-",
                            booking
                                ?.mobile ||
                            "-",
                            getEmployeeName(
                                booking
                            ),
                            toExcelDate(
                                booking
                                    ?.bookingDate
                            ),
                            toExcelDate(
                                booking
                                    ?.cancelledAt
                            ),
                            getBookingAmount(
                                booking
                            ),
                            getRemainingAmount(
                                booking
                            ),
                            booking
                                ?.paymentMode ||
                            "-",
                            "CANCELLED",
                        ]
                    ),

                widths: [
                    18,
                    18,
                    20,
                    12,
                    24,
                    16,
                    24,
                    16,
                    22,
                    20,
                    20,
                    18,
                    14,
                ],

                currencyColumns: [
                    10,
                    11,
                ],

                dateColumns: [
                    8,
                    9,
                ],
            }
        );

        // ==================================================
        // General Sheet Styling
        // ==================================================

        workbook.eachSheet(
            (
                worksheet
            ) => {

                worksheet.properties
                    .defaultRowHeight =
                    20;

                worksheet.views = [
                    {
                        state:
                            "frozen",

                        ySplit:
                            worksheet.name ===
                            "Project Summary"
                                ? 3
                                : 4,
                    },
                ];

                worksheet.eachRow(
                    (
                        row,
                        rowNumber
                    ) => {

                        if (
                            rowNumber %
                                2 ===
                                0 &&
                            rowNumber >
                                4
                        ) {

                            row.eachCell(
                                (
                                    cell
                                ) => {

                                    if (
                                        !cell.fill ||
                                        (
                                            cell.fill as
                                                ExcelJS.FillPattern
                                        )
                                            .fgColor
                                            ?.argb ===
                                            undefined
                                    ) {

                                        cell.fill = {
                                            type:
                                                "pattern",

                                            pattern:
                                                "solid",

                                            fgColor: {
                                                argb:
                                                    `FF${LIGHT_FILL}`,
                                            },
                                        };
                                    }
                                }
                            );
                        }
                    }
                );
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

        const date =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );

        anchor.href =
            url;

        anchor.download =
            `Emerald_Heights_Project_Summary_${date}.xlsx`;

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