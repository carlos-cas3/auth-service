const { authService } = require("../services");
const { HTTP_STATUS } = require("../models/types");
const Joi = require("joi");

const registerSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    personal_phone: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    company: Joi.object({
        name: Joi.string().required(),
        ruc: Joi.string().required(),
        address: Joi.string().required(),
        categories: Joi.array().items(Joi.number().integer()).required(),
    }).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

class AuthController {
    /**
     * POST /api/auth/register
     * Register a new VENDOR_ADMIN user with company data.
     *
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     *
     * @example
     * // Request body:
     * {
     *   "firstName": "John",
     *   "lastName": "Doe",
     *   "email": "john@example.com",
     *   "personal_phone": "123456789",
     *   "password": "secret123",
     *   "confirmPassword": "secret123",
     *   "company": { "name": "Acme", "ruc": "123", "address": "St", "categories": [1] }
     * }
     * // Response 201:
     * { "success": true, "message": "User registered successfully. Pending approval.", "data": { ... } }
     */
    async register(req, res, next) {
        try {
            const { error } = registerSchema.validate(req.body);
            if (error) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: error.details[0].message,
                });
            }

            const user = await authService.register(req.body);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: "User registered successfully. Pending approval.",
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /api/auth/login
     * Authenticate a user and return a JWT token.
     *
     * @param {import('express').Request} req - Express request
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     *
     * @example
     * // Request body:
     * { "email": "john@example.com", "password": "secret123" }
     * // Response 200:
     * { "success": true, "message": "Login successful", "data": { "token": "...", "user": { ... } } }
     */
    async login(req, res, next) {
        try {
            const { error } = loginSchema.validate(req.body);
            if (error) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: error.details[0].message,
                });
            }

            const { email, password } = req.body;
            const result = await authService.login(email, password);

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: "Login successful",
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    /**
     * GET /api/auth/me
     * Return the currently authenticated user's profile.
     * Requires a valid Bearer JWT in the Authorization header.
     *
     * @param {import('express').Request} req - Express request (req.user populated by authenticate middleware)
     * @param {import('express').Response} res - Express response
     * @param {import('express').NextFunction} next - Express next function
     * @returns {Promise<void>}
     *
     * @example
     * // Response 200:
     * { "success": true, "data": { "userId": 1, "email": "...", ... } }
     */
    async me(req, res, next) {
        try {
            res.status(HTTP_STATUS.OK).json({
                success: true,
                data: req.user,
            });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();