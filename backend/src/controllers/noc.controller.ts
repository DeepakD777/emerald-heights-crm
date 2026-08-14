import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

import {
  NocStatus,
} from "../generated/prisma/enums";

// ======================================================
// Helpers
// ======================================================

const normalizeNocStatus = (
  value: unknown
): NocStatus | null => {
  const status = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (status) {
    case "PENDING":
      return NocStatus.PENDING;

    case "IN_PROCESS":
    case "IN PROCESS":
      return NocStatus.IN_PROCESS;

    case "APPROVED":
      return NocStatus.APPROVED;

    case "REJECTED":
      return NocStatus.REJECTED;

    case "ISSUED":
    case "GIVEN":
    case "COMPLETED":
      return NocStatus.ISSUED;

    default:
      return null;
  }
};

// Notification message deliberately contains NOC code,
// so we can safely find/delete only this NOC's notification.
const buildNocNotificationMessage = (
  nocCode: string,
  bookingCode: string,
  status: NocStatus
) => {
  switch (status) {
    case NocStatus.IN_PROCESS:
      return `NOC ${nocCode} is in process for booking ${bookingCode}`;

    case NocStatus.APPROVED:
      return `NOC ${nocCode} is approved and pending issue for booking ${bookingCode}`;

    case NocStatus.REJECTED:
      return `NOC ${nocCode} requires attention for booking ${bookingCode}`;

    case NocStatus.PENDING:
    default:
      return `NOC ${nocCode} is required for booking ${bookingCode}`;
  }
};

// Remove every active bell notification belonging to one NOC.
const removeNocNotifications = async (
  tx: any,
  nocCode: string
) => {
  await tx.notification.deleteMany({
    where: {
      message: {
        contains: `NOC ${nocCode}`,
      },
    },
  });
};

// Create fresh Admin bell notifications for one NOC.
const createNocNotifications = async (
  tx: any,
  nocCode: string,
  bookingCode: string,
  status: NocStatus
) => {
  const admins = await tx.admin.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (admins.length === 0) {
    return;
  }

  const message =
    buildNocNotificationMessage(
      nocCode,
      bookingCode,
      status
    );

  await tx.notification.createMany({
    data: admins.map((admin: { id: string }) => ({
      title: "NOC Required",
      message,
      adminId: admin.id,
      isRead: false,
    })),
  });
};

// ======================================================
// GET /api/nocs
// ======================================================

export const getNocs = async (
  _req: Request,
  res: Response
) => {
  try {
    const nocs = await prisma.noc.findMany({
      include: {
        booking: {
          include: {
            customer: true,
            property: true,
            employee: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      success: true,
      data: nocs,
    });
  } catch (error) {
    console.error(
      "Get NOCs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch NOCs",
    });
  }
};

// ======================================================
// GET /api/nocs/:id
// ======================================================

export const getNocById = async (
  req: Request,
  res: Response
) => {
  try {
    const nocId = String(
      req.params.id
    );

    const noc = await prisma.noc.findUnique({
      where: {
        id: nocId,
      },

      include: {
        booking: {
          include: {
            customer: true,
            property: true,
            employee: true,
          },
        },
      },
    });

    if (!noc) {
      return res.status(404).json({
        success: false,
        message: "NOC not found",
      });
    }

    return res.json({
      success: true,
      data: noc,
    });
  } catch (error) {
    console.error(
      "Get NOC error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch NOC",
    });
  }
};

// ======================================================
// GET /api/nocs/booking/:bookingId
// Useful for Booking Details modal
// ======================================================

export const getNocByBookingId = async (
  req: Request,
  res: Response
) => {
  try {
    const bookingId = String(
      req.params.bookingId
    );

    const noc = await prisma.noc.findFirst({
      where: {
        bookingId,
      },

      include: {
        booking: {
          include: {
            customer: true,
            property: true,
            employee: true,
          },
        },
      },
    });

    // No NOC yet means frontend should show:
    // "Not Required" + "Set Required"
    if (!noc) {
      return res.json({
        success: true,
        data: null,
      });
    }

    return res.json({
      success: true,
      data: noc,
    });
  } catch (error) {
    console.error(
      "Get booking NOC error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch booking NOC",
    });
  }
};

// ======================================================
// POST /api/nocs
//
// This is what frontend calls when:
// NOC = Not Required
// user clicks "Set Required"
// ======================================================

export const createNoc = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      bookingId,
      remarks,
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required",
      });
    }

    const booking =
      await prisma.booking.findUnique({
        where: {
          id: String(bookingId),
        },

        include: {
          customer: true,
          property: true,
          employee: true,
        },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const existingNoc =
      await prisma.noc.findFirst({
        where: {
          bookingId: booking.id,
        },
      });

    // If NOC already exists, frontend should update it
    // instead of creating duplicate NOC.
    if (existingNoc) {
      return res.status(409).json({
        success: false,
        message:
          "NOC already exists for this booking",
        data: existingNoc,
      });
    }

    const nocCode =
      `NOC-${Date.now()}`;

    const noc = await prisma.$transaction(
      async (tx) => {
        const created =
          await tx.noc.create({
            data: {
              nocCode,
              bookingId: booking.id,

              // Set Required button means:
              isRequired: true,
              status: NocStatus.PENDING,

              remarks:
                remarks !== undefined
                  ? String(remarks).trim()
                  : null,
            },
          });

        // Set Required => Bell notification appears.
        await createNocNotifications(
          tx,
          created.nocCode,
          booking.bookingCode,
          NocStatus.PENDING
        );

        return created;
      }
    );

    return res.status(201).json({
      success: true,
      message:
        "NOC marked as required successfully",
      data: noc,
    });
  } catch (error) {
    console.error(
      "Create NOC error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create NOC",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

// ======================================================
// PUT /api/nocs/:id
//
// Supports:
//
// isRequired: true
// isRequired: false
//
// status:
// PENDING
// IN_PROCESS
// APPROVED
// REJECTED
// ISSUED
//
// ISSUED = NOC Given
// ======================================================

export const updateNoc = async (
  req: Request,
  res: Response
) => {
  try {
    const nocId = String(
      req.params.id
    );

    const existingNoc =
      await prisma.noc.findUnique({
        where: {
          id: nocId,
        },

        include: {
          booking: true,
        },
      });

    if (!existingNoc) {
      return res.status(404).json({
        success: false,
        message: "NOC not found",
      });
    }

    const {
      isRequired,
      status,
      remarks,
      fileName,
      fileUrl,
    } = req.body;

    let normalizedStatus:
      | NocStatus
      | undefined;

    if (status !== undefined) {
      const parsed =
        normalizeNocStatus(status);

      if (!parsed) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid NOC status",
        });
      }

      normalizedStatus = parsed;
    }

    let requiredValue:
      | boolean
      | undefined;

    if (isRequired !== undefined) {
      if (
        typeof isRequired !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isRequired must be true or false",
        });
      }

      requiredValue = isRequired;
    }

    const now = new Date();

    const updatedNoc =
      await prisma.$transaction(
        async (tx) => {
          // ------------------------------------------
          // CASE 1:
          // Set Not Required
          //
          // Notification must disappear.
          // ------------------------------------------

          if (requiredValue === false) {
            await removeNocNotifications(
              tx,
              existingNoc.nocCode
            );

            return tx.noc.update({
              where: {
                id: nocId,
              },

              data: {
                isRequired: false,

                // Reset workflow
                status:
                  NocStatus.PENDING,

                approvedAt: null,
                rejectedAt: null,
                issuedAt: null,

                remarks:
                  remarks !== undefined
                    ? remarks
                      ? String(
                          remarks
                        ).trim()
                      : null
                    : undefined,

                fileName:
                  fileName !== undefined
                    ? fileName
                      ? String(
                          fileName
                        ).trim()
                      : null
                    : undefined,

                fileUrl:
                  fileUrl !== undefined
                    ? fileUrl
                      ? String(
                          fileUrl
                        ).trim()
                      : null
                    : undefined,
              },
            });
          }

          // ------------------------------------------
          // Determine final required state.
          // ------------------------------------------

          const finalIsRequired =
            requiredValue !== undefined
              ? requiredValue
              : existingNoc.isRequired;

          // If someone changes workflow status,
          // NOC should automatically become required.
          const shouldBecomeRequired =
            normalizedStatus !== undefined
              ? true
              : finalIsRequired;

          const finalStatus =
            normalizedStatus ??
            existingNoc.status;

          const noc =
            await tx.noc.update({
              where: {
                id: nocId,
              },

              data: {
                isRequired:
                  shouldBecomeRequired,

                status:
                  normalizedStatus,

                remarks:
                  remarks !== undefined
                    ? remarks
                      ? String(
                          remarks
                        ).trim()
                      : null
                    : undefined,

                fileName:
                  fileName !== undefined
                    ? fileName
                      ? String(
                          fileName
                        ).trim()
                      : null
                    : undefined,

                fileUrl:
                  fileUrl !== undefined
                    ? fileUrl
                      ? String(
                          fileUrl
                        ).trim()
                      : null
                    : undefined,

                approvedAt:
                  normalizedStatus ===
                  NocStatus.APPROVED
                    ? now
                    : undefined,

                rejectedAt:
                  normalizedStatus ===
                  NocStatus.REJECTED
                    ? now
                    : undefined,

                issuedAt:
                  normalizedStatus ===
                  NocStatus.ISSUED
                    ? now
                    : undefined,
              },
            });

          // Always clear previous NOC bell item first.
          await removeNocNotifications(
            tx,
            existingNoc.nocCode
          );

          // ------------------------------------------
          // Bell logic
          //
          // Required + not issued
          // => notification should exist
          //
          // ISSUED / Given
          // => notification should disappear
          // ------------------------------------------

          if (
            noc.isRequired &&
            finalStatus !== NocStatus.ISSUED
          ) {
            await createNocNotifications(
              tx,
              noc.nocCode,
              existingNoc.booking.bookingCode,
              finalStatus
            );
          }

          return noc;
        }
      );

    return res.json({
      success: true,
      message:
        updatedNoc.isRequired
          ? updatedNoc.status ===
            NocStatus.ISSUED
            ? "NOC marked as given successfully"
            : "NOC updated successfully"
          : "NOC marked as not required successfully",

      data: updatedNoc,
    });
  } catch (error) {
    console.error(
      "Update NOC error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update NOC",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

// ======================================================
// DELETE /api/nocs/:id
// Admin only
// ======================================================

export const deleteNoc = async (
  req: Request,
  res: Response
) => {
  try {
    const nocId = String(
      req.params.id
    );

    const existingNoc =
      await prisma.noc.findUnique({
        where: {
          id: nocId,
        },
      });

    if (!existingNoc) {
      return res.status(404).json({
        success: false,
        message: "NOC not found",
      });
    }

    await prisma.$transaction(
      async (tx) => {
        // Remove corresponding bell item first.
        await removeNocNotifications(
          tx,
          existingNoc.nocCode
        );

        await tx.noc.delete({
          where: {
            id: nocId,
          },
        });
      }
    );

    return res.json({
      success: true,
      message:
        "NOC deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete NOC error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete NOC",
    });
  }
};