import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { ReactNode } from "react";

// ======================================================
// Agreement Document
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

    // ==================================================
    // Documents
    // ==================================================

    documents: BookingDocuments;
}

// ======================================================
// Booking Context Type
// ======================================================

interface BookingContextType {

    bookings: Booking[];

    addBooking: (
        booking: Booking
    ) => void;

    updateBooking: (
        booking: Booking
    ) => void;

    deleteBooking: (
        id: string
    ) => void;
}

// ======================================================
// Default Documents
// ======================================================

const createDefaultDocuments =
    (): BookingDocuments => ({

        // ----------------------------------------------
        // Agreement to Sell
        // ----------------------------------------------

        agreementToSell: {

            status: "pending",

        },

        // ----------------------------------------------
        // Tripartite Agreement
        // ----------------------------------------------

        tripartiteAgreement: {

            required: false,

            document: {

                status: "pending",

            },

        },

    });

// ======================================================
// Create Context
// ======================================================

const BookingContext =
    createContext<
        BookingContextType | undefined
    >(undefined);

// ======================================================
// Booking Provider
// ======================================================

export function BookingProvider({
    children,
}: {
    children: ReactNode;
}) {

    // ==================================================
    // Bookings
    // ==================================================

    const [bookings, setBookings] =
        useState<Booking[]>(() => {

            const savedBookings =
                localStorage.getItem(
                    "bookings"
                );

            if (!savedBookings) {
                return [];
            }

            try {

                const parsedBookings =
                    JSON.parse(
                        savedBookings
                    );

                // --------------------------------------
                // Existing bookings migration
                // --------------------------------------

                return parsedBookings.map(
                    (booking: any) => ({

                        ...booking,

                        documents:
                            booking.documents ??
                            createDefaultDocuments(),

                    })
                );

            } catch (error) {

                console.error(
                    "Failed to load bookings:",
                    error
                );

                return [];

            }

        });

    // ==================================================
    // Add Booking
    // ==================================================

    const addBooking = (
        booking: Booking
    ) => {

        const bookingWithDocuments: Booking = {

            ...booking,

            documents:
                booking.documents ??
                createDefaultDocuments(),

        };

        setBookings(
            (prev) => [
                ...prev,
                bookingWithDocuments,
            ]
        );

    };

    // ==================================================
    // Update Booking
    // ==================================================

    const updateBooking = (
        updatedBooking: Booking
    ) => {

        setBookings(
            (prev) =>
                prev.map(
                    (booking) =>
                        booking.id ===
                        updatedBooking.id
                            ? {
                                ...updatedBooking,

                                documents:
                                    updatedBooking
                                        .documents ??
                                    booking.documents ??
                                    createDefaultDocuments(),
                            }
                            : booking
                )
        );

    };

    // ==================================================
    // Delete Booking
    // ==================================================

    const deleteBooking = (
        id: string
    ) => {

        setBookings(
            (prev) =>
                prev.filter(
                    (booking) =>
                        booking.id !== id
                )
        );

    };

    // ==================================================
    // Save to Local Storage
    // ==================================================

    useEffect(() => {

        localStorage.setItem(
            "bookings",
            JSON.stringify(bookings)
        );

    }, [bookings]);

    // ==================================================
    // Provider
    // ==================================================

    return (

        <BookingContext.Provider
            value={{
                bookings,
                addBooking,
                updateBooking,
                deleteBooking,
            }}
        >

            {children}

        </BookingContext.Provider>

    );

}

// ======================================================
// useBooking Hook
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