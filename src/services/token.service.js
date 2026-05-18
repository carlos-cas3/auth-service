// Responsabilidad única: firma y verificación de JWT

const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    const payload = {
        userId: user.user_id,
        email: user.email,
        roleId: user.role_id,
        vendorId: user.vendor_id,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateToken, verifyToken };
