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
            parseInt(process.env.BCRYPT_ROUNDS),
        );

        const vendorRole = await roleRepository.findByName(
            ROLE_NAME.VENDOR_ADMIN,
        );

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
                },
            );

            vendor = response.data;
        } catch (error) {
            console.log(
                "Vendor service error response:",
                JSON.stringify(error.response?.data),
            );
            console.log("Vendor service status:", error.response?.status);
            throw new Error(
                error.response?.data?.message || "Error creating vendor",
            );
        }

        console.log("vendor response:", JSON.stringify(vendor)); // ← agregar aquí

        console.log("ROLE_NAME.VENDOR_ADMIN:", ROLE_NAME.VENDOR_ADMIN);
        console.log("ROLE_NAME.VENDOR_ADMIN:", ROLE_NAME.VENDOR_ADMIN);
        console.log("vendorRole result:", vendorRole);

        const user = await userRepository.create({
            first_name: firstName,
            last_name: lastName,
            email,
            phone,
            password: hashedPassword,
            role_id: vendorRole.role_id,
            status: USER_STATUS.PENDING,
            vendor_id: vendor.data.vendor_id,
        });

        return this.sanitizeUser(user);
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        console.log("user found:", user);
        console.log("password input:", password);
        console.log("password hash en BD:", user?.password);
        console.log("match:", await bcrypt.compare(password, user?.password));
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
        if (!user) {
            throw new Error("User not found");
        }

        if (user.status !== USER_STATUS.PENDING) {
            throw new Error("User is not pending approval");
        }

        const updatedUser = await userRepository.updateStatus(
            userId,
            USER_STATUS.ACTIVE,
        );

        return this.sanitizeUser(updatedUser);
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
            if (!user) {
                throw new Error("User not found");
            }
            return this.sanitizeUser(user);
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
}

module.exports = new AuthService();
