const express = require("express");
const router = express.Router();
const { adminController } = require("../controllers");
const { authenticate, authorize } = require("../middlewares");
const serviceAuth = require("../middlewares/serviceAuth");

/**
 * Admin routes — mounted at /api/admin.
 * All endpoints require SUPER_ADMIN role unless they use internal service auth.
 *
 * GET   /users/pending           — List pending VENDOR_ADMIN users
 * PATCH /users/:id/approve       — Approve a pending user
 * PATCH /users/:id/status        — Update user status (JWT or internal service)
 * GET   /vendors/:vendor_id/user — Lookup user by linked vendor ID
 * PATCH /users/:id               — Update user profile fields
 */

// ruta interna: solo vendor-service puede llamar esto
router.post(
    "/users/internal",
    serviceAuth,
    adminController.createUserInternal,
);

router.get(
    "/users/pending",
    authenticate,
    authorize("SUPER_ADMIN"),
    adminController.getPendingUsers,
);

router.patch(
    "/users/:id/approve",
    authenticate,
    authorize("SUPER_ADMIN"),
    adminController.approveUser,
);

router.patch(
    "/users/:id/status",
    serviceAuth,
    (req, res, next) => {
        if (req.isInternalService) return next();
        authenticate(req, res, next);
    },
    adminController.updateUserStatus,
);

router.get(
    "/vendors/:vendor_id/user",
    authenticate,
    authorize("SUPER_ADMIN"),
    adminController.getUserByVendorId,
);

router.patch(
    "/users/:id",
    authenticate,
    authorize("SUPER_ADMIN"),
    express.json(),
    adminController.updateUser,
);

module.exports = router;
