import { Router } from "express";

import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireAdmin } from "../middleware/role.middleware";

const router = Router();

// Admin + Employee can view
router.get("/", authenticate, getEmployees);
router.get("/:id", authenticate, getEmployeeById);

// Admin only
router.post("/", authenticate, requireAdmin, createEmployee);
router.put("/:id", authenticate, requireAdmin, updateEmployee);
router.delete("/:id", authenticate, requireAdmin, deleteEmployee);

export default router;