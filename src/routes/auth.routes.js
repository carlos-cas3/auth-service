const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { authenticate, loginLimiter } = require("../middlewares");

router.post("/register", authController.register);
router.post("/login", loginLimiter, authController.login);
router.get("/me", authenticate, authController.me);

module.exports = router;
