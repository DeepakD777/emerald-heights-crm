import {
  Request,
  Response,
} from "express";

import {
  prisma,
} from "../lib/prisma";

// ======================================================
// Dashboard Summary
// ======================================================

export const getDashboardSummary = async (
  _req: Request,
  res: Response
) => {

  try {

    // ==================================================
    // Employees
    // ==================================================

    const totalEmployees =
      await prisma.employee.count();

    const activeEmployees =
      await prisma.employee.count({
        where: {
          status: "ACTIVE",
        },
      });

    // ==================================================
    // Customers
    // ==================================================

    const totalCustomers =
      await prisma.customer.count();

    // ==================================================
    // Properties
    //
    // One grouped query replaces 15 separate counts.
    // ==================================================

    const propertyGroups =
      await prisma.property.groupBy({
        by: [
          "type",
          "status",
        ],

        _count: {
          _all: true,
        },
      });

    // ==================================================
    // Property Helpers
    // ==================================================

    const getPropertyCount = (
      type?: string,
      status?: string
    ) => {

      return propertyGroups
        .filter(
          (group) => {

            const typeMatches =
              !type ||
              group.type === type;

            const statusMatches =
              !status ||
              group.status === status;

            return (
              typeMatches &&
              statusMatches
            );
          }
        )
        .reduce(
          (
            total,
            group
          ) =>
            total +
            group._count._all,
          0
        );
    };

    // ==================================================
    // All Properties
    // ==================================================

    const totalProperties =
      getPropertyCount();

    const availableProperties =
      getPropertyCount(
        undefined,
        "AVAILABLE"
      );

    const holdProperties =
      getPropertyCount(
        undefined,
        "HOLD"
      );

    const bookedProperties =
      getPropertyCount(
        undefined,
        "BOOKED"
      );

    const soldProperties =
      getPropertyCount(
        undefined,
        "SOLD"
      );

    // ==================================================
    // Residential
    // ==================================================

    const totalResidential =
      getPropertyCount(
        "RESIDENTIAL"
      );

    const availableResidential =
      getPropertyCount(
        "RESIDENTIAL",
        "AVAILABLE"
      );

    const holdResidential =
      getPropertyCount(
        "RESIDENTIAL",
        "HOLD"
      );

    const bookedResidential =
      getPropertyCount(
        "RESIDENTIAL",
        "BOOKED"
      );

    const soldResidential =
      getPropertyCount(
        "RESIDENTIAL",
        "SOLD"
      );

    // ==================================================
    // Commercial
    // ==================================================

    const totalCommercial =
      getPropertyCount(
        "COMMERCIAL"
      );

    const availableCommercial =
      getPropertyCount(
        "COMMERCIAL",
        "AVAILABLE"
      );

    const holdCommercial =
      getPropertyCount(
        "COMMERCIAL",
        "HOLD"
      );

    const bookedCommercial =
      getPropertyCount(
        "COMMERCIAL",
        "BOOKED"
      );

    const soldCommercial =
      getPropertyCount(
        "COMMERCIAL",
        "SOLD"
      );

    // ==================================================
    // Bookings
    //
    // One grouped query replaces booking count queries
    // and the separate amount aggregate query.
    // ==================================================

    const bookingGroups =
      await prisma.booking.groupBy({
        by: [
          "status",
        ],

        _count: {
          _all: true,
        },

        _sum: {
          amount: true,
        },
      });

    // ==================================================
    // Booking Helper
    // ==================================================

    const getBookingCount = (
      status?: string
    ) => {

      return bookingGroups
        .filter(
          (group) =>
            !status ||
            group.status === status
        )
        .reduce(
          (
            total,
            group
          ) =>
            total +
            group._count._all,
          0
        );
    };

    // ==================================================
    // Booking Counts
    // ==================================================

    const totalBookings =
      getBookingCount();

    const pendingBookings =
      getBookingCount(
        "PENDING"
      );

    const confirmedBookings =
      getBookingCount(
        "CONFIRMED"
      );

    const completedBookings =
      getBookingCount(
        "COMPLETED"
      );

    const cancelledBookings =
      getBookingCount(
        "CANCELLED"
      );

    // ==================================================
    // Revenue
    // ==================================================

    const totalBookingAmount =
      bookingGroups.reduce(
        (
          total,
          group
        ) => {

          return (
            total +
            Number(
              group._sum.amount ??
              0
            )
          );
        },
        0
      );

    // ==================================================
    // Response
    // ==================================================

    return res.json({
      success: true,

      data: {

        employees: {
          total:
            totalEmployees,

          active:
            activeEmployees,
        },

        customers: {
          total:
            totalCustomers,
        },

        properties: {

          total:
            totalProperties,

          available:
            availableProperties,

          hold:
            holdProperties,

          booked:
            bookedProperties,

          sold:
            soldProperties,

          residential: {

            total:
              totalResidential,

            available:
              availableResidential,

            hold:
              holdResidential,

            booked:
              bookedResidential,

            sold:
              soldResidential,
          },

          commercial: {

            total:
              totalCommercial,

            available:
              availableCommercial,

            hold:
              holdCommercial,

            booked:
              bookedCommercial,

            sold:
              soldCommercial,
          },
        },

        bookings: {

          total:
            totalBookings,

          pending:
            pendingBookings,

          confirmed:
            confirmedBookings,

          completed:
            completedBookings,

          cancelled:
            cancelledBookings,
        },

        revenue: {

          totalBookingAmount,
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