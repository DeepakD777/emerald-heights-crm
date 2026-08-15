import { prisma } from "../src/lib/prisma";

import {
    PropertyStatus,
    PropertyType,
} from "../src/generated/prisma/enums";

// ======================================================
// Types
// ======================================================

type InventoryUnit = {
    propertyCode: string;
    name: string;

    type: PropertyType;

    phase: string;
    block?: string | null;
    tower?: string | null;
    floor: string;
    series?: string | null;
    unitNumber: string;

    description?: string | null;
};

// ======================================================
// Helpers
// ======================================================

const units: InventoryUnit[] = [];

const addUnit = (
    unit: InventoryUnit
) => {
    units.push(unit);
};

// ======================================================
// RESIDENTIAL
//
// B Block - Ekash
//
// Phase 1:
// 101-104 ... 1001-1004
//
// Phase 2 / B1 Tower:
// 105-108 ... 1005-1008
// ======================================================

const buildResidentialInventory = () => {
    // ----------------------------------------------------
    // B Block - Phase 1
    // 10 Floors x 4 Flats = 40
    // ----------------------------------------------------

    for (let floor = 1; floor <= 10; floor++) {
        for (let suffix = 1; suffix <= 4; suffix++) {
            const unitNumber =
                `${floor}${String(suffix).padStart(2, "0")}`;

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
                    "B Block - Ekash - Phase 1",
            });
        }
    }

    // ----------------------------------------------------
    // B Block - Phase 2 / B1 Tower
    // 10 Floors x 4 Flats = 40
    // ----------------------------------------------------

    for (let floor = 1; floor <= 10; floor++) {
        for (let suffix = 5; suffix <= 8; suffix++) {
            const unitNumber =
                `${floor}${String(suffix).padStart(2, "0")}`;

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
                    "B Block - Phase 2 - B1 Tower",
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
            `${tower} - ${phase} - ${floor}`,
    });
};

const shopCode = (
    series: string,
    number: number
) => {
    return `${series}${String(number).padStart(2, "0")}`;
};

// ======================================================
// COMMERCIAL PHASE 1
//
// Commercial Hub
//
// Ground  A Series
// First   B Series
// Second  C Series
// Third   D Series
//
// Each floor:
// 01-40
// 126-139
//
// 54 per floor
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

    for (const item of floors) {
        // Main block 01-40
        for (
            let number = 1;
            number <= 40;
            number++
        ) {
            addCommercialShop({
                phase: "Phase 1",
                tower: "Commercial Hub",
                floor: item.floor,
                series: item.series,
                shopNumber:
                    shopCode(
                        item.series,
                        number
                    ),
            });
        }

        // Additional shops 126-139
        for (
            let number = 126;
            number <= 139;
            number++
        ) {
            addCommercialShop({
                phase: "Phase 1",
                tower: "Commercial Hub",
                floor: item.floor,
                series: item.series,
                shopNumber:
                    `${item.series}${number}`,
            });
        }
    }
};

// ======================================================
// COMMERCIAL PHASE 2
//
// Commercial 1
//
// Ground:
// A41-A99
// A101-A125
// A100 DOES NOT EXIST
// Total = 84
//
// First:
// B41-B125
// B140-B141
// Total = 87
//
// Second:
// C41-C125
// C140-C141
// Total = 87
//
// Third:
// D41-D125
// D140
// Total = 86
//
// Total = 344
// ======================================================

const buildCommercialPhase2 = () => {
    // ----------------------------------------------------
    // Ground Floor - A Series
    // ----------------------------------------------------

    for (
        let number = 41;
        number <= 99;
        number++
    ) {
        addCommercialShop({
            phase: "Phase 2",
            tower: "Commercial 1",
            floor: "Ground Floor",
            series: "A",
            shopNumber:
                `A${number}`,
        });
    }

    // A100 intentionally does NOT exist.

    for (
        let number = 101;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase: "Phase 2",
            tower: "Commercial 1",
            floor: "Ground Floor",
            series: "A",
            shopNumber:
                `A${number}`,
        });
    }

    // ----------------------------------------------------
    // First Floor - B Series
    // B41-B125 + B140-B141
    // ----------------------------------------------------

    for (
        let number = 41;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase: "Phase 2",
            tower: "Commercial 1",
            floor: "1st Floor",
            series: "B",
            shopNumber:
                `B${number}`,
        });
    }

    for (const number of [140, 141]) {
        addCommercialShop({
            phase: "Phase 2",
            tower: "Commercial 1",
            floor: "1st Floor",
            series: "B",
            shopNumber:
                `B${number}`,
        });
    }

    // ----------------------------------------------------
    // Second Floor - C Series
    // C41-C125 + C140-C141
    // ----------------------------------------------------

    for (
        let number = 41;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase: "Phase 2",
            tower: "Commercial 1",
            floor: "2nd Floor",
            series: "C",
            shopNumber:
                `C${number}`,
        });
    }

    for (const number of [140, 141]) {
        addCommercialShop({
            phase: "Phase 2",
            tower: "Commercial 1",
            floor: "2nd Floor",
            series: "C",
            shopNumber:
                `C${number}`,
        });
    }

    // ----------------------------------------------------
    // Third Floor - D Series
    // D41-D125 + D140
    // ----------------------------------------------------

    for (
        let number = 41;
        number <= 125;
        number++
    ) {
        addCommercialShop({
            phase: "Phase 2",
            tower: "Commercial 1",
            floor: "3rd Floor",
            series: "D",
            shopNumber:
                `D${number}`,
        });
    }

    addCommercialShop({
        phase: "Phase 2",
        tower: "Commercial 1",
        floor: "3rd Floor",
        series: "D",
        shopNumber: "D140",
    });
};

// ======================================================
// Build Inventory
// ======================================================

buildResidentialInventory();
buildCommercialPhase1();
buildCommercialPhase2();

// ======================================================
// Validation before database changes
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

const commercialPhase1 =
    commercialUnits.filter(
        (unit) =>
            unit.phase === "Phase 1"
    );

const commercialPhase2 =
    commercialUnits.filter(
        (unit) =>
            unit.phase === "Phase 2"
    );

// Expected active inventory:
//
// Residential = 80
// Commercial P1 = 216
// Commercial P2 = 344
// Total = 640

if (residentialUnits.length !== 80) {
    throw new Error(
        `Residential inventory count incorrect. Expected 80, got ${residentialUnits.length}`
    );
}

if (commercialPhase1.length !== 216) {
    throw new Error(
        `Commercial Phase 1 count incorrect. Expected 216, got ${commercialPhase1.length}`
    );
}

if (commercialPhase2.length !== 344) {
    throw new Error(
        `Commercial Phase 2 count incorrect. Expected 344, got ${commercialPhase2.length}`
    );
}

if (units.length !== 640) {
    throw new Error(
        `Total inventory count incorrect. Expected 640, got ${units.length}`
    );
}

// Check duplicate property codes before DB
const propertyCodes =
    units.map(
        (unit) =>
            unit.propertyCode
    );

const uniquePropertyCodes =
    new Set(propertyCodes);

if (
    uniquePropertyCodes.size !==
    propertyCodes.length
) {
    throw new Error(
        "Duplicate propertyCode detected in seed inventory"
    );
}

// ======================================================
// Seed
// ======================================================

const seedInventory = async () => {
    console.log(
        "=========================================="
    );
    console.log(
        "Emerald Heights Inventory Seed Starting"
    );
    console.log(
        "=========================================="
    );

    console.log(
        `Residential Units: ${residentialUnits.length}`
    );

    console.log(
        `Commercial Phase 1: ${commercialPhase1.length}`
    );

    console.log(
        `Commercial Phase 2: ${commercialPhase2.length}`
    );

    console.log(
        `Total Initial Units: ${units.length}`
    );

    console.log("");

    let processed = 0;

    for (const unit of units) {
        await prisma.property.upsert({
            where: {
                propertyCode:
                    unit.propertyCode,
            },

            // IMPORTANT:
            // Do not reset Admin-controlled fields
            // such as status or Fine Dine selection.
            update: {
                name:
                    unit.name,

                type:
                    unit.type,

                phase:
                    unit.phase,

                block:
                    unit.block ?? null,

                tower:
                    unit.tower ?? null,

                floor:
                    unit.floor,

                series:
                    unit.series ?? null,

                unitNumber:
                    unit.unitNumber,

                description:
                    unit.description ?? null,
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
                    unit.phase,

                block:
                    unit.block ?? null,

                tower:
                    unit.tower ?? null,

                floor:
                    unit.floor,

                series:
                    unit.series ?? null,

                unitNumber:
                    unit.unitNumber,

                area:
                    null,

                price:
                    null,

                description:
                    unit.description ?? null,
            },
        });

        processed++;

        if (processed % 100 === 0) {
            console.log(
                `Processed ${processed}/${units.length}`
            );
        }
    }

    console.log("");
    console.log(
        "Inventory seed completed."
    );

    // ----------------------------------------------------
    // Database verification
    // Only count seeded property-code prefixes
    // ----------------------------------------------------

    const residentialCount =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith: "RES-B-",
                },
            },
        });

    const commercialP1Count =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith: "COM-P1-",
                },
            },
        });

    const commercialP2Count =
        await prisma.property.count({
            where: {
                propertyCode: {
                    startsWith: "COM-P2-",
                },
            },
        });

    console.log("");
    console.log(
        "Database Verification"
    );

    console.log(
        `Residential: ${residentialCount}`
    );

    console.log(
        `Commercial Phase 1: ${commercialP1Count}`
    );

    console.log(
        `Commercial Phase 2: ${commercialP2Count}`
    );

    console.log(
        `Seeded Total: ${residentialCount +
        commercialP1Count +
        commercialP2Count
        }`
    );

    if (
        residentialCount !== 80 ||
        commercialP1Count !== 216 ||
        commercialP2Count !== 344
    ) {
        throw new Error(
            "Database inventory verification failed"
        );
    }

    console.log("");
    console.log(
        "✅ INVENTORY VERIFIED SUCCESSFULLY"
    );
    console.log(
        "Residential = 80"
    );
    console.log(
        "Commercial Phase 1 = 216"
    );
    console.log(
        "Commercial Phase 2 = 344"
    );
    console.log(
        "Total Initial Inventory = 640"
    );
};

// ======================================================
// Run
// ======================================================

seedInventory()
    .catch((error) => {
        console.error(
            "❌ Inventory seed failed:",
            error
        );

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });