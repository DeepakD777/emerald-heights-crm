import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import {
  BookingStatus,
  DocumentType,
  DocumentStatus,
} from "../generated/prisma/enums";

// ======================================================
// Helpers
// ======================================================

const normalizeBookingStatus = (
  status: unknown
): BookingStatus => {
  const value = String(status ?? "")
    .trim()
    .toUpperCase();

  switch (value) {
    case "BOOKED":
    case "CONFIRMED":
      return BookingStatus.CONFIRMED;

    case "CANCELLED":
    case "CANCELED":
      return BookingStatus.CANCELLED;

    case "COMPLETED":
      return BookingStatus.COMPLETED;

    case "PENDING":
    default:
      return BookingStatus.PENDING;
  }
};

// ======================================================
// Convert database booking → frontend booking
// ======================================================

const formatBooking = (booking: any) => {
  let extraData: {
    paymentMode?: string;
    remarks?: string;
  } = {};

  try {
    if (booking.notes) {
      extraData = JSON.parse(booking.notes);
    }
  } catch {
    extraData = {
      remarks: booking.notes ?? "",
    };
  }

  const documents = booking.documents ?? [];

  const findDocument = (
    type: DocumentType
  ) => {
    const document = documents.find(
      (item: any) => item.type === type
    );

    return {
      status:
        document?.status?.toLowerCase() ??
        "pending",

      fileName: document?.fileName ?? undefined,
      fileUrl: document?.fileUrl ?? undefined,

      generatedAt:
        document?.generatedAt?.toISOString?.() ??
        undefined,

      uploadedAt:
        document?.uploadedAt?.toISOString?.() ??
        undefined,

      givenAt:
        document?.givenAt?.toISOString?.() ??
        undefined,

      completedAt:
        document?.completedAt?.toISOString?.() ??
        undefined,
    };
  };

  const tripartite = findDocument(
    DocumentType.TRIPARTITE_AGREEMENT
  );

  return {
    id: booking.id,

    flatNumber:
      booking.property?.unitNumber ?? "",

    tower:
      booking.property?.block ?? "",

    floor: Number(
      booking.property?.floor ?? 0
    ),

    customerName:
      booking.customer?.name ?? "",

    mobile:
      booking.customer?.phone ?? "",

    email:
      booking.customer?.email ?? "",

    address:
      booking.customer?.address ?? "",

    aadhar:
      booking.customer?.aadhar ?? "",

    pan:
      booking.customer?.pan ?? "",

    bookingAmount:
      booking.amount != null
        ? String(booking.amount)
        : "",

    paymentMode:
      extraData.paymentMode ?? "Cash",

    bookingDate:
      booking.bookingDate
        ? new Date(
          booking.bookingDate
        )
          .toISOString()
          .split("T")[0]
        : "",

    remarks:
      extraData.remarks ?? "",

    status:
      booking.status ===
        BookingStatus.CONFIRMED
        ? "booked"
        : booking.status.toLowerCase(),

    bookingCode:
      booking.bookingCode,

    documents: {
      requisitionLetter:
        findDocument(
          DocumentType.REQUISITION_LETTER
        ),

      agreementToSell:
        findDocument(
          DocumentType.AGREEMENT_TO_SELL
        ),

      tripartiteAgreement: {
        required:
          Boolean(
            documents.find(
              (item: any) =>
                item.type ===
                DocumentType.TRIPARTITE_AGREEMENT
            )
          ),

        document: tripartite,
      },
    },
  };
};

// ======================================================
// GET /api/bookings
// ======================================================

export const getBookings = async (
  _req: Request,
  res: Response
) => {
  try {
    const bookings =
      await prisma.booking.findMany({
        include: {
          customer: true,
          property: true,
          employee: true,
          documents: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    res.json({
      success: true,
      data: bookings.map(formatBooking),
    });
  } catch (error) {
    console.error(
      "Get bookings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ======================================================
// GET /api/bookings/:id
// ======================================================

export const getBookingById = async (
  req: Request,
  res: Response
) => {
  try {
    const booking =
      await prisma.booking.findUnique({
        where: {
          id: String(req.params.id),
        },

        include: {
          customer: true,
          property: true,
          employee: true,
          documents: true,
        },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.json({
      success: true,
      data: formatBooking(booking),
    });
  } catch (error) {
    console.error(
      "Get booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};

// ======================================================
// POST /api/bookings
// ======================================================

export const createBooking = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      bookingCode,
      customerId,
      propertyId,
      employeeId,

      // Frontend fields
      flatNumber,
      tower,
      floor,

      customerName,
      mobile,
      email,
      address,
      aadhar,
      pan,

      bookingAmount,
      paymentMode,
      bookingDate,
      remarks,

      status,
    } = req.body;

    // ------------------------------------------------
    // Validate customer
    // ------------------------------------------------

    if (
      !customerName ||
      !mobile
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name and mobile are required",
      });
    }

    // ------------------------------------------------
    // Find/Create Customer
    // ------------------------------------------------

    let customer;

    if (customerId) {
      customer =
        await prisma.customer.findUnique({
          where: {
            id: String(customerId),
          },
        });
    }

    if (!customer) {
      customer =
        await prisma.customer.findFirst({
          where: {
            phone: String(mobile).trim(),
          },
        });
    }

    if (customer) {
      customer =
        await prisma.customer.update({
          where: {
            id: customer.id,
          },

          data: {
            name:
              String(
                customerName
              ).trim(),

            email:
              email
                ? String(
                  email
                ).trim()
                : null,

            phone:
              String(
                mobile
              ).trim(),

            address:
              address
                ? String(
                  address
                ).trim()
                : null,

            aadhar:
              aadhar
                ? String(
                  aadhar
                ).trim()
                : null,

            pan:
              pan
                ? String(
                  pan
                ).trim()
                : null,
          },
        });
    } else {
      customer =
        await prisma.customer.create({
          data: {
            name:
              String(
                customerName
              ).trim(),

            email:
              email
                ? String(
                  email
                ).trim()
                : null,

            phone:
              String(
                mobile
              ).trim(),

            address:
              address
                ? String(
                  address
                ).trim()
                : null,

            aadhar:
              aadhar
                ? String(
                  aadhar
                ).trim()
                : null,

            pan:
              pan
                ? String(
                  pan
                ).trim()
                : null,
          },
        });
    }

    // ------------------------------------------------
    // Find Property
    // ------------------------------------------------

    let property;

    if (propertyId) {
      property =
        await prisma.property.findUnique({
          where: {
            id: String(propertyId),
          },
        });
    }

    if (!property) {
      property =
        await prisma.property.findFirst({
          where: {
            unitNumber:
              String(
                flatNumber ?? ""
              ),

            block:
              String(
                tower ?? ""
              ),

            floor:
              String(
                floor ?? ""
              ),
          },
        });
    }

    if (!property) {
      return res.status(404).json({
        success: false,
        message:
          "Property/flat not found in inventory",
      });
    }

    // ------------------------------------------------
    // Employee
    // ------------------------------------------------

    if (employeeId) {
      const employee =
        await prisma.employee.findUnique({
          where: {
            id: String(employeeId),
          },
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found",
        });
      }
    }

    // ------------------------------------------------
    // Booking Code
    // ------------------------------------------------

    const finalBookingCode =
      bookingCode ||
      `BK-${Date.now()}`;

    // ------------------------------------------------
    // Check duplicate booking code
    // ------------------------------------------------

    const existingBooking =
      await prisma.booking.findUnique({
        where: {
          bookingCode:
            finalBookingCode,
        },
      });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "Booking with this code already exists",
      });
    }

    // ------------------------------------------------
    // Notes
    // ------------------------------------------------

    const notes = JSON.stringify({
      paymentMode:
        paymentMode ?? "Cash",

      remarks:
        remarks ?? "",
    });

    // ------------------------------------------------
    // Create Booking + Documents
    // ------------------------------------------------

    const booking =
      await prisma.$transaction(
        async (tx) => {
          const newBooking =
            await tx.booking.create({
              data: {
                bookingCode:
                  finalBookingCode,

                customerId:
                  customer.id,

                propertyId:
                  property.id,

                employeeId:
                  employeeId
                    ? String(
                      employeeId
                    )
                    : undefined,

                status:
                  normalizeBookingStatus(
                    status
                  ),

                bookingDate:
                  bookingDate
                    ? new Date(
                      bookingDate
                    )
                    : undefined,

                amount:
                  bookingAmount
                    ? Number(
                      bookingAmount
                    )
                    : undefined,

                notes,
              },
            });

          await tx.bookingDocument.createMany(
            {
              data: [
                {
                  bookingId:
                    newBooking.id,

                  type:
                    DocumentType.REQUISITION_LETTER,

                  status:
                    DocumentStatus.PENDING,
                },

                {
                  bookingId:
                    newBooking.id,

                  type:
                    DocumentType.AGREEMENT_TO_SELL,

                  status:
                    DocumentStatus.PENDING,
                },

                {
                  bookingId:
                    newBooking.id,

                  type:
                    DocumentType.TRIPARTITE_AGREEMENT,

                  status:
                    DocumentStatus.PENDING,
                },
              ],
            }
          );

          return newBooking;
        }
      );

    // ------------------------------------------------
    // Return complete booking
    // ------------------------------------------------

    const completeBooking =
      await prisma.booking.findUnique({
        where: {
          id: booking.id,
        },

        include: {
          customer: true,
          property: true,
          employee: true,
          documents: true,
        },
      });

    res.status(201).json({
      success: true,
      message:
        "Booking created successfully",

      data:
        formatBooking(
          completeBooking
        ),
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create booking",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

// ======================================================
// PUT /api/bookings/:id
// ======================================================

export const updateBooking = async (
  req: Request,
  res: Response
) => {
  try {
    const bookingId =
      String(req.params.id);

    const existingBooking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },

        include: {
          customer: true,
          property: true,
        },
      });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    const {
      customerName,
      mobile,
      email,
      address,
      aadhar,
      pan,

      bookingAmount,
      paymentMode,
      bookingDate,
      remarks,

      employeeId,
      status,
    } = req.body;

    // ------------------------------------------------
    // Update Customer
    // ------------------------------------------------

    if (
      customerName !== undefined ||
      mobile !== undefined ||
      email !== undefined ||
      address !== undefined ||
      aadhar !== undefined ||
      pan !== undefined
    ) {
      await prisma.customer.update({
        where: {
          id:
            existingBooking.customerId,
        },

        data: {
          name:
            customerName !==
              undefined
              ? String(
                customerName
              ).trim()
              : undefined,

          phone:
            mobile !== undefined
              ? String(
                mobile
              ).trim()
              : undefined,

          email:
            email !== undefined
              ? email
                ? String(
                  email
                ).trim()
                : null
              : undefined,

          address:
            address !== undefined
              ? address
                ? String(
                  address
                ).trim()
                : null
              : undefined,

          aadhar:
            aadhar !== undefined
              ? aadhar
                ? String(
                  aadhar
                ).trim()
                : null
              : undefined,

          pan:
            pan !== undefined
              ? pan
                ? String(
                  pan
                ).trim()
                : null
              : undefined,
        },
      });
    }

    // ------------------------------------------------
    // Update employee if supplied
    // ------------------------------------------------

    if (employeeId) {
      const employee =
        await prisma.employee.findUnique({
          where: {
            id: String(
              employeeId
            ),
          },
        });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message:
            "Employee not found",
        });
      }
    }

    // ------------------------------------------------
    // Update notes
    // ------------------------------------------------

    let currentExtraData: {
      paymentMode?: string;
      remarks?: string;
    } = {};

    try {
      if (existingBooking.notes) {
        currentExtraData =
          JSON.parse(
            existingBooking.notes
          );
      }
    } catch {
      currentExtraData = {
        remarks:
          existingBooking.notes ??
          "",
      };
    }

    const updatedNotes =
      JSON.stringify({
        paymentMode:
          paymentMode ??
          currentExtraData.paymentMode ??
          "Cash",

        remarks:
          remarks ??
          currentExtraData.remarks ??
          "",
      });

    // ------------------------------------------------
    // Update booking
    // ------------------------------------------------

    const booking =
      await prisma.booking.update({
        where: {
          id: bookingId,
        },

        data: {
          employeeId:
            employeeId !==
              undefined
              ? employeeId
                ? String(
                  employeeId
                )
                : null
              : undefined,

          status:
            status !== undefined
              ? normalizeBookingStatus(
                status
              )
              : undefined,

          bookingDate:
            bookingDate
              ? new Date(
                bookingDate
              )
              : undefined,

          amount:
            bookingAmount !==
              undefined
              ? bookingAmount
                ? Number(
                  bookingAmount
                )
                : null
              : undefined,

          notes:
            updatedNotes,
        },
      });

    // ------------------------------------------------
    // Return updated booking
    // ------------------------------------------------

    const completeBooking =
      await prisma.booking.findUnique({
        where: {
          id: booking.id,
        },

        include: {
          customer: true,
          property: true,
          employee: true,
          documents: true,
        },
      });

    res.json({
      success: true,
      message:
        "Booking updated successfully",

      data:
        formatBooking(
          completeBooking
        ),
    });
  } catch (error) {
    console.error(
      "Update booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update booking",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

// ======================================================
// DELETE /api/bookings/:id
// ======================================================

export const deleteBooking = async (
  req: Request,
  res: Response
) => {
  try {
    const bookingId =
      String(req.params.id);

    const existingBooking =
      await prisma.booking.findUnique({
        where: {
          id: bookingId,
        },
      });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    res.json({
      success: true,
      message:
        "Booking deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete booking",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};