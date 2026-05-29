/**
 * Maps internal user + company data into the payload expected by the Vendor Service API.
 *
 * @param {Object} user - User object from database (snake_case fields)
 * @param {string} user.email - User's email address
 * @param {string} user.personal_phone - User's phone number
 * @param {number} user.user_id - User's internal ID
 * @param {Object} company - Company data from registration input
 * @param {string} company.name - Company legal name
 * @param {string} company.ruc - Company tax ID (RUC)
 * @param {string} company.address - Company physical address
 * @param {number[]} company.categories - Array of category IDs
 * @returns {Object} Payload ready for POST /api/vendors
 * @property {string} vendor_name
 * @property {string} vendor_ruc
 * @property {string} vendor_email
 * @property {string} vendor_phone
 * @property {string} vendor_address
 * @property {number[]} vendor_categories
 * @property {number} user_id
 */
const mapToVendorPayload = (user, company) => {
    return {
        vendor_name: company.name,
        vendor_ruc: company.ruc,
        vendor_email: user.email,
        vendor_phone: user.personal_phone,
        vendor_address: company.address,
        vendor_categories: company.categories,
        user_id: user.user_id,
    };
};

module.exports = { mapToVendorPayload };