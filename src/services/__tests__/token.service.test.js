jest.mock("jsonwebtoken");

const jwt = require("jsonwebtoken");
const { generateToken, verifyToken } = require("../token.service");

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV, JWT_SECRET: "test-secret", JWT_EXPIRES_IN: "7d" };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("generateToken", () => {
  it("signs a JWT with user payload and expiration", () => {
    const user = {
      user_id: 1,
      email: "test@example.com",
      role_id: 2,
      vendor_id: 42,
    };

    jwt.sign.mockReturnValue("signed-token");
    const token = generateToken(user);

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        userId: user.user_id,
        email: user.email,
        roleId: user.role_id,
        vendorId: user.vendor_id,
      },
      "test-secret",
      { expiresIn: "7d" },
    );
    expect(token).toBe("signed-token");
  });

  it("uses default expiration when JWT_EXPIRES_IN is not set", () => {
    delete process.env.JWT_EXPIRES_IN;

    jwt.sign.mockReturnValue("signed-token");
    generateToken({ user_id: 1, email: "a@b.com", role_id: 1 });

    expect(jwt.sign).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      expiresIn: "7d",
    });
  });
});

describe("verifyToken", () => {
  it("verifies the token with the secret", () => {
    jwt.verify.mockReturnValue({ userId: 1 });
    const decoded = verifyToken("some-token");

    expect(jwt.verify).toHaveBeenCalledWith("some-token", "test-secret");
    expect(decoded).toEqual({ userId: 1 });
  });

  it("throws when token is invalid", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("jwt malformed");
    });

    expect(() => verifyToken("bad-token")).toThrow("jwt malformed");
  });
});
