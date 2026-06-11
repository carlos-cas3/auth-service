const express = require("express");
const router = express.Router();
const { adminController } = require("../controllers");
const serviceAuth = require("../middlewares/serviceAuth");

router.patch("/users/:id", serviceAuth, adminController.updateUser);

module.exports = router;
