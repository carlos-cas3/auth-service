const express = require("express");
const router = express.Router();
const { adminController } = require("../controllers");
const serviceAuth = require("../middlewares/serviceAuth");

router.post("/users", serviceAuth, adminController.createInternalUser);
router.get("/users", serviceAuth, adminController.getInternalUsers);

module.exports = router;
