// ======================================================
// Residential Floor Map Data
// ======================================================
//
// A Block - Amogh
// 10 Floors × 10 Flats = 100
//
// B Block - Ekash
// Phase 1 = 40 Flats
// Phase 2 / B1 Tower = 40 Flats
// Total B = 80
//
// C Block - Ishan
// C1 Tower = 90 Flats
//
// Total Residential = 270 Flats
// ======================================================


// ======================================================
// Type
// ======================================================

export interface ResidentialFlat {
    id: string;
    number: string;

    block: string;
    phase: number;

    tower: string;
    towerName: string;

    floor: number;

    area: string;
    type: string;
    facing: string;

    status:
        | "available"
        | "booked"
        | "hold";
}


// ======================================================
// Existing Floor Map - Top Flats
// ======================================================
//
// KEEPING EXISTING A BLOCK DATA AS-IS
// ======================================================

export const topFlats = [

    {
        id: 1,
        number: "A-101",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
    },

    {
        id: 2,
        number: "A-102",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "booked",
    },

    {
        id: 3,
        number: "A-103",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
    },

    {
        id: 4,
        number: "A-104",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "hold",
    },

    {
        id: 5,
        number: "A-105",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
    },

];


// ======================================================
// Existing Floor Map - Bottom Flats
// ======================================================
//
// KEEPING EXISTING A BLOCK DATA AS-IS
// ======================================================

export const bottomFlats = [

    {
        id: 6,
        number: "A-110",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "hold",
    },

    {
        id: 7,
        number: "A-109",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
    },

    {
        id: 8,
        type: "stair",
    },

    {
        id: 9,
        type: "lobby",
    },

    {
        id: 10,
        type: "lift",
    },

    {
        id: 11,
        type: "lift",
    },

    {
        id: 12,
        number: "A-108",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "booked",
    },

    {
        id: 13,
        number: "A-107",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
    },

    {
        id: 14,
        number: "A-106",
        tower: "A",
        floor: 1,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
    },

];


// ======================================================
// A BLOCK - AMOGH
// ======================================================
//
// Existing structure:
// 10 Floors × 10 Flats = 100
//
// A-101 ... A-110
// A-201 ... A-210
// ...
// A-1001 ... A-1010
//
// EXISTING DATA PRESERVED
// ======================================================

const towerAFlats: ResidentialFlat[] = [];

for (
    let floor = 1;
    floor <= 10;
    floor++
) {

    for (
        let flat = 1;
        flat <= 10;
        flat++
    ) {

        const number =
            `A-${floor}${String(flat).padStart(2, "0")}`;

        towerAFlats.push({

            id:
                `A-${floor}-${flat}`,

            number,

            block: "A",

            phase: 1,

            tower: "A",

            towerName: "Amogh",

            floor,

            area: "1650 sqft",

            type: "3 BHK",

            facing: "East",

            status: "available",

        });

    }

}


// ======================================================
// B BLOCK - PHASE 1
// ======================================================
//
// Client Data:
//
// Floor 1  → 101, 102, 103, 104
// Floor 2  → 201, 202, 203, 204
// ...
// Floor 10 → 1001, 1002, 1003, 1004
//
// Total = 40
//
// Existing name/details preserved:
// Tower Name = Ekash
// Area       = 1650 sqft
// Type       = 3 BHK
// Facing     = East
// ======================================================

const bPhase1Flats: ResidentialFlat[] = [];

for (
    let floor = 1;
    floor <= 10;
    floor++
) {

    for (
        let flat = 1;
        flat <= 4;
        flat++
    ) {

        const number =
            `${floor}${String(flat).padStart(2, "0")}`;

        bPhase1Flats.push({

            id:
                `B-P1-${number}`,

            number,

            block: "B",

            phase: 1,

            tower: "B",

            towerName: "Ekash",

            floor,

            area: "1650 sqft",

            type: "3 BHK",

            facing: "East",

            status: "available",

        });

    }

}


// ======================================================
// B BLOCK - PHASE 2 / B1 TOWER
// ======================================================
//
// Client Data:
//
// Floor 1  → 105, 106, 107, 108
// Floor 2  → 205, 206, 207, 208
// ...
// Floor 10 → 1005, 1006, 1007, 1008
//
// Total = 40
//
// Existing name/details preserved:
// Tower Name = Ekash
// Area       = 1650 sqft
// Type       = 3 BHK
// Facing     = East
// ======================================================

const bPhase2Flats: ResidentialFlat[] = [];

for (
    let floor = 1;
    floor <= 10;
    floor++
) {

    for (
        let flat = 5;
        flat <= 8;
        flat++
    ) {

        const number =
            `${floor}${String(flat).padStart(2, "0")}`;

        bPhase2Flats.push({

            id:
                `B-P2-${number}`,

            number,

            block: "B",

            phase: 2,

            tower: "B1",

            towerName: "Ekash",

            floor,

            area: "1650 sqft",

            type: "3 BHK",

            facing: "East",

            status: "available",

        });

    }

}


// ======================================================
// C BLOCK - C1 TOWER
// ======================================================
//
// Client Data:
//
// Floor 1-5:
// 12 Flats Per Floor
//
// Floor 6-10:
// 6 Flats Per Floor
//
// Total:
// 60 + 30 = 90
//
// Existing name/details preserved:
// Tower Name = Ishan
// Area       = 1650 sqft
// Type       = 3 BHK
// Facing     = East
// ======================================================

const c1Flats: ResidentialFlat[] = [];

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
        let flat = 1;
        flat <= flatsOnFloor;
        flat++
    ) {

        const number =
            `${floor}${String(flat).padStart(2, "0")}`;

        c1Flats.push({

            id:
                `C1-${number}`,

            number,

            block: "C",

            phase: 1,

            tower: "C1",

            towerName: "Ishan",

            floor,

            area: "1650 sqft",

            type: "3 BHK",

            facing: "East",

            status: "available",

        });

    }

}


// ======================================================
// COMPLETE RESIDENTIAL INVENTORY
// ======================================================

export const residentialFlats: ResidentialFlat[] = [

    // ----------------------------------------------
    // A Block - Amogh
    // ----------------------------------------------

    ...towerAFlats,

    // ----------------------------------------------
    // B Block - Phase 1
    // ----------------------------------------------

    ...bPhase1Flats,

    // ----------------------------------------------
    // B Block - Phase 2 / B1
    // ----------------------------------------------

    ...bPhase2Flats,

    // ----------------------------------------------
    // C Block - C1
    // ----------------------------------------------

    ...c1Flats,

];


// ======================================================
// Individual Exports
// ======================================================

export {
    towerAFlats,
    bPhase1Flats,
    bPhase2Flats,
    c1Flats,
};


// ======================================================
// Inventory Summary
// ======================================================

export const residentialInventorySummary = {

    // A Block
    towerA:
        towerAFlats.length,

    // B Block
    bBlockPhase1:
        bPhase1Flats.length,

    bBlockPhase2:
        bPhase2Flats.length,

    bBlockTotal:
        bPhase1Flats.length +
        bPhase2Flats.length,

    // C Block
    c1Tower:
        c1Flats.length,

    // Overall
    total:
        residentialFlats.length,

};