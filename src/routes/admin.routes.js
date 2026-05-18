const express = require("express");
const router = express.Router();
const { adminController } = require("../controllers");
const { authenticate, authorize } = require("../middlewares");

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
    authenticate,
    authorize("SUPER_ADMIN"),
    adminController.updateUserStatus,
);

module.exports = router;