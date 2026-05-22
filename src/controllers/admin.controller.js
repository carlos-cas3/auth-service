const { adminService } = require("../services");
const { HTTP_STATUS } = require("../models/types");

class AdminController {
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
