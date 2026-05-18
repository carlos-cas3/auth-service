// clients/vendor.client.js
const axios = require("axios");

const createVendor = async (payload) => {
    const response = await axios.post(
        `${process.env.VENDOR_SERVICE_URL}/api/vendors`,
        payload,
    );
    return response.data.data;
};

const updateVendorStatus = async (vendorId, status) => {
    const response = await axios.patch(
        `${process.env.VENDOR_SERVICE_URL}/api/vendors/${vendorId}/status`,
        { status },
    );
    return response.data;
};

module.exports = { createVendor, updateVendorStatus };