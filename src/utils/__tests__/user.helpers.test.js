const { sanitizeUser } = require("../user.helpers");

describe("sanitizeUser", () => {
  it("converts snake_case user to camelCase", () => {
    const user = {
      user_id: 1,
      vendor_id: 42,
      role_id: 2,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      personal_phone: "123456789",
      status: "ACTIVE",
      created_at: "2024-01-01T00:00:00.000Z",
      roles: {
        role_name: "VENDOR_ADMIN",
        role_description: "Vendor Admin",
      },
    };

    const result = sanitizeUser(user);

    expect(result).toEqual({
      userId: 1,
      vendorId: 42,
      roleId: 2,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      personalPhone: "123456789",
      status: "ACTIVE",
      createdAt: "2024-01-01T00:00:00.000Z",
      role: {
        roleName: "VENDOR_ADMIN",
        roleDescription: "Vendor Admin",
      },
    });
  });

  it("sets role to null when roles is missing", () => {
    const user = {
      user_id: 1,
      vendor_id: null,
      role_id: 3,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane@example.com",
      personal_phone: null,
      status: "ACTIVE",
      created_at: "2024-01-01T00:00:00.000Z",
    };

    const result = sanitizeUser(user);

    expect(result.role).toBeNull();
  });

  it("handles null vendor_id", () => {
    const user = {
      user_id: 1,
      vendor_id: null,
      role_id: 2,
      first_name: "Test",
      last_name: "User",
      email: "test@example.com",
      personal_phone: "999999999",
      status: "PENDING",
      created_at: "2024-06-01T00:00:00.000Z",
    };

    const result = sanitizeUser(user);

    expect(result.vendorId).toBeNull();
  });
});
