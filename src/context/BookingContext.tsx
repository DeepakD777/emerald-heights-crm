import {
    createContext,
    useContext,
    useState,
} from "react";

import type { ReactNode } from "react";

interface Booking {
    flatNumber: string;
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
}

interface BookingContextType {
    bookings: Booking[];
    addBooking: (booking: Booking) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [bookings, setBookings] = useState<Booking[]>([]);

    const addBooking = (booking: Booking) => {
        setBookings((prev) => [...prev, booking]);
    };

    return (
        <BookingContext.Provider
            value={{
                bookings,
                addBooking,
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