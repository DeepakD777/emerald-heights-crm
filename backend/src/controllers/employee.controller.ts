import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { UserRole, EmployeeStatus } from "../generated/prisma/enums";

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

const normalizeRole = (role: unknown): UserRole => {
    const value = String(role ?? "").trim().toUpperCase();

    switch (value) {
        case "SALES EXECUTIVE":
        case "SALES_EXECUTIVE":
        case "EMPLOYEE":
            return UserRole.SALES_EXECUTIVE;

        case "SALES MANAGER":
        case "SALES_MANAGER":
            return UserRole.SALES_MANAGER;

        case "TEAM LEADER":
        case "TEAM_LEADER":
            return UserRole.TEAM_LEADER;

        default:
            throw new Error(`Invalid employee role: ${role}`);
    }
};

const normalizeStatus = (status: unknown): EmployeeStatus => {
    const value = String(status ?? "").trim().toUpperCase();

    switch (value) {
        case "ACTIVE":
            return EmployeeStatus.ACTIVE;

        case "INACTIVE":
            return EmployeeStatus.INACTIVE;

        default:
            throw new Error(`Invalid employee status: ${status}`);
    }
};

// ----------------------------------------------------
// GET /api/employees
// ----------------------------------------------------

export const getEmployees = async (
    _req: Request,
    res: Response
) => {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: employees,
        });
    } catch (error) {
        console.error("Get employees error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch employees",
        });
    }
};

// ----------------------------------------------------
// GET /api/employees/:id
// ----------------------------------------------------

export const getEmployeeById = async (
    req: Request,
    res: Response
) => {
    try {
        const employee = await prisma.employee.findUnique({
            where: {
                id: String(req.params.id),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.json({
            success: true,
            data: employee,
        });
    } catch (error) {
        console.error("Get employee error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch employee",
        });
    }
};

// ----------------------------------------------------
// POST /api/employees
// ----------------------------------------------------

export const createEmployee = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            email,
            phone,
            passwordHash,
            role,
            status,
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required",
            });
        }

        const existingEmployee = await prisma.employee.findUnique({
            where: {
                email: String(email).trim(),
            },
        });

        if (existingEmployee) {
            return res.status(409).json({
                success: false,
                message: "Employee with this email already exists",
            });
        }

        const normalizedRole = role
            ? normalizeRole(role)
            : UserRole.SALES_EXECUTIVE;

        const normalizedStatus = status
            ? normalizeStatus(status)
            : EmployeeStatus.ACTIVE;

        /*
         * Current Sales Team form does not appear to have
         * a password field.
         *
         * If passwordHash is supplied, we keep it.
         * Otherwise we use a temporary value so that the
         * required Prisma field can be created.
         *
         * When employee login/authentication is implemented,
         * replace this with proper password hashing.
         */
        const finalPasswordHash =
            passwordHash && String(passwordHash).trim()
                ? String(passwordHash)
                : "TEMPORARY_PASSWORD";

        const employee = await prisma.employee.create({
            data: {
                name: String(name).trim(),
                email: String(email).trim(),
                phone: phone ? String(phone).trim() : null,
                passwordHash: finalPasswordHash,
                role: normalizedRole,
                status: normalizedStatus,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });
    } catch (error) {
        console.error("Create employee error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create employee",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
    }
};

// ----------------------------------------------------
// PUT /api/employees/:id
// ----------------------------------------------------

export const updateEmployee = async (
    req: Request,
    res: Response
) => {
    try {
        const employeeId = String(req.params.id);

        const {
            name,
            email,
            phone,
            role,
            status,
        } = req.body;

        const existingEmployee = await prisma.employee.findUnique({
            where: {
                id: employeeId,
            },
        });

        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        const updateData: any = {};

        if (name !== undefined) {
            updateData.name = String(name).trim();
        }

        if (email !== undefined) {
            updateData.email = String(email).trim();
        }

        if (phone !== undefined) {
            updateData.phone =
                phone === null || phone === ""
                    ? null
                    : String(phone).trim();
        }

        if (role !== undefined) {
            updateData.role = normalizeRole(role);
        }

        if (status !== undefined) {
            updateData.status = normalizeStatus(status);
        }

        const employee = await prisma.employee.update({
            where: {
                id: employeeId,
            },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json({
            success: true,
            message: "Employee updated successfully",
            data: employee,
        });
    } catch (error) {
        console.error("Update employee error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update employee",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
    }
};

// ----------------------------------------------------
// DELETE /api/employees/:id
// ----------------------------------------------------

export const deleteEmployee = async (
    req: Request,
    res: Response
) => {
    try {
        const employeeId = String(req.params.id);

        const existingEmployee = await prisma.employee.findUnique({
            where: {
                id: employeeId,
            },
        });

        if (!existingEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        await prisma.employee.delete({
            where: {
                id: employeeId,
            },
        });

        res.json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        console.error("Delete employee error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete employee",
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error",
        });
    }
};