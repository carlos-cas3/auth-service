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
jest.mock("../token.service");
jest.mock("../../utils/user.helpers");
jest.mock("../../clients/vendor.client");
jest.mock("../../mappers/vendor.mapper");
jest.mock("bcryptjs");

const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../token.service");
const { userRepository, roleRepository } = require("../../repositories");
const { createVendor } = require("../../clients/vendor.client");
const { mapToVendorPayload } = require("../../mappers/vendor.mapper");
const { sanitizeUser } = require("../../utils/user.helpers");
const authService = require("../auth.service");

const OLD_ENV = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...OLD_ENV, BCRYPT_ROUNDS: "10" };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("register", () => {
  const validUserData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    personal_phone: "123456789",
    password: "password123",
    confirmPassword: "password123",
    company: {
      name: "ACME Inc",
      ruc: "123456789",
      address: "123 Main St",
      categories: [1, 2],
    },
  };

  it("creates a user, creates a vendor, and links vendor_id", async () => {
    const vendorRole = { role_id: 2, role_name: "VENDOR_ADMIN" };
    const createdUser = {
      user_id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      personal_phone: "123456789",
      role_id: 2,
      status: "PENDING",
      vendor_id: null,
      created_at: new Date().toISOString(),
    };
    const vendor = { vendor_id: 99, vendor_name: "ACME Inc" };
    const sanitizedUser = {
      userId: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      status: "PENDING",
      vendorId: 99,
    };

    bcrypt.hash.mockResolvedValue("hashed-password");
    roleRepository.findByName.mockResolvedValue(vendorRole);
    userRepository.create.mockResolvedValue(createdUser);
    mapToVendorPayload.mockReturnValue({ vendor_name: "ACME Inc", user_id: 1 });
    createVendor.mockResolvedValue(vendor);
    userRepository.updateVendorId.mockResolvedValue({ ...createdUser, vendor_id: 99 });
    sanitizeUser.mockReturnValue(sanitizedUser);

    const result = await authService.register(validUserData);

    expect(roleRepository.findByName).toHaveBeenCalledWith("VENDOR_ADMIN");
    expect(userRepository.create).toHaveBeenCalledWith({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      personal_phone: "123456789",
      password: "hashed-password",
      role_id: 2,
      status: "PENDING",
      vendor_id: null,
    });
    expect(mapToVendorPayload).toHaveBeenCalledWith(createdUser, validUserData.company);
    expect(createVendor).toHaveBeenCalledWith({ vendor_name: "ACME Inc", user_id: 1 });
    expect(userRepository.updateVendorId).toHaveBeenCalledWith(1, 99);
    expect(sanitizeUser).toHaveBeenCalledWith({ ...createdUser, vendor_id: 99 });
    expect(result).toEqual(sanitizedUser);
  });

  it("throws if passwords do not match", async () => {
    const data = { ...validUserData, confirmPassword: "different" };

    await expect(authService.register(data)).rejects.toThrow("Passwords do not match");
  });

  it("throws if company data is missing", async () => {
    const data = { ...validUserData, company: undefined };

    await expect(authService.register(data)).rejects.toThrow("Company data is required");
  });

  it("throws if email already registered", async () => {
    userRepository.findByEmail.mockResolvedValue({ user_id: 1 });

    await expect(authService.register(validUserData)).rejects.toThrow("Email already registered");
  });

  it("rolls back the user if vendor creation fails", async () => {
    bcrypt.hash.mockResolvedValue("hashed-password");
    userRepository.findByEmail.mockResolvedValue(null);
    roleRepository.findByName.mockResolvedValue({ role_id: 2 });
    userRepository.create.mockResolvedValue({ user_id: 1, email: "john@example.com" });
    mapToVendorPayload.mockReturnValue({});
    createVendor.mockRejectedValue(new Error("Vendor API unavailable"));

    await expect(authService.register(validUserData)).rejects.toThrow("Vendor API unavailable");
    expect(userRepository.delete).toHaveBeenCalledWith(1);
  });
});

describe("login", () => {
  const user = {
    user_id: 1,
    email: "john@example.com",
    password: "hashed-password",
    status: "ACTIVE",
    first_name: "John",
    last_name: "Doe",
    created_at: new Date().toISOString(),
    roles: { role_name: "VENDOR_ADMIN", role_description: "Vendor Administrator" },
  };

  it("returns token and sanitized user on valid credentials", async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue("jwt-token");
    sanitizeUser.mockReturnValue({ userId: 1, email: "john@example.com" });

    const result = await authService.login("john@example.com", "password123");

    expect(userRepository.findByEmail).toHaveBeenCalledWith("john@example.com");
    expect(bcrypt.compare).toHaveBeenCalledWith("password123", user.password);
    expect(generateToken).toHaveBeenCalledWith(user);
    expect(result).toEqual({ token: "jwt-token", user: { userId: 1, email: "john@example.com" } });
  });

  it("throws if user not found", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(authService.login("unknown@test.com", "pass")).rejects.toThrow("Invalid credentials");
  });

  it("throws if user is PENDING", async () => {
    userRepository.findByEmail.mockResolvedValue({ ...user, status: "PENDING" });

    await expect(authService.login("john@example.com", "pass")).rejects.toThrow("Account pending approval");
  });

  it("throws if password is wrong", async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(false);

    await expect(authService.login("john@example.com", "wrongpass")).rejects.toThrow("Invalid credentials");
  });
});

describe("validateToken", () => {
  it("returns sanitized user when token is valid", async () => {
    verifyToken.mockReturnValue({ userId: 1 });
    userRepository.findById.mockResolvedValue({ user_id: 1, email: "john@example.com" });
    sanitizeUser.mockReturnValue({ userId: 1, email: "john@example.com" });

    const result = await authService.validateToken("valid-token");

    expect(verifyToken).toHaveBeenCalledWith("valid-token");
    expect(userRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual({ userId: 1, email: "john@example.com" });
  });

  it("throws if token verification fails", async () => {
    verifyToken.mockImplementation(() => { throw new Error("jwt expired"); });

    await expect(authService.validateToken("expired-token")).rejects.toThrow("Invalid token");
  });

  it("throws if user not found", async () => {
    verifyToken.mockReturnValue({ userId: 999 });
    userRepository.findById.mockResolvedValue(null);

    await expect(authService.validateToken("valid-token")).rejects.toThrow("Invalid token");
  });
});
