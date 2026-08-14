import { Router } from "express";

import {
  getDashboardSummary,
} from "../controllers/dashboard.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

const router = Router();

// Admin + Employee can view dashboard
router.get(
  "/summary",
  authenticate,
  getDashboardSummary
);

export default router;