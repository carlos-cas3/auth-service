const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { authenticate, loginLimiter } = require("../middlewares");

/**
 * Auth routes — mounted at /api/auth.
 *
 * POST /register  — Register a new VENDOR_ADMIN with company data
 * POST /login     — Authenticate and receive a JWT (rate-limited)
 * GET  /me        — Get current user profile (requires Bearer token)
 */
router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
