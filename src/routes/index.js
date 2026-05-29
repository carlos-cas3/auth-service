/** Barrel module — re-exports all route routers. */
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');

module.exports = {
    authRoutes,
    adminRoutes,
};