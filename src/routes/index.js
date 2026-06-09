/** Barrel module — re-exports all route routers. */
const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const internalRoutes = require('./internal.routes');

module.exports = {
    authRoutes,
    adminRoutes,
    internalRoutes,
};