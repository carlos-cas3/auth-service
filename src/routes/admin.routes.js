const express = require("express");
const router = express.Router();
const { adminController } = require("../controllers");
const { authenticate, authorize } = require("../middlewares");
const serviceAuth = require("../middlewares/serviceAuth");

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
    serviceAuth, // primero verifica si es llamada interna
    (req, res, next) => {
        if (req.isInternalService) return next(); // llamada interna, salta authenticate
        authenticate(req, res, next); // llamada normal, requiere JWT
    },
    adminController.updateUserStatus,
);


router.get(
    "/vendors/:vendor_id/user",
    authenticate,
    authorize("SUPER_ADMIN"),
    adminController.getUserByVendorId,
);


//es el user_id el que se actualiza, no el vendor_id

router.patch(
    "/users/:id",
    authenticate,
    authorize("SUPER_ADMIN"),
    express.json(),
    adminController.updateUser,
);

module.exports = router;
