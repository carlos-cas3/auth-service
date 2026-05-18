// services/admin.service.js
const { userRepository } = require("../repositories");
const { USER_STATUS, ROLE_NAME } = require("../models/types");
const { sanitizeUser } = require("../utils/user.helpers");
const { updateVendorStatus } = require("../clients/vendor.client"); // cambió

const STATUS_MAP = {
    ACTIVE: USER_STATUS.ACTIVE,
    PENDING: USER_STATUS.PENDING,
};

class AdminService {
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

        return sanitizeUser(updatedUser);
    }

    async updateUserStatus(userId, status) {
        const mappedStatus = STATUS_MAP[status];
        if (!mappedStatus) throw new Error(`Status inválido: ${status}`);

        const user = await userRepository.updateStatus(userId, mappedStatus);
        return sanitizeUser(user);
    }

    async getPendingUsers() {
        const users = await userRepository.findAllPending();
        return users.map(sanitizeUser);
    }
}

module.exports = new AdminService();
