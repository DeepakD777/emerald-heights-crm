import { Router } from "express";

import {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
} from "../controllers/property.controller";

import {
    authenticate,
} from "../middleware/auth.middleware";

import {
    requireAdmin,
} from "../middleware/role.middleware";

const router = Router();

// =========================
// VIEW ACCESS
// Admin + Employee
// =========================

router.get("/", authenticate, getProperties);
router.get("/:id", authenticate, getPropertyById);


// =========================
// ADMIN ONLY
// Create / Update / Delete
// =========================

router.post("/", authenticate, requireAdmin, createProperty);
router.put("/:id", authenticate, requireAdmin, updateProperty);
router.delete("/:id", authenticate, requireAdmin, deleteProperty);

export default router;