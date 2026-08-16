import {
    Router,
} from "express";

import {
    login,
    getCurrentUser,
} from "../controllers/auth.controller";

import {
    authenticate,
} from "../middleware/auth.middleware";

const router =
    Router();

// ======================================================
// Public
// ======================================================

router.post(
    "/login",
    login
);

// ======================================================
// Protected
// ======================================================

router.get(
    "/me",
    authenticate,
    getCurrentUser
);

export default router;