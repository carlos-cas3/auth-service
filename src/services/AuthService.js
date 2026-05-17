const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { userRepository, roleRepository } = require("../repositories");
const { USER_STATUS, ROLE_NAME } = require("../models/types");
const axios = require("axios");

class AuthService {
    async register(userData) {
        const {
            firstName,
            lastName,
            email,
            phone,
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

        // 1. Crear usuario primero (sin vendor_id aún)
        const user = await userRepository.create({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            password: hashedPassword,
            role_id: vendorRole.role_id,
            status: USER_STATUS.PENDING,
            vendor_id: null,
        });


        // 2. Crear vendor pasando el userId
        let vendor;
        try {
            const response = await axios.post(
                "http://localhost:3001/api/vendors",
                {
                    name: company.name,
                    ruc: company.ruc,
                    email: email,
                    phone: phone,
                    address: company.address,
                    categories: company.categories,
                    userId: user.user_id,
                },
            );
            vendor = response.data;
        } catch (error) {
            // Si falla el vendor-service, eliminar el usuario creado
            await userRepository.delete(user.user_id);
            throw new Error(
                error.response?.data?.message || "Error creating vendor",
            );
        }

        // 3. Actualizar usuario con el vendor_id
        await userRepository.updateVendorId(
            user.user_id,
            vendor.data.vendor_id,
        );

        return this.sanitizeUser({
            ...user,
            vendor_id: vendor.data.vendor_id,
        });
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        if (user.status === USER_STATUS.PENDING) {
            throw new Error("Account pending approval");
        }

        if (user.status === USER_STATUS.REJECTED) {
            throw new Error("Account rejected");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }

        const token = this.generateToken(user);

        return {
            token,
            user: this.sanitizeUser(user),
        };
    }

    generateToken(user) {
        const payload = {
            userId: user.user_id,
            email: user.email,
            roleId: user.role_id,
            vendorId: user.vendor_id,
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
        });
    }

    async approveUser(userId, adminUser) {
        if (adminUser.role?.roleName !== "SUPER_ADMIN") {
            throw new Error("Only SUPER_ADMIN can approve users");
        }

        const user = await userRepository.findById(userId);
        if (!user) throw new Error("User not found");
        if (user.status !== USER_STATUS.PENDING) {
            throw new Error("User is not pending approval");
        }

        const updatedUser = await userRepository.updateStatus(
            userId,
            USER_STATUS.ACTIVE,
        );

        if (user.vendor_id) {
            try {
                await axios.patch(
                    `http://localhost:3001/api/vendors/${user.vendor_id}/status`,
                    { status: "ACTIVE" },
                );
            } catch (error) {
                console.error(
                    "Error actualizando vendor status:",
                    error.message,
                );
            }
        }

        return this.sanitizeUser(updatedUser);
    }

    async updateUserStatus(userId, status) {
        const statusMap = {
            ACTIVE: USER_STATUS.ACTIVE,
            PENDING: USER_STATUS.PENDING,
            INACTIVE: USER_STATUS.REJECTED, // o agregar INACTIVE a USER_STATUS
            SUSPENDED: USER_STATUS.REJECTED,
        };

        const mappedStatus = statusMap[status];
        if (!mappedStatus) throw new Error("Status inválido");

        const user = await userRepository.updateStatus(userId, mappedStatus);
        return this.sanitizeUser(user);
    }

    async getPendingUsers() {
        const users = await userRepository.findAllPending();
        return users.map(this.sanitizeUser);
    }

    sanitizeUser(user) {
        return {
            userId: user.user_id,
            vendorId: user.vendor_id,
            roleId: user.role_id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            status: user.status,
            createdAt: user.created_at,
            role: user.roles
                ? {
                    roleName: user.roles.role_name,
                    roleDescription: user.roles.role_description,
                  }
                : null,
        };
    }

    async validateToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userRepository.findById(decoded.userId);
            if (!user) throw new Error("User not found");
            return this.sanitizeUser(user);
        } catch (error) {
            console.error("Token validation error:", error.message);
            throw new Error("Invalid token");
        }
    }
}

module.exports = new AuthService();
