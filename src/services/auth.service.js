const bcrypt = require("bcryptjs");
const { userRepository, roleRepository } = require("../repositories");
const { USER_STATUS, ROLE_NAME } = require("../models/types");
const { generateToken, verifyToken } = require("./token.service");
const { sanitizeUser } = require("../utils/user.helpers");
const { createVendor } = require("../clients/vendor.client");
const { mapToVendorPayload } = require("../mappers/vendor.mapper");

class AuthService {
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
