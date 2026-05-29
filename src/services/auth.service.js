const bcrypt = require("bcryptjs");
const { userRepository, roleRepository } = require("../repositories");
const { USER_STATUS, ROLE_NAME } = require("../models/types");
const { generateToken, verifyToken } = require("./token.service");
const { sanitizeUser } = require("../utils/user.helpers");
const { createVendor } = require("../clients/vendor.client");
const { mapToVendorPayload } = require("../mappers/vendor.mapper");

class AuthService {
    /**
     * Register a new VENDOR_ADMIN user.
     *
     * Flow: validate inputs → check uniqueness → hash password → create user →
     * create vendor via HTTP (rolls back user on failure) → link vendor_id → return.
     *
     * @param {Object} userData - Registration payload
     * @param {string} userData.firstName - First name
     * @param {string} userData.lastName - Last name
     * @param {string} userData.email - Email address
     * @param {string} userData.personal_phone - Phone number
     * @param {string} userData.password - Plaintext password (min 6 chars)
     * @param {string} userData.confirmPassword - Must match password
     * @param {Object} userData.company - Company information
     * @param {string} userData.company.name - Company name
     * @param {string} userData.company.ruc - Tax ID
     * @param {string} userData.company.address - Company address
     * @param {number[]} userData.company.categories - Category IDs
     * @returns {Promise<Object>} Sanitized user (camelCase) with linked vendor_id
     * @throws {Error} If passwords don't match, email is taken, or vendor creation fails
     */
    async register(userData) {
        const {
            firstName,
            lastName,
            email,
            personal_phone,
            password,
            confirmPassword,
            company,
        } = userData;

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }

        if (!company) {
            throw new Error("Company data is required");
        }

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("Email already registered");
        }

        const hashedPassword = await bcrypt.hash(
            password,
            Number.parseInt(process.env.BCRYPT_ROUNDS),
        );

        const vendorRole = await roleRepository.findByName(
            ROLE_NAME.VENDOR_ADMIN,
        );

        const user = await userRepository.create({
            first_name: firstName,
            last_name: lastName,
            email,
            personal_phone: personal_phone,
            password: hashedPassword,
            role_id: vendorRole.role_id,
            status: USER_STATUS.PENDING,
            vendor_id: null,
        });

        let vendor;
        try {
            const payload = mapToVendorPayload(user, company);
            vendor = await createVendor(payload);
        } catch (error) {
            await userRepository.delete(user.user_id);
            throw new Error(error?.message || "Error creating vendor");
        }

        await userRepository.updateVendorId(user.user_id, vendor.vendor_id);

        return sanitizeUser({ ...user, vendor_id: vendor.vendor_id });
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
            throw new Error("Invalid token");
        }
    }
}

module.exports = new AuthService();
