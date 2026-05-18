const mapToVendorPayload = (user, company) => {
    return {
        vendor_name: company.name,
        vendor_ruc: company.ruc,
        vendor_email: user.email,
        vendor_phone: user.phone,
        vendor_address: company.address,
        vendor_categories: company.categories,
        user_id: user.user_id,
    };
};

module.exports = { mapToVendorPayload };