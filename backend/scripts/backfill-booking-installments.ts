import "dotenv/config";
import {
    prisma,
} from "../src/lib/prisma";

import {
    PropertyType,
} from "../src/generated/prisma/enums";

// ======================================================
// Types
// ======================================================

type InstallmentPlanItem = {
    sequence: number;
    stageName: string;
    percentage: number;
};

// ======================================================
// Residential Plan
// ======================================================

const RESIDENTIAL_INSTALLMENT_PLAN:
    InstallmentPlanItem[] = [
        {
            sequence: 1,
            stageName:
                "Booking Amount",
            percentage: 10,
        },
        {
            sequence: 2,
            stageName:
                "On Completion up to Plinth",
            percentage: 15,
        },
        {
            sequence: 3,
            stageName:
                "After Completion of 1/3rd Floor Slabs (4th Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 4,
            stageName:
                "After Completion of 2/3rd Floor Slabs (7th Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 5,
            stageName:
                "After Completion of Entire Frame Structure",
            percentage: 10,
        },
        {
            sequence: 6,
            stageName:
                "After 50% Completion of Brick Work & Internal Plaster (up to 5th Floor)",
            percentage: 10,
        },
        {
            sequence: 7,
            stageName:
                "After 100% Completion of Brick Work & Internal Plaster (up to 5th Floor)",
            percentage: 10,
        },
        {
            sequence: 8,
            stageName:
                "After Completion of Flooring & External Plaster",
            percentage: 10,
        },
        {
            sequence: 9,
            stageName:
                "After Completion of Plumbing, Internal Electrification & Finishing Work",
            percentage: 10,
        },
        {
            sequence: 10,
            stageName:
                "At the Time of Possession & Registration of Sale Deed",
            percentage: 5,
        },
    ];

// ======================================================
// Commercial Plan
// ======================================================

const COMMERCIAL_INSTALLMENT_PLAN:
    InstallmentPlanItem[] = [
        {
            sequence: 1,
            stageName:
                "Booking Amount",
            percentage: 10,
        },
        {
            sequence: 2,
            stageName:
                "On Completion up to Plinth",
            percentage: 15,
        },
        {
            sequence: 3,
            stageName:
                "After Completion of 1/3rd Floor Slabs (1st Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 4,
            stageName:
                "After Completion of 2/3rd Floor Slabs (3rd Floor Slab)",
            percentage: 10,
        },
        {
            sequence: 5,
            stageName:
                "After Completion of Entire Frame Structure",
            percentage: 10,
        },
        {
            sequence: 6,
            stageName:
                "After 50% Completion of Brick Work & Internal Plaster (up to 1st Floor)",
            percentage: 10,
        },
        {
            sequence: 7,
            stageName:
                "After 100% Completion of Brick Work & Internal Plaster (up to 3rd Floor)",
            percentage: 10,
        },
        {
            sequence: 8,
            stageName:
                "After Completion of Flooring & External Plaster",
            percentage: 10,
        },
        {
            sequence: 9,
            stageName:
                "After Completion of Plumbing, Internal Electrification & Finishing Work",
            percentage: 10,
        },
        {
            sequence: 10,
            stageName:
                "At the Time of Possession & Registration of Sale Deed",
            percentage: 5,
        },
    ];

// ======================================================
// Plan Selector
// ======================================================

const getInstallmentPlan = (
    propertyType:
        PropertyType
): InstallmentPlanItem[] => {

    return propertyType ===
        PropertyType.COMMERCIAL
        ? COMMERCIAL_INSTALLMENT_PLAN
        : RESIDENTIAL_INSTALLMENT_PLAN;
};

// ======================================================
// Main
// ======================================================

const main =
    async () => {

        const apply =
            process.argv
                .includes(
                    "--apply"
                );

        console.log(
            apply
                ? "BACKFILL MODE: APPLY"
                : "BACKFILL MODE: DRY RUN"
        );

        console.log(
            "--------------------------------"
        );

        const bookings =
            await prisma
                .booking
                .findMany({

                    include: {

                        property:
                            true,

                        installmentStages: {
                            select: {
                                id:
                                    true,
                            },
                        },
                    },

                    orderBy: {
                        createdAt:
                            "asc",
                    },
                });

        let eligibleCount =
            0;

        let skippedExisting =
            0;

        let skippedNoValue =
            0;

        let createdCount =
            0;

        for (
            const booking of
            bookings
        ) {

            // ==============================================
            // Already Backfilled / New Booking
            // ==============================================

            if (
                booking
                    .installmentStages
                    .length >
                0
            ) {

                skippedExisting++;

                console.log(
                    `[SKIP] ${booking.bookingCode} - installment stages already exist`
                );

                continue;
            }

            // ==============================================
            // Final Sale Value
            // ==============================================

            const finalSaleValue =
                booking
                    .afterDiscountAmount !=
                null

                    ? Number(
                        booking
                            .afterDiscountAmount
                    )

                    : booking
                        .totalAmount !=
                    null

                        ? Math.max(
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
                        )

                        : null;

            if (
                finalSaleValue ==
                    null ||
                !Number.isFinite(
                    finalSaleValue
                ) ||
                finalSaleValue <=
                    0
            ) {

                skippedNoValue++;

                console.log(
                    `[SKIP] ${booking.bookingCode} - final sale value unavailable`
                );

                continue;
            }

            eligibleCount++;

            const plan =
                getInstallmentPlan(
                    booking
                        .property
                        .type
                );

            console.log(
                `[READY] ${booking.bookingCode} | ${booking.property.type} | ₹${finalSaleValue}`
            );

            if (
                !apply
            ) {

                continue;
            }

            // ==============================================
            // Transaction
            // ==============================================

            await prisma
                .$transaction(
                    async (
                        tx
                    ) => {

                        // ----------------------------------
                        // Re-check inside transaction
                        // Prevent accidental duplicate run
                        // ----------------------------------

                        const existingStage =
                            await tx
                                .bookingInstallmentStage
                                .findFirst({

                                    where: {
                                        bookingId:
                                            booking.id,
                                    },

                                    select: {
                                        id:
                                            true,
                                    },
                                });

                        if (
                            existingStage
                        ) {

                            return;
                        }

                        // ----------------------------------
                        // Create 10 Stages
                        // ----------------------------------

                        for (
                            const stage of
                            plan
                        ) {

                            const createdStage =
                                await tx
                                    .bookingInstallmentStage
                                    .create({

                                        data: {

                                            bookingId:
                                                booking.id,

                                            sequence:
                                                stage.sequence,

                                            stageName:
                                                stage.stageName,

                                            percentage:
                                                stage.percentage,

                                            plannedAmount:
                                                (
                                                    finalSaleValue *
                                                    stage.percentage
                                                ) /
                                                100,
                                        },
                                    });

                            // ------------------------------
                            // Existing Booking Amount
                            // becomes Stage 1 payment
                            // ------------------------------

                            if (
                                stage.sequence ===
                                    1 &&
                                booking.amount !=
                                    null &&
                                Number(
                                    booking.amount
                                ) >
                                    0
                            ) {

                                await tx
                                    .bookingInstallmentPayment
                                    .create({

                                        data: {

                                            bookingId:
                                                booking.id,

                                            installmentId:
                                                createdStage.id,

                                            amount:
                                                Number(
                                                    booking.amount
                                                ),

                                            paymentDate:
                                                booking
                                                    .bookingDate ??
                                                booking
                                                    .createdAt,

                                            paymentMode:
                                                "Existing Booking Payment",

                                            remarks:
                                                "Backfilled from existing booking amount",
                                        },
                                    });
                            }
                        }
                    }
                );

            createdCount++;

            console.log(
                `[DONE] ${booking.bookingCode}`
            );
        }

        console.log(
            "--------------------------------"
        );

        console.log(
            `Total bookings: ${bookings.length}`
        );

        console.log(
            `Eligible for backfill: ${eligibleCount}`
        );

        console.log(
            `Already had stages: ${skippedExisting}`
        );

        console.log(
            `Skipped without sale value: ${skippedNoValue}`
        );

        if (
            apply
        ) {

            console.log(
                `Bookings backfilled: ${createdCount}`
            );

        } else {

            console.log(
                "DRY RUN ONLY - database was not changed."
            );

            console.log(
                "Use --apply later to perform the backfill."
            );
        }
    };

// ======================================================
// Run
// ======================================================

main()
    .catch(
        (
            error
        ) => {

            console.error(
                "Backfill failed:",
                error
            );

            process.exitCode =
                1;
        }
    );
