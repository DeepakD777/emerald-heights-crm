// ======================================================
// Commercial Inventory
// ======================================================
//
// Client Final Data:
//
// Ground Floor = 138 Shops
// 1st Floor    = 141 Shops
// 2nd Floor    = 141 Shops
// 3rd Floor    = 140 Shops
//
// Total Commercial = 560 Shops
// ======================================================

export const commercialShops = [
    // ====================================================
    // Ground Floor - 138 Shops
    // ====================================================

    ...Array.from({ length: 138 }, (_, index) => ({
        id: `G-${index + 1}`,
        number: `G-${String(index + 1).padStart(3, "0")}`,
        floor: 0,
        floorName: "Ground Floor",
        type: "shop",
        area: "500 sqft",
        status: "available",
    })),

    // ====================================================
    // 1st Floor - 141 Shops
    // ====================================================

    ...Array.from({ length: 141 }, (_, index) => ({
        id: `1-${index + 1}`,
        number: `S1-${String(index + 1).padStart(3, "0")}`,
        floor: 1,
        floorName: "1st Floor",
        type: "shop",
        area: "500 sqft",
        status: "available",
    })),

    // ====================================================
    // 2nd Floor - 141 Shops
    // ====================================================

    ...Array.from({ length: 141 }, (_, index) => ({
        id: `2-${index + 1}`,
        number: `S2-${String(index + 1).padStart(3, "0")}`,
        floor: 2,
        floorName: "2nd Floor",
        type: "shop",
        area: "500 sqft",
        status: "available",
    })),

    // ====================================================
    // 3rd Floor - 140 Shops
    // ====================================================

    ...Array.from({ length: 140 }, (_, index) => ({
        id: `3-${index + 1}`,
        number: `S3-${String(index + 1).padStart(3, "0")}`,
        floor: 3,
        floorName: "3rd Floor",
        type: "shop",
        area: "500 sqft",
        status: "available",
    })),
];