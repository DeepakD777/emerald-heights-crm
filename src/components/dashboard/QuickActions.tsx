import {
  PlusCircle,
  UserPlus,
  Building2,
  Receipt,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Quick Actions
      </h2>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* New Booking */}
        <button
          onClick={() => navigate("/bookings")}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-green-50 hover:bg-green-100 transition"
        >
          <PlusCircle
            className="text-green-600"
            size={36}
          />

          <span className="font-semibold">
            New Booking
          </span>
        </button>

        {/* Add Customer */}
        <button
          onClick={() => navigate("/customers")}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-blue-50 hover:bg-blue-100 transition"
        >
          <UserPlus
            className="text-blue-600"
            size={36}
          />

          <span className="font-semibold">
            Add Customer
          </span>
        </button>

        {/* Add Property */}
        <button
          onClick={() => navigate("/properties")}
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-orange-50 hover:bg-orange-100 transition"
        >
          <Building2
            className="text-orange-600"
            size={36}
          />

          <span className="font-semibold">
            Add Property
          </span>
        </button>

        {/* Generate Receipt */}
        <button
          className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-purple-50 hover:bg-purple-100 transition"
        >
          <Receipt
            className="text-purple-600"
            size={36}
          />

          <span className="font-semibold">
            Generate Receipt
          </span>
        </button>

      </div>

    </div>
  );
}

export default QuickActions;