import { useState } from "react";
import { useBooking } from "../../context/BookingContext";
import { topFlats, bottomFlats } from "../../data/floorData";
import FlatModal from "./FlatModal";

function getColor(status: string) {
  switch (status) {
    case "available":
      return "bg-green-100 border-green-400";

    case "booked":
      return "bg-red-100 border-red-400";

    case "hold":
      return "bg-yellow-100 border-yellow-400";

    default:
      return "bg-gray-100 border-gray-300";
  }
}

function FloorMap() {
  const [topFlatsData, setTopFlatsData] = useState(topFlats);
  const [bottomFlatsData, setBottomFlatsData] = useState(bottomFlats);
  const [selectedFlat, setSelectedFlat] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  // const [bookings, setBookings] = useState<any[]>([]);
 const { addBooking } = useBooking();

  const openFlat = (flat: any) => {
    setSelectedFlat(flat);
    setIsOpen(true);
  };
  const handleSaveFlat = (updatedFlat: any) => {

    setTopFlatsData((prev) =>
      prev.map((flat) =>
        flat.id === updatedFlat.id ? updatedFlat : flat
      )
    );

    setBottomFlatsData((prev) =>
      prev.map((item) => {
        if ("id" in item && item.id === updatedFlat.id) {
          return updatedFlat;
        }

        return item;
      })
    );

    setSelectedFlat(updatedFlat);
    setIsOpen(false);

  };
  const handleBooking = (bookingData: any) => {
   addBooking(bookingData);

    // Update Top Flats
    setTopFlatsData((prev) =>
      prev.map((flat) =>
        flat.number === bookingData.flatNumber
          ? {
            ...flat,
            status: "booked",
          }
          : flat
      )
    );

    // Update Bottom Flats
    setBottomFlatsData((prev: any[]) =>
      prev.map((item: any) => {
        if (item.number === bookingData.flatNumber) {
          return {
            ...item,
            status: "booked",
          };
        }

        return item;
      })
    );

    // Update Selected Flat
    if (selectedFlat?.number === bookingData.flatNumber) {
      setSelectedFlat({
        ...selectedFlat,
        status: "booked",
      });
    }

    setIsOpen(false);
  };

  return (

    <div className="bg-white rounded-2xl shadow p-6">

      {/* Heading */}
      <h2 className="text-2xl font-bold">
        Residential Floor Overview
      </h2>

      <p className="text-gray-500 mt-1">
        Tower A - Floor Layout
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6">

        <div className="flex gap-2">

          <button className="px-4 py-2 rounded-lg bg-green-600 text-white">
            All
          </button>

          {[1, 2, 3, 4, 5].map((floor) => (

            <button
              key={floor}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              {floor}
            </button>

          ))}

        </div>

        <select className="border rounded-lg px-4 py-2">

          <option>Tower A</option>
          <option>Tower B</option>

        </select>

      </div>

      {/* Layout */}

      <div className="mt-8 space-y-6">

        {/* Top Flats */}

        <div className="grid grid-cols-5 gap-4">

          {topFlatsData.map((flat) => (

            <div
              key={flat.id}
              onClick={() => openFlat(flat)}
              className={`cursor-pointer rounded-lg border p-4 text-center transition hover:scale-105 ${getColor(flat.status)}`}
            >

              <h3 className="font-bold text-lg">
                {flat.number}
              </h3>

              <p className="text-gray-600">
                {flat.area}
              </p>

            </div>

          ))}

        </div>

        {/* Bottom Row */}

        <div className="grid grid-cols-9 gap-3">

          {bottomFlatsData.map((item) => {

            if (item.type === "stair") {
              return (

                <div
                  key={item.id}
                  className="bg-gray-100 border rounded-lg flex items-center justify-center h-24 font-semibold"
                >
                  STAIR
                </div>

              );
            }

            if (item.type === "lobby") {
              return (

                <div
                  key={item.id}
                  className="bg-gray-200 border rounded-lg flex items-center justify-center h-24 font-semibold"
                >
                  LOBBY
                </div>

              );
            }

            if (item.type === "lift") {
              return (

                <div
                  key={item.id}
                  className="bg-gray-100 border rounded-lg flex items-center justify-center h-24 font-semibold"
                >
                  LIFT
                </div>

              );
            }

            return (

              <div
                key={item.id}
                onClick={() => openFlat(item)}
                className={`cursor-pointer rounded-lg border p-4 text-center transition hover:scale-105 ${getColor(item.status!)}`}
              >

                <h3 className="font-bold">
                  {item.number}
                </h3>

                <p className="text-gray-600">
                  {item.area}
                </p>

              </div>

            );

          })}

        </div>

      </div>

      {/* Legend */}

      <div className="flex gap-8 mt-8 text-sm">

        <div className="flex items-center gap-2">

          <div className="w-4 h-4 rounded bg-green-500"></div>

          Available

        </div>

        <div className="flex items-center gap-2">

          <div className="w-4 h-4 rounded bg-yellow-400"></div>

          Hold

        </div>

        <div className="flex items-center gap-2">

          <div className="w-4 h-4 rounded bg-red-500"></div>

          Booked

        </div>

      </div>

      <FlatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSaveFlat}
        onBooking={handleBooking}
        flat={selectedFlat}
      />

    </div>

  );

}

export default FloorMap;