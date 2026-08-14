import { Router } from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";

const router = Router();

// Admin + Employee can view
router.get("/", authenticate, getCustomers);
router.get("/:id", authenticate, getCustomerById);

// Admin only
router.post("/", authenticate, requireAdmin, createCustomer);
router.put("/:id", authenticate, requireAdmin, updateCustomer);
router.delete("/:id", authenticate, requireAdmin, deleteCustomer);

export default router;