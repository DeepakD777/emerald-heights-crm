import { Router } from "express";

import {
  getNocs,
  getNocById,
  getNocByBookingId,
  createNoc,
  updateNoc,
  deleteNoc,
} from "../controllers/noc.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  requireAdmin,
} from "../middleware/role.middleware";

const router = Router();

// ======================================================
// VIEW ROUTES
// Admin + Employee dono dekh sakte hain
// ======================================================

// GET /api/nocs
router.get(
  "/",
  authenticate,
  getNocs
);

// GET /api/nocs/booking/:bookingId
// Booking Details modal ke liye
router.get(
  "/booking/:bookingId",
  authenticate,
  getNocByBookingId
);

// GET /api/nocs/:id
router.get(
  "/:id",
  authenticate,
  getNocById
);

// ======================================================
// ADMIN-ONLY ROUTES
// ======================================================

// POST /api/nocs
// "Set Required" ke liye
router.post(
  "/",
  authenticate,
  requireAdmin,
  createNoc
);

// PUT /api/nocs/:id
// Required / Not Required / Status / Given update
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  updateNoc
);

// DELETE /api/nocs/:id
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  deleteNoc
);

export default router;