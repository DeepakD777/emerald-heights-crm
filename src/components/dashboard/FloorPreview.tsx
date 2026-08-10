// =========================================================
// Floor Preview Component
// =========================================================

import { useState } from "react";

import {
  Building2,
  Store,
  CheckCircle,
  Clock3,
  AlertCircle,
} from "lucide-react";

import { residentialFlats } from "../../data/floorData";
import { commercialShops } from "../../data/commercialData";

import { useFlat } from "../../context/FlatContext";

type PreviewType = "residential" | "commercial";

interface FloorStatus {
  floorNumber: number;
  name: string;
  total: number;
  available: number;
  booked: number;
  hold: number;
  occupied: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

function FloorPreview() {
  const [previewType, setPreviewType] =
    useState<PreviewType>("residential");

  const { flatStatuses } = useFlat();

  // =====================================================
  // Residential Flats with Actual Saved Status
  // =====================================================

  const flatsWithStatus = residentialFlats.map((flat) => {
    const savedStatus = flatStatuses.find(
      (item) => item.number === flat.number
    );

    return {
      ...flat,
      status: savedStatus?.status ?? flat.status,
    };
  });

  // =====================================================
  // Residential Floor Data
  // =====================================================

  const residentialFloors: FloorStatus[] = Array.from(
    { length: 10 },
    (_, index) => {
      const floorNumber = index + 1;

      const floorFlats = flatsWithStatus.filter(
        (flat) => flat.floor === floorNumber
      );

      const total = floorFlats.length;

      const booked = floorFlats.filter(
        (flat) => flat.status === "booked"
      ).length;

      const hold = floorFlats.filter(
        (flat) => flat.status === "hold"
      ).length;

      const available = floorFlats.filter(
        (flat) => flat.status === "available"
      ).length;

      const occupied = booked + hold;

      const percentage =
        total > 0
          ? Math.round((occupied / total) * 100)
          : 0;

      let color = "bg-green-500";

      let icon = (
        <CheckCircle
          className="text-green-600"
          size={18}
        />
      );

      if (percentage >= 70) {
        color = "bg-red-500";

        icon = (
          <AlertCircle
            className="text-red-500"
            size={18}
          />
        );
      } else if (percentage >= 40) {
        color = "bg-yellow-500";

        icon = (
          <Clock3
            className="text-yellow-500"
            size={18}
          />
        );
      }

      return {
        floorNumber,
        name: `Floor ${floorNumber}`,
        total,
        available,
        booked,
        hold,
        occupied,
        percentage,
        color,
        icon,
      };
    }
  );

  // =====================================================
  // Commercial Floor Data
  // =====================================================

  const commercialFloors: FloorStatus[] = [
    {
      floorNumber: 0,
      name: "Ground Floor",
      total: 0,
      available: 0,
      booked: 0,
      hold: 0,
      occupied: 0,
      percentage: 0,
      color: "bg-green-500",
      icon: (
        <CheckCircle
          className="text-green-600"
          size={18}
        />
      ),
    },
    {
      floorNumber: 1,
      name: "1st Floor",
      total: 0,
      available: 0,
      booked: 0,
      hold: 0,
      occupied: 0,
      percentage: 0,
      color: "bg-green-500",
      icon: (
        <CheckCircle
          className="text-green-600"
          size={18}
        />
      ),
    },
    {
      floorNumber: 2,
      name: "2nd Floor",
      total: 0,
      available: 0,
      booked: 0,
      hold: 0,
      occupied: 0,
      percentage: 0,
      color: "bg-green-500",
      icon: (
        <CheckCircle
          className="text-green-600"
          size={18}
        />
      ),
    },
    {
      floorNumber: 3,
      name: "3rd Floor",
      total: 0,
      available: 0,
      booked: 0,
      hold: 0,
      occupied: 0,
      percentage: 0,
      color: "bg-green-500",
      icon: (
        <CheckCircle
          className="text-green-600"
          size={18}
        />
      ),
    },
  ];

  // =====================================================
  // Calculate Actual Commercial Status
  // =====================================================

  commercialFloors.forEach((floor) => {
    const shops = commercialShops.filter(
      (shop) => shop.floor === floor.floorNumber
    );

    floor.total = shops.length;

    floor.available = shops.filter(
      (shop) => shop.status === "available"
    ).length;

    floor.booked = shops.filter(
      (shop) => shop.status === "booked"
    ).length;

    floor.hold = shops.filter(
      (shop) => shop.status === "hold"
    ).length;

    floor.occupied = floor.booked + floor.hold;

    floor.percentage =
      floor.total > 0
        ? Math.round(
            (floor.occupied / floor.total) * 100
          )
        : 0;

    floor.color = "bg-green-500";

    floor.icon = (
      <CheckCircle
        className="text-green-600"
        size={18}
      />
    );

    if (floor.percentage >= 70) {
      floor.color = "bg-red-500";

      floor.icon = (
        <AlertCircle
          className="text-red-500"
          size={18}
        />
      );
    } else if (floor.percentage >= 40) {
      floor.color = "bg-yellow-500";

      floor.icon = (
        <Clock3
          className="text-yellow-500"
          size={18}
        />
      );
    }
  });

  const floors =
    previewType === "residential"
      ? residentialFloors
      : commercialFloors;

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      {/* ==================================================
          Heading
      ================================================== */}

      <div className="mb-4 flex items-start gap-2">
        {previewType === "residential" ? (
          <Building2
            className="mt-0.5 text-green-600"
            size={22}
          />
        ) : (
          <Store
            className="mt-0.5 text-green-600"
            size={22}
          />
        )}

        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Floor Preview
          </h2>

          <p className="text-sm text-gray-500">
            {previewType === "residential"
              ? "Residential floor occupancy"
              : "Commercial floor occupancy"}
          </p>
        </div>
      </div>

      {/* ==================================================
          Residential / Commercial Toggle
      ================================================== */}

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() =>
            setPreviewType("residential")
          }
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            previewType === "residential"
              ? "bg-green-700 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Residential
        </button>

        <button
          type="button"
          onClick={() =>
            setPreviewType("commercial")
          }
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            previewType === "commercial"
              ? "bg-green-700 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Commercial
        </button>
      </div>

      {/* ==================================================
          Floors
      ================================================== */}

      <div className="h-64 space-y-4 overflow-y-auto pr-2">
        {floors.map((floor) => (
          <div key={floor.floorNumber}>
            {/* Floor Header */}

            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {floor.icon}

                <span className="font-medium text-gray-700">
                  {floor.name}
                </span>
              </div>

              <span className="text-sm font-semibold text-gray-600">
                {floor.percentage}%
              </span>
            </div>

            {/* Progress Bar */}

            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`${floor.color} h-2 rounded-full transition-all duration-500`}
                style={{
                  width: `${floor.percentage}%`,
                }}
              />
            </div>

            {/* Floor Stats */}

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
              <span>
                Total: {floor.total}
              </span>

              <span className="text-green-600">
                Available: {floor.available}
              </span>

              <span className="text-red-600">
                Booked: {floor.booked}
              </span>

              <span className="text-yellow-600">
                Hold: {floor.hold}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FloorPreview;