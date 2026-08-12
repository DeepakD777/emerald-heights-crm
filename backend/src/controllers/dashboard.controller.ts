import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getDashboardSummary = async (
  _req: Request,
  res: Response
) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      totalCustomers,
      totalProperties,
      availableProperties,
      bookedProperties,
      soldProperties,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.employee.count(),

      prisma.employee.count({
        where: {
          status: "ACTIVE",
        },
      }),

      prisma.customer.count(),

      prisma.property.count(),

      prisma.property.count({
        where: {
          status: "AVAILABLE",
        },
      }),

      prisma.property.count({
        where: {
          status: "BOOKED",
        },
      }),

      prisma.property.count({
        where: {
          status: "SOLD",
        },
      }),

      prisma.booking.count(),

      prisma.booking.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.booking.count({
        where: {
          status: "CONFIRMED",
        },
      }),

      prisma.booking.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.booking.count({
        where: {
          status: "CANCELLED",
        },
      }),
    ]);

    const amountSummary = await prisma.booking.aggregate({
      _sum: {
        amount: true,
      },
    });

    res.json({
      success: true,
      data: {
        employees: {
          total: totalEmployees,
          active: activeEmployees,
        },

        customers: {
          total: totalCustomers,
        },

        properties: {
          total: totalProperties,
          available: availableProperties,
          booked: bookedProperties,
          sold: soldProperties,
        },

        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },

        revenue: {
          totalBookingAmount: amountSummary._sum.amount ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
};