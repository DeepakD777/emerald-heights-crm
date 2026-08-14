import { Router } from "express";

import {
  getBookingDocuments,
  getBookingDocumentByType,
  updateBookingDocument,
} from "../controllers/document.controller";

import {
  authenticate,
} from "../middleware/auth.middleware";

import {
  requireAdmin,
} from "../middleware/role.middleware";

const router = Router();

// Admin + Employee can view documents
router.get(
  "/:bookingId/documents",
  authenticate,
  getBookingDocuments
);

router.get(
  "/:bookingId/documents/:type",
  authenticate,
  getBookingDocumentByType
);

// Only Admin can change document workflow
router.put(
  "/:bookingId/documents/:type",
  authenticate,
  requireAdmin,
  updateBookingDocument
);

export default router;