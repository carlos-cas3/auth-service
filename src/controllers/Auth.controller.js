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