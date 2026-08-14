import { Request, Response } from "express";

import { prisma } from "../lib/prisma";

import {
  PropertyStatus,
  PropertyType,
} from "../generated/prisma/enums";

// ======================================================
// Helpers
// ======================================================

const normalizePropertyType = (
  value: unknown
): PropertyType => {
  const type = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (type) {
    case "RESIDENTIAL":
      return PropertyType.RESIDENTIAL;

    case "COMMERCIAL":
      return PropertyType.COMMERCIAL;

    default:
      throw new Error(
        `Invalid property type: ${value}`
      );
  }
};

const normalizePropertyStatus = (
  value: unknown
): PropertyStatus => {
  const status = String(value ?? "")
    .trim()
    .toUpperCase();

  switch (status) {
    case "AVAILABLE":
      return PropertyStatus.AVAILABLE;

    case "HOLD":
      return PropertyStatus.HOLD;

    case "BOOKED":
      return PropertyStatus.BOOKED;

    case "SOLD":
      return PropertyStatus.SOLD;

    default:
      throw new Error(
        `Invalid property status: ${value}`
      );
  }
};

const optionalText = (
  value: unknown
): string | null => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return null;
  }

  return String(value).trim();
};

// ======================================================
// GET /api/properties
// ======================================================

export const getProperties = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      type,
      status,
      phase,
      block,
      tower,
      floor,
      series,
    } = req.query;

    const properties =
      await prisma.property.findMany({
        where: {
          type:
            type !== undefined
              ? normalizePropertyType(type)
              : undefined,

          status:
            status !== undefined
              ? normalizePropertyStatus(status)
              : undefined,

          phase:
            phase !== undefined
              ? String(phase).trim()
              : undefined,

          block:
            block !== undefined
              ? String(block).trim()
              : undefined,

          tower:
            tower !== undefined
              ? String(tower).trim()
              : undefined,

          floor:
            floor !== undefined
              ? String(floor).trim()
              : undefined,

          series:
            series !== undefined
              ? String(series).trim()
              : undefined,
        },

        orderBy: [
          {
            type: "asc",
          },
          {
            phase: "asc",
          },
          {
            tower: "asc",
          },
          {
            floor: "asc",
          },
          {
            unitNumber: "asc",
          },
        ],
      });

    return res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error(
      "Get properties error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch properties",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

// ======================================================
// GET /api/properties/:id
// ======================================================

export const getPropertyById = async (
  req: Request,
  res: Response
) => {
  try {
    const property =
      await prisma.property.findUnique({
        where: {
          id: String(req.params.id),
        },

        include: {
          bookings: {
            select: {
              id: true,
              bookingCode: true,
              status: true,
            },
          },
        },
      });

    if (!property) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found",
      });
    }

    return res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error(
      "Get property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch property",
    });
  }
};

// ======================================================
// POST /api/properties
// ======================================================

export const createProperty = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      propertyCode,
      name,
      type,
      status,

      phase,
      block,
      tower,
      floor,
      series,
      unitNumber,

      area,
      price,
      description,
    } = req.body;

    if (
      !propertyCode ||
      !name ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Property code, name and type are required",
      });
    }

    const normalizedPropertyCode =
      String(propertyCode)
        .trim()
        .toUpperCase();

    const existingProperty =
      await prisma.property.findUnique({
        where: {
          propertyCode:
            normalizedPropertyCode,
        },
      });

    if (existingProperty) {
      return res.status(409).json({
        success: false,
        message:
          "Property with this code already exists",
      });
    }

    const normalizedType =
      normalizePropertyType(type);

    const normalizedStatus =
      status !== undefined
        ? normalizePropertyStatus(status)
        : PropertyStatus.AVAILABLE;

    const property =
      await prisma.property.create({
        data: {
          propertyCode:
            normalizedPropertyCode,

          name:
            String(name).trim(),

          type:
            normalizedType,

          status:
            normalizedStatus,

          phase:
            optionalText(phase),

          block:
            optionalText(block),

          tower:
            optionalText(tower),

          floor:
            optionalText(floor),

          series:
            optionalText(series),

          unitNumber:
            optionalText(unitNumber),

          area:
            area !== undefined &&
            area !== null &&
            area !== ""
              ? Number(area)
              : null,

          price:
            price !== undefined &&
            price !== null &&
            price !== ""
              ? Number(price)
              : null,

          description:
            optionalText(description),
        },
      });

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Property created successfully",
        data: property,
      });
  } catch (error) {
    console.error(
      "Create property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create property",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

// ======================================================
// PUT /api/properties/:id
// ======================================================

export const updateProperty = async (
  req: Request,
  res: Response
) => {
  try {
    const propertyId =
      String(req.params.id);

    const existingProperty =
      await prisma.property.findUnique({
        where: {
          id: propertyId,
        },
      });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found",
      });
    }

    const {
      propertyCode,
      name,
      type,
      status,

      phase,
      block,
      tower,
      floor,
      series,
      unitNumber,

      area,
      price,
      description,
    } = req.body;

    const updateData: any = {};

    // --------------------------------------------------
    // Property Code
    // --------------------------------------------------

    if (propertyCode !== undefined) {
      const normalizedPropertyCode =
        String(propertyCode)
          .trim()
          .toUpperCase();

      const duplicate =
        await prisma.property.findUnique({
          where: {
            propertyCode:
              normalizedPropertyCode,
          },
        });

      if (
        duplicate &&
        duplicate.id !== propertyId
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Property with this code already exists",
        });
      }

      updateData.propertyCode =
        normalizedPropertyCode;
    }

    // --------------------------------------------------
    // Basic fields
    // --------------------------------------------------

    if (name !== undefined) {
      updateData.name =
        String(name).trim();
    }

    if (type !== undefined) {
      updateData.type =
        normalizePropertyType(type);
    }

    if (status !== undefined) {
      updateData.status =
        normalizePropertyStatus(status);
    }

    // --------------------------------------------------
    // Inventory hierarchy
    // --------------------------------------------------

    if (phase !== undefined) {
      updateData.phase =
        optionalText(phase);
    }

    if (block !== undefined) {
      updateData.block =
        optionalText(block);
    }

    if (tower !== undefined) {
      updateData.tower =
        optionalText(tower);
    }

    if (floor !== undefined) {
      updateData.floor =
        optionalText(floor);
    }

    if (series !== undefined) {
      updateData.series =
        optionalText(series);
    }

    if (unitNumber !== undefined) {
      updateData.unitNumber =
        optionalText(unitNumber);
    }

    // --------------------------------------------------
    // Numeric/details
    // --------------------------------------------------

    if (area !== undefined) {
      updateData.area =
        area === null ||
        area === ""
          ? null
          : Number(area);
    }

    if (price !== undefined) {
      updateData.price =
        price === null ||
        price === ""
          ? null
          : Number(price);
    }

    if (description !== undefined) {
      updateData.description =
        optionalText(description);
    }

    const property =
      await prisma.property.update({
        where: {
          id: propertyId,
        },

        data: updateData,
      });

    return res.json({
      success: true,
      message:
        "Property updated successfully",
      data: property,
    });
  } catch (error) {
    console.error(
      "Update property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update property",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};

// ======================================================
// DELETE /api/properties/:id
//
// Safety:
// AVAILABLE -> delete allowed
// HOLD      -> delete allowed
// BOOKED    -> blocked
// SOLD      -> blocked
//
// Any property with booking history is also blocked.
// ======================================================

export const deleteProperty = async (
  req: Request,
  res: Response
) => {
  try {
    const propertyId =
      String(req.params.id);

    const existingProperty =
      await prisma.property.findUnique({
        where: {
          id: propertyId,
        },

        include: {
          bookings: {
            select: {
              id: true,
            },
          },
        },
      });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message:
          "Property not found",
      });
    }

    if (
      existingProperty.status ===
        PropertyStatus.BOOKED ||
      existingProperty.status ===
        PropertyStatus.SOLD
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Booked or sold property cannot be deleted",
      });
    }

    if (
      existingProperty.bookings.length >
      0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Property with booking history cannot be deleted",
      });
    }

    await prisma.property.delete({
      where: {
        id: propertyId,
      },
    });

    return res.json({
      success: true,
      message:
        "Property deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete property error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete property",

      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });
  }
};