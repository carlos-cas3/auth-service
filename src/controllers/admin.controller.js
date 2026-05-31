const { adminService } = require("../services");
const { HTTP_STATUS } = require("../models/types");

class AdminController {
    /**
     * POST /api/admin/users/internal
     * Creates a VENDOR_ADMIN user from an internal service call (vendor-service).
     * Protected by x-service-secret header, no JWT required.
     *
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     *
     **/
    async createUserInternal(req, res, next) {
        try {
            const result = await adminService.createUserInternal(req.body);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/admin/users/:id/approve
     * Approve a pending user. Sets status to ACTIVE and syncs with Vendor Service.
     * Requires SUPER_ADMIN role.
     *
     * @param {import('express').Request} req - Express request (req.user = authenticated admin)
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async approveUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await adminService.approveUser(id, req.user);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "User approved successfully",
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/admin/users/pending
     * List all VENDOR_ADMIN users with PENDING status.
     * Requires SUPER_ADMIN role.
     *
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getPendingUsers(req, res, next) {
        try {
            const users = await adminService.getPendingUsers();

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: users,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/admin/users/:id/status
     * Update a user's status directly. Accepts internal service auth OR JWT.
     * If called with x-service-secret header that matches INTERNAL_SERVICE_SECRET,
     * JWT authentication is bypassed. Otherwise requires SUPER_ADMIN role.
     *
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     *
     * @example
     * // Request body:
     * { "status": "ACTIVE" }
     */
    async updateUserStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const user = await adminService.updateUserStatus(id, status);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/admin/vendors/:vendor_id/user
     * Find a user by their linked vendor ID.
     * Requires SUPER_ADMIN role.
     *
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     */
    async getUserByVendorId(req, res, next) {
        try {
            const { vendor_id } = req.params;
            const user = await adminService.getUserByVendorId(vendor_id);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /api/admin/users/:id
     * Update a user's profile fields (first_name, last_name, personal_phone).
     * Requires SUPER_ADMIN role.
     *
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     *
     * @example
     * // Request body:
     * { "first_name": "John", "last_name": "Smith", "personal_phone": "987654321" }
     */
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await adminService.updateUser(id, req.body);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Usuario actualizado correctamente",
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AdminController();
