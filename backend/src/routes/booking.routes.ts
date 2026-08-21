import {
    Router,
} from "express";

import {
    getBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    permanentlyDeleteBooking,
} from "../controllers/booking.controller";

import {
    addInstallmentPayment,
} from "../controllers/booking-installment.controller";

import {
    authenticate,
} from "../middleware/auth.middleware";

import {
    requireAdmin,
} from "../middleware/role.middleware";

const router =
    Router();

// ======================================================
// Admin + Employee can view
// ======================================================

router.get(
    "/",
    authenticate,
    getBookings
);

router.get(
    "/:id",
    authenticate,
    getBookingById
);

// ======================================================
// Admin Only
// ======================================================

// Create Booking

router.post(
    "/",
    authenticate,
    requireAdmin,
    createBooking
);

// Update Booking

router.put(
    "/:id",
    authenticate,
    requireAdmin,
    updateBooking
);

// ======================================================
// Installment Payment
// Admin Only
// ======================================================

router.post(
    "/:id/installment-payments",
    authenticate,
    requireAdmin,
    addInstallmentPayment
);

// ======================================================
// Bookings Page
// Soft Archive
// ======================================================

router.delete(
    "/:id",
    authenticate,
    requireAdmin,
    deleteBooking
);

// ======================================================
// Reports Page
// Permanent Delete
// ======================================================

router.delete(
    "/:id/permanent",
    authenticate,
    requireAdmin,
    permanentlyDeleteBooking
);

export default router;