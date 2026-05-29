const axios = require("axios");

const VENDOR_URL = `${process.env.VENDOR_SERVICE_URL}/api/vendors`;

/**
 * Creates a vendor via the external Vendor Service and optionally assigns categories.
 * Called during user registration. If this fails, the user creation is rolled back.
 *
 * @param {Object} payload - Vendor creation payload
 * @param {string} payload.vendor_name - Company legal name
 * @param {string} payload.vendor_ruc - Company tax ID (RUC)
 * @param {string} payload.vendor_email - Admin email
 * @param {string} payload.vendor_phone - Admin phone
 * @param {string} payload.vendor_address - Company address
 * @param {number[]} [payload.vendor_categories] - Array of category IDs
 * @param {number} payload.user_id - ID of the user who will own this vendor
 * @returns {Promise<Object>} The created vendor object from the Vendor Service
 * @property {number} vendor_id - ID of the created vendor
 * @throws {Error} If the Vendor Service is unreachable or returns an error
 */
const createVendor = async (payload) => {
    const { vendor_categories, ...vendorData } = payload;

    const response = await axios.post(VENDOR_URL, vendorData);
    const vendor = response.data.data;

    if (vendor_categories?.length > 0) {
        await axios.put(`${VENDOR_URL}/${vendor.vendor_id}/categories`, {
            category_ids: vendor_categories,
        });
    }

    return vendor;
};

/**
 * Updates the status of a vendor through the external Vendor Service.
 * Called when a user is approved or their status changes.
 *
 * @param {number} vendorId - ID of the vendor to update
 * @param {string} status - New status (e.g. "ACTIVE", "INACTIVE", "SUSPENDED")
 * @returns {Promise<Object>} Response data from the Vendor Service
 * @throws {Error} If the Vendor Service is unreachable or returns an error
 */
const updateVendorStatus = async (vendorId, status) => {
    const response = await axios.patch(`${VENDOR_URL}/${vendorId}/status`, {
        status,
    });
    return response.data;
};

module.exports = { createVendor, updateVendorStatus };
