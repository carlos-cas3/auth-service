// Funciones puras — sin side effects, sin dependencias de infraestructura
const sanitizeUser = (user) => ({
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
});

const mapToVendorPayload = (user, company) => ({
    userId: user.user_id,
    email: user.email,
    company,
});

module.exports = { sanitizeUser, mapToVendorPayload };