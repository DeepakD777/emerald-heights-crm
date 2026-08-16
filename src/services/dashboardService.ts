import { apiRequest } from "./api";

export type DashboardSummary = {
    employees: {
        total: number;
        active: number;
    };

    customers: {
        total: number;
    };

    properties: {
        total: number;
        available: number;
        hold: number;
        booked: number;
        sold: number;

        residential: {
            total: number;
            available: number;
            hold: number;
            booked: number;
            sold: number;
        };

        commercial: {
            total: number;
            available: number;
            hold: number;
            booked: number;
            sold: number;
        };
    };

    bookings: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };

    revenue: {
        totalBookingAmount: number;
    };
};

type DashboardResponse = {
    success: true;
    data: DashboardSummary;
};

export async function getDashboardSummary() {
    return apiRequest<DashboardResponse>(
        "/dashboard/summary"
    );
}