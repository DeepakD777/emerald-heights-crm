// ======================================================
// Current Floor Map Data
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
// Complete Residential Inventory
// ======================================================
//
// Tower A - Amogh
// 10 Floors × 10 Flats = 100
//
// Tower B - Ekash
// 10 Floors × 8 Flats = 80
//
// Tower C - Ishan
// 10 Floors × 12 Flats = 120
//
// Total Residential = 300 Flats
// ======================================================

export const residentialFlats = [

  // ====================================================
  // Tower A - Amogh
  // ====================================================

  ...Array.from({ length: 10 }, (_, floorIndex) =>
    Array.from({ length: 10 }, (_, flatIndex) => {

      const floor = floorIndex + 1;
      const flat = flatIndex + 1;

      return {
        id: `A-${floor}-${flat}`,
        number: `A-${floor}${String(flat).padStart(2, "0")}`,
        tower: "A",
        towerName: "Amogh",
        floor,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
      };

    })
  ).flat(),

  // ====================================================
  // Tower B - Ekash
  // ====================================================

  ...Array.from({ length: 10 }, (_, floorIndex) =>
    Array.from({ length: 8 }, (_, flatIndex) => {

      const floor = floorIndex + 1;
      const flat = flatIndex + 1;

      return {
        id: `B-${floor}-${flat}`,
        number: `B-${floor}${String(flat).padStart(2, "0")}`,
        tower: "B",
        towerName: "Ekash",
        floor,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
      };

    })
  ).flat(),

  // ====================================================
  // Tower C - Ishan
  // ====================================================

  ...Array.from({ length: 10 }, (_, floorIndex) =>
    Array.from({ length: 12 }, (_, flatIndex) => {

      const floor = floorIndex + 1;
      const flat = flatIndex + 1;

      return {
        id: `C-${floor}-${flat}`,
        number: `C-${floor}${String(flat).padStart(2, "0")}`,
        tower: "C",
        towerName: "Ishan",
        floor,
        area: "1650 sqft",
        type: "3 BHK",
        facing: "East",
        status: "available",
      };

    })
  ).flat(),

];