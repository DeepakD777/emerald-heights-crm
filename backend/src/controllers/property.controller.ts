import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/properties
export const getProperties = async (
  _req: Request,
  res: Response
) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Get properties error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
    });
  }
};

// GET /api/properties/:id
export const getPropertyById = async (
  req: Request,
  res: Response
) => {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Get property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch property",
    });
  }
};

// POST /api/properties
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
      block,
      floor,
      unitNumber,
      area,
      price,
      description,
    } = req.body;

    if (!propertyCode || !name || !type) {
      return res.status(400).json({
        success: false,
        message: "Property code, name and type are required",
      });
    }

    const existingProperty =
      await prisma.property.findUnique({
        where: {
          propertyCode,
        },
      });

    if (existingProperty) {
      return res.status(409).json({
        success: false,
        message: "Property with this code already exists",
      });
    }

    const property = await prisma.property.create({
      data: {
        propertyCode,
        name,
        type,
        status,
        block,
        floor,
        unitNumber,
        area,
        price,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: property,
    });
  } catch (error) {
    console.error("Create property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create property",
    });
  }
};

// PUT /api/properties/:id
export const updateProperty = async (
  req: Request,
  res: Response
) => {
  try {
    const propertyId = String(req.params.id);

    const existingProperty =
      await prisma.property.findUnique({
        where: {
          id: propertyId,
        },
      });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const {
      propertyCode,
      name,
      type,
      status,
      block,
      floor,
      unitNumber,
      area,
      price,
      description,
    } = req.body;

    const property = await prisma.property.update({
      where: {
        id: propertyId,
      },
      data: {
        propertyCode,
        name,
        type,
        status,
        block,
        floor,
        unitNumber,
        area,
        price,
        description,
      },
    });

    res.json({
      success: true,
      message: "Property updated successfully",
      data: property,
    });
  } catch (error) {
    console.error("Update property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update property",
    });
  }
};

// DELETE /api/properties/:id
export const deleteProperty = async (
  req: Request,
  res: Response
) => {
  try {
    const propertyId = String(req.params.id);

    const existingProperty =
      await prisma.property.findUnique({
        where: {
          id: propertyId,
        },
      });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    await prisma.property.delete({
      where: {
        id: propertyId,
      },
    });

    res.json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Delete property error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete property",
    });
  }
};