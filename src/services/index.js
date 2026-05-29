/** Barrel module — re-exports all service instances. */
const authService = require("./auth.service");
const adminService = require("./admin.service");

module.exports = {
    authService,
    adminService,
};
