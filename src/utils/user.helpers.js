/**
 * Converts a raw database user row (snake_case) to a camelCase API response object.
 *
 * @param {Object} user - Raw user row from Supabase (snake_case fields)
 * @param {number} user.user_id - User ID
 * @param {number|null} user.vendor_id - Linked vendor ID
 * @param {number} user.role_id - Role ID
 * @param {string} user.first_name - First name
 * @param {string} user.last_name - Last name
 * @param {string} user.email - Email address
 * @param {string} user.personal_phone - Phone number
 * @param {string} user.status - Account status
 * @param {string} user.created_at - ISO creation timestamp
 * @param {Object} [user.roles] - Joined roles object
 * @param {string} user.roles.role_name - Role name
 * @param {string} user.roles.role_description - Role description
 * @returns {Object} Sanitized user object with camelCase keys
 * @property {number} userId
 * @property {number|null} vendorId
 * @property {number} roleId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} personalPhone
 * @property {string} status
 * @property {string} createdAt
 * @property {Object|null} role
 * @property {string} role.roleName
 * @property {string} role.roleDescription
 */
const sanitizeUser = (user) => ({
    userId: user.user_id,
    vendorId: user.vendor_id,
    roleId: user.role_id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    personalPhone: user.personal_phone,
    status: user.status,
    createdAt: user.created_at,
    role: user.roles
        ? {
            roleName: user.roles.role_name,
            roleDescription: user.roles.role_description,
        }
        : null,
});

/**
 * Maps user + company to a vendor-creation payload (unused — see src/mappers/vendor.mapper.js).
 * @deprecated Use {@link mapToVendorPayload} from src/mappers/vendor.mapper.js instead.
 * @param {Object} user - User object
 * @param {number} user.user_id - User ID
 * @param {string} user.email - Email
 * @param {Object} company - Company data
 * @returns {Object} Vendor payload
 */
const mapToVendorPayload = (user, company) => ({
    userId: user.user_id,
    email: user.email,
    company,
});

module.exports = { sanitizeUser, mapToVendorPayload };