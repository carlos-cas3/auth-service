/** Barrel module — re-exports all controller instances. */
const authController = require('./auth.controller');
const adminController = require('./admin.controller');

module.exports = {
    authController,
    adminController,
};
