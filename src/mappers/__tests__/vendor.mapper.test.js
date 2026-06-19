const { mapToVendorPayload } = require("../vendor.mapper");

describe("mapToVendorPayload", () => {
  const user = {
    user_id: 1,
    email: "vendor@test.com",
    personal_phone: "123456789",
  };

  const company = {
    name: "ACME Inc",
    ruc: "123456789",
    address: "123 Main St",
    categories: [1, 2],
  };

  it("maps user and company to vendor payload", () => {
    const result = mapToVendorPayload(user, company);

    expect(result).toEqual({
      vendor_name: "ACME Inc",
      vendor_ruc: "123456789",
      vendor_email: "vendor@test.com",
      vendor_phone: "123456789",
      vendor_address: "123 Main St",
      vendor_categories: [1, 2],
      user_id: 1,
    });
  });

  it("handles missing optional fields", () => {
    const minimalUser = { user_id: 2, email: "a@b.com" };
    const minimalCompany = { name: "Corp" };

    const result = mapToVendorPayload(minimalUser, minimalCompany);

    expect(result).toEqual({
      vendor_name: "Corp",
      vendor_ruc: undefined,
      vendor_email: "a@b.com",
      vendor_phone: undefined,
      vendor_address: undefined,
      vendor_categories: undefined,
      user_id: 2,
    });
  });
});
