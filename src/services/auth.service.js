const bcrypt = require("bcryptjs");
const { userRepository, roleRepository } = require("../repositories");
const { USER_STATUS, ROLE_NAME } = require("../models/types");
const { generateToken, verifyToken } = require("./token.service");
const { sanitizeUser } = require("../utils/user.helpers");
const { createVendor } = require("../clients/vendor.client");
const { mapToVendorPayload } = require("../mappers/vendor.mapper");
class AuthService {
    /**
     * Register a new vendor admin user.
     *
     * @param {Object} data - Registration data
     * @param {string} data.firstName - First name
     * @param {string} data.lastName - Last name
     * @param {string} data.email - Email address
     * @param {string} data.personal_phone - Phone number
     * @param {string} data.password - Password
     * @param {string} data.confirmPassword - Password confirmation
     * @param {Object} data.company - Company data
     * @returns {Promise<Object>} Sanitized user (camelCase)
     * @throws {Error} If validation fails, email exists, or vendor creation fails
     */
    async register(data) {
        if (data.password !== data.confirmPassword) {
            throw new Error("Passwords do not match");
        }
        if (!data.company) {
            throw new Error("Company data is required");
        }
        const existing = await userRepository.findByEmail(data.email);
        if (existing) {
            throw new Error("Email already registered");
        }
        const hashedPassword = await bcrypt.hash(data.password, parseInt(process.env.BCRYPT_ROUNDS, 10) || 10);
        const vendorRole = await roleRepository.findByName("VENDOR_ADMIN");
        const user = await userRepository.create({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            personal_phone: data.personal_phone,
            password: hashedPassword,
            role_id: vendorRole.role_id,
            status: USER_STATUS.PENDING,
            vendor_id: null,
        });
        let vendor;
        try {
            const vendorPayload = mapToVendorPayload(user, data.company);
            vendor = await createVendor(vendorPayload);
        } catch (err) {
            await userRepository.delete(user.user_id);
            throw err;
        }
        const updatedUser = await userRepository.updateVendorId(user.user_id, vendor.vendor_id);
        return sanitizeUser(updatedUser);
    }

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
