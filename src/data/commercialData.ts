// ======================================================
// Commercial Inventory
// ======================================================
//
// Client Final Data
//
// Phase 1 - Commercial Hub
// --------------------------------------
// Ground Floor = 54 Shops
// 1st Floor    = 54 Shops
// 2nd Floor   = 54 Shops
// 3rd Floor   = 54 Shops
//
// Phase 1 Total = 216 Shops
//
// Phase 2 - Commercial 1
// --------------------------------------
// Ground Floor = 84 Shops
// 1st Floor    = 87 Shops
// 2nd Floor   = 87 Shops
// 3rd Floor   = 86 Shops
//
// Phase 2 Total = 344 Shops
//
// ======================================================
// TOTAL COMMERCIAL = 560 SHOPS
// ======================================================

export interface CommercialShop {
    id: string;
    number: string;

    phase: 1 | 2;

    floor: number;
    floorName: string;

    series: "A" | "B" | "C" | "D";

    type: "shop";

    area: string;

    status:
        | "available"
        | "hold"
        | "booked";
}

// ======================================================
// Helper
// ======================================================

const createShops = (
    phase: 1 | 2,
    floor: number,
    floorName: string,
    series: "A" | "B" | "C" | "D",
    numbers: string[]
): CommercialShop[] => {

    return numbers.map(
        (number, index) => ({

            id:
                `P${phase}-${series}-${floor}-${index + 1}`,

            number,

            phase,

            floor,

            floorName,

            series,

            type: "shop",

            // Existing UI field preserved.
            // Client data did not provide shop area.
            area: "500 sqft",

            status: "available",

        })
    );

};

// ======================================================
// Exact Shop Number Lists
// ======================================================

// ======================================================
// PHASE 1 - COMMERCIAL HUB
// ======================================================

// ------------------------------------------------------
// Ground Floor - A Series
// A01 - A40
// A126 - A139
// Total = 54
// ------------------------------------------------------

const phase1Ground = [
    ...Array.from(
        { length: 40 },
        (_, index) =>
            `A${String(index + 1).padStart(2, "0")}`
    ),

    ...Array.from(
        { length: 14 },
        (_, index) =>
            `A${index + 126}`
    ),
];

// ------------------------------------------------------
// First Floor - B Series
// B01 - B40
// B126 - B139
// Total = 54
// ------------------------------------------------------

const phase1First = [
    ...Array.from(
        { length: 40 },
        (_, index) =>
            `B${String(index + 1).padStart(2, "0")}`
    ),

    ...Array.from(
        { length: 14 },
        (_, index) =>
            `B${index + 126}`
    ),
];

// ------------------------------------------------------
// Second Floor - C Series
// C01 - C40
// C126 - C139
// Total = 54
// ------------------------------------------------------

const phase1Second = [
    ...Array.from(
        { length: 40 },
        (_, index) =>
            `C${String(index + 1).padStart(2, "0")}`
    ),

    ...Array.from(
        { length: 14 },
        (_, index) =>
            `C${index + 126}`
    ),
];

// ------------------------------------------------------
// Third Floor - D Series
// D01 - D40
// D126 - D139
// Total = 54
// ------------------------------------------------------

const phase1Third = [
    ...Array.from(
        { length: 40 },
        (_, index) =>
            `D${String(index + 1).padStart(2, "0")}`
    ),

    ...Array.from(
        { length: 14 },
        (_, index) =>
            `D${index + 126}`
    ),
];


// ======================================================
// PHASE 2 - COMMERCIAL 1
// ======================================================

// ------------------------------------------------------
// Ground Floor - A Series
//
// A41 - A99
// A100 DOES NOT EXIST
// A101 - A125
//
// Total = 84
// ------------------------------------------------------

const phase2Ground = [

    ...Array.from(
        { length: 59 },
        (_, index) =>
            `A${index + 41}`
    ),

    ...Array.from(
        { length: 25 },
        (_, index) =>
            `A${index + 101}`
    ),

];

// ------------------------------------------------------
// First Floor - B Series
//
// B41 - B125
// B140 - B141
//
// Total = 87
// ------------------------------------------------------

const phase2First = [

    ...Array.from(
        { length: 85 },
        (_, index) =>
            `B${index + 41}`
    ),

    "B140",
    "B141",

];

// ------------------------------------------------------
// Second Floor - C Series
//
// C41 - C125
// C140 - C141
//
// Total = 87
// ------------------------------------------------------

const phase2Second = [

    ...Array.from(
        { length: 85 },
        (_, index) =>
            `C${index + 41}`
    ),

    "C140",
    "C141",

];

// ------------------------------------------------------
// Third Floor - D Series
//
// D41 - D125
// D140
//
// Total = 86
// ------------------------------------------------------

const phase2Third = [

    ...Array.from(
        { length: 85 },
        (_, index) =>
            `D${index + 41}`
    ),

    "D140",

];


// ======================================================
// FINAL COMMERCIAL INVENTORY
// ======================================================

export const commercialShops: CommercialShop[] = [

    // ==================================================
    // PHASE 1
    // ==================================================

    // Ground Floor
    ...createShops(
        1,
        0,
        "Ground Floor",
        "A",
        phase1Ground
    ),

    // First Floor
    ...createShops(
        1,
        1,
        "1st Floor",
        "B",
        phase1First
    ),

    // Second Floor
    ...createShops(
        1,
        2,
        "2nd Floor",
        "C",
        phase1Second
    ),

    // Third Floor
    ...createShops(
        1,
        3,
        "3rd Floor",
        "D",
        phase1Third
    ),


    // ==================================================
    // PHASE 2
    // ==================================================

    // Ground Floor
    ...createShops(
        2,
        0,
        "Ground Floor",
        "A",
        phase2Ground
    ),

    // First Floor
    ...createShops(
        2,
        1,
        "1st Floor",
        "B",
        phase2First
    ),

    // Second Floor
    ...createShops(
        2,
        2,
        "2nd Floor",
        "C",
        phase2Second
    ),

    // Third Floor
    ...createShops(
        2,
        3,
        "3rd Floor",
        "D",
        phase2Third
    ),

];