import { Request, Response } from "express";

import { prisma } from "../lib/prisma";

import {
    BookingStatus,
    DocumentStatus,
    DocumentType,
    FinanceType,
    PropertyStatus,
    PropertyType,
    RemainingAmountMode,
} from "../generated/prisma/enums";

type FrontendDocument = {
    status?: unknown;
    fileName?: unknown;
    fileUrl?: unknown;
    generatedAt?: unknown;
    uploadedAt?: unknown;
    givenAt?: unknown;
    completedAt?: unknown;
};

type FrontendDocuments = {
    requisitionLetter?: FrontendDocument;
    agreementToSell?: FrontendDocument;

    tripartiteAgreement?: {
        required?: boolean;
        document?: FrontendDocument;
    };
};

type BookingPayload = {
    bookingCode?: string;

    customerId?: string;
    propertyId?: string;

    employeeId?:
    | string
    | null;

    flatNumber?: string;
    tower?: string;
    floor?: number;

    customerName?: string;
    mobile?: string;
    email?: string;
    address?: string;
    aadhar?: string;
    pan?: string;
    dob?: string;
    doa?: string;
    profile?: string;

    bookingAmount?: string;

    remainingAmount?: string;
    remainingAmountMode?: string;

    financeType?: string;

    totalAmount?: string;
    discount?: string;
    afterDiscountAmount?: string;

    plan?: string;
    chequeNo?: string;
    bankName?: string;
    finance?: string;
    customerNeed?: string;

    paymentMode?: string;

    bookingDate?: string;
    remarks?: string;

    status?: string;

    documents?: FrontendDocuments;
};

// ======================================================
// Normalizers / Parsers
// ======================================================

const normalizeBookingStatus = (
    status: unknown
): BookingStatus => {

    const value =
        String(
            status ?? ""
        )
            .trim()
            .toUpperCase();

    switch (value) {

        case "BOOKED":
        case "CONFIRMED":
            return BookingStatus.CONFIRMED;

        case "CANCELLED":
        case "CANCELED":
            return BookingStatus.CANCELLED;

        case "COMPLETED":
            return BookingStatus.COMPLETED;

        case "PENDING":
        default:
            return BookingStatus.PENDING;
    }
};

// ======================================================
// Remaining Amount Mode
// ======================================================

const normalizeRemainingAmountMode = (
    value: unknown
): RemainingAmountMode => {

    return String(
        value ?? ""
    )
        .trim()
        .toUpperCase() ===
        "MANUAL"
        ? RemainingAmountMode.MANUAL
        : RemainingAmountMode.AUTO;
};

// ======================================================
// Finance Type
// ======================================================

const normalizeFinanceType = (
    value: unknown
): FinanceType | null => {

    const normalized =
        String(
            value ?? ""
        )
            .trim()
            .toUpperCase();

    if (
        normalized ===
        "FINANCE"
    ) {

        return FinanceType.FINANCE;
    }

    if (
        normalized ===
        "CASH"
    ) {

        return FinanceType.CASH;
    }

    return null;
};

// ======================================================
// Document Status
// ======================================================

const normalizeDocumentStatus = (
    status: unknown
): DocumentStatus => {

    const value =
        String(
            status ?? ""
        )
            .trim()
            .toUpperCase();

    switch (value) {

        case "GENERATED":
            return DocumentStatus.GENERATED;

        case "UPLOADED":
            return DocumentStatus.UPLOADED;

        case "GIVEN":
            return DocumentStatus.GIVEN;

        case "COMPLETED":
            return DocumentStatus.COMPLETED;

        case "PENDING":
        default:
            return DocumentStatus.PENDING;
    }
};

// ======================================================
// Date Parser
// ======================================================

const parseDateValue = (
    value: unknown
): Date | null | undefined => {

    if (
        value === undefined
    ) {

        return undefined;
    }

    if (
        value === null ||
        value === ""
    ) {

        return null;
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

        return undefined;
    }

    return date;
};

// ======================================================
// Number Parser
// ======================================================

const parseNullableNumber = (
    value: unknown
): number | null | undefined => {

    if (
        value === undefined
    ) {

        return undefined;
    }

    if (
        value === null ||
        String(
            value
        )
            .trim() ===
        ""
    ) {

        return null;
    }

    const numberValue =
        Number(
            value
        );

    if (
        !Number.isFinite(
            numberValue
        )
    ) {

        return undefined;
    }

    return roundMoney(
        numberValue
    );
};
const roundMoney = (
    value:
        number
): number => {

    return Math.round(
        (
            value +
            Number.EPSILON
        ) *
        100
    ) / 100;
};
const calculateFinalSaleValue = (
    afterDiscountAmount:
        number |
        null |
        undefined,

    totalAmount:
        number |
        null |
        undefined,

    discount:
        number |
        null |
        undefined
): number => {

    if (
        afterDiscountAmount !=
        null
    ) {
        return roundMoney(
            Math.max(
                afterDiscountAmount,
                0
            )
        );
    }

    return roundMoney(
        Math.max(
            (
                totalAmount ??
                0
            ) -
            (
                discount ??
                0
            ),
            0
        )
    );
};
// ======================================================
// Remaining Amount Calculation
//
// AUTO:
// Final Sale Value - Total Received
// Minimum remaining amount = 0
// ======================================================

const calculateRemainingAmount = (
    finalSaleValue:
        | number
        | null
        | undefined,

    receivedAmount:
        | number
        | null
        | undefined
): number | null => {

    if (
        finalSaleValue ==
        null ||
        receivedAmount ==
        null
    ) {

        return null;
    }

    return roundMoney(
        Math.max(
            finalSaleValue -
            receivedAmount,
            0
        )
    );
};

// ======================================================
// Installment Plans
// ======================================================

type InstallmentPlanItem = {
    sequence: number;
    stageName: string;
    percentage: number;
};

const RESIDENTIAL_INSTALLMENT_PLAN:
    InstallmentPlanItem[] = [
        {
            sequence: 1,
            stageName:
                "Booking Amount",
            percentage: 10,
        },
        {
            sequence: 2,
            stageName:
                "On Completion up to Plinth",
            percentage: 15,
        },
        {
            sequence: 3,
            stageName:
                "After Completion of 1/3rd Floor Slabs (4th Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 4,
            stageName:
                "After Completion of 2/3rd Floor Slabs (7th Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 5,
            stageName:
                "After Completion of Entire Frame Structure",
            percentage: 10,
        },
        {
            sequence: 6,
            stageName:
                "After 50% Completion of Brick Work & Internal Plaster (up to 5th Floor)",
            percentage: 10,
        },
        {
            sequence: 7,
            stageName:
                "After 100% Completion of Brick Work & Internal Plaster (up to 5th Floor)",
            percentage: 10,
        },
        {
            sequence: 8,
            stageName:
                "After Completion of Flooring & External Plaster",
            percentage: 10,
        },
        {
            sequence: 9,
            stageName:
                "After Completion of Plumbing, Internal Electrification & Finishing Work",
            percentage: 10,
        },
        {
            sequence: 10,
            stageName:
                "At the Time of Possession & Registration of Sale Deed",
            percentage: 5,
        },
    ];

const COMMERCIAL_INSTALLMENT_PLAN:
    InstallmentPlanItem[] = [
        {
            sequence: 1,
            stageName:
                "Booking Amount",
            percentage: 10,
        },
        {
            sequence: 2,
            stageName:
                "On Completion up to Plinth",
            percentage: 15,
        },
        {
            sequence: 3,
            stageName:
                "After Completion of 1/3rd Floor Slabs (1st Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 4,
            stageName:
                "After Completion of 2/3rd Floor Slabs (3rd Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 5,
            stageName:
                "After Completion of Entire Frame Structure",
            percentage: 10,
        },
        {
            sequence: 6,
            stageName:
                "After 50% Completion of Brick Work & Internal Plaster (up to 1st Floor)",
            percentage: 10,
        },
        {
            sequence: 7,
            stageName:
                "After 100% Completion of Brick Work & Internal Plaster (up to 3rd Floor)",
            percentage: 10,
        },
        {
            sequence: 8,
            stageName:
                "After Completion of Flooring & External Plaster",
            percentage: 10,
        },
        {
            sequence: 9,
            stageName:
                "After Completion of Plumbing, Internal Electrification & Finishing Work",
            percentage: 10,
        },
        {
            sequence: 10,
            stageName:
                "At the Time of Possession & Registration of Sale Deed",
            percentage: 5,
        },
    ];

// ======================================================
// Get Installment Plan By Property Type
// ======================================================

const getInstallmentPlan = (
    propertyType:
        PropertyType
): InstallmentPlanItem[] => {

    return propertyType ===
        PropertyType.COMMERCIAL
        ? COMMERCIAL_INSTALLMENT_PLAN
        : RESIDENTIAL_INSTALLMENT_PLAN;
};
// ======================================================
// Document Data Builder
// ======================================================

const buildDocumentData = (
    payload?: FrontendDocument
) => {

    const status =
        normalizeDocumentStatus(
            payload?.status
        );

    const data:
        Record<
            string,
            any
        > = {
        status,
    };

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "fileName"
            )
    ) {

        data.fileName =
            payload.fileName
                ? String(
                    payload.fileName
                )
                : null;
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "fileUrl"
            )
    ) {

        data.fileUrl =
            payload.fileUrl
                ? String(
                    payload.fileUrl
                )
                : null;
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "generatedAt"
            )
    ) {

        data.generatedAt =
            parseDateValue(
                payload.generatedAt
            );
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "uploadedAt"
            )
    ) {

        data.uploadedAt =
            parseDateValue(
                payload.uploadedAt
            );
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "givenAt"
            )
    ) {

        data.givenAt =
            parseDateValue(
                payload.givenAt
            );
    }

    if (
        payload &&
        Object.prototype
            .hasOwnProperty.call(
                payload,
                "completedAt"
            )
    ) {

        data.completedAt =
            parseDateValue(
                payload.completedAt
            );
    }

    if (
        status ===
        DocumentStatus.GENERATED &&
        data.generatedAt ===
        undefined
    ) {

        data.generatedAt =
            new Date();
    }

    if (
        status ===
        DocumentStatus.UPLOADED &&
        data.uploadedAt ===
        undefined
    ) {

        data.uploadedAt =
            new Date();
    }

    if (
        status ===
        DocumentStatus.GIVEN &&
        data.givenAt ===
        undefined
    ) {

        data.givenAt =
            new Date();
    }

    if (
        status ===
        DocumentStatus.COMPLETED &&
        data.completedAt ===
        undefined
    ) {

        data.completedAt =
            new Date();
    }

    if (
        status ===
        DocumentStatus.PENDING
    ) {

        data.givenAt =
            null;

        data.completedAt =
            null;
    }

    if (
        status ===
        DocumentStatus.UPLOADED
    ) {

        data.givenAt =
            null;

        data.completedAt =
            null;
    }

    if (
        status ===
        DocumentStatus.GIVEN
    ) {

        data.completedAt =
            null;
    }

    return data;
};

// ======================================================
// Upsert Booking Document
// ======================================================

const upsertBookingDocument =
    async (
        tx: any,
        bookingId: string,
        type: DocumentType,
        payload?: FrontendDocument
    ) => {

        const existing =
            await tx
                .bookingDocument
                .findFirst({

                    where: {
                        bookingId,
                        type,
                    },

                    select: {
                        id:
                            true,
                    },
                });

        const data =
            buildDocumentData(
                payload
            );

        if (
            existing
        ) {

            await tx
                .bookingDocument
                .update({

                    where: {
                        id:
                            existing.id,
                    },

                    data,
                });

            return;
        }

        await tx
            .bookingDocument
            .create({

                data: {
                    bookingId,
                    type,
                    ...data,
                },
            });
    };

// ======================================================
// Sync Documents
// ======================================================

const syncBookingDocuments =
    async (
        tx: any,
        bookingId: string,
        documents?: FrontendDocuments
    ) => {

        if (
            !documents
        ) {

            return;
        }

        if (
            documents
                .requisitionLetter
        ) {

            await upsertBookingDocument(
                tx,
                bookingId,
                DocumentType
                    .REQUISITION_LETTER,
                documents
                    .requisitionLetter
            );
        }

        if (
            documents
                .agreementToSell
        ) {

            await upsertBookingDocument(
                tx,
                bookingId,
                DocumentType
                    .AGREEMENT_TO_SELL,
                documents
                    .agreementToSell
            );
        }

        const tripartite =
            documents
                .tripartiteAgreement;

        if (
            !tripartite
        ) {


            return;
        }

        if (
            tripartite.required ===
            false
        ) {

            await tx
                .bookingDocument
                .deleteMany({

                    where: {
                        bookingId,

                        type:
                            DocumentType
                                .TRIPARTITE_AGREEMENT,
                    },
                });

            return;
        }

        if (
            tripartite.required ===
            true ||
            tripartite.document
        ) {

            await upsertBookingDocument(
                tx,
                bookingId,
                DocumentType
                    .TRIPARTITE_AGREEMENT,

                tripartite.document ?? {
                    status:
                        "pending",
                }
            );
        }
    };

// ======================================================
// Property Status From Booking
// ======================================================

const getPropertyStatusFromBookingStatus = (
    status: BookingStatus
): PropertyStatus => {

    switch (
    status
    ) {

        case BookingStatus
            .CONFIRMED:

            return PropertyStatus
                .BOOKED;

        case BookingStatus
            .COMPLETED:

            return PropertyStatus
                .SOLD;

        case BookingStatus
            .PENDING:

            return PropertyStatus
                .HOLD;

        case BookingStatus
            .CANCELLED:

        default:

            return PropertyStatus
                .AVAILABLE;
    }
};

// ======================================================
// Property Status From Multiple Bookings
// ======================================================

const getPropertyStatusFromBookings = (
    bookings:
        Array<{
            status:
            BookingStatus;
        }>
): PropertyStatus => {

    if (
        bookings.some(
            (
                booking
            ) =>
                booking.status ===
                BookingStatus
                    .COMPLETED
        )
    ) {

        return PropertyStatus
            .SOLD;
    }

    if (
        bookings.some(
            (
                booking
            ) =>
                booking.status ===
                BookingStatus
                    .CONFIRMED
        )
    ) {

        return PropertyStatus
            .BOOKED;
    }

    if (
        bookings.some(
            (
                booking
            ) =>
                booking.status ===
                BookingStatus
                    .PENDING
        )
    ) {

        return PropertyStatus
            .HOLD;
    }

    return PropertyStatus
        .AVAILABLE;
};

// ======================================================
// Format Booking For Frontend
// ======================================================

const formatBooking = (
    booking: any
) => {

    let extraData: {
        paymentMode?: string;
        remarks?: string;
    } = {};

    try {

        if (
            booking.notes
        ) {

            extraData =
                JSON.parse(
                    booking.notes
                );
        }

    } catch {

        extraData = {
            remarks:
                booking.notes ??
                "",
        };
    }

    const documents =
        booking.documents ??
        [];

    const findDocument = (
        type:
            DocumentType
    ) => {

        const document =
            documents.find(
                (
                    item: any
                ) =>
                    item.type ===
                    type
            );

        return {

            status:
                document
                    ?.status
                    ?.toLowerCase() ??
                "pending",

            fileName:
                document
                    ?.fileName ??
                undefined,

            fileUrl:
                document
                    ?.fileUrl ??
                undefined,

            generatedAt:
                document
                    ?.generatedAt
                    ?.toISOString?.() ??
                undefined,

            uploadedAt:
                document
                    ?.uploadedAt
                    ?.toISOString?.() ??
                undefined,

            givenAt:
                document
                    ?.givenAt
                    ?.toISOString?.() ??
                undefined,

            completedAt:
                document
                    ?.completedAt
                    ?.toISOString?.() ??
                undefined,
        };
    };

    const tripartiteRow =
        documents.find(
            (
                item: any
            ) =>
                item.type ===
                DocumentType
                    .TRIPARTITE_AGREEMENT
        );

    const tripartite =
        findDocument(
            DocumentType
                .TRIPARTITE_AGREEMENT
        );
    // ==================================================
    // Installment Summary
    // ==================================================

    const installmentStages =
        (
            booking.installmentStages ??
            []
        ).map(
            (
                stage: any
            ) => {

                const payments =
                    stage.payments ??
                    [];

                const paidAmount =
                    roundMoney(
                        payments.reduce(
                            (
                                total: number,
                                payment: any
                            ) =>
                                total +
                                Number(
                                    payment.amount ??
                                    0
                                ),
                            0
                        )
                    );

                const plannedAmount =
                    roundMoney(
                        Number(
                            stage.plannedAmount ??
                            0
                        )
                    );

                const balanceAmount =
                    roundMoney(
                        Math.max(
                            plannedAmount -
                            paidAmount,
                            0
                        )
                    );

                const paymentStatus =
                    paidAmount <= 0
                        ? "PENDING"
                        : paidAmount <
                            plannedAmount
                            ? "PARTIAL"
                            : "PAID";

                const lastPayment =
                    payments.length >
                        0
                        ? payments[
                        payments.length -
                        1
                        ]
                        : null;

                return {

                    id:
                        stage.id,

                    sequence:
                        stage.sequence,

                    stageName:
                        stage.stageName,

                    percentage:
                        stage.percentage,

                    plannedAmount,

                    paidAmount,

                    balanceAmount,

                    status:
                        paymentStatus,

                    lastPaymentDate:
                        lastPayment
                            ?.paymentDate
                            ? new Date(
                                lastPayment
                                    .paymentDate
                            ).toISOString()
                            : null,

                    lastPaymentMode:
                        lastPayment
                            ?.paymentMode ??
                        null,

                    payments:
                        payments.map(
                            (
                                payment: any
                            ) => ({
                                id:
                                    payment.id,

                                amount:
                                    roundMoney(
                                        Number(
                                            payment.amount ??
                                            0
                                        )
                                    ),

                                paymentDate:
                                    payment
                                        .paymentDate
                                        ? new Date(
                                            payment
                                                .paymentDate
                                        ).toISOString()
                                        : null,

                                paymentMode:
                                    payment
                                        .paymentMode ??
                                    null,

                                referenceNo:
                                    payment
                                        .referenceNo ??
                                    null,

                                remarks:
                                    payment
                                        .remarks ??
                                    null,
                            })
                        ),
                };
            }
        );

    const totalInstallmentReceived =
        roundMoney(
            installmentStages.reduce(
                (
                    total: number,
                    stage: any
                ) =>
                    total +
                    stage.paidAmount,
                0
            )
        );

    const totalInstallmentPlanned =
        roundMoney(
            installmentStages.reduce(
                (
                    total: number,
                    stage: any
                ) =>
                    total +
                    stage.plannedAmount,
                0
            )
        );

    const totalInstallmentBalance =
        roundMoney(
            Math.max(
                totalInstallmentPlanned -
                totalInstallmentReceived,
                0
            )
        );

    const currentInstallment =
        [...installmentStages]
            .reverse()
            .find(
                (
                    stage: any
                ) =>
                    stage.paidAmount >
                    0
            ) ??
        null;

    return {

        id:
            booking.id,

        employeeId:
            booking.employeeId ??
            booking.employee
                ?.id ??
            null,

        assignedEmployee:
            booking.employee
                ? {

                    id:
                        booking.employee.id,

                    name:
                        booking.employee.name,

                    email:
                        booking.employee.email,

                    phone:
                        booking.employee.phone ??
                        null,

                    role:
                        booking.employee.role,

                    status:
                        booking.employee.status,
                }
                : null,

        // ----------------------------------------------
        // Property
        // ----------------------------------------------

        propertyType:
            booking.property
                ?.type ??
            null,

        flatNumber:
            booking.property
                ?.unitNumber ??
            "",

        tower:
            booking.property
                ?.block ??
            booking.property
                ?.tower ??
            "",

        floor:
            (() => {

                const rawFloor =
                    booking.property
                        ?.floor;

                if (
                    rawFloor ===
                    null ||
                    rawFloor ===
                    undefined
                ) {
                    return 0;
                }

                const normalizedFloor =
                    String(
                        rawFloor
                    )
                        .trim()
                        .toLowerCase();

                if (
                    normalizedFloor ===
                    "ground floor" ||
                    normalizedFloor ===
                    "ground" ||
                    normalizedFloor ===
                    "gf"
                ) {
                    return 0;
                }

                const floorNumber =
                    normalizedFloor.match(
                        /\d+/
                    );

                return floorNumber
                    ? Number(
                        floorNumber[0]
                    )
                    : 0;
            })(),

        // ----------------------------------------------
        // Customer
        // ----------------------------------------------

        customerName:
            booking.customer
                ?.name ??
            "",

        mobile:
            booking.customer
                ?.phone ??
            "",

        email:
            booking.customer
                ?.email ??
            "",

        address:
            booking.customer
                ?.address ??
            "",

        aadhar:
            booking.customer
                ?.aadhar ??
            "",

        pan:
            booking.customer
                ?.pan ??
            "",

        dob:
            booking.customer
                ?.dob
                ? new Date(
                    booking.customer
                        .dob
                )
                    .toISOString()
                    .split(
                        "T"
                    )[0]
                : "",

        doa:
            booking.customer
                ?.doa
                ? new Date(
                    booking.customer
                        .doa
                )
                    .toISOString()
                    .split(
                        "T"
                    )[0]
                : "",

        profile:
            booking.customer
                ?.profile ??
            "",

        // ----------------------------------------------
        // Financial
        // ----------------------------------------------

        bookingAmount:
            booking.amount !=
                null
                ? String(
                    booking.amount
                )
                : "",

        remainingAmount:
            booking
                .remainingAmount !=
                null
                ? String(
                    booking
                        .remainingAmount
                )
                : "",

        remainingAmountMode:
            booking
                .remainingAmountMode ??
            RemainingAmountMode
                .AUTO,

        financeType:
            booking
                .financeType ??
            null,

        totalAmount:
            booking
                .totalAmount !=
                null
                ? String(
                    booking
                        .totalAmount
                )
                : "",

        discount:
            booking.discount !=
                null
                ? String(
                    booking.discount
                )
                : "",

        afterDiscountAmount:
            booking
                .afterDiscountAmount !=
                null
                ? String(
                    booking
                        .afterDiscountAmount
                )
                : "",

        plan:
            booking.plan ??
            "",

        chequeNo:
            booking.chequeNo ??
            "",

        bankName:
            booking.bankName ??
            "",

        finance:
            booking.finance ??
            "",

        customerNeed:
            booking.customerNeed ??
            "",

        paymentMode:
            extraData
                .paymentMode ??
            "Cash",

        // ----------------------------------------------
        // Dates / Status
        // ----------------------------------------------

        bookingDate:
            booking.bookingDate
                ? new Date(
                    booking.bookingDate
                )
                    .toISOString()
                    .split(
                        "T"
                    )[0]
                : "",

        cancelledAt:
            booking.cancelledAt
                ? new Date(
                    booking.cancelledAt
                )
                    .toISOString()
                : null,
        archivedAt:
            booking.archivedAt
                ? new Date(
                    booking.archivedAt
                )
                    .toISOString()
                : null,

        remarks:
            extraData
                .remarks ??
            "",

        status:
            booking.status ===
                BookingStatus
                    .CONFIRMED
                ? "booked"
                : booking.status
                    .toLowerCase(),

        bookingCode:
            booking.bookingCode,


        // ----------------------------------------------
        // Installments
        // ----------------------------------------------

        installmentStages,

        installmentSummary: {

            totalPlannedAmount:
                totalInstallmentPlanned,

            totalReceivedAmount:
                totalInstallmentReceived,

            totalBalanceAmount:
                totalInstallmentBalance,

            currentInstallment:
                currentInstallment
                    ? {
                        id:
                            currentInstallment.id,

                        sequence:
                            currentInstallment.sequence,

                        stageName:
                            currentInstallment.stageName,

                        percentage:
                            currentInstallment.percentage,

                        plannedAmount:
                            currentInstallment.plannedAmount,

                        paidAmount:
                            currentInstallment.paidAmount,

                        balanceAmount:
                            currentInstallment.balanceAmount,

                        status:
                            currentInstallment.status,
                    }
                    : null,
        },
        // ----------------------------------------------
        // Documents
        // ----------------------------------------------

        documents: {

            requisitionLetter:
                findDocument(
                    DocumentType
                        .REQUISITION_LETTER
                ),

            agreementToSell:
                findDocument(
                    DocumentType
                        .AGREEMENT_TO_SELL
                ),

            tripartiteAgreement: {

                required:
                    Boolean(
                        tripartiteRow
                    ),

                document:
                    tripartite,
            },
        },
    };
};

// ======================================================
// GET BOOKINGS
// ======================================================

export const getBookings =
    async (
        _req: Request,
        res: Response
    ) => {

        try {

            const bookings =
                await prisma
                    .booking
                    .findMany({

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,
                            installmentStages: {

                                orderBy: {
                                    sequence:
                                        "asc",
                                },

                                include: {

                                    payments: {

                                        orderBy: {
                                            paymentDate:
                                                "asc",
                                        },
                                    },
                                },
                            },
                        },

                        orderBy: {
                            createdAt:
                                "desc",
                        },
                    });

            return res.json({

                success:
                    true,

                data:
                    bookings.map(
                        formatBooking
                    ),
            });

        } catch (error) {

            console.error(
                "Get bookings error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to fetch bookings",
                });
        }
    };

// ======================================================
// GET BOOKING BY ID
// ======================================================

export const getBookingById =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const booking =
                await prisma
                    .booking
                    .findUnique({

                        where: {
                            id:
                                String(
                                    req.params.id
                                ),
                        },

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,

                            installmentStages: {

                                orderBy: {
                                    sequence:
                                        "asc",
                                },

                                include: {

                                    payments: {

                                        orderBy: {
                                            paymentDate:
                                                "asc",
                                        },
                                    },
                                },
                            },
                        },
                    });

            if (
                !booking
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            return res.json({

                success:
                    true,

                data:
                    formatBooking(
                        booking
                    ),
            });

        } catch (error) {

            console.error(
                "Get booking error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to fetch booking",
                });
        }
    };

// ======================================================
// CREATE BOOKING
// ======================================================

export const createBooking =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const payload =
                req.body as
                BookingPayload;

            const {
                bookingCode,

                customerId,
                propertyId,
                employeeId,

                flatNumber,
                tower,
                floor,

                customerName,
                mobile,
                email,
                address,
                aadhar,
                pan,
                dob,
                doa,
                profile,

                bookingAmount,

                remainingAmount,
                remainingAmountMode,

                financeType,

                totalAmount,
                discount,
                afterDiscountAmount,

                plan,
                chequeNo,
                bankName,
                finance,
                customerNeed,

                paymentMode,

                bookingDate,
                remarks,

                status,

                documents,
            } = payload;

            // ==================================================
            // Required Customer Fields
            // ==================================================

            if (
                !customerName ||
                !mobile
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Customer name and mobile are required",
                    });
            }

            // ==================================================
            // Find Customer
            // ==================================================

            let customer =
                customerId
                    ? await prisma
                        .customer
                        .findUnique({

                            where: {
                                id:
                                    String(
                                        customerId
                                    ),
                            },
                        })
                    : null;

            if (
                !customer
            ) {

                customer =
                    await prisma
                        .customer
                        .findFirst({

                            where: {
                                phone:
                                    String(
                                        mobile
                                    )
                                        .trim(),
                            },
                        });
            }

            // ==================================================
            // Customer Data
            // ==================================================

            const customerData = {

                name:
                    String(
                        customerName
                    )
                        .trim(),

                email:
                    email
                        ? String(
                            email
                        )
                            .trim()
                        : null,

                phone:
                    String(
                        mobile
                    )
                        .trim(),

                address:
                    address
                        ? String(
                            address
                        )
                            .trim()
                        : null,

                aadhar:
                    aadhar
                        ? String(
                            aadhar
                        )
                            .trim()
                        : null,

                pan:
                    pan
                        ? String(
                            pan
                        )
                            .trim()
                        : null,

                dob:
                    parseDateValue(
                        dob
                    ),

                doa:
                    parseDateValue(
                        doa
                    ),

                profile:
                    profile
                        ? String(
                            profile
                        )
                            .trim()
                        : null,
            };

            // ==================================================
            // Create / Update Customer
            // ==================================================

            customer =
                customer
                    ? await prisma
                        .customer
                        .update({

                            where: {
                                id:
                                    customer.id,
                            },

                            data:
                                customerData,
                        })

                    : await prisma
                        .customer
                        .create({

                            data:
                                customerData,
                        });

            // ==================================================
            // Find Property
            // ==================================================

            let property =
                propertyId
                    ? await prisma
                        .property
                        .findUnique({

                            where: {
                                id:
                                    String(
                                        propertyId
                                    ),
                            },
                        })
                    : null;

            if (
                !property
            ) {

                property =
                    await prisma
                        .property
                        .findFirst({

                            where: {

                                unitNumber:
                                    String(
                                        flatNumber ??
                                        ""
                                    ),

                                OR: [
                                    {
                                        block:
                                            String(
                                                tower ??
                                                ""
                                            ),
                                    },

                                    {
                                        tower:
                                            String(
                                                tower ??
                                                ""
                                            ),
                                    },
                                ],

                                floor:
                                    String(
                                        floor ??
                                        ""
                                    ),
                            },
                        });
            }

            if (
                !property
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Property/flat not found in inventory",
                    });
            }

            // ==================================================
            // Fine Dine Guard
            // ==================================================

            if (
                property
                    .isFineDine
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "This property is reserved for Fine Dine and cannot be booked",
                    });
            }

            // ==================================================
            // Booking Status
            // ==================================================

            const finalBookingStatus =
                normalizeBookingStatus(
                    status
                );

            if (
                finalBookingStatus !==
                BookingStatus
                    .CANCELLED &&
                property.status !==
                PropertyStatus
                    .AVAILABLE
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            `Property is currently ${property.status.toLowerCase()} and cannot be booked`,
                    });
            }

            // ==================================================
            // Employee Validation
            // ==================================================

            if (
                employeeId
            ) {

                const employee =
                    await prisma
                        .employee
                        .findUnique({

                            where: {
                                id:
                                    String(
                                        employeeId
                                    ),
                            },
                        });

                if (
                    !employee
                ) {

                    return res
                        .status(404)
                        .json({

                            success:
                                false,

                            message:
                                "Employee not found",
                        });
                }
            }

            // ==================================================
            // Booking Code
            // ==================================================

            const finalBookingCode =
                bookingCode ||
                `BK-${Date.now()}`;

            const existingBooking =
                await prisma
                    .booking
                    .findUnique({

                        where: {
                            bookingCode:
                                finalBookingCode,
                        },
                    });

            if (
                existingBooking
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "Booking with this code already exists",
                    });
            }

            // ==================================================
            // Financial Values
            // ==================================================

            const parsedBookingAmount =
                parseNullableNumber(
                    bookingAmount
                );

            const parsedTotalAmount =
                parseNullableNumber(
                    totalAmount
                );

            const parsedDiscount =
                parseNullableNumber(
                    discount
                );

            const parsedAfterDiscountAmount =
                parseNullableNumber(
                    afterDiscountAmount
                );

            const parsedManualRemainingAmount =
                parseNullableNumber(
                    remainingAmount
                );

            // ==================================================
            // Remaining Amount
            // ==================================================
            const finalSaleValue =
                calculateFinalSaleValue(
                    parsedAfterDiscountAmount,
                    parsedTotalAmount,
                    parsedDiscount
                );

            const shouldPersistFinalSaleValue =
                parsedAfterDiscountAmount !=
                null ||
                parsedTotalAmount !=
                null;

            const finalRemainingAmountMode =
                normalizeRemainingAmountMode(
                    remainingAmountMode
                );

            const finalRemainingAmount =
                finalRemainingAmountMode ===
                    RemainingAmountMode
                        .AUTO

                    ? calculateRemainingAmount(
                        finalSaleValue,
                        parsedBookingAmount
                    )

                    : parsedManualRemainingAmount ??
                    null;

            // ==================================================
            // Finance / Cash
            // ==================================================

            const finalFinanceType =
                normalizeFinanceType(
                    financeType
                );

            // ==================================================
            // Notes
            // ==================================================

            const notes =
                JSON.stringify({

                    paymentMode:
                        paymentMode ??
                        "Cash",

                    remarks:
                        remarks ??
                        "",
                });

            // ==================================================
            // Create Transaction
            // ==================================================

            const booking =
                await prisma
                    .$transaction(
                        async (
                            tx
                        ) => {

                            const currentProperty =
                                await tx
                                    .property
                                    .findUnique({

                                        where: {
                                            id:
                                                property.id,
                                        },
                                    });

                            if (
                                !currentProperty
                            ) {

                                throw new Error(
                                    "Property not found"
                                );
                            }

                            if (
                                currentProperty
                                    .isFineDine
                            ) {

                                throw new Error(
                                    "FINE_DINE_BLOCK"
                                );
                            }

                            if (
                                finalBookingStatus !==
                                BookingStatus
                                    .CANCELLED &&

                                currentProperty
                                    .status !==
                                PropertyStatus
                                    .AVAILABLE
                            ) {

                                throw new Error(
                                    "PROPERTY_NOT_AVAILABLE"
                                );
                            }

                            // ==================================
                            // Create Booking
                            // ==================================

                            const newBooking =
                                await tx
                                    .booking
                                    .create({

                                        data: {

                                            bookingCode:
                                                finalBookingCode,

                                            customerId:
                                                customer.id,

                                            propertyId:
                                                currentProperty.id,

                                            employeeId:
                                                employeeId
                                                    ? String(
                                                        employeeId
                                                    )
                                                    : null,

                                            status:
                                                finalBookingStatus,

                                            bookingDate:
                                                bookingDate
                                                    ? new Date(
                                                        bookingDate
                                                    )
                                                    : undefined,

                                            // ----------------------
                                            // Booking Amount
                                            // ----------------------

                                            amount:
                                                parsedBookingAmount ??
                                                undefined,

                                            // ----------------------
                                            // Remaining Amount
                                            // ----------------------

                                            remainingAmount:
                                                finalRemainingAmount,

                                            remainingAmountMode:
                                                finalRemainingAmountMode,

                                            // ----------------------
                                            // Finance / Cash
                                            // ----------------------

                                            financeType:
                                                finalFinanceType,

                                            // ----------------------
                                            // Client Financial
                                            // ----------------------

                                            totalAmount:
                                                parsedTotalAmount ??
                                                undefined,

                                            discount:
                                                parsedDiscount ??
                                                undefined,

                                            afterDiscountAmount:
                                                shouldPersistFinalSaleValue
                                                    ? finalSaleValue
                                                    : undefined,

                                            plan:
                                                plan
                                                    ? String(
                                                        plan
                                                    )
                                                        .trim()
                                                    : null,

                                            chequeNo:
                                                chequeNo
                                                    ? String(
                                                        chequeNo
                                                    )
                                                        .trim()
                                                    : null,

                                            bankName:
                                                bankName
                                                    ? String(
                                                        bankName
                                                    )
                                                        .trim()
                                                    : null,

                                            finance:
                                                finance
                                                    ? String(
                                                        finance
                                                    )
                                                        .trim()
                                                    : null,

                                            customerNeed:
                                                customerNeed
                                                    ? String(
                                                        customerNeed
                                                    )
                                                        .trim()
                                                    : null,

                                            notes,
                                        },
                                    });
                            // ==================================
                            // Create Installment Plan Snapshot
                            // ==================================



                            const installmentPlan =
                                getInstallmentPlan(
                                    currentProperty.type
                                );

                            let plannedAmountRunningTotal =
                                0;

                            for (
                                const installment of
                                installmentPlan
                            ) {

                                const plannedAmount =
                                    installment.sequence ===
                                        10
                                        ? roundMoney(
                                            finalSaleValue -
                                            plannedAmountRunningTotal
                                        )
                                        : roundMoney(
                                            (
                                                finalSaleValue *
                                                installment.percentage
                                            ) /
                                            100
                                        );

                                plannedAmountRunningTotal =
                                    roundMoney(
                                        plannedAmountRunningTotal +
                                        plannedAmount
                                    );

                                const createdStage =
                                    await tx
                                        .bookingInstallmentStage
                                        .create({

                                            data: {

                                                bookingId:
                                                    newBooking.id,

                                                sequence:
                                                    installment.sequence,

                                                stageName:
                                                    installment.stageName,

                                                percentage:
                                                    installment.percentage,

                                                plannedAmount,
                                            },
                                        });

                                // ----------------------------------
                                // Initial Booking Amount Payment
                                // Stage 1 = Booking Amount
                                // ----------------------------------

                                if (
                                    installment.sequence ===
                                    1 &&
                                    parsedBookingAmount !=
                                    null &&
                                    parsedBookingAmount >
                                    0
                                ) {

                                    await tx
                                        .bookingInstallmentPayment
                                        .create({

                                            data: {

                                                bookingId:
                                                    newBooking.id,

                                                installmentId:
                                                    createdStage.id,

                                                amount:
                                                    parsedBookingAmount,

                                                paymentDate:
                                                    bookingDate
                                                        ? new Date(
                                                            bookingDate
                                                        )
                                                        : new Date(),

                                                paymentMode:
                                                    paymentMode ??
                                                    "Cash",

                                                remarks:
                                                    "Initial booking payment",
                                            },
                                        });
                                }
                            }
                            // ==================================
                            // Requisition Letter
                            // ==================================

                            await upsertBookingDocument(
                                tx,

                                newBooking.id,

                                DocumentType
                                    .REQUISITION_LETTER,

                                documents
                                    ?.requisitionLetter ??
                                {
                                    status:
                                        "pending",
                                }
                            );

                            // ==================================
                            // Agreement To Sell
                            // ==================================

                            await upsertBookingDocument(
                                tx,

                                newBooking.id,

                                DocumentType
                                    .AGREEMENT_TO_SELL,

                                documents
                                    ?.agreementToSell ??
                                {
                                    status:
                                        "pending",
                                }
                            );

                            // ==================================
                            // Tripartite Agreement
                            // ==================================

                            if (
                                documents
                                    ?.tripartiteAgreement
                                    ?.required ===
                                true
                            ) {

                                await upsertBookingDocument(
                                    tx,

                                    newBooking.id,

                                    DocumentType
                                        .TRIPARTITE_AGREEMENT,

                                    documents
                                        .tripartiteAgreement
                                        .document ??
                                    {
                                        status:
                                            "pending",
                                    }
                                );
                            }

                            // ==================================
                            // Property Status
                            // ==================================

                            await tx
                                .property
                                .update({

                                    where: {
                                        id:
                                            currentProperty.id,
                                    },

                                    data: {

                                        status:
                                            getPropertyStatusFromBookingStatus(
                                                finalBookingStatus
                                            ),
                                    },
                                });

                            return newBooking;
                        }
                    );

            // ==================================================
            // Reload Complete Booking
            // ==================================================

            const completeBooking =
                await prisma
                    .booking
                    .findUnique({

                        where: {
                            id:
                                booking.id,
                        },

                        include: {

                            customer:
                                true,

                            property:
                                true,

                            employee:
                                true,

                            documents:
                                true,

                            installmentStages: {

                                orderBy: {
                                    sequence:
                                        "asc",
                                },

                                include: {

                                    payments: {

                                        orderBy: {
                                            paymentDate:
                                                "asc",
                                        },
                                    },
                                },
                            },
                        },
                    });

            return res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Booking created successfully",

                    data:
                        formatBooking(
                            completeBooking
                        ),
                });

        } catch (error) {

            console.error(
                "Create booking error:",
                error
            );

            if (
                error instanceof
                Error &&
                error.message ===
                "FINE_DINE_BLOCK"
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "This property is reserved for Fine Dine and cannot be booked",
                    });
            }

            if (
                error instanceof
                Error &&
                error.message ===
                "PROPERTY_NOT_AVAILABLE"
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "Property is no longer available for booking",
                    });
            }

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to create booking",

                    error:
                        error instanceof
                            Error
                            ? error.message
                            : "Unknown error",
                });
        }
    };

// ======================================================
// UPDATE BOOKING
// ======================================================

export const updateBooking = async (
    req: Request,
    res: Response
) => {
    try {
        const bookingId =
            String(req.params.id);

        const payload =
            req.body as BookingPayload;

        // ==================================================
        // Existing Booking
        // ==================================================

        const existingBooking =
            await prisma.booking.findUnique({
                where: {
                    id: bookingId,
                },

                include: {
                    customer: true,
                    property: true,
                    employee: true,
                    documents: true,
                },
            });

        if (!existingBooking) {
            return res
                .status(404)
                .json({
                    success: false,
                    message:
                        "Booking not found",
                });
        }

        // ==================================================
        // Prisma relation payload typing helper
        //
        // Runtime booking contains all scalar fields.
        // This explicitly tells TypeScript about the
        // newly-added financial scalar fields.
        // ==================================================

        const existingBookingFinancial =
            existingBooking as
            typeof existingBooking & {
                remainingAmount:
                number | null;

                remainingAmountMode:
                RemainingAmountMode;

                financeType:
                FinanceType | null;
            };

        const {
            customerName,
            mobile,
            email,
            address,
            aadhar,
            pan,
            dob,
            doa,
            profile,

            bookingAmount,

            remainingAmount,
            remainingAmountMode,

            financeType,

            totalAmount,
            discount,
            afterDiscountAmount,

            plan,
            chequeNo,
            bankName,
            finance,
            customerNeed,

            paymentMode,
            bookingDate,
            remarks,

            employeeId,
            status,

            documents,
        } = payload;

        // ==================================================
        // Customer Update
        // ==================================================

        const hasCustomerUpdate =
            customerName !== undefined ||
            mobile !== undefined ||
            email !== undefined ||
            address !== undefined ||
            aadhar !== undefined ||
            pan !== undefined ||
            dob !== undefined ||
            doa !== undefined ||
            profile !== undefined;

        if (hasCustomerUpdate) {
            await prisma.customer.update({
                where: {
                    id:
                        existingBooking
                            .customerId,
                },

                data: {
                    name:
                        customerName !==
                            undefined
                            ? String(
                                customerName
                            ).trim()
                            : undefined,

                    phone:
                        mobile !== undefined
                            ? String(
                                mobile
                            ).trim()
                            : undefined,

                    email:
                        email !== undefined
                            ? email
                                ? String(
                                    email
                                ).trim()
                                : null
                            : undefined,

                    address:
                        address !==
                            undefined
                            ? address
                                ? String(
                                    address
                                ).trim()
                                : null
                            : undefined,

                    aadhar:
                        aadhar !== undefined
                            ? aadhar
                                ? String(
                                    aadhar
                                ).trim()
                                : null
                            : undefined,

                    pan:
                        pan !== undefined
                            ? pan
                                ? String(
                                    pan
                                ).trim()
                                : null
                            : undefined,

                    dob:
                        dob !== undefined
                            ? parseDateValue(
                                dob
                            )
                            : undefined,

                    doa:
                        doa !== undefined
                            ? parseDateValue(
                                doa
                            )
                            : undefined,

                    profile:
                        profile !==
                            undefined
                            ? profile
                                ? String(
                                    profile
                                ).trim()
                                : null
                            : undefined,
                },
            });
        }

        // ==================================================
        // Employee Validation
        // ==================================================

        if (employeeId) {
            const employee =
                await prisma.employee
                    .findUnique({
                        where: {
                            id: String(
                                employeeId
                            ),
                        },
                    });

            if (!employee) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Employee not found",
                    });
            }
        }

        // ==================================================
        // Existing Notes
        // ==================================================

        let currentExtraData: {
            paymentMode?: string;
            remarks?: string;
        } = {};

        try {
            if (
                existingBooking.notes
            ) {
                currentExtraData =
                    JSON.parse(
                        existingBooking.notes
                    );
            }
        } catch {
            currentExtraData = {
                remarks:
                    existingBooking.notes ??
                    "",
            };
        }

        const updatedNotes =
            JSON.stringify({
                paymentMode:
                    paymentMode ??
                    currentExtraData
                        .paymentMode ??
                    "Cash",

                remarks:
                    remarks ??
                    currentExtraData
                        .remarks ??
                    "",
            });

        // ==================================================
        // Booking Status
        // ==================================================

        const nextBookingStatus =
            status !== undefined
                ? normalizeBookingStatus(
                    status
                )
                : existingBooking.status;

        // ==================================================
        // Active Booking Guard
        // ==================================================

        if (
            status !== undefined &&
            nextBookingStatus !==
            BookingStatus.CANCELLED
        ) {
            const otherActiveBooking =
                await prisma.booking
                    .findFirst({
                        where: {
                            propertyId:
                                existingBooking
                                    .propertyId,

                            id: {
                                not: bookingId,
                            },

                            status: {
                                in: [
                                    BookingStatus.PENDING,
                                    BookingStatus.CONFIRMED,
                                    BookingStatus.COMPLETED,
                                ],
                            },
                        },
                    });

            if (
                otherActiveBooking
            ) {
                return res
                    .status(409)
                    .json({
                        success: false,

                        message:
                            "Another active booking already exists for this property",
                    });
            }

            if (
                existingBooking
                    .property
                    .isFineDine
            ) {
                return res
                    .status(409)
                    .json({
                        success: false,

                        message:
                            "This property is reserved for Fine Dine and cannot be booked",
                    });
            }
        }

        // ==================================================
        // Booking Amount
        // ==================================================

        const nextBookingAmount =
            bookingAmount !==
                undefined
                ? parseNullableNumber(
                    bookingAmount
                ) ?? null
                : existingBooking
                    .amount;

        // ==================================================
        // After Discount Amount
        // ==================================================
        const nextTotalAmount =
            totalAmount !== undefined
                ? parseNullableNumber(
                    totalAmount
                ) ?? null
                : existingBooking
                    .totalAmount;

        const nextDiscount =
            discount !== undefined
                ? parseNullableNumber(
                    discount
                ) ?? null
                : existingBooking
                    .discount;

        const nextAfterDiscountAmount =
            afterDiscountAmount !==
                undefined
                ? parseNullableNumber(
                    afterDiscountAmount
                ) ?? null
                : (
                    totalAmount !== undefined ||
                    discount !== undefined
                )
                    ? calculateFinalSaleValue(
                        null,
                        nextTotalAmount,
                        nextDiscount
                    )
                    : existingBooking
                        .afterDiscountAmount;

        const nextFinalSaleValue =
            calculateFinalSaleValue(
                nextAfterDiscountAmount,
                nextTotalAmount,
                nextDiscount
            );

        // ==================================================
        // Remaining Amount Mode
        // ==================================================

        const nextRemainingAmountMode =
            remainingAmountMode !==
                undefined
                ? normalizeRemainingAmountMode(
                    remainingAmountMode
                )
                : existingBookingFinancial
                    .remainingAmountMode;



        const installmentPaymentTotal =
            await prisma.bookingInstallmentPayment.aggregate({
                where: {
                    bookingId,
                },

                _sum: {
                    amount: true,
                },
            });

        const totalInstallmentReceived =
            roundMoney(
                Number(
                    installmentPaymentTotal
                        ._sum
                        .amount ??
                    0
                )
            );

        const effectiveReceivedAmount =
            roundMoney(
                totalInstallmentReceived >
                    0
                    ? totalInstallmentReceived
                    : nextBookingAmount ??
                    0
            );

        // ==================================================
        // Remaining Amount
        //
        // AUTO:
        // Final Sale Value - Total Received
        //
        // MANUAL:
        // Admin entered value
        // ==================================================

        let nextRemainingAmount =
            existingBookingFinancial
                .remainingAmount;

        if (
            nextRemainingAmountMode ===
            RemainingAmountMode.AUTO
        ) {
            nextRemainingAmount =
                calculateRemainingAmount(
                    nextFinalSaleValue,
                    effectiveReceivedAmount
                );
        } else if (
            remainingAmount !==
            undefined
        ) {
            nextRemainingAmount =
                parseNullableNumber(
                    remainingAmount
                ) ?? null;
        }

        const shouldUpdateFinalSaleValue =
            totalAmount !==
            undefined ||
            discount !==
            undefined ||
            afterDiscountAmount !==
            undefined;

        const shouldUpdateRemainingAmount =
            bookingAmount !==
            undefined ||
            shouldUpdateFinalSaleValue ||
            remainingAmount !==
            undefined ||
            remainingAmountMode !==
            undefined;

        // ==================================================
        // Finance / Cash
        // ==================================================

        const nextFinanceType =
            financeType !== undefined
                ? normalizeFinanceType(
                    financeType
                )
                : undefined;

        // ==================================================
        // Transaction
        // ==================================================

        const booking =
            await prisma.$transaction(
                async (tx) => {
                    const updatedBooking =
                        await tx.booking.update({
                            where: {
                                id:
                                    bookingId,
                            },

                            data: {
                                // --------------------------
                                // Employee
                                // --------------------------

                                employeeId:
                                    employeeId !==
                                        undefined
                                        ? employeeId
                                            ? String(
                                                employeeId
                                            )
                                            : null
                                        : undefined,

                                // --------------------------
                                // Status
                                // --------------------------

                                status:
                                    status !==
                                        undefined
                                        ? nextBookingStatus
                                        : undefined,

                                // --------------------------
                                // Booking Date
                                // --------------------------

                                bookingDate:
                                    bookingDate !==
                                        undefined
                                        ? bookingDate
                                            ? new Date(
                                                bookingDate
                                            )
                                            : undefined
                                        : undefined,

                                // --------------------------
                                // Booking Amount
                                // --------------------------

                                amount:
                                    bookingAmount !==
                                        undefined
                                        ? nextBookingAmount
                                        : undefined,

                                // --------------------------
                                // Remaining Amount
                                // --------------------------

                                remainingAmount:
                                    shouldUpdateRemainingAmount
                                        ? nextRemainingAmount
                                        : undefined,

                                remainingAmountMode:
                                    remainingAmountMode !==
                                        undefined
                                        ? nextRemainingAmountMode
                                        : undefined,

                                // --------------------------
                                // Finance / Cash
                                // --------------------------

                                financeType:
                                    nextFinanceType,

                                // --------------------------
                                // Total Amount
                                // --------------------------

                                totalAmount:
                                    totalAmount !==
                                        undefined
                                        ? nextTotalAmount
                                        : undefined,

                                // --------------------------
                                // Discount
                                // --------------------------

                                discount:
                                    discount !==
                                        undefined
                                        ? nextDiscount
                                        : undefined,

                                // --------------------------
                                // After Discount
                                // --------------------------

                                afterDiscountAmount:
                                    shouldUpdateFinalSaleValue
                                        ? nextFinalSaleValue
                                        : undefined,

                                // --------------------------
                                // Plan
                                // --------------------------

                                plan:
                                    plan !==
                                        undefined
                                        ? plan
                                            ? String(
                                                plan
                                            ).trim()
                                            : null
                                        : undefined,

                                // --------------------------
                                // Cheque
                                // --------------------------

                                chequeNo:
                                    chequeNo !==
                                        undefined
                                        ? chequeNo
                                            ? String(
                                                chequeNo
                                            ).trim()
                                            : null
                                        : undefined,

                                // --------------------------
                                // Bank
                                // --------------------------

                                bankName:
                                    bankName !==
                                        undefined
                                        ? bankName
                                            ? String(
                                                bankName
                                            ).trim()
                                            : null
                                        : undefined,

                                // --------------------------
                                // Existing Finance Detail
                                // --------------------------

                                finance:
                                    finance !==
                                        undefined
                                        ? finance
                                            ? String(
                                                finance
                                            ).trim()
                                            : null
                                        : undefined,

                                // --------------------------
                                // Customer Need
                                // --------------------------

                                customerNeed:
                                    customerNeed !==
                                        undefined
                                        ? customerNeed
                                            ? String(
                                                customerNeed
                                            ).trim()
                                            : null
                                        : undefined,

                                // --------------------------
                                // Notes
                                // --------------------------

                                notes:
                                    updatedNotes,
                            },
                        });

                    // ======================================
                    // Re-plan Installment Snapshot
                    // Keeps payment history untouched
                    // ======================================

                    if (
                        shouldUpdateFinalSaleValue
                    ) {
                        const installmentPlan =
                            getInstallmentPlan(
                                existingBooking
                                    .property
                                    .type
                            );

                        let plannedAmountRunningTotal =
                            0;

                        for (
                            const installment of
                            installmentPlan
                        ) {
                            const plannedAmount =
                                installment.sequence ===
                                    10
                                    ? roundMoney(
                                        nextFinalSaleValue -
                                        plannedAmountRunningTotal
                                    )
                                    : roundMoney(
                                        (
                                            nextFinalSaleValue *
                                            installment.percentage
                                        ) /
                                        100
                                    );

                            plannedAmountRunningTotal =
                                roundMoney(
                                    plannedAmountRunningTotal +
                                    plannedAmount
                                );

                            await tx
                                .bookingInstallmentStage
                                .updateMany({
                                    where: {
                                        bookingId,
                                        sequence:
                                            installment.sequence,
                                    },

                                    data: {
                                        plannedAmount,
                                    },
                                });
                        }
                    }

                    // ======================================
                    // Documents
                    // ======================================

                    await syncBookingDocuments(
                        tx,
                        bookingId,
                        documents
                    );

                    // ======================================
                    // Property Status
                    // ======================================

                    if (
                        status !==
                        undefined
                    ) {
                        const relatedBookings =
                            await tx.booking
                                .findMany({
                                    where: {
                                        propertyId:
                                            existingBooking
                                                .propertyId,

                                        id: {
                                            not:
                                                bookingId,
                                        },

                                        status: {
                                            in: [
                                                BookingStatus.PENDING,
                                                BookingStatus.CONFIRMED,
                                                BookingStatus.COMPLETED,
                                            ],
                                        },
                                    },

                                    select: {
                                        status: true,
                                    },
                                });

                        if (
                            nextBookingStatus !==
                            BookingStatus.CANCELLED
                        ) {
                            relatedBookings.push({
                                status:
                                    nextBookingStatus,
                            });
                        }

                        const nextPropertyStatus =
                            getPropertyStatusFromBookings(
                                relatedBookings
                            );

                        await tx.property
                            .update({
                                where: {
                                    id:
                                        existingBooking
                                            .propertyId,
                                },

                                data: {
                                    status:
                                        nextPropertyStatus,
                                },
                            });
                    }

                    return updatedBooking;
                }
            );

        // ==================================================
        // Reload Complete Booking
        // ==================================================

        const completeBooking =
            await prisma.booking
                .findUnique({
                    where: {
                        id:
                            booking.id,
                    },

                    include: {

                        customer:
                            true,

                        property:
                            true,

                        employee:
                            true,

                        documents:
                            true,

                        installmentStages: {

                            orderBy: {
                                sequence:
                                    "asc",
                            },

                            include: {

                                payments: {

                                    orderBy: {
                                        paymentDate:
                                            "asc",
                                    },
                                },
                            },
                        },
                    },
                });

        return res.json({
            success: true,

            message:
                "Booking updated successfully",

            data:
                formatBooking(
                    completeBooking
                ),
        });
    } catch (error) {
        console.error(
            "Update booking error:",
            error
        );

        return res
            .status(500)
            .json({
                success: false,

                message:
                    "Failed to update booking",

                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error",
            });
    }
};

// ======================================================
// DELETE BOOKING
// ======================================================

// ======================================================
// DELETE / ARCHIVE BOOKING
// Bookings page se remove hoga,
// Reports history me preserve rahega.
// ======================================================

export const deleteBooking =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const bookingId =
                String(
                    req.params.id
                );

            const existingBooking =
                await prisma.booking
                    .findUnique({

                        where: {
                            id:
                                bookingId,
                        },
                    });

            if (
                !existingBooking
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            if (
                existingBooking
                    .archivedAt
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Booking is already archived",
                    });
            }

            const archiveTime =
                new Date();

            await prisma
                .$transaction(
                    async (
                        tx
                    ) => {

                        // ==================================
                        // Soft Archive Booking
                        // DO NOT permanently delete
                        // ==================================

                        await tx.booking
                            .update({

                                where: {
                                    id:
                                        bookingId,
                                },

                                data: {

                                    archivedAt:
                                        archiveTime,

                                    status:
                                        BookingStatus
                                            .CANCELLED,

                                    cancelledAt:
                                        existingBooking
                                            .cancelledAt ??
                                        archiveTime,

                                },
                            });

                        // ==================================
                        // Remaining Active Bookings
                        // ==================================

                        const remainingBookings =
                            await tx.booking
                                .findMany({

                                    where: {

                                        propertyId:
                                            existingBooking
                                                .propertyId,

                                        archivedAt:
                                            null,

                                        status: {

                                            in: [
                                                BookingStatus
                                                    .PENDING,

                                                BookingStatus
                                                    .CONFIRMED,

                                                BookingStatus
                                                    .COMPLETED,
                                            ],
                                        },
                                    },

                                    select: {
                                        status:
                                            true,
                                    },
                                });

                        // ==================================
                        // Property Status
                        // ==================================

                        const nextPropertyStatus =
                            getPropertyStatusFromBookings(
                                remainingBookings
                            );

                        await tx.property
                            .update({

                                where: {
                                    id:
                                        existingBooking
                                            .propertyId,
                                },

                                data: {
                                    status:
                                        nextPropertyStatus,
                                },
                            });
                    }
                );

            return res.json({

                success:
                    true,

                message:
                    "Booking archived successfully",
            });

        } catch (
        error
        ) {

            console.error(
                "Archive booking error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to archive booking",

                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
        }
    };
// ======================================================
// PERMANENT DELETE BOOKING
// Reports page only
// Database history permanently remove hogi.
// ======================================================

export const permanentlyDeleteBooking =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const bookingId =
                String(
                    req.params.id
                );

            // ==============================================
            // Existing Booking
            // ==============================================

            const existingBooking =
                await prisma.booking
                    .findUnique({

                        where: {
                            id:
                                bookingId,
                        },

                        select: {
                            id:
                                true,

                            propertyId:
                                true,
                        },
                    });

            if (
                !existingBooking
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            // ==============================================
            // Permanent Delete Transaction
            // ==============================================

            await prisma
                .$transaction(
                    async (
                        tx
                    ) => {

                        // ----------------------------------
                        // Permanently delete booking
                        //
                        // Booking Documents + NOC records
                        // cascade delete through Prisma DB
                        // relations.
                        // ----------------------------------

                        await tx.booking
                            .delete({

                                where: {
                                    id:
                                        bookingId,
                                },
                            });

                        // ----------------------------------
                        // Find remaining active bookings
                        // for this property
                        // ----------------------------------

                        const remainingBookings =
                            await tx.booking
                                .findMany({

                                    where: {

                                        propertyId:
                                            existingBooking
                                                .propertyId,

                                        archivedAt:
                                            null,

                                        status: {

                                            in: [
                                                BookingStatus
                                                    .PENDING,

                                                BookingStatus
                                                    .CONFIRMED,

                                                BookingStatus
                                                    .COMPLETED,
                                            ],
                                        },
                                    },

                                    select: {
                                        status:
                                            true,
                                    },
                                });

                        // ----------------------------------
                        // Recalculate Property Status
                        // ----------------------------------

                        const nextPropertyStatus =
                            getPropertyStatusFromBookings(
                                remainingBookings
                            );

                        await tx.property
                            .update({

                                where: {
                                    id:
                                        existingBooking
                                            .propertyId,
                                },

                                data: {
                                    status:
                                        nextPropertyStatus,
                                },
                            });
                    }
                );

            return res.json({

                success:
                    true,

                message:
                    "Booking permanently deleted successfully",
            });

        } catch (
        error
        ) {

            console.error(
                "Permanent delete booking error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to permanently delete booking",

                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                });
        }
    };