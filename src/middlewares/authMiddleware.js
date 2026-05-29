const { authService } = require("../services");
const { HTTP_STATUS } = require("../models/types");

/**
 * Express middleware that validates a Bearer JWT from the Authorization header.
 * On success, sets `req.user` with the sanitized user object and calls `next()`.
 * On failure, responds with 401 and does NOT call `next()`.
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {Promise<void>}
 *
 * @example
 * router.get("/me", authenticate, myHandler);
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];
        const user = await authService.validateToken(token);

        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: "Invalid token",
        });
    }
};

/**
 * Factory that returns an Express middleware to restrict access to specified roles.
 * Must be used after the `authenticate` middleware so `req.user` is populated.
 *
 * @param {...string} roles - One or more role names allowed (e.g. "SUPER_ADMIN")
 * @returns {import('express').RequestHandler} Middleware that returns 401/403 if unauthorized
 *
 * @example
 * router.get("/admin", authenticate, authorize("SUPER_ADMIN"), handler);
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                message: "Not authenticated",
            });
        }

        if (roles.length && !roles.includes(req.user.role?.roleName)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                message: "Insufficient permissions",
            });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
