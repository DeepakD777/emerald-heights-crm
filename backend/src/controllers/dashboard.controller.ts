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
      holdProperties,
      bookedProperties,
      soldProperties,

      totalResidential,
      availableResidential,
      holdResidential,
      bookedResidential,
      soldResidential,

      totalCommercial,
      availableCommercial,
      holdCommercial,
      bookedCommercial,
      soldCommercial,

      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      // Employees
      prisma.employee.count(),

      prisma.employee.count({
        where: {
          status: "ACTIVE",
        },
      }),

      // Customers
      prisma.customer.count(),

      // All Properties
      prisma.property.count(),

      prisma.property.count({
        where: {
          status: "AVAILABLE",
        },
      }),

      prisma.property.count({
        where: {
          status: "HOLD",
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

      // Residential
      prisma.property.count({
        where: {
          type: "RESIDENTIAL",
        },
      }),

      prisma.property.count({
        where: {
          type: "RESIDENTIAL",
          status: "AVAILABLE",
        },
      }),

      prisma.property.count({
        where: {
          type: "RESIDENTIAL",
          status: "HOLD",
        },
      }),

      prisma.property.count({
        where: {
          type: "RESIDENTIAL",
          status: "BOOKED",
        },
      }),

      prisma.property.count({
        where: {
          type: "RESIDENTIAL",
          status: "SOLD",
        },
      }),

      // Commercial
      prisma.property.count({
        where: {
          type: "COMMERCIAL",
        },
      }),

      prisma.property.count({
        where: {
          type: "COMMERCIAL",
          status: "AVAILABLE",
        },
      }),

      prisma.property.count({
        where: {
          type: "COMMERCIAL",
          status: "HOLD",
        },
      }),

      prisma.property.count({
        where: {
          type: "COMMERCIAL",
          status: "BOOKED",
        },
      }),

      prisma.property.count({
        where: {
          type: "COMMERCIAL",
          status: "SOLD",
        },
      }),

      // Bookings
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

    return res.json({
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
          hold: holdProperties,
          booked: bookedProperties,
          sold: soldProperties,

          residential: {
            total: totalResidential,
            available: availableResidential,
            hold: holdResidential,
            booked: bookedResidential,
            sold: soldResidential,
          },

          commercial: {
            total: totalCommercial,
            available: availableCommercial,
            hold: holdCommercial,
            booked: bookedCommercial,
            sold: soldCommercial,
          },
        },

        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },

        revenue: {
          totalBookingAmount:
            amountSummary._sum.amount ?? 0,
        },
      },
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch dashboard summary",
    });
  }
};