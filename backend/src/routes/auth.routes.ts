import {
    Router,
} from "express";

import {
    login,
    getCurrentUser,
    requestAdminPasswordOtp,
    verifyAdminPasswordOtp,
    resetAdminPassword,
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

router.post(
    "/admin/forgot-password/request-otp",
    requestAdminPasswordOtp
);

router.post(
    "/admin/forgot-password/verify-otp",
    verifyAdminPasswordOtp
);

router.post(
    "/admin/forgot-password/reset",
    resetAdminPassword
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