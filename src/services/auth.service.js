const bcrypt = require("bcryptjs");
const { userRepository, roleRepository } = require("../repositories");
const { USER_STATUS, ROLE_NAME } = require("../models/types");
const { generateToken, verifyToken } = require("./token.service");
const { sanitizeUser } = require("../utils/user.helpers");
const { createVendor } = require("../clients/vendor.client");
const { mapToVendorPayload } = require("../mappers/vendor.mapper");
class AuthService {
    /**
     * Authenticate a user by email and password.
     *
     * @param {string} email - User email
     * @param {string} password - Plaintext password
     * @returns {Promise<Object>} Login result with JWT token and sanitized user
     * @property {string} token - Signed JWT
     * @property {Object} user - Sanitized user object (camelCase)
     * @throws {Error} If credentials are invalid, account is pending, or account is rejected
     */
    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error("Invalid credentials");

        if (user.status === USER_STATUS.PENDING)
            throw new Error("Account pending approval");
        if (user.status === USER_STATUS.REJECTED)
            throw new Error("Account rejected");

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        const token = generateToken(user);

        return { token, user: sanitizeUser(user) };
    }

    /**
     * Validate a JWT token and return the associated user.
     *
     * @param {string} token - JWT string (without "Bearer " prefix)
     * @returns {Promise<Object>} Sanitized user (camelCase)
     * @throws {Error} If the token is invalid, expired, or the user no longer exists
     */
    async validateToken(token) {
        try {
            const decoded = verifyToken(token);
            const user = await userRepository.findById(decoded.userId);
            if (!user) throw new Error("User not found");
            return sanitizeUser(user);
        } catch (error) {
            throw new Error("Invalid token", { cause: error });
        }
    }
}

module.exports = new AuthService();
