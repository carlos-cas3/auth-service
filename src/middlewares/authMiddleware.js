const { authService } = require("../services");
const { HTTP_STATUS } = require("../models/types");

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
        console.error("Authentication error:", error.message); // ← loggear el error
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: "Invalid token",
        });
    }
};

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
