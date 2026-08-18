import {
  useState,
} from "react";

import {
  PlusCircle,
  Building2,
  UserPlus,
  BarChart3,
  Home,
  Store,
  BookOpen,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

// ======================================================
// Quick Actions
// ======================================================

function QuickActions() {

  const navigate =
    useNavigate();

  const {
    isAdmin,
  } = useAuth();

  const [
    isBookingTypeOpen,
    setIsBookingTypeOpen,
  ] = useState(false);

  // ====================================================
  // New Booking
  // ====================================================

  const handleNewBooking =
    () => {

      if (!isAdmin) {
        return;
      }

      setIsBookingTypeOpen(
        true
      );
    };

  // ====================================================
  // Residential Booking
  // ====================================================

  const handleResidentialBooking =
    () => {

      setIsBookingTypeOpen(
        false
      );

      navigate(
        "/residential"
      );
    };

  // ====================================================
  // Commercial Booking
  // ====================================================

  const handleCommercialBooking =
    () => {

      setIsBookingTypeOpen(
        false
      );

      navigate(
        "/commercial"
      );
    };

  // ====================================================
  // UI
  // ====================================================

  return (
    <>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

        {/* ==================================================
            Heading
        ================================================== */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold text-gray-800">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {
                isAdmin
                  ? "Manage bookings, inventory, sales team and reports"
                  : "Quick access to CRM information"
              }
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

            {/* ==============================================
                New Booking
            ============================================== */}

            <button
              type="button"
              onClick={
                handleNewBooking
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-green-50
                p-5
                text-center
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

            {/* ==============================================
                Add Property
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/properties?mode=create"
                )
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-orange-50
                p-5
                text-center
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

            {/* ==============================================
                Add Sales Member
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/sales-team?mode=create"
                )
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-blue-50
                p-5
                text-center
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
                Add Sales Member
              </span>

            </button>

            {/* ==============================================
                View Reports
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/reports"
                )
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-purple-50
                p-5
                text-center
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

        ) : (

          /* ==================================================
              EMPLOYEE VIEW-ONLY QUICK ACTIONS
          ================================================== */

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {/* ==============================================
                Residential
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/residential"
                )
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-green-50
                p-5
                text-center
                transition
                hover:-translate-y-1
                hover:bg-green-100
                hover:shadow-md
              "
            >

              <Home
                className="text-green-600"
                size={36}
              />

              <span className="font-semibold text-gray-800">
                Residential
              </span>

            </button>

            {/* ==============================================
                Commercial
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/commercial"
                )
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-orange-50
                p-5
                text-center
                transition
                hover:-translate-y-1
                hover:bg-orange-100
                hover:shadow-md
              "
            >

              <Store
                className="text-orange-600"
                size={36}
              />

              <span className="font-semibold text-gray-800">
                Commercial
              </span>

            </button>

            {/* ==============================================
                Bookings
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/bookings"
                )
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-blue-50
                p-5
                text-center
                transition
                hover:-translate-y-1
                hover:bg-blue-100
                hover:shadow-md
              "
            >

              <BookOpen
                className="text-blue-600"
                size={36}
              />

              <span className="font-semibold text-gray-800">
                Bookings
              </span>

            </button>

            {/* ==============================================
                Reports
            ============================================== */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/reports"
                )
              }
              className="
                flex
                min-h-28
                flex-col
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-purple-50
                p-5
                text-center
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
                Reports
              </span>

            </button>

          </div>

        )}

      </div>

      {/* ====================================================
          NEW BOOKING TYPE MODAL
          Admin Only
      ==================================================== */}

      {isAdmin &&
        isBookingTypeOpen && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/50
            p-4
          "
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              setIsBookingTypeOpen(
                false
              );
            }
          }}
        >

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* ==============================================
                Modal Header
            ============================================== */}

            <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  New Booking
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select property type to continue
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setIsBookingTypeOpen(
                    false
                  )
                }
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                aria-label="Close"
              >

                <X
                  size={20}
                />

              </button>

            </div>

            {/* ==============================================
                Property Type Selection
            ============================================== */}

            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">

              {/* Residential */}

              <button
                type="button"
                onClick={
                  handleResidentialBooking
                }
                className="
                  flex
                  min-h-40
                  flex-col
                  items-center
                  justify-center
                  gap-4
                  rounded-2xl
                  border
                  border-green-200
                  bg-green-50
                  p-6
                  text-center
                  transition
                  hover:-translate-y-1
                  hover:border-green-300
                  hover:bg-green-100
                  hover:shadow-md
                "
              >

                <div className="rounded-2xl bg-white p-4 text-green-600 shadow-sm">

                  <Home
                    size={34}
                  />

                </div>

                <div>

                  <p className="font-bold text-gray-800">
                    Residential
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Select an available residential unit
                  </p>

                </div>

              </button>

              {/* Commercial */}

              <button
                type="button"
                onClick={
                  handleCommercialBooking
                }
                className="
                  flex
                  min-h-40
                  flex-col
                  items-center
                  justify-center
                  gap-4
                  rounded-2xl
                  border
                  border-orange-200
                  bg-orange-50
                  p-6
                  text-center
                  transition
                  hover:-translate-y-1
                  hover:border-orange-300
                  hover:bg-orange-100
                  hover:shadow-md
                "
              >

                <div className="rounded-2xl bg-white p-4 text-orange-600 shadow-sm">

                  <Store
                    size={34}
                  />

                </div>

                <div>

                  <p className="font-bold text-gray-800">
                    Commercial
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Select an available commercial unit
                  </p>

                </div>

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

export default QuickActions;