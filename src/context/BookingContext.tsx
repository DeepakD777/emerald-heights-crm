import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import {
    getAuthToken,
} from "../services/api";

// ======================================================
// Agreement / Document
// ======================================================

interface AgreementDocument {
    status:
    | "pending"
    | "generated"
    | "uploaded"
    | "given"
    | "completed";

    fileName?: string;
    fileUrl?: string;

    generatedAt?: string;
    uploadedAt?: string;
    givenAt?: string;
    completedAt?: string;
}

// ======================================================
// Booking Documents
// ======================================================

interface BookingDocuments {
    requisitionLetter:
    AgreementDocument;

    agreementToSell:
    AgreementDocument;

    tripartiteAgreement: {
        required: boolean;

        document:
        AgreementDocument;
    };
}

// ======================================================
// Assigned Employee
// ======================================================

interface AssignedEmployee {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
}
// ======================================================
// Installment Payment
// ======================================================

interface InstallmentPayment {
    id: string;
    amount: number;

    paymentDate:
    string | null;

    paymentMode:
    string | null;

    referenceNo:
    string | null;

    remarks:
    string | null;
}

// ======================================================
// Installment Stage
// ======================================================

interface InstallmentStage {
    id: string;

    sequence:
    number;

    stageName:
    string;

    percentage:
    number;

    plannedAmount:
    number;

    paidAmount:
    number;

    balanceAmount:
    number;

    status:
    | "PENDING"
    | "PARTIAL"
    | "PAID";

    lastPaymentDate:
    string | null;

    lastPaymentMode:
    string | null;

    payments:
    InstallmentPayment[];
}

// ======================================================
// Installment Summary
// ======================================================

interface InstallmentSummary {
    totalPlannedAmount:
    number;

    totalReceivedAmount:
    number;

    totalBalanceAmount:
    number;

    currentInstallment:
    {
        id: string;
        sequence: number;
        stageName: string;
        percentage: number;
        plannedAmount: number;
        paidAmount: number;
        balanceAmount: number;

        status:
        | "PENDING"
        | "PARTIAL"
        | "PAID";
    } | null;
}

// ======================================================
// Booking
// ======================================================

interface Booking {
    id: string;

    flatNumber: string;
    tower: string;
    floor: number;

    customerName: string;
    mobile: string;
    email: string;
    address: string;

    aadhar: string;
    pan: string;

    // ==================================================
    // Client Customer Fields
    // ==================================================

    dob?: string;
    doa?: string;
    profile?: string;

    // ==================================================
    // Existing Booking Fields
    // ==================================================

    bookingAmount: string;

    propertyType?:
    | "RESIDENTIAL"
    | "COMMERCIAL"
    | null;

    remainingAmount?: string;

    remainingAmountMode?:
    | "AUTO"
    | "MANUAL";

    financeType?:
    | "FINANCE"
    | "CASH"
    | null;

    paymentMode: string;
    bookingDate: string;

    cancelledAt:
    string | null;

    archivedAt:
    string | null;

    remarks: string;

    status: string;

    // ==================================================
    // Client Booking Fields
    // ==================================================

    totalAmount?: string;
    discount?: string;
    afterDiscountAmount?: string;

    plan?: string;

    chequeNo?: string;
    bankName?: string;

    finance?: string;
    customerNeed?: string;

    // ==================================================
    // Employee Assignment
    // ==================================================

    employeeId?:
    string | null;

    assignedEmployee?:
    AssignedEmployee | null;

    documents:
    BookingDocuments;
    // ==================================================
    // Installments
    // ==================================================

    installmentStages:
    InstallmentStage[];

    installmentSummary:
    InstallmentSummary;

    bookingCode?: string;
}

// ======================================================
// Context Type
// ======================================================

interface BookingContextType {
    bookings:
    Booking[];

    loading:
    boolean;

    error:
    string | null;

    addBooking: (
        booking:
            Booking
    ) => Promise<void>;

    updateBooking: (
        booking:
            Booking
    ) => Promise<void>;

    deleteBooking: (
        id:
            string
    ) => Promise<void>;

    permanentlyDeleteBooking: (
        id:
            string
    ) => Promise<void>;


    refreshBookings:
    () => Promise<void>;
}

// ======================================================
// API
// ======================================================

const API_URL =
    "http://localhost:5000/api/bookings";

// ======================================================
// Auth Headers
// ======================================================

const getRequestHeaders = (
    includeJson = false
): HeadersInit => {

    const token =
        getAuthToken();

    const headers:
        Record<
            string,
            string
        > = {};

    if (
        includeJson
    ) {

        headers[
            "Content-Type"
        ] =
            "application/json";
    }

    if (
        token
    ) {

        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
};

// ======================================================
// Default Documents
// ======================================================

const createDefaultDocuments =
    (): BookingDocuments => ({

        requisitionLetter: {
            status:
                "pending",
        },

        agreementToSell: {
            status:
                "pending",
        },

        tripartiteAgreement: {

            required:
                false,

            document: {
                status:
                    "pending",
            },
        },
    });

// ======================================================
// Normalize Document
// ======================================================

const normalizeDocument = (
    document: any
): AgreementDocument => {

    return {

        status:
            document?.status ??
            "pending",

        fileName:
            document?.fileName ??
            undefined,

        fileUrl:
            document?.fileUrl ??
            undefined,

        generatedAt:
            document?.generatedAt ??
            undefined,

        uploadedAt:
            document?.uploadedAt ??
            undefined,

        givenAt:
            document?.givenAt ??
            undefined,

        completedAt:
            document?.completedAt ??
            undefined,
    };
};

// ======================================================
// Normalize Assigned Employee
// ======================================================

const normalizeAssignedEmployee = (
    employee: any
): AssignedEmployee | null => {

    if (
        !employee
    ) {
        return null;
    }

    return {

        id:
            String(
                employee.id ??
                ""
            ),

        name:
            employee.name ??
            "",

        email:
            employee.email ??
            "",

        phone:
            employee.phone ??
            null,

        role:
            employee.role ??
            "",

        status:
            employee.status ??
            "",
    };
};

// ======================================================
// Normalize Booking
// ======================================================

const normalizeBooking = (
    booking: any
): Booking => {

    const documents =
        booking?.documents ??
        createDefaultDocuments();

    return {

        id:
            String(
                booking?.id ??
                crypto.randomUUID()
            ),

        flatNumber:
            booking?.flatNumber ??
            booking?.property
                ?.unitNumber ??
            "",

        tower:
            booking?.tower ??
            booking?.property
                ?.block ??
            "",

        floor:
            Number(
                booking?.floor ??
                booking?.property
                    ?.floor ??
                0
            ),

        customerName:
            booking?.customerName ??
            booking?.customer
                ?.name ??
            "",

        mobile:
            booking?.mobile ??
            booking?.customer
                ?.phone ??
            "",

        email:
            booking?.email ??
            booking?.customer
                ?.email ??
            "",

        address:
            booking?.address ??
            booking?.customer
                ?.address ??
            "",

        aadhar:
            booking?.aadhar ??
            booking?.customer
                ?.aadhar ??
            "",

        pan:
            booking?.pan ??
            booking?.customer
                ?.pan ??
            "",

        // ==================================================
        // Client Customer Fields
        // ==================================================

        dob:
            booking?.dob ??
            "",

        doa:
            booking?.doa ??
            "",

        profile:
            booking?.profile ??
            "",

        // ==================================================
        // Existing Booking Fields
        // ==================================================

        bookingAmount:
            booking?.bookingAmount ??
            (
                booking?.amount !=
                    null
                    ? String(
                        booking.amount
                    )
                    : ""
            ),

        propertyType:
            booking?.propertyType ??
            booking?.property
                ?.type ??
            null,

        remainingAmount:
            booking?.remainingAmount !=
                null
                ? String(
                    booking
                        .remainingAmount
                )
                : "",

        remainingAmountMode:
            booking
                ?.remainingAmountMode ??
            "AUTO",

        financeType:
            booking?.financeType ??
            null,

        paymentMode:
            booking?.paymentMode ??
            "Cash",

        bookingDate:
            booking?.bookingDate
                ? String(
                    booking.bookingDate
                ).split(
                    "T"
                )[0]
                : "",

        cancelledAt:
            booking?.cancelledAt
                ? String(
                    booking.cancelledAt
                )
                : null,

        archivedAt:
            booking?.archivedAt
                ? String(
                    booking.archivedAt
                )
                : null,

        remarks:
            booking?.remarks ??
            "",

        status:
            booking?.status ??
            "pending",

        bookingCode:
            booking?.bookingCode ??
            undefined,

        // ==================================================
        // Client Booking Fields
        // ==================================================

        totalAmount:
            booking?.totalAmount ??
            "",

        discount:
            booking?.discount ??
            "",

        afterDiscountAmount:
            booking
                ?.afterDiscountAmount ??
            "",

        plan:
            booking?.plan ??
            "",

        chequeNo:
            booking?.chequeNo ??
            "",

        bankName:
            booking?.bankName ??
            "",

        finance:
            booking?.finance ??
            "",

        customerNeed:
            booking?.customerNeed ??
            "",

        // ==================================================
        // Assigned Employee
        // ==================================================

        employeeId:
            booking?.employeeId ??
            booking
                ?.assignedEmployee
                ?.id ??
            null,

        assignedEmployee:
            normalizeAssignedEmployee(
                booking
                    ?.assignedEmployee ??
                booking?.employee
            ),
        // ==================================================
        // Installments
        // ==================================================

        installmentStages:
            Array.isArray(
                booking
                    ?.installmentStages
            )
                ? booking
                    .installmentStages
                    .map(
                        (
                            stage: any
                        ) => ({

                            id:
                                String(
                                    stage.id ??
                                    ""
                                ),

                            sequence:
                                Number(
                                    stage.sequence ??
                                    0
                                ),

                            stageName:
                                stage.stageName ??
                                "",

                            percentage:
                                Number(
                                    stage.percentage ??
                                    0
                                ),

                            plannedAmount:
                                Number(
                                    stage.plannedAmount ??
                                    0
                                ),

                            paidAmount:
                                Number(
                                    stage.paidAmount ??
                                    0
                                ),

                            balanceAmount:
                                Number(
                                    stage.balanceAmount ??
                                    0
                                ),

                            status:
                                stage.status ??
                                "PENDING",

                            lastPaymentDate:
                                stage
                                    .lastPaymentDate ??
                                null,

                            lastPaymentMode:
                                stage
                                    .lastPaymentMode ??
                                null,

                            payments:
                                Array.isArray(
                                    stage.payments
                                )
                                    ? stage
                                        .payments
                                        .map(
                                            (
                                                payment:
                                                    any
                                            ) => ({

                                                id:
                                                    String(
                                                        payment.id ??
                                                        ""
                                                    ),

                                                amount:
                                                    Number(
                                                        payment.amount ??
                                                        0
                                                    ),

                                                paymentDate:
                                                    payment.paymentDate ??
                                                    null,

                                                paymentMode:
                                                    payment.paymentMode ??
                                                    null,

                                                referenceNo:
                                                    payment.referenceNo ??
                                                    null,

                                                remarks:
                                                    payment.remarks ??
                                                    null,
                                            })
                                        )
                                    : [],
                        })
                    )
                : [],

        installmentSummary: {

            totalPlannedAmount:
                Number(
                    booking
                        ?.installmentSummary
                        ?.totalPlannedAmount ??
                    0
                ),

            totalReceivedAmount:
                Number(
                    booking
                        ?.installmentSummary
                        ?.totalReceivedAmount ??
                    0
                ),

            totalBalanceAmount:
                Number(
                    booking
                        ?.installmentSummary
                        ?.totalBalanceAmount ??
                    0
                ),

            currentInstallment:
                booking
                    ?.installmentSummary
                    ?.currentInstallment
                    ? {

                        id:
                            String(
                                booking
                                    .installmentSummary
                                    .currentInstallment
                                    .id ??
                                ""
                            ),

                        sequence:
                            Number(
                                booking
                                    .installmentSummary
                                    .currentInstallment
                                    .sequence ??
                                0
                            ),

                        stageName:
                            booking
                                .installmentSummary
                                .currentInstallment
                                .stageName ??
                            "",

                        percentage:
                            Number(
                                booking
                                    .installmentSummary
                                    .currentInstallment
                                    .percentage ??
                                0
                            ),

                        plannedAmount:
                            Number(
                                booking
                                    .installmentSummary
                                    .currentInstallment
                                    .plannedAmount ??
                                0
                            ),

                        paidAmount:
                            Number(
                                booking
                                    .installmentSummary
                                    .currentInstallment
                                    .paidAmount ??
                                0
                            ),

                        balanceAmount:
                            Number(
                                booking
                                    .installmentSummary
                                    .currentInstallment
                                    .balanceAmount ??
                                0
                            ),

                        status:
                            booking
                                .installmentSummary
                                .currentInstallment
                                .status ??
                            "PENDING",
                    }
                    : null,
        },
        documents: {

            requisitionLetter:
                normalizeDocument(
                    documents
                        .requisitionLetter
                ),

            agreementToSell:
                normalizeDocument(
                    documents
                        .agreementToSell
                ),

            tripartiteAgreement: {

                required:
                    Boolean(
                        documents
                            .tripartiteAgreement
                            ?.required
                    ),

                document:
                    normalizeDocument(
                        documents
                            .tripartiteAgreement
                            ?.document
                    ),
            },
        },
    };
};

// ======================================================
// Convert Frontend Booking -> API Payload
// ======================================================

const createApiPayload = (
    booking:
        Booking
) => {

    return {

        id:
            booking.id,

        bookingCode:
            booking.bookingCode,

        flatNumber:
            booking.flatNumber,

        tower:
            booking.tower,

        floor:
            booking.floor,

        // ==================================================
        // Employee Assignment
        // ==================================================

        employeeId:
            booking.employeeId ??
            null,

        // ==================================================
        // Customer
        // ==================================================

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

        dob:
            booking.dob,

        doa:
            booking.doa,

        profile:
            booking.profile,

        // ==================================================
        // Booking
        // ==================================================

        bookingAmount:
            booking.bookingAmount,

        remainingAmount:
            booking.remainingAmount,

        remainingAmountMode:
            booking
                .remainingAmountMode,

        financeType:
            booking.financeType,

        totalAmount:
            booking.totalAmount,

        discount:
            booking.discount,

        afterDiscountAmount:
            booking
                .afterDiscountAmount,

        plan:
            booking.plan,

        chequeNo:
            booking.chequeNo,

        bankName:
            booking.bankName,

        finance:
            booking.finance,

        customerNeed:
            booking.customerNeed,

        paymentMode:
            booking.paymentMode,

        bookingDate:
            booking.bookingDate,

        remarks:
            booking.remarks,

        status:
            booking.status,

        documents:
            booking.documents,
    };
};

// ======================================================
// Context
// ======================================================

const BookingContext =
    createContext<
        BookingContextType |
        undefined
    >(
        undefined
    );

// ======================================================
// Provider
// ======================================================

export function BookingProvider({
    children,
}: {
    children:
    ReactNode;
}) {

    const [
        bookings,
        setBookings,
    ] =
        useState<
            Booking[]
        >([]);

    const [
        loading,
        setLoading,
    ] =
        useState(
            true
        );

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(
            null
        );

    // ==================================================
    // GET BOOKINGS
    // ==================================================

    const refreshBookings =
        async () => {

            try {

                setLoading(
                    true
                );

                setError(
                    null
                );

                const response =
                    await fetch(
                        API_URL,
                        {
                            headers:
                                getRequestHeaders(),
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
                        "Failed to fetch bookings"
                    );
                }

                const serverBookings =
                    Array.isArray(
                        result.data
                    )
                        ? result.data
                            .map(
                                normalizeBooking
                            )
                        : [];

                setBookings(
                    serverBookings
                );

            } catch (
            error
            ) {

                console.error(
                    "Fetch bookings error:",
                    error
                );

                setError(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to fetch bookings"
                );

            } finally {

                setLoading(
                    false
                );
            }
        };

    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(
        () => {

            void refreshBookings();

        },
        []
    );

    // ==================================================
    // ADD BOOKING
    // ==================================================

    const addBooking =
        async (
            booking:
                Booking
        ) => {

            try {

                setError(
                    null
                );

                const response =
                    await fetch(
                        API_URL,
                        {
                            method:
                                "POST",

                            headers:
                                getRequestHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify(
                                    createApiPayload(
                                        booking
                                    )
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
                        "Failed to create booking"
                    );
                }

                const newBooking =
                    normalizeBooking(
                        result.data
                    );

                setBookings(
                    (
                        previous
                    ) => [
                            ...previous,
                            newBooking,
                        ]
                );

            } catch (
            error
            ) {

                console.error(
                    "Create booking error:",
                    error
                );

                setError(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to create booking"
                );

                throw error;
            }
        };

    // ==================================================
    // UPDATE BOOKING
    // ==================================================

    const updateBooking =
        async (
            updatedBooking:
                Booking
        ) => {

            try {

                setError(
                    null
                );

                const response =
                    await fetch(
                        `${API_URL}/${updatedBooking.id}`,
                        {
                            method:
                                "PUT",

                            headers:
                                getRequestHeaders(
                                    true
                                ),

                            body:
                                JSON.stringify(
                                    createApiPayload(
                                        updatedBooking
                                    )
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
                        "Failed to update booking"
                    );
                }

                const savedBooking =
                    normalizeBooking(
                        result.data
                    );

                setBookings(
                    (
                        previous
                    ) =>
                        previous.map(
                            (
                                booking
                            ) =>
                                booking.id ===
                                    savedBooking.id
                                    ? savedBooking
                                    : booking
                        )
                );

            } catch (
            error
            ) {

                console.error(
                    "Update booking error:",
                    error
                );

                setError(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to update booking"
                );

                throw error;
            }
        };

    // ==================================================
    // DELETE / ARCHIVE BOOKING
    // ==================================================

    const deleteBooking =
        async (
            id:
                string
        ) => {

            try {

                setError(
                    null
                );

                const response =
                    await fetch(
                        `${API_URL}/${id}`,
                        {
                            method:
                                "DELETE",

                            headers:
                                getRequestHeaders(),
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
                        "Failed to archive booking"
                    );
                }

                // Temporary local removal from Booking page.
                // Backend record remains preserved in database.
                await refreshBookings();

            } catch (
            error
            ) {

                console.error(
                    "Archive booking error:",
                    error
                );

                setError(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to archive booking"
                );

                throw error;
            }
        };
    // ==================================================
    // PERMANENT DELETE BOOKING
    // Reports page only
    // ==================================================

    const permanentlyDeleteBooking =
        async (
            id:
                string
        ) => {

            try {

                setError(
                    null
                );

                const response =
                    await fetch(
                        `${API_URL}/${id}/permanent`,
                        {
                            method:
                                "DELETE",

                            headers:
                                getRequestHeaders(),
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
                        "Failed to permanently delete booking"
                    );
                }

                await refreshBookings();

            } catch (
            error
            ) {

                console.error(
                    "Permanent delete booking error:",
                    error
                );

                setError(
                    error instanceof
                        Error
                        ? error.message
                        : "Failed to permanently delete booking"
                );

                throw error;
            }
        };
    // ==================================================
    // Provider
    // ==================================================

    return (

        <BookingContext.Provider
            value={{
                bookings,
                loading,
                error,

                addBooking,
                updateBooking,
                deleteBooking,
                permanentlyDeleteBooking,
                refreshBookings,
            }}
        >

            {
                children
            }

        </BookingContext.Provider>
    );
}

// ======================================================
// Hook
// ======================================================

export function useBooking() {

    const context =
        useContext(
            BookingContext
        );

    if (
        !context
    ) {

        throw new Error(
            "useBooking must be used inside BookingProvider"
        );
    }

    return context;
}