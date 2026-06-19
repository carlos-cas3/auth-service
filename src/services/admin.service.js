const { userRepository } = require("../repositories");
const { roleRepository } = require("../repositories");
const bcrypt = require("bcryptjs");
const { USER_STATUS, ROLE_NAME } = require("../models/types");
const { sanitizeUser } = require("../utils/user.helpers");
const { updateVendorStatus } = require("../clients/vendor.client");
const { sendEvent } = require("../clients/analytics.client");

const STATUS_MAP = {
    ACTIVE: USER_STATUS.ACTIVE,
    PENDING: USER_STATUS.PENDING,
    INACTIVE: USER_STATUS.INACTIVE,
    SUSPENDED: USER_STATUS.SUSPENDED,
};

class AdminService {
    async createUserInternal(data) {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) throw new Error("Email already registered");

        const hashedPassword = await bcrypt.hash(
            data.password || process.env.DEFAULT_STAFF_PASSWORD,
            Number.parseInt(process.env.BCRYPT_ROUNDS),
        );

        const vendorRole = await roleRepository.findByName(
            ROLE_NAME.VENDOR_ADMIN,
        );

        const user = await userRepository.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            personal_phone: data.personal_phone,
            password: hashedPassword,
            role_id: vendorRole.role_id,
            status: USER_STATUS.ACTIVE,
            vendor_id: data.vendor_id,
            must_change_password: true,
        });

        sendEvent({
            type: "USER_CREATED",
            aggregateType: "user",
            aggregateId: user.email,
            vendorId: user.vendor_id,
            payload: { email: user.email, first_name: data.first_name, last_name: data.last_name },
        });

        return { user_id: user.user_id };
    }

    async createInternalUser(data) {
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) throw new Error("Email already registered");

        const hashedPassword = await bcrypt.hash(
            process.env.DEFAULT_STAFF_PASSWORD,
            Number.parseInt(process.env.BCRYPT_ROUNDS),
        );

        const user = await userRepository.create({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            personal_phone: data.personal_phone,
            password: hashedPassword,
            role_id: data.role_id,
            status: USER_STATUS.ACTIVE,
            vendor_id: data.vendor_id,
            must_change_password: true,
        });

        sendEvent({
            type: "USER_CREATED",
            aggregateType: "user",
            aggregateId: user.email,
            vendorId: user.vendor_id,
            payload: { email: user.email, role_id: user.role_id, first_name: user.first_name, last_name: user.last_name },
        });

        return {
            user_id: user.user_id,
            email: user.email,
            role_id: user.role_id,
            vendor_id: user.vendor_id,
            first_name: user.first_name,
            last_name: user.last_name,
        };
    }
    /**
     * Approve a pending user, setting their status to ACTIVE.
     * Only SUPER_ADMIN users can perform this action.
     * Also syncs the status to the linked vendor via the Vendor Service.
     *
     * @param {number} userId - ID of the user to approve
     * @param {Object} adminUser - The authenticated admin performing the action
     * @param {Object} adminUser.role - Admin's role object
     * @param {string} adminUser.role.roleName - Admin's role name
     * @returns {Promise<Object>} Sanitized approved user (camelCase)
     * @throws {Error} If admin lacks SUPER_ADMIN role, user not found, or user is not PENDING
     */
    async approveUser(userId, adminUser) {
        if (adminUser.role?.roleName !== ROLE_NAME.SUPER_ADMIN) {
            throw new Error("Only SUPER_ADMIN can approve users");
        }

        const user = await userRepository.findById(userId);
        if (!user) throw new Error("User not found");
        if (user.status !== USER_STATUS.PENDING)
            throw new Error("User is not pending approval");

        const updatedUser = await userRepository.updateStatus(
            userId,
            USER_STATUS.ACTIVE,
        );

        if (user.vendor_id) {
            await updateVendorStatus(user.vendor_id, "ACTIVE");
        }

        sendEvent({
            type: "USER_STATUS_CHANGED",
            aggregateType: "user",
            aggregateId: user.email,
            vendorId: user.vendor_id,
            payload: { status: "active", previous_status: "pending" },
        });

        return sanitizeUser(updatedUser);
    }

    /**
     * Update a user's status directly.
     * Called either by SUPER_ADMIN or by an internal service via x-service-secret.
     *
     * @param {number} userId - ID of the user
     * @param {string} status - New status string ("ACTIVE", "PENDING", "INACTIVE", "SUSPENDED")
     * @returns {Promise<Object>} Sanitized updated user (camelCase)
     * @throws {Error} If the status value is not recognized
     */
    async updateUserStatus(userId, status) {
        const mappedStatus = STATUS_MAP[status];
        if (!mappedStatus) throw new Error(`Status inválido: ${status}`);

        const user = await userRepository.updateStatus(userId, mappedStatus);

        sendEvent({
            type: "USER_STATUS_CHANGED",
            aggregateType: "user",
            aggregateId: user.email,
            vendorId: user.vendor_id,
            payload: { status: status.toLowerCase() },
        });

        return sanitizeUser(user);
    }

    /**
     * Retrieve all VENDOR_ADMIN users with PENDING status.
     *
     * @returns {Promise<Object[]>} Array of sanitized pending users (camelCase)
     */
    async getPendingUsers() {
        const users = await userRepository.findAllPending();
        return users.map(sanitizeUser);
    }

    /**
     * Find a user by their linked vendor ID.
     *
     * @param {number|string} vendorId - Vendor ID (will be parsed to integer)
     * @returns {Promise<Object>} Sanitized user (camelCase)
     * @throws {Error} If no user is linked to the given vendor ID
     */
    async getUserByVendorId(vendorId) {
        const user = await userRepository.findByVendorId(parseInt(vendorId));
        if (!user) throw new Error("Usuario no encontrado para este vendor");
        return sanitizeUser(user);
    }

    /**
     * Update a user's basic profile fields (first_name, last_name, personal_phone).
     *
     * @param {number} userId - ID of the user to update
     * @param {Object} data - Fields to update (snake_case keys)
     * @param {string} [data.first_name] - New first name
     * @param {string} [data.last_name] - New last name
     * @param {string} [data.personal_phone] - New phone number
     * @returns {Promise<Object>} Sanitized updated user (camelCase)
     * @throws {Error} If the user is not found
     */
    async updateUser(userId, data) {
        const user = await userRepository.findById(userId);
        if (!user) throw new Error("Usuario no encontrado");

        if (data.email && data.email !== user.email) {
            const existing = await userRepository.findByEmail(data.email);
            if (existing) throw new Error("Email already registered");
        }

        const updated = await userRepository.update(userId, data);
        return sanitizeUser(updated);
    }

    async getInternalUsers(vendorId) {
        return userRepository.findStaffByVendorId(vendorId);
    }
}

module.exports = new AdminService();
