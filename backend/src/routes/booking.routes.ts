import { Router } from "express";

import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";

const router = Router();

// Admin + Employee can view
router.get("/", authenticate, getBookings);
router.get("/:id", authenticate, getBookingById);

// Admin only
router.post("/", authenticate, requireAdmin, createBooking);
router.put("/:id", authenticate, requireAdmin, updateBooking);
router.delete("/:id", authenticate, requireAdmin, deleteBooking);

export default router;