import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { ReactNode } from "react";

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
    requisitionLetter: AgreementDocument;

    agreementToSell: AgreementDocument;

    tripartiteAgreement: {
        required: boolean;
        document: AgreementDocument;
    };
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

    bookingAmount: string;
    paymentMode: string;
    bookingDate: string;

    remarks: string;

    status: string;

    documents: BookingDocuments;

    bookingCode?: string;
}

// ======================================================
// Context Type
// ======================================================

interface BookingContextType {
    bookings: Booking[];

    loading: boolean;

    error: string | null;

    addBooking: (
        booking: Booking
    ) => Promise<void>;

    updateBooking: (
        booking: Booking
    ) => Promise<void>;

    deleteBooking: (
        id: string
    ) => Promise<void>;

    refreshBookings: () => Promise<void>;
}

// ======================================================
// API
// ======================================================

const API_URL =
    "http://localhost:5000/api/bookings";

// ======================================================
// Default Documents
// ======================================================

const createDefaultDocuments =
    (): BookingDocuments => ({
        requisitionLetter: {
            status: "pending",
        },

        agreementToSell: {
            status: "pending",
        },

        tripartiteAgreement: {
            required: false,

            document: {
                status: "pending",
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
            booking?.property?.unitNumber ??
            "",

        tower:
            booking?.tower ??
            booking?.property?.block ??
            "",

        floor:
            Number(
                booking?.floor ??
                booking?.property?.floor ??
                0
            ),

        customerName:
            booking?.customerName ??
            booking?.customer?.name ??
            "",

        mobile:
            booking?.mobile ??
            booking?.customer?.phone ??
            "",

        email:
            booking?.email ??
            booking?.customer?.email ??
            "",

        address:
            booking?.address ??
            booking?.customer?.address ??
            "",

        aadhar:
            booking?.aadhar ??
            booking?.customer?.aadhar ??
            "",

        pan:
            booking?.pan ??
            booking?.customer?.pan ??
            "",

        bookingAmount:
            booking?.bookingAmount ??
                booking?.amount != null
                ? String(
                    booking?.bookingAmount ??
                    booking?.amount
                )
                : "",

        paymentMode:
            booking?.paymentMode ??
            "Cash",

        bookingDate:
            booking?.bookingDate
                ? String(
                    booking.bookingDate
                ).split("T")[0]
                : "",

        remarks:
            booking?.remarks ??
            "",

        status:
            booking?.status ??
            "pending",

        bookingCode:
            booking?.bookingCode ??
            undefined,

        documents: {
            requisitionLetter:
                normalizeDocument(
                    documents.requisitionLetter
                ),

            agreementToSell:
                normalizeDocument(
                    documents.agreementToSell
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
// Convert frontend booking → API payload
// ======================================================

const createApiPayload = (
    booking: Booking
) => {
    return {
        id: booking.id,

        bookingCode:
            booking.bookingCode,

        flatNumber:
            booking.flatNumber,

        tower:
            booking.tower,

        floor:
            booking.floor,

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

        bookingAmount:
            booking.bookingAmount,

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
        BookingContextType | undefined
    >(undefined);

// ======================================================
// Provider
// ======================================================

export function BookingProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [bookings, setBookings] =
        useState<Booking[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    // ==================================================
    // GET BOOKINGS
    // ==================================================

    const refreshBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            const response =
                await fetch(API_URL);

            const result =
                await response.json();

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
                Array.isArray(result.data)
                    ? result.data.map(
                        normalizeBooking
                    )
                    : [];

            setBookings(
                serverBookings
            );
        } catch (error) {
            console.error(
                "Fetch bookings error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to fetch bookings"
            );
        } finally {
            setLoading(false);
        }
    };

    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {
        refreshBookings();
    }, []);

    // ==================================================
    // ADD BOOKING
    // ==================================================

    const addBooking = async (
        booking: Booking
    ) => {
        try {
            setError(null);

            const response =
                await fetch(API_URL, {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        createApiPayload(
                            booking
                        )
                    ),
                });

            const result =
                await response.json();

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
                (previous) => [
                    ...previous,
                    newBooking,
                ]
            );
        } catch (error) {
            console.error(
                "Create booking error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to create booking"
            );

            throw error;
        }
    };

    // ==================================================
    // UPDATE BOOKING
    // ==================================================

    const updateBooking = async (
        updatedBooking: Booking
    ) => {
        try {
            setError(null);

            const response =
                await fetch(
                    `${API_URL}/${updatedBooking.id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify(
                            createApiPayload(
                                updatedBooking
                            )
                        ),
                    }
                );

            const result =
                await response.json();

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
                (previous) =>
                    previous.map(
                        (booking) =>
                            booking.id ===
                                savedBooking.id
                                ? savedBooking
                                : booking
                    )
            );
        } catch (error) {
            console.error(
                "Update booking error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to update booking"
            );

            throw error;
        }
    };

    // ==================================================
    // DELETE BOOKING
    // ==================================================

    const deleteBooking = async (
        id: string
    ) => {
        try {
            setError(null);

            const response =
                await fetch(
                    `${API_URL}/${id}`,
                    {
                        method: "DELETE",
                    }
                );

            const result =
                await response.json();

            if (
                !response.ok ||
                !result.success
            ) {
                throw new Error(
                    result.message ||
                    "Failed to delete booking"
                );
            }

            setBookings(
                (previous) =>
                    previous.filter(
                        (booking) =>
                            booking.id !== id
                    )
            );
        } catch (error) {
            console.error(
                "Delete booking error:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete booking"
            );

            throw error;
        }
    };

    // ==================================================
    // PROVIDER
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

                refreshBookings,
            }}
        >
            {children}
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

    if (!context) {
        throw new Error(
            "useBooking must be used inside BookingProvider"
        );
    }

    return context;
}