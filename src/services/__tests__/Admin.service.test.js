jest.mock("../../repositories", () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    updateVendorId: jest.fn(),
    findAllPending: jest.fn(),
    findByVendorId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  },
  roleRepository: {
    findByName: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  },
}));
jest.mock("../../models/types", () => ({
  USER_STATUS: { PENDING: "PENDING", ACTIVE: "ACTIVE", INACTIVE: "INACTIVE", SUSPENDED: "SUSPENDED" },
  ROLE_NAME: { SUPER_ADMIN: "SUPER_ADMIN", VENDOR_ADMIN: "VENDOR_ADMIN" },
}));
jest.mock("../../utils/user.helpers");
jest.mock("../../clients/vendor.client");

const { userRepository } = require("../../repositories");
const { updateVendorStatus } = require("../../clients/vendor.client");
const { sanitizeUser } = require("../../utils/user.helpers");
const adminService = require("../Admin.service");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("approveUser", () => {
  const pendingUser = {
    user_id: 1,
    email: "vendor@test.com",
    status: "PENDING",
    vendor_id: 42,
    created_at: new Date().toISOString(),
    roles: { role_name: "VENDOR_ADMIN", role_description: "Vendor Admin" },
  };

  it("approves a pending user and activates the vendor", async () => {
    const superAdmin = { user_id: 2, role: { roleName: "SUPER_ADMIN" } };
    const updatedUser = { ...pendingUser, status: "ACTIVE" };

    userRepository.findById.mockResolvedValue(pendingUser);
    userRepository.updateStatus.mockResolvedValue(updatedUser);
    updateVendorStatus.mockResolvedValue({ success: true });
    sanitizeUser.mockReturnValue({ userId: 1, status: "ACTIVE", vendorId: 42 });

    const result = await adminService.approveUser("1", superAdmin);

    expect(userRepository.findById).toHaveBeenCalledWith("1");
    expect(userRepository.updateStatus).toHaveBeenCalledWith("1", "ACTIVE");
    expect(updateVendorStatus).toHaveBeenCalledWith(42, "ACTIVE");
    expect(result).toEqual({ userId: 1, status: "ACTIVE", vendorId: 42 });
  });

  it("throws if admin is not SUPER_ADMIN", async () => {
    const vendorAdmin = { role: { roleName: "VENDOR_ADMIN" } };

    await expect(adminService.approveUser("1", vendorAdmin)).rejects.toThrow("Only SUPER_ADMIN can approve users");
  });

  it("throws if user not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(adminService.approveUser("999", { role: { roleName: "SUPER_ADMIN" } })).rejects.toThrow("User not found");
  });

  it("throws if user is not pending", async () => {
    userRepository.findById.mockResolvedValue({ ...pendingUser, status: "ACTIVE" });

    await expect(adminService.approveUser("1", { role: { roleName: "SUPER_ADMIN" } })).rejects.toThrow("User is not pending approval");
  });

  it("does not call vendor service if user has no vendor_id", async () => {
    userRepository.findById.mockResolvedValue({ ...pendingUser, vendor_id: null });
    userRepository.updateStatus.mockResolvedValue({ ...pendingUser, vendor_id: null, status: "ACTIVE" });
    sanitizeUser.mockReturnValue({ userId: 1, status: "ACTIVE" });

    await adminService.approveUser("1", { role: { roleName: "SUPER_ADMIN" } });

    expect(updateVendorStatus).not.toHaveBeenCalled();
  });
});

describe("updateUserStatus", () => {
  it("updates status to ACTIVE", async () => {
    userRepository.updateStatus.mockResolvedValue({ user_id: 1, status: "ACTIVE" });
    sanitizeUser.mockReturnValue({ userId: 1, status: "ACTIVE" });

    const result = await adminService.updateUserStatus("1", "ACTIVE");

    expect(userRepository.updateStatus).toHaveBeenCalledWith("1", "ACTIVE");
    expect(result).toEqual({ userId: 1, status: "ACTIVE" });
  });

  it("updates status to SUSPENDED", async () => {
    userRepository.updateStatus.mockResolvedValue({ user_id: 1, status: "SUSPENDED" });
    sanitizeUser.mockReturnValue({ userId: 1, status: "SUSPENDED" });

    await adminService.updateUserStatus("1", "SUSPENDED");

    expect(userRepository.updateStatus).toHaveBeenCalledWith("1", "SUSPENDED");
  });

  it("throws for invalid status string", async () => {
    await expect(adminService.updateUserStatus("1", "INVALID")).rejects.toThrow("Status inválido: INVALID");
  });
});

describe("getPendingUsers", () => {
  it("returns sanitized list of pending users", async () => {
    const pendingUsers = [
      { user_id: 1, email: "a@test.com", status: "PENDING" },
      { user_id: 2, email: "b@test.com", status: "PENDING" },
    ];

    userRepository.findAllPending.mockResolvedValue(pendingUsers);
    sanitizeUser.mockImplementation((u) => ({ userId: u.user_id }));

    const result = await adminService.getPendingUsers();

    expect(userRepository.findAllPending).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ userId: 1 }, { userId: 2 }]);
  });
});

describe("getUserByVendorId", () => {
  it("returns sanitized user for a vendor", async () => {
    userRepository.findByVendorId.mockResolvedValue({ user_id: 1, vendor_id: 99 });
    sanitizeUser.mockReturnValue({ userId: 1, vendorId: 99 });

    const result = await adminService.getUserByVendorId("99");

    expect(userRepository.findByVendorId).toHaveBeenCalledWith(99);
    expect(result).toEqual({ userId: 1, vendorId: 99 });
  });

  it("throws if no user found for vendor", async () => {
    userRepository.findByVendorId.mockResolvedValue(null);

    await expect(adminService.getUserByVendorId("999")).rejects.toThrow("Usuario no encontrado para este vendor");
  });
});

describe("updateUser", () => {
  it("updates user fields", async () => {
    const data = { first_name: "New", last_name: "Name" };
    userRepository.findById.mockResolvedValue({ user_id: 1 });
    userRepository.update.mockResolvedValue({ user_id: 1, first_name: "New", last_name: "Name" });
    sanitizeUser.mockReturnValue({ userId: 1, firstName: "New", lastName: "Name" });

    const result = await adminService.updateUser("1", data);

    expect(userRepository.findById).toHaveBeenCalledWith("1");
    expect(userRepository.update).toHaveBeenCalledWith("1", data);
    expect(result).toEqual({ userId: 1, firstName: "New", lastName: "Name" });
  });

  it("throws if user not found", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(adminService.updateUser("999", {})).rejects.toThrow("Usuario no encontrado");
  });
});
