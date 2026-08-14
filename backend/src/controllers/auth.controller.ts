import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured in .env");
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const normalizedEmail = String(email).trim().toLowerCase();

        // -------------------------
        // Check Admin
        // -------------------------

        const admin = await prisma.admin.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (admin && admin.isActive) {
            const isPasswordValid = await bcrypt.compare(
                password,
                admin.passwordHash
            );

            if (isPasswordValid) {
                const token = jwt.sign(
                    {
                        id: admin.id,
                        email: admin.email,
                        role: "ADMIN",
                        userType: "ADMIN",
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "7d",
                    }
                );

                return res.json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email,
                        role: "ADMIN",
                        userType: "ADMIN",
                    },
                });
            }
        }

        // -------------------------
        // Check Employee
        // -------------------------

        const employee = await prisma.employee.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (employee && employee.status === "ACTIVE") {
            const isPasswordValid = await bcrypt.compare(
                password,
                employee.passwordHash
            );

            if (isPasswordValid) {
                const token = jwt.sign(
                    {
                        id: employee.id,
                        email: employee.email,
                        role: employee.role,
                        userType: "EMPLOYEE",
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "7d",
                    }
                );

                return res.json({
                    success: true,
                    message: "Login successful",
                    token,
                    user: {
                        id: employee.id,
                        name: employee.name,
                        email: employee.email,
                        role: employee.role,
                        userType: "EMPLOYEE",
                    },
                });
            }
        }

        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};