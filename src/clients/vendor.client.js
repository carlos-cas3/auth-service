const axios = require("axios");

const VENDOR_URL = `${process.env.VENDOR_SERVICE_URL}/api/vendors`;

const createVendor = async (payload) => {
    const { vendor_categories, ...vendorData } = payload;

    // 1. Crear el vendor
    const response = await axios.post(VENDOR_URL, vendorData);
    const vendor = response.data.data;

    // 2. Asignar categorías si vienen
    if (vendor_categories?.length > 0) {
        await axios.put(`${VENDOR_URL}/${vendor.vendor_id}/categories`, {
            category_ids: vendor_categories,
        });
    }

    return vendor;
};

const updateVendorStatus = async (vendorId, status) => {
    const response = await axios.patch(`${VENDOR_URL}/${vendorId}/status`, {
        status,
    });
    return response.data;
};

module.exports = { createVendor, updateVendorStatus };
