const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT for the given user.
 *
 * @param {Object} user - User object (must include user_id, email, role_id, vendor_id)
 * @param {number} user.user_id - User ID
 * @param {string} user.email - User email
 * @param {number} user.role_id - Role ID
 * @param {number|null} user.vendor_id - Linked vendor ID
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
    const payload = {
        userId: user.user_id,
        email: user.email,
        roleId: user.role_id,
        vendorId: user.vendor_id,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

/**
 * Verify and decode a JWT token.
 *
 * @param {string} token - The JWT string to verify
 * @returns {Object} Decoded token payload ({ userId, email, roleId, vendorId, iat, exp })
 * @throws {Error} If the token is invalid, expired, or tampered with
 */
const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateToken, verifyToken };
