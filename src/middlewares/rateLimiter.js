const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 100 : 5,
    message: {
        success: false,
        message: "Too many login attempts. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === "development", // ← saltea en dev
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { loginLimiter, generalLimiter };
