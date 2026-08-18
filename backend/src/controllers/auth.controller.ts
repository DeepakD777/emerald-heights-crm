import {
    Request,
    Response,
} from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer, {
    Transporter,
} from "nodemailer";

import {
    createHash,
    randomInt,
} from "crypto";

import {
    prisma,
} from "../lib/prisma";

import type {
    AuthRequest,
} from "../middleware/auth.middleware";

// ======================================================
// JWT
// ======================================================

const JWT_SECRET =
    process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET is not configured in .env"
    );
}

// ======================================================
// Login Type
// ======================================================

type LoginType =
    | "ADMIN"
    | "EMPLOYEE";

// ======================================================
// Admin Password Reset Configuration
// ======================================================

const OTP_EXPIRY_MS =
    10 * 60 * 1000;

const OTP_RESEND_COOLDOWN_MS =
    60 * 1000;

const OTP_MAX_ATTEMPTS =
    5;

const RESET_TOKEN_EXPIRY_MS =
    10 * 60 * 1000;

// ======================================================
// Temporary Password Reset Store
//
// Development / single-server friendly.
// Production multi-server deployment can later move this
// store to Redis without changing the frontend flow.
// ======================================================

type AdminOtpRecord = {
    otpHash: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
};

type AdminResetTokenRecord = {
    adminId: string;
    email: string;
    expiresAt: number;
};

const adminOtpStore =
    new Map<
        string,
        AdminOtpRecord
    >();

const adminResetTokenStore =
    new Map<
        string,
        AdminResetTokenRecord
    >();

// ======================================================
// Helpers
// ======================================================

const normalizeEmail = (
    email: unknown
) =>
    String(
        email ?? ""
    )
        .trim()
        .toLowerCase();

const hashValue = (
    value: string
) =>
    createHash(
        "sha256"
    )
        .update(
            `${value}:${JWT_SECRET}`
        )
        .digest(
            "hex"
        );

const cleanupExpiredPasswordResetData =
    () => {

        const now =
            Date.now();

        for (
            const [
                email,
                record,
            ] of adminOtpStore
        ) {

            if (
                record.expiresAt <=
                now
            ) {
                adminOtpStore.delete(
                    email
                );
            }
        }

        for (
            const [
                tokenHash,
                record,
            ] of adminResetTokenStore
        ) {

            if (
                record.expiresAt <=
                now
            ) {
                adminResetTokenStore.delete(
                    tokenHash
                );
            }
        }
    };

// ======================================================
// Mail Transporter
// ======================================================

let mailTransporter:
    Transporter | null =
    null;

const getMailTransporter =
    () => {

        const smtpUser =
            process.env.SMTP_USER;

        const smtpPass =
            process.env.SMTP_PASS;

        if (
            !smtpUser ||
            !smtpPass
        ) {
            throw new Error(
                "SMTP_USER or SMTP_PASS is not configured in .env"
            );
        }

        if (
            !mailTransporter
        ) {

            mailTransporter =
                nodemailer.createTransport({
                    service:
                        "gmail",

                    auth: {
                        user:
                            smtpUser,

                        pass:
                            smtpPass,
                    },
                });
        }

        return {
            transporter:
                mailTransporter,

            smtpUser,
        };
    };

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
            loginType,
        } = req.body;

        // ==================================================
        // Required Fields
        // ==================================================

        if (
            !email ||
            !password
        ) {

            return res
                .status(400)
                .json({
                    success:
                        false,

                    message:
                        "Email and password are required",
                });
        }

        // ==================================================
        // Validate Login Type
        // ==================================================

        const normalizedLoginType:
            LoginType | undefined =
            loginType
                ? String(
                      loginType
                  )
                      .trim()
                      .toUpperCase() as
                      LoginType
                : undefined;

        if (
            normalizedLoginType &&
            normalizedLoginType !==
                "ADMIN" &&
            normalizedLoginType !==
                "EMPLOYEE"
        ) {

            return res
                .status(400)
                .json({
                    success:
                        false,

                    message:
                        "Invalid login type",
                });
        }

        // ==================================================
        // Normalize Email
        // ==================================================

        const normalizedEmail =
            normalizeEmail(
                email
            );

        // ==================================================
        // ADMIN LOGIN
        // ==================================================

        if (
            !normalizedLoginType ||
            normalizedLoginType ===
                "ADMIN"
        ) {

            const admin =
                await prisma.admin
                    .findUnique({
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
                        String(
                            password
                        ),
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
                        success:
                            true,

                        message:
                            "Admin login successful",

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

            if (
                normalizedLoginType ===
                "ADMIN"
            ) {

                return res
                    .status(401)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid Admin email or password",
                    });
            }
        }

        // ==================================================
        // EMPLOYEE LOGIN
        // ==================================================

        if (
            !normalizedLoginType ||
            normalizedLoginType ===
                "EMPLOYEE"
        ) {

            const employee =
                await prisma.employee
                    .findUnique({
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
                        String(
                            password
                        ),
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
                        success:
                            true,

                        message:
                            "Employee login successful",

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

            if (
                normalizedLoginType ===
                "EMPLOYEE"
            ) {

                return res
                    .status(401)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid Employee email or password",
                    });
            }
        }

        // ==================================================
        // Legacy / Generic Login Failure
        // ==================================================

        return res
            .status(401)
            .json({
                success:
                    false,

                message:
                    "Invalid email or password",
            });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res
            .status(500)
            .json({
                success:
                    false,

                message:
                    "Login failed",
            });
    }
};

// ======================================================
// REQUEST ADMIN PASSWORD RESET OTP
// ======================================================

export const requestAdminPasswordOtp =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            cleanupExpiredPasswordResetData();

            const {
                email,
            } = req.body;

            if (!email) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Email is required",
                    });
            }

            const normalizedEmail =
                normalizeEmail(
                    email
                );

            if (
                !normalizedEmail
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "A valid email is required",
                    });
            }

            const now =
                Date.now();

            const existingRecord =
                adminOtpStore.get(
                    normalizedEmail
                );

            if (
                existingRecord &&
                now -
                    existingRecord.lastSentAt <
                    OTP_RESEND_COOLDOWN_MS
            ) {

                const remainingSeconds =
                    Math.ceil(
                        (
                            OTP_RESEND_COOLDOWN_MS -
                            (
                                now -
                                existingRecord.lastSentAt
                            )
                        ) /
                            1000
                    );

                return res
                    .status(429)
                    .json({
                        success:
                            false,

                        message:
                            `Please wait ${remainingSeconds} seconds before requesting another OTP`,
                    });
            }

            const otp =
                randomInt(
                    100000,
                    1000000
                ).toString();

            adminOtpStore.set(
                normalizedEmail,
                {
                    otpHash:
                        hashValue(
                            otp
                        ),

                    expiresAt:
                        now +
                        OTP_EXPIRY_MS,

                    attempts:
                        0,

                    lastSentAt:
                        now,
                }
            );

            const admin =
                await prisma.admin
                    .findUnique({
                        where: {
                            email:
                                normalizedEmail,
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

            // --------------------------------------------------
            // Security:
            // Do not reveal whether a random email exists.
            // --------------------------------------------------

            if (
                !admin ||
                !admin.isActive
            ) {

                return res.json({
                    success:
                        true,

                    message:
                        "If this email belongs to an active Admin, a password reset OTP has been sent.",
                });
            }

            try {

                const {
                    transporter,
                    smtpUser,
                } =
                    getMailTransporter();

                await transporter.sendMail({
                    from:
                        `"Emerald Heights CRM" <${smtpUser}>`,

                    to:
                        admin.email,

                    subject:
                        "Emerald Heights CRM - Password Reset OTP",

                    text:
                        `Hello ${admin.name},

Your Emerald Heights CRM password reset OTP is: ${otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, you can ignore this email.

Emerald Heights CRM`,

                    html:
                        `
                        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
                            <div style="background: #166534; padding: 24px; border-radius: 12px 12px 0 0;">
                                <h2 style="margin: 0; color: #ffffff;">
                                    Emerald Heights CRM
                                </h2>
                            </div>

                            <div style="border: 1px solid #e5e7eb; border-top: 0; padding: 28px; border-radius: 0 0 12px 12px;">
                                <p>
                                    Hello ${admin.name},
                                </p>

                                <p>
                                    Use the following OTP to reset your Admin password:
                                </p>

                                <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 20px; background: #f0fdf4; color: #166534; border-radius: 10px; margin: 24px 0;">
                                    ${otp}
                                </div>

                                <p>
                                    This OTP will expire in
                                    <strong>10 minutes</strong>.
                                </p>

                                <p style="color: #6b7280; font-size: 14px;">
                                    If you did not request a password reset, you can safely ignore this email.
                                </p>
                            </div>
                        </div>
                        `,
                });

            } catch (mailError) {

                adminOtpStore.delete(
                    normalizedEmail
                );

                console.error(
                    "Admin OTP email error:",
                    mailError
                );

                return res
                    .status(500)
                    .json({
                        success:
                            false,

                        message:
                            "Unable to send password reset OTP. Please try again.",
                    });
            }

            return res.json({
                success:
                    true,

                message:
                    "If this email belongs to an active Admin, a password reset OTP has been sent.",
            });

        } catch (error) {

            console.error(
                "Request Admin password OTP error:",
                error
            );

            return res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Failed to request password reset OTP",
                });
        }
    };

// ======================================================
// VERIFY ADMIN PASSWORD RESET OTP
// ======================================================

export const verifyAdminPasswordOtp =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            cleanupExpiredPasswordResetData();

            const {
                email,
                otp,
            } = req.body;

            if (
                !email ||
                !otp
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Email and OTP are required",
                    });
            }

            const normalizedEmail =
                normalizeEmail(
                    email
                );

            const normalizedOtp =
                String(
                    otp
                )
                    .trim()
                    .replace(
                        /\s/g,
                        ""
                    );

            if (
                !/^\d{6}$/.test(
                    normalizedOtp
                )
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired OTP",
                    });
            }

            const otpRecord =
                adminOtpStore.get(
                    normalizedEmail
                );

            if (
                !otpRecord ||
                otpRecord.expiresAt <=
                    Date.now()
            ) {

                adminOtpStore.delete(
                    normalizedEmail
                );

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired OTP",
                    });
            }

            if (
                otpRecord.attempts >=
                OTP_MAX_ATTEMPTS
            ) {

                adminOtpStore.delete(
                    normalizedEmail
                );

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired OTP",
                    });
            }

            const suppliedOtpHash =
                hashValue(
                    normalizedOtp
                );

            if (
                suppliedOtpHash !==
                otpRecord.otpHash
            ) {

                otpRecord.attempts +=
                    1;

                adminOtpStore.set(
                    normalizedEmail,
                    otpRecord
                );

                if (
                    otpRecord.attempts >=
                    OTP_MAX_ATTEMPTS
                ) {

                    adminOtpStore.delete(
                        normalizedEmail
                    );
                }

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired OTP",
                    });
            }

            const admin =
                await prisma.admin
                    .findUnique({
                        where: {
                            email:
                                normalizedEmail,
                        },

                        select: {
                            id:
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

                adminOtpStore.delete(
                    normalizedEmail
                );

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired OTP",
                    });
            }

            adminOtpStore.delete(
                normalizedEmail
            );

            const resetToken =
                jwt.sign(
                    {
                        adminId:
                            admin.id,

                        email:
                            admin.email,

                        purpose:
                            "ADMIN_PASSWORD_RESET",
                    },

                    JWT_SECRET,

                    {
                        expiresIn:
                            "10m",
                    }
                );

            adminResetTokenStore.set(
                hashValue(
                    resetToken
                ),
                {
                    adminId:
                        admin.id,

                    email:
                        admin.email,

                    expiresAt:
                        Date.now() +
                        RESET_TOKEN_EXPIRY_MS,
                }
            );

            return res.json({
                success:
                    true,

                message:
                    "OTP verified successfully",

                resetToken,
            });

        } catch (error) {

            console.error(
                "Verify Admin password OTP error:",
                error
            );

            return res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Failed to verify OTP",
                });
        }
    };

// ======================================================
// RESET ADMIN PASSWORD
// ======================================================

export const resetAdminPassword =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            cleanupExpiredPasswordResetData();

            const {
                resetToken,
                newPassword,
                confirmPassword,
            } = req.body;

            if (
                !resetToken ||
                !newPassword ||
                !confirmPassword
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Reset token, new password and confirm password are required",
                    });
            }

            if (
                String(
                    newPassword
                ) !==
                String(
                    confirmPassword
                )
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Passwords do not match",
                    });
            }

            if (
                String(
                    newPassword
                ).length < 8
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Password must be at least 8 characters long",
                    });
            }

            let decoded:
                jwt.JwtPayload;

            try {

                const verified =
                    jwt.verify(
                        String(
                            resetToken
                        ),
                        JWT_SECRET
                    );

                if (
                    typeof verified ===
                    "string"
                ) {
                    throw new Error(
                        "Invalid reset token"
                    );
                }

                decoded =
                    verified;

            } catch {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired password reset session",
                    });
            }

            if (
                decoded.purpose !==
                "ADMIN_PASSWORD_RESET"
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired password reset session",
                    });
            }

            const adminId =
                String(
                    decoded.adminId ??
                        ""
                );

            const email =
                normalizeEmail(
                    decoded.email
                );

            if (
                !adminId ||
                !email
            ) {

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired password reset session",
                    });
            }

            const tokenHash =
                hashValue(
                    String(
                        resetToken
                    )
                );

            const storedResetToken =
                adminResetTokenStore.get(
                    tokenHash
                );

            if (
                !storedResetToken ||
                storedResetToken.expiresAt <=
                    Date.now() ||
                storedResetToken.adminId !==
                    adminId ||
                normalizeEmail(
                    storedResetToken.email
                ) !==
                    email
            ) {

                adminResetTokenStore.delete(
                    tokenHash
                );

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired password reset session",
                    });
            }

            const admin =
                await prisma.admin
                    .findUnique({
                        where: {
                            id:
                                adminId,
                        },

                        select: {
                            id:
                                true,

                            email:
                                true,

                            isActive:
                                true,
                        },
                    });

            if (
                !admin ||
                !admin.isActive ||
                normalizeEmail(
                    admin.email
                ) !==
                    email
            ) {

                adminResetTokenStore.delete(
                    tokenHash
                );

                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Invalid or expired password reset session",
                    });
            }

            const passwordHash =
                await bcrypt.hash(
                    String(
                        newPassword
                    ),
                    12
                );

            await prisma.admin
                .update({
                    where: {
                        id:
                            admin.id,
                    },

                    data: {
                        passwordHash,
                    },
                });

            // --------------------------------------------------
            // One-time reset token
            // --------------------------------------------------

            adminResetTokenStore.delete(
                tokenHash
            );

            adminOtpStore.delete(
                email
            );

            return res.json({
                success:
                    true,

                message:
                    "Admin password reset successfully",
            });

        } catch (error) {

            console.error(
                "Reset Admin password error:",
                error
            );

            return res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Failed to reset Admin password",
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

            // ==================================================
            // ADMIN
            // ==================================================

            if (
                req.user.userType ===
                "ADMIN"
            ) {

                const admin =
                    await prisma.admin
                        .findUnique({
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
                    success:
                        true,

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

            // ==================================================
            // EMPLOYEE
            // ==================================================

            const employee =
                await prisma.employee
                    .findUnique({
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
                success:
                    true,

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

            return res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Failed to load current user",
                });
        }
    };