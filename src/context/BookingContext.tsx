import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import type { ReactNode } from "react";

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
}

interface BookingContextType {
    bookings: Booking[];
    addBooking: (booking: Booking) => void;
    updateBooking: (booking: Booking) => void;
    deleteBooking: (id: string) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [bookings, setBookings] = useState<Booking[]>(() => {
        const savedBookings = localStorage.getItem("bookings");

        return savedBookings
            ? JSON.parse(savedBookings)
            : [];
    });

    const addBooking = (booking: Booking) => {
        setBookings((prev) => [...prev, booking]);
    };

    const updateBooking = (updatedBooking: Booking) => {

        setBookings((prev) =>
            prev.map((booking) =>
                booking.id === updatedBooking.id
                    ? updatedBooking
                    : booking
            )
        );

    };
    const deleteBooking = (id: string) => {

        setBookings((prev) =>
            prev.filter((booking) => booking.id !== id)
        );

    };

    useEffect(() => {
        localStorage.setItem(
            "bookings",
            JSON.stringify(bookings)
        );
    }, [bookings]);

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

export function useBooking() {

    const context = useContext(BookingContext);

    if (!context) {
        throw new Error(
            "useBooking must be used inside BookingProvider"
        );
    }

    return context;
}