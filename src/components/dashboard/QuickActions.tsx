import {
  PlusCircle,
  UserPlus,
  Building2,
  Receipt,
  BookOpen,
  Users,
  BarChart3,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

function QuickActions() {
  const navigate =
    useNavigate();

  const {
    isAdmin,
  } = useAuth();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      {/* Heading */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isAdmin
              ? "Manage bookings, customers, properties and receipts"
              : "Quick access to CRM information"}
          </p>
        </div>

        {!isAdmin && (
          <span
            className="
              rounded-full
              border
              border-gray-200
              bg-gray-50
              px-3
              py-1
              text-xs
              font-semibold
              text-gray-600
            "
          >
            View Only
          </span>
        )}

      </div>

      {/* ==================================================
          ADMIN QUICK ACTIONS
      ================================================== */}

      {isAdmin ? (

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          {/* New Booking */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/bookings?mode=create"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-green-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-green-100
              hover:shadow-md
            "
          >
            <PlusCircle
              className="text-green-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              New Booking
            </span>
          </button>

          {/* Add Customer */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/customers?mode=create"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-blue-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-blue-100
              hover:shadow-md
            "
          >
            <UserPlus
              className="text-blue-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              Add Customer
            </span>
          </button>

          {/* Add Property */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/properties?mode=create"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-orange-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-orange-100
              hover:shadow-md
            "
          >
            <Building2
              className="text-orange-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              Add Property
            </span>
          </button>

          {/* Generate Receipt */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/bookings?mode=receipt"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-purple-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-purple-100
              hover:shadow-md
            "
          >
            <Receipt
              className="text-purple-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              Generate Receipt
            </span>
          </button>

        </div>

      ) : (

        /* ==================================================
            EMPLOYEE VIEW-ONLY SHORTCUTS
        ================================================== */

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

          {/* View Bookings */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/bookings"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-green-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-green-100
              hover:shadow-md
            "
          >
            <BookOpen
              className="text-green-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              View Bookings
            </span>
          </button>

          {/* View Customers */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/customers"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-blue-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-blue-100
              hover:shadow-md
            "
          >
            <Users
              className="text-blue-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              View Customers
            </span>
          </button>

          {/* View Properties */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/properties"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-orange-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-orange-100
              hover:shadow-md
            "
          >
            <Building2
              className="text-orange-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              View Properties
            </span>
          </button>

          {/* View Reports */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/reports"
              )
            }
            className="
              flex
              flex-col
              items-center
              justify-center
              gap-3
              rounded-xl
              bg-purple-50
              p-6
              transition
              hover:-translate-y-1
              hover:bg-purple-100
              hover:shadow-md
            "
          >
            <BarChart3
              className="text-purple-600"
              size={36}
            />

            <span className="font-semibold text-gray-800">
              View Reports
            </span>
          </button>

        </div>

      )}

    </div>
  );
}

export default QuickActions;