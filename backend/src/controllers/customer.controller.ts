import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/customers
export const getCustomers = async (
  _req: Request,
  res: Response
) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

// GET /api/customers/:id
export const getCustomerById = async (
  req: Request,
  res: Response
) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: {
        id: String(req.params.id),
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Get customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
    });
  }
};

// POST /api/customers
export const createCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      notes,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

// PUT /api/customers/:id
export const updateCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const customerId = String(req.params.id);

    const existingCustomer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      notes,
    } = req.body;

    const customer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        name,
        email,
        phone,
        address,
        city,
        state,
        notes,
      },
    });

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Update customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

// DELETE /api/customers/:id
export const deleteCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const customerId = String(req.params.id);

    const existingCustomer =
      await prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    await prisma.customer.delete({
      where: {
        id: customerId,
      },
    });

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};