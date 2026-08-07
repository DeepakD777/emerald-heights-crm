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

  status: "Booked";
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

    const [bookings, setBookings] = useState<Booking[]>(() => {
  const savedBookings = localStorage.getItem("bookings");

  return savedBookings
    ? JSON.parse(savedBookings)
    : [];
});

    const addBooking = (booking: Booking) => {
        setBookings((prev) => [...prev, booking]);
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