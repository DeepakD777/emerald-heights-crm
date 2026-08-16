import { apiRequest } from "./api";

export type Booking = {
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
    bookingCode: string;

    documents?: any;
};

type CreateBookingResponse = {
    success: true;
    message: string;
    data: Booking;
};

type BookingsResponse = {
    success: true;
    data: Booking[];
};

export async function createBooking(
    data: {
        propertyId: string;

        customerName: string;
        mobile: string;

        email?: string;
        address?: string;
        aadhar?: string;
        pan?: string;

        bookingAmount?: string | number;
        paymentMode?: string;
        bookingDate?: string;
        remarks?: string;

        status?: string;
        employeeId?: string;
    }
) {
    return apiRequest<CreateBookingResponse>(
        "/bookings",
        {
            method: "POST",
            body: JSON.stringify(data),
        }
    );
}

export async function getBookings() {
    return apiRequest<BookingsResponse>(
        "/bookings"
    );
}