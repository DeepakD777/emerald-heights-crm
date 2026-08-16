import {
    Request,
    Response,
} from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma";

import type {
    AuthRequest,
} from "../middleware/auth.middleware";

const JWT_SECRET =
    process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not configured in .env"
    );
}

// ======================================================
// LOGIN
// ======================================================

export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();

        // ==================================================
        // ADMIN
        // ==================================================

        const admin =
            await prisma.admin.findUnique({
                where: {
                    email:
                        normalizedEmail,
                },
            });

        if (
            admin &&
            admin.isActive
        ) {
            const valid =
                await bcrypt.compare(
                    password,
                    admin.passwordHash
                );

            if (valid) {
                const token =
                    jwt.sign(
                        {
                            id:
                                admin.id,

                            email:
                                admin.email,

                            role:
                                "ADMIN",

                            userType:
                                "ADMIN",
                        },

                        JWT_SECRET,

                        {
                            expiresIn:
                                "7d",
                        }
                    );

                return res.json({
                    success: true,
                    message:
                        "Login successful",

                    token,

                    user: {
                        id:
                            admin.id,

                        name:
                            admin.name,

                        email:
                            admin.email,

                        role:
                            "ADMIN",

                        userType:
                            "ADMIN",
                    },
                });
            }
        }

        // ==================================================
        // EMPLOYEE
        // ==================================================

        const employee =
            await prisma.employee.findUnique({
                where: {
                    email:
                        normalizedEmail,
                },
            });

        if (
            employee &&
            employee.status ===
                "ACTIVE"
        ) {
            const valid =
                await bcrypt.compare(
                    password,
                    employee.passwordHash
                );

            if (valid) {
                const token =
                    jwt.sign(
                        {
                            id:
                                employee.id,

                            email:
                                employee.email,

                            role:
                                employee.role,

                            userType:
                                "EMPLOYEE",
                        },

                        JWT_SECRET,

                        {
                            expiresIn:
                                "7d",
                        }
                    );

                return res.json({
                    success: true,
                    message:
                        "Login successful",

                    token,

                    user: {
                        id:
                            employee.id,

                        name:
                            employee.name,

                        email:
                            employee.email,

                        role:
                            employee.role,

                        userType:
                            "EMPLOYEE",
                    },
                });
            }
        }

        return res.status(401).json({
            success: false,
            message:
                "Invalid email or password",
        });

    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Login failed",
        });
    }
};

// ======================================================
// CURRENT USER
// ======================================================

export const getCurrentUser =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
            if (
                !req.user
            ) {
                return res
                    .status(401)
                    .json({
                        success:
                            false,

                        message:
                            "Authentication required",
                    });
            }

            // ==============================================
            // ADMIN
            // ==============================================

            if (
                req.user.userType ===
                "ADMIN"
            ) {
                const admin =
                    await prisma.admin.findUnique({
                        where: {
                            id:
                                req.user.id,
                        },

                        select: {
                            id:
                                true,

                            name:
                                true,

                            email:
                                true,

                            isActive:
                                true,
                        },
                    });

                if (
                    !admin ||
                    !admin.isActive
                ) {
                    return res
                        .status(401)
                        .json({
                            success:
                                false,

                            message:
                                "Admin account is inactive or unavailable",
                        });
                }

                return res.json({
                    success: true,

                    user: {
                        id:
                            admin.id,

                        name:
                            admin.name,

                        email:
                            admin.email,

                        role:
                            "ADMIN",

                        userType:
                            "ADMIN",
                    },
                });
            }

            // ==============================================
            // EMPLOYEE
            // ==============================================

            const employee =
                await prisma.employee.findUnique({
                    where: {
                        id:
                            req.user.id,
                    },

                    select: {
                        id:
                            true,

                        name:
                            true,

                        email:
                            true,

                        role:
                            true,

                        status:
                            true,
                    },
                });

            if (
                !employee ||
                employee.status !==
                    "ACTIVE"
            ) {
                return res
                    .status(401)
                    .json({
                        success:
                            false,

                        message:
                            "Employee account is inactive or unavailable",
                    });
            }

            return res.json({
                success: true,

                user: {
                    id:
                        employee.id,

                    name:
                        employee.name,

                    email:
                        employee.email,

                    role:
                        employee.role,

                    userType:
                        "EMPLOYEE",
                },
            });

        } catch (error) {
            console.error(
                "Get current user error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to load current user",
            });
        }
    };