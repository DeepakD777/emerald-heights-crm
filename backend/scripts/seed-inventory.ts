import { prisma } from "../src/lib/prisma";

import {
    PropertyStatus,
    PropertyType,
} from "../src/generated/prisma/enums";

// ======================================================
// TYPES
// ======================================================

type InventoryUnit = {
    propertyCode: string;
    name: string;

    type: PropertyType;

    phase?: string | null;
    block?: string | null;
    tower?: string | null;
    floor: string;
    series?: string | null;
    unitNumber: string;

    description?: string | null;
};

// ======================================================
// HELPERS
// ======================================================

const units: InventoryUnit[] = [];

const addUnit = (
    unit: InventoryUnit
) => {
    units.push(unit);
};

const residentialUnitNumber = (
    floor: number,
    suffix: number
) => {
    return `${floor}${String(suffix).padStart(2, "0")}`;
};

// ======================================================
// RESIDENTIAL
// ======================================================

const buildResidentialInventory = () => {

    // ==================================================
    // A BLOCK - AMOGH
    //
    // No Phase
    // 10 Floors
    // 10 Flats / Floor
    // Total = 100
    // ==================================================

    for (
        let floor = 1;
        floor <= 10;
        floor++
    ) {
        for (
            let suffix = 1;
            suffix <= 10;
            suffix++
        ) {
            const unitNumber =
                residentialUnitNumber(
                    floor,
                    suffix
                );

            addUnit({
                propertyCode:
                    `RES-A-${unitNumber}`,

                name:
                    `Flat ${unitNumber}`,

                type:
                    PropertyType.RESIDENTIAL,

                phase:
                    null,

                block:
                    "A Block",

                tower:
                    "Amogh",

                floor:
                    String(floor),

                series:
                    null,

                unitNumber,

                description:
                    "A Block - Amogh",
            });
        }
    }

    // ==================================================
    // B BLOCK - EKASH
    //
    // Internal Phase 1
    // UI Label = B
    //
    // 10 Floors x 4 = 40
    // 101-104 ... 1001-1004
    // ==================================================

    for (
        let floor = 1;
        floor <= 10;
        floor++
    ) {
        for (
            let suffix = 1;
            suffix <= 4;
            suffix++
        ) {
            const unitNumber =
                residentialUnitNumber(
                    floor,
                    suffix
                );

            addUnit({
                propertyCode:
                    `RES-B-P1-${unitNumber}`,

                name:
                    `Flat ${unitNumber}`,

                type:
                    PropertyType.RESIDENTIAL,

                phase:
                    "Phase 1",

                block:
                    "B Block",

                tower:
                    "Ekash",

                floor:
                    String(floor),

                series:
                    null,

                unitNumber,

                description:
                    "B Block - Ekash - B",
            });
        }
    }

    // ==================================================
    // B1
    //
    // Internal Phase 2
    // UI Label = B1
    //
    // 10 Floors x 4 = 40
    // 105-108 ... 1005-1008
    // ==================================================

    for (
        let floor = 1;
        floor <= 10;
        floor++
    ) {
        for (
            let suffix = 5;
            suffix <= 8;
            suffix++
        ) {
            const unitNumber =
                residentialUnitNumber(
                    floor,
                    suffix
                );

            addUnit({
                propertyCode:
                    `RES-B-P2-${unitNumber}`,

                name:
                    `Flat ${unitNumber}`,

                type:
                    PropertyType.RESIDENTIAL,

                phase:
                    "Phase 2",

                block:
                    "B Block",

                tower:
                    "B1 Tower",

                floor:
                    String(floor),

                series:
                    null,

                unitNumber,

                description:
                    "B Block - Ekash - B1",
            });
        }
    }

    // ==================================================
    // C1 TOWER - ISHAN
    //
    // No Phase
    //
    // Floor 1-5:
    // 12 Flats x 5 = 60
    //
    // Floor 6-10:
    // 6 Flats x 5 = 30
    //
    // Total = 90
    // ==================================================

    for (
        let floor = 1;
        floor <= 10;
        floor++
    ) {
        const flatsOnFloor =
            floor <= 5
                ? 12
                : 6;

        for (
            let suffix = 1;
            suffix <= flatsOnFloor;
            suffix++
        ) {
            const unitNumber =
                residentialUnitNumber(
                    floor,
                    suffix
                );

            addUnit({
                propertyCode:
                    `RES-C1-${unitNumber}`,

                name:
                    `Flat ${unitNumber}`,

                type:
                    PropertyType.RESIDENTIAL,

                phase:
                    null,

                block:
                    "C1 Tower",

                tower:
                    "Ishan",

                floor:
                    String(floor),

                series:
                    null,

                unitNumber,

                description:
                    "C1 Tower - Ishan",
            });
        }
    }
};

// ======================================================
// COMMERCIAL HELPERS
// ======================================================

const addCommercialShop = ({
    phase,
    tower,
    floor,
    series,
    shopNumber,
}: {
    phase: string;
    tower: string;
    floor: string;
    series: string;
    shopNumber: string;
}) => {

    const phaseCode =
        phase === "Phase 1"
            ? "P1"
            : "P2";

    addUnit({
        propertyCode:
            `COM-${phaseCode}-${shopNumber}`,

        name:
            `Shop ${shopNumber}`,

        type:
            PropertyType.COMMERCIAL,

        phase,

        block:
            null,

        tower,

        floor,

        series,

        unitNumber:
            shopNumber,

        description:
            `${tower} - ${floor}`,
    });
};

const shopCode = (
    series: string,
    number: number
) => {
    return `${series}${String(number).padStart(2, "0")}`;
};

// ======================================================
// COMMERCIAL
//
// Internal Phase 1
// UI Label = Commercial
//
// 54 Shops / Floor
// 4 Floors
// Total = 216
// ======================================================

const buildCommercialPhase1 = () => {

    const floors = [
        {
            floor: "Ground Floor",
            series: "A",
        },
        {
            floor: "1st Floor",
            series: "B",
        },
        {
            floor: "2nd Floor",
            series: "C",
        },
        {
            floor: "3rd Floor",
            series: "D",
        },
    ];

    for (
        const item of floors
    ) {

        // 01-40
        for (
            let number = 1;
            number <= 40;
            number++
        ) {
            addCommercialShop({
                phase:
                    "Phase 1",

                tower:
                    "Commercial",

                floor:
                    item.floor,

                series:
                    item.series,

                shopNumber:
                    shopCode(
                        item.series,
                        number
                    ),
            });
        }

        // 126-139
        for (
            let number = 126;
            number <= 139;
            number++
        ) {
            addCommercialShop({
                phase:
                    "Phase 1",

                tower:
                    "Commercial",

                floor:
                    item.floor,

                series:
                    item.series,

                shopNumber:
                    `${item.series}${number}`,
            });
        }
    }
};

// ======================================================
// COMMERCIAL 1
//
// Internal Phase 2
// UI Label = Commercial 1
//
// Ground = 84
// 1st = 87
// 2nd = 87
// 3rd = 86
//
// Total = 344
// ======================================================

const buildCommercialPhase2 = () => {

    // --------------------------------------------------
    // Ground Floor
    // A41-A99
    // A101-A125
    // A100 does not exist
    // --------------------------------------------------

    for (
        let number = 41;
        number <= 99;
        number++
    ) {
        addCommercialShop({
            phase:
                "Phase 2",

            tower:
                "Commercial 1",

            floor:
                "Ground Floor",

            series:
                "A",

            shopNumber:
                `A${number}`,
        });
    }

    for (
        let number = 101;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase:
                "Phase 2",

            tower:
                "Commercial 1",

            floor:
                "Ground Floor",

            series:
                "A",

            shopNumber:
                `A${number}`,
        });
    }

    // --------------------------------------------------
    // First Floor
    // B41-B125 + B140-B141
    // --------------------------------------------------

    for (
        let number = 41;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase:
                "Phase 2",

            tower:
                "Commercial 1",

            floor:
                "1st Floor",

            series:
                "B",

            shopNumber:
                `B${number}`,
        });
    }

    for (
        const number of [
            140,
            141,
        ]
    ) {
        addCommercialShop({
            phase:
                "Phase 2",

            tower:
                "Commercial 1",

            floor:
                "1st Floor",

            series:
                "B",

            shopNumber:
                `B${number}`,
        });
    }

    // --------------------------------------------------
    // Second Floor
    // C41-C125 + C140-C141
    // --------------------------------------------------

    for (
        let number = 41;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase:
                "Phase 2",

            tower:
                "Commercial 1",

            floor:
                "2nd Floor",

            series:
                "C",

            shopNumber:
                `C${number}`,
        });
    }

    for (
        const number of [
            140,
            141,
        ]
    ) {
        addCommercialShop({
            phase:
                "Phase 2",

            tower:
                "Commercial 1",

            floor:
                "2nd Floor",

            series:
                "C",

            shopNumber:
                `C${number}`,
        });
    }

    // --------------------------------------------------
    // Third Floor
    // D41-D125 + D140
    // --------------------------------------------------

    for (
        let number = 41;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase:
                "Phase 2",

            tower:
                "Commercial 1",

            floor:
                "3rd Floor",

            series:
                "D",

            shopNumber:
                `D${number}`,
        });
    }

    addCommercialShop({
        phase:
            "Phase 2",

        tower:
            "Commercial 1",

        floor:
            "3rd Floor",

        series:
            "D",

        shopNumber:
            "D140",
    });
};

// ======================================================
// BUILD INVENTORY
// ======================================================

buildResidentialInventory();
buildCommercialPhase1();
buildCommercialPhase2();

// ======================================================
// GROUPS
// ======================================================

const residentialUnits =
    units.filter(
        (unit) =>
            unit.type ===
            PropertyType.RESIDENTIAL
    );

const commercialUnits =
    units.filter(
        (unit) =>
            unit.type ===
            PropertyType.COMMERCIAL
    );

const residentialA =
    residentialUnits.filter(
        (unit) =>
            unit.block ===
            "A Block"
    );

const residentialB =
    residentialUnits.filter(
        (unit) =>
            unit.block ===
            "B Block"
    );

const residentialC1 =
    residentialUnits.filter(
        (unit) =>
            unit.block ===
            "C1 Tower"
    );

const residentialBSection =
    residentialB.filter(
        (unit) =>
            unit.phase ===
            "Phase 1"
    );

const residentialB1Section =
    residentialB.filter(
        (unit) =>
            unit.phase ===
            "Phase 2"
    );

const commercialPhase1 =
    commercialUnits.filter(
        (unit) =>
            unit.phase ===
            "Phase 1"
    );

const commercialPhase2 =
    commercialUnits.filter(
        (unit) =>
            unit.phase ===
            "Phase 2"
    );

// ======================================================
// VALIDATION
//
// Residential:
// A = 100
// B = 40
// B1 = 40
// C1 = 90
//
// Total Residential = 270
//
// Commercial = 216
// Commercial 1 = 344
//
// Total Commercial = 560
//
// Grand Total = 830
// ======================================================

if (
    residentialA.length !==
    100
) {
    throw new Error(
        `A Block count incorrect. Expected 100, got ${residentialA.length}`
    );
}

if (
    residentialBSection.length !==
    40
) {
    throw new Error(
        `B section count incorrect. Expected 40, got ${residentialBSection.length}`
    );
}

if (
    residentialB1Section.length !==
    40
) {
    throw new Error(
        `B1 section count incorrect. Expected 40, got ${residentialB1Section.length}`
    );
}

if (
    residentialB.length !==
    80
) {
    throw new Error(
        `B Block count incorrect. Expected 80, got ${residentialB.length}`
    );
}

if (
    residentialC1.length !==
    90
) {
    throw new Error(
        `C1 Tower count incorrect. Expected 90, got ${residentialC1.length}`
    );
}

if (
    residentialUnits.length !==
    270
) {
    throw new Error(
        `Residential inventory count incorrect. Expected 270, got ${residentialUnits.length}`
    );
}

if (
    commercialPhase1.length !==
    216
) {
    throw new Error(
        `Commercial count incorrect. Expected 216, got ${commercialPhase1.length}`
    );
}

if (
    commercialPhase2.length !==
    344
) {
    throw new Error(
        `Commercial 1 count incorrect. Expected 344, got ${commercialPhase2.length}`
    );
}

if (
    commercialUnits.length !==
    560
) {
    throw new Error(
        `Commercial inventory count incorrect. Expected 560, got ${commercialUnits.length}`
    );
}

if (
    units.length !==
    830
) {
    throw new Error(
        `Total inventory count incorrect. Expected 830, got ${units.length}`
    );
}

// ======================================================
// DUPLICATE PROPERTY CODE CHECK
// ======================================================

const propertyCodes =
    units.map(
        (unit) =>
            unit.propertyCode
    );

const uniquePropertyCodes =
    new Set(
        propertyCodes
    );

if (
    uniquePropertyCodes.size !==
    propertyCodes.length
) {
    throw new Error(
        "Duplicate propertyCode detected in inventory"
    );
}

// ======================================================
// SEED
// ======================================================

const seedInventory =
    async () => {

    console.log(
        "=========================================="
    );

    console.log(
        "Emerald Heights Final Inventory Seed"
    );

    console.log(
        "=========================================="
    );

    console.log(
        `A Block - Amogh: ${residentialA.length}`
    );

    console.log(
        `B: ${residentialBSection.length}`
    );

    console.log(
        `B1: ${residentialB1Section.length}`
    );

    console.log(
        `C1 Tower - Ishan: ${residentialC1.length}`
    );

    console.log(
        `Residential Total: ${residentialUnits.length}`
    );

    console.log(
        `Commercial: ${commercialPhase1.length}`
    );

    console.log(
        `Commercial 1: ${commercialPhase2.length}`
    );

    console.log(
        `Commercial Total: ${commercialUnits.length}`
    );

    console.log(
        `Grand Total: ${units.length}`
    );

    console.log("");

    // ==================================================
    // REMOVE LEGACY C BLOCK
    //
    // Old provisional records:
    // RES-C-*
    //
    // C1 uses RES-C1-* and is NOT affected.
    // ==================================================

    const legacyCProperties =
        await prisma.property.findMany({
            where: {
                propertyCode: {
                    startsWith:
                        "RES-C-",
                },
            },

            select: {
                id:
                    true,

                propertyCode:
                    true,

                _count: {
                    select: {
                        bookings:
                            true,
                    },
                },
            },
        });

    const legacyCWithBookings =
        legacyCProperties.filter(
            (property) =>
                property._count
                    .bookings > 0
        );

    if (
        legacyCWithBookings.length >
        0
    ) {

        const codes =
            legacyCWithBookings
                .map(
                    (property) =>
                        property.propertyCode
                )
                .join(", ");

        throw new Error(
            `Cannot remove legacy C Block. Booking history exists for: ${codes}`
        );
    }

    if (
        legacyCProperties.length >
        0
    ) {

        const deleted =
            await prisma.property.deleteMany({
                where: {
                    propertyCode: {
                        startsWith:
                            "RES-C-",
                    },
                },
            });

        console.log(
            `Removed legacy C Block properties: ${deleted.count}`
        );

        console.log("");
    }

    // ==================================================
    // UPSERT FINAL INVENTORY
    // ==================================================

    let processed = 0;

    for (
        const unit of units
    ) {

        await prisma.property.upsert({

            where: {
                propertyCode:
                    unit.propertyCode,
            },

            // Preserve:
            // status
            // Fine Dine
            // area
            // price
            //
            // Only hierarchy/master data updated.

            update: {
                name:
                    unit.name,

                type:
                    unit.type,

                phase:
                    unit.phase ??
                    null,

                block:
                    unit.block ??
                    null,

                tower:
                    unit.tower ??
                    null,

                floor:
                    unit.floor,

                series:
                    unit.series ??
                    null,

                unitNumber:
                    unit.unitNumber,

                description:
                    unit.description ??
                    null,
            },

            create: {
                propertyCode:
                    unit.propertyCode,

                name:
                    unit.name,

                type:
                    unit.type,

                status:
                    PropertyStatus.AVAILABLE,

                isFineDine:
                    false,

                phase:
                    unit.phase ??
                    null,

                block:
                    unit.block ??
                    null,

                tower:
                    unit.tower ??
                    null,

                floor:
                    unit.floor,

                series:
                    unit.series ??
                    null,

                unitNumber:
                    unit.unitNumber,

                area:
                    null,

                price:
                    null,

                description:
                    unit.description ??
                    null,
            },
        });

        processed++;

        if (
            processed % 100 ===
            0
        ) {
            console.log(
                `Processed ${processed}/${units.length}`
            );
        }
    }

    // ==================================================
    // DATABASE VERIFICATION
    // ==================================================

    const dbA =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith:
                        "RES-A-",
                },
            },
        });

    const dbB =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith:
                        "RES-B-",
                },
            },
        });

    const dbC =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith:
                        "RES-C-",
                },
            },
        });

    const dbC1 =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith:
                        "RES-C1-",
                },
            },
        });

    const dbCommercial =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith:
                        "COM-P1-",
                },
            },
        });

    const dbCommercial1 =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith:
                        "COM-P2-",
                },
            },
        });

    const verifiedTotal =
        dbA +
        dbB +
        dbC1 +
        dbCommercial +
        dbCommercial1;

    console.log("");
    console.log(
        "DATABASE VERIFICATION"
    );

    console.log(
        `A Block: ${dbA}`
    );

    console.log(
        `B Block: ${dbB}`
    );

    console.log(
        `Legacy C Block: ${dbC}`
    );

    console.log(
        `C1 Tower: ${dbC1}`
    );

    console.log(
        `Commercial: ${dbCommercial}`
    );

    console.log(
        `Commercial 1: ${dbCommercial1}`
    );

    console.log(
        `Verified Total: ${verifiedTotal}`
    );

    if (
        dbA !== 100 ||
        dbB !== 80 ||
        dbC !== 0 ||
        dbC1 !== 90 ||
        dbCommercial !== 216 ||
        dbCommercial1 !== 344 ||
        verifiedTotal !== 830
    ) {

        throw new Error(
            "Database final inventory verification failed"
        );
    }

    console.log("");
    console.log(
        "✅ FINAL INVENTORY VERIFIED"
    );

    console.log(
        "Residential = 270"
    );

    console.log(
        "Commercial = 560"
    );

    console.log(
        "Grand Total = 830"
    );
};

// ======================================================
// RUN
// ======================================================

seedInventory()
    .catch(
        (
            error
        ) => {

            console.error(
                "❌ Inventory seed failed:",
                error
            );

            process.exitCode =
                1;
        }
    )
    .finally(
        async () => {

            await prisma.$disconnect();
        }
    );