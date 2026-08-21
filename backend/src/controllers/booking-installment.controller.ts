import {
    Request,
    Response,
} from "express";

import {
    prisma,
} from "../lib/prisma";

import {
    BookingStatus,
    RemainingAmountMode,
} from "../generated/prisma/enums";

// ======================================================
// Types
// ======================================================

type InstallmentPaymentPayload = {
    installmentId?: string;
    amount?:
    | string
    | number;
    paymentDate?: string;
    paymentMode?: string;
    referenceNo?: string;
    remarks?: string;
};

// ======================================================
// Format Installment Stage
// ======================================================

const formatInstallmentStage = (
    stage: any
) => {

    const payments =
        stage.payments ??
        [];

    const paidAmount =
        payments.reduce(
            (
                total: number,
                payment: any
            ) =>
                total +
                Number(
                    payment.amount ??
                    0
                ),
            0
        );

    const plannedAmount =
        Number(
            stage.plannedAmount ??
            0
        );

    const balanceAmount =
        Math.max(
            plannedAmount -
            paidAmount,
            0
        );

    const status =
        paidAmount <= 0
            ? "PENDING"
            : paidAmount <
                plannedAmount
                ? "PARTIAL"
                : "PAID";

    const lastPayment =
        payments.length >
            0
            ? payments[
                payments.length -
                1
            ]
            : null;

    return {

        id:
            stage.id,

        sequence:
            stage.sequence,

        stageName:
            stage.stageName,

        percentage:
            Number(
                stage.percentage ??
                0
            ),

        plannedAmount,

        paidAmount,

        balanceAmount,

        status,

        lastPaymentDate:
            lastPayment
                ?.paymentDate
                ? new Date(
                    lastPayment
                        .paymentDate
                ).toISOString()
                : null,

        lastPaymentMode:
            lastPayment
                ?.paymentMode ??
            null,

        payments:
            payments.map(
                (
                    payment: any
                ) => ({

                    id:
                        payment.id,

                    amount:
                        Number(
                            payment.amount ??
                            0
                        ),

                    paymentDate:
                        payment
                            .paymentDate
                            ? new Date(
                                payment
                                    .paymentDate
                            ).toISOString()
                            : null,

                    paymentMode:
                        payment
                            .paymentMode ??
                        null,

                    referenceNo:
                        payment
                            .referenceNo ??
                        null,

                    remarks:
                        payment
                            .remarks ??
                        null,
                })
            ),
    };
};

// ======================================================
// ADD INSTALLMENT PAYMENT
// Route will enforce Admin only
// ======================================================

export const addInstallmentPayment =
    async (
        req: Request,
        res: Response
    ) => {

        try {

            const bookingId =
                String(
                    req.params.id
                );

            const payload =
                req.body as
                InstallmentPaymentPayload;

            const {
                installmentId,
                amount,
                paymentDate,
                paymentMode,
                referenceNo,
                remarks,
            } = payload;

            // ==================================================
            // Installment Required
            // ==================================================

            if (
                !installmentId ||
                !String(
                    installmentId
                ).trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Installment stage is required",
                    });
            }

            // ==================================================
            // Amount Validation
            // ==================================================

            const parsedAmount =
                Number(
                    amount
                );

            if (
                !Number.isFinite(
                    parsedAmount
                ) ||
                parsedAmount <=
                0
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Valid payment amount is required",
                    });
            }

            // ==================================================
            // Payment Date
            // ==================================================

            let finalPaymentDate =
                new Date();

            if (
                paymentDate
            ) {

                const parsedDate =
                    new Date(
                        paymentDate
                    );

                if (
                    Number.isNaN(
                        parsedDate
                            .getTime()
                    )
                ) {

                    return res
                        .status(400)
                        .json({

                            success:
                                false,

                            message:
                                "Invalid payment date",
                        });
                }

                finalPaymentDate =
                    parsedDate;
            }

            // ==================================================
            // Transaction
            // ==================================================

            const createdPayment =
                await prisma
                    .$transaction(
                        async (
                            tx
                        ) => {

                            // ==================================
                            // Booking
                            // ==================================

                            const booking =
                                await tx
                                    .booking
                                    .findUnique({

                                        where: {
                                            id:
                                                bookingId,
                                        },
                                    });

                            if (
                                !booking
                            ) {

                                throw new Error(
                                    "BOOKING_NOT_FOUND"
                                );
                            }

                            // ==================================
                            // Cancelled / Archived Guard
                            // ==================================

                            if (
                                booking
                                    .archivedAt ||
                                booking
                                    .status ===
                                BookingStatus
                                    .CANCELLED
                            ) {

                                throw new Error(
                                    "BOOKING_NOT_ACTIVE"
                                );
                            }

                            // ==================================
                            // Installment Stage
                            // Must belong to same booking
                            // ==================================

                            const installment =
                                await tx
                                    .bookingInstallmentStage
                                    .findFirst({

                                        where: {

                                            id:
                                                String(
                                                    installmentId
                                                ),

                                            bookingId,
                                        },

                                        include: {

                                            payments:
                                                true,
                                        },
                                    });

                            if (
                                !installment
                            ) {

                                throw new Error(
                                    "INSTALLMENT_NOT_FOUND"
                                );
                            }

                            // ==================================
                            // Current Paid Amount
                            // ==================================

                            const alreadyPaid =
                                installment
                                    .payments
                                    .reduce(
                                        (
                                            total:
                                                number,
                                            payment:
                                                any
                                        ) =>
                                            total +
                                            Number(
                                                payment
                                                    .amount ??
                                                0
                                            ),
                                        0
                                    );

                            const plannedAmount =
                                Number(
                                    installment
                                        .plannedAmount ??
                                    0
                                );

                            const stageBalance =
                                Math.max(
                                    plannedAmount -
                                    alreadyPaid,
                                    0
                                );

                            // ==================================
                            // Fully Paid Guard
                            // ==================================

                            if (
                                stageBalance <=
                                0.01
                            ) {

                                throw new Error(
                                    "INSTALLMENT_ALREADY_PAID"
                                );
                            }

                            // ==================================
                            // Overpayment Guard
                            // ==================================

                            if (
                                parsedAmount -
                                stageBalance >
                                0.01
                            ) {

                                throw new Error(
                                    `PAYMENT_EXCEEDS_STAGE_BALANCE:${stageBalance}`
                                );
                            }

                            // ==================================
                            // Create Payment History
                            // ==================================

                            const payment =
                                await tx
                                    .bookingInstallmentPayment
                                    .create({

                                        data: {

                                            bookingId,

                                            installmentId:
                                                installment.id,

                                            amount:
                                                parsedAmount,

                                            paymentDate:
                                                finalPaymentDate,

                                            paymentMode:
                                                paymentMode
                                                    ? String(
                                                        paymentMode
                                                    )
                                                        .trim()
                                                    : "Cash",

                                            referenceNo:
                                                referenceNo
                                                    ? String(
                                                        referenceNo
                                                    )
                                                        .trim()
                                                    : null,

                                            remarks:
                                                remarks
                                                    ? String(
                                                        remarks
                                                    )
                                                        .trim()
                                                    : null,
                                        },
                                    });

                            // ==================================
                            // Total Received
                            // Includes initial booking payment
                            // ==================================

                            const paymentTotal =
                                await tx
                                    .bookingInstallmentPayment
                                    .aggregate({

                                        where: {
                                            bookingId,
                                        },

                                        _sum: {
                                            amount:
                                                true,
                                        },
                                    });

                            const totalReceived =
                                Number(
                                    paymentTotal
                                        ._sum
                                        .amount ??
                                    0
                                );

                            // ==================================
                            // Final Sale Value
                            // ==================================

                            let finalSaleValue:
                                number |
                                null =
                                null;

                            if (
                                booking
                                    .afterDiscountAmount !=
                                null
                            ) {

                                finalSaleValue =
                                    Number(
                                        booking
                                            .afterDiscountAmount
                                    );

                            } else if (
                                booking
                                    .totalAmount !=
                                null
                            ) {

                                finalSaleValue =
                                    Math.max(
                                        Number(
                                            booking
                                                .totalAmount
                                        ) -
                                        Number(
                                            booking
                                                .discount ??
                                            0
                                        ),
                                        0
                                    );
                            }

                            // ==================================
                            // Remaining Amount
                            //
                            // AUTO:
                            // Final Sale - Total Payments
                            //
                            // MANUAL:
                            // Existing manual value untouched
                            // ==================================

                            if (
                                booking
                                    .remainingAmountMode ===
                                    RemainingAmountMode
                                        .AUTO &&
                                finalSaleValue !=
                                null
                            ) {

                                await tx
                                    .booking
                                    .update({

                                        where: {
                                            id:
                                                bookingId,
                                        },

                                        data: {

                                            remainingAmount:
                                                Math.max(
                                                    finalSaleValue -
                                                    totalReceived,
                                                    0
                                                ),
                                        },
                                    });
                            }

                            return payment;
                        }
                    );

            // ==================================================
            // Reload Booking + Installments
            // ==================================================

            const booking =
                await prisma
                    .booking
                    .findUnique({

                        where: {
                            id:
                                bookingId,
                        },

                        select: {

                            id:
                                true,

                            bookingCode:
                                true,

                            amount:
                                true,

                            totalAmount:
                                true,

                            discount:
                                true,

                            afterDiscountAmount:
                                true,

                            remainingAmount:
                                true,

                            remainingAmountMode:
                                true,

                            installmentStages: {

                                orderBy: {
                                    sequence:
                                        "asc",
                                },

                                include: {

                                    payments: {

                                        orderBy: [
                                            {
                                                paymentDate:
                                                    "asc",
                                            },
                                            {
                                                createdAt:
                                                    "asc",
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    });

            if (
                !booking
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            // ==================================================
            // Format Stages
            // ==================================================

            const installmentStages =
                booking
                    .installmentStages
                    .map(
                        formatInstallmentStage
                    );

            // ==================================================
            // Summary
            // ==================================================

            const totalPlannedAmount =
                installmentStages
                    .reduce(
                        (
                            total:
                                number,
                            stage:
                                any
                        ) =>
                            total +
                            Number(
                                stage
                                    .plannedAmount ??
                                0
                            ),
                        0
                    );

            const totalReceivedAmount =
                installmentStages
                    .reduce(
                        (
                            total:
                                number,
                            stage:
                                any
                        ) =>
                            total +
                            Number(
                                stage
                                    .paidAmount ??
                                0
                            ),
                        0
                    );

            const totalBalanceAmount =
                Math.max(
                    totalPlannedAmount -
                    totalReceivedAmount,
                    0
                );

            // ==================================================
            // Current / Latest Installment
            // Latest stage that has received any payment
            // ==================================================

            const currentInstallment =
                [
                    ...installmentStages,
                ]
                    .reverse()
                    .find(
                        (
                            stage:
                                any
                        ) =>
                            stage
                                .paidAmount >
                            0
                    ) ??
                null;

            // ==================================================
            // Success
            // ==================================================

            return res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Installment payment added successfully",

                    data: {

                        payment: {

                            id:
                                createdPayment.id,

                            installmentId:
                                createdPayment
                                    .installmentId,

                            amount:
                                Number(
                                    createdPayment
                                        .amount
                                ),

                            paymentDate:
                                createdPayment
                                    .paymentDate
                                    .toISOString(),

                            paymentMode:
                                createdPayment
                                    .paymentMode,

                            referenceNo:
                                createdPayment
                                    .referenceNo,

                            remarks:
                                createdPayment
                                    .remarks,
                        },

                        booking: {

                            id:
                                booking.id,

                            bookingCode:
                                booking
                                    .bookingCode,

                            remainingAmount:
                                booking
                                    .remainingAmount,

                            remainingAmountMode:
                                booking
                                    .remainingAmountMode,
                        },

                        installmentStages,

                        installmentSummary: {

                            totalPlannedAmount,

                            totalReceivedAmount,

                            totalBalanceAmount,

                            currentInstallment:
                                currentInstallment
                                    ? {

                                        id:
                                            currentInstallment
                                                .id,

                                        sequence:
                                            currentInstallment
                                                .sequence,

                                        stageName:
                                            currentInstallment
                                                .stageName,

                                        percentage:
                                            currentInstallment
                                                .percentage,

                                        plannedAmount:
                                            currentInstallment
                                                .plannedAmount,

                                        paidAmount:
                                            currentInstallment
                                                .paidAmount,

                                        balanceAmount:
                                            currentInstallment
                                                .balanceAmount,

                                        status:
                                            currentInstallment
                                                .status,
                                    }
                                    : null,
                        },
                    },
                });

        } catch (
            error
        ) {

            console.error(
                "Add installment payment error:",
                error
            );

            // ==================================================
            // Booking Not Found
            // ==================================================

            if (
                error instanceof
                    Error &&
                error.message ===
                    "BOOKING_NOT_FOUND"
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Booking not found",
                    });
            }

            // ==================================================
            // Installment Not Found
            // ==================================================

            if (
                error instanceof
                    Error &&
                error.message ===
                    "INSTALLMENT_NOT_FOUND"
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Installment stage not found",
                    });
            }

            // ==================================================
            // Cancelled / Archived
            // ==================================================

            if (
                error instanceof
                    Error &&
                error.message ===
                    "BOOKING_NOT_ACTIVE"
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "Payments cannot be added to a cancelled or archived booking",
                    });
            }

            // ==================================================
            // Fully Paid
            // ==================================================

            if (
                error instanceof
                    Error &&
                error.message ===
                    "INSTALLMENT_ALREADY_PAID"
            ) {

                return res
                    .status(409)
                    .json({

                        success:
                            false,

                        message:
                            "This installment stage is already fully paid",
                    });
            }

            // ==================================================
            // Overpayment
            // ==================================================

            if (
                error instanceof
                    Error &&
                error.message
                    .startsWith(
                        "PAYMENT_EXCEEDS_STAGE_BALANCE:"
                    )
            ) {

                const balance =
                    Number(
                        error
                            .message
                            .split(
                                ":"
                            )[1] ??
                        0
                    );

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Payment amount exceeds installment balance",

                        stageBalance:
                            balance,
                    });
            }

            // ==================================================
            // Unknown Error
            // ==================================================

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Failed to add installment payment",

                    error:
                        error instanceof
                            Error
                            ? error.message
                            : "Unknown error",
                });
        }
    };