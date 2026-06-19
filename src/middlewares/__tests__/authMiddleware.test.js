jest.mock("../../services", () => ({
  authService: {
    validateToken: jest.fn(),
  },
}));

const { authenticate, authorize } = require("../authMiddleware");
const { authService } = require("../../services");
const { HTTP_STATUS } = require("../../models/types");

function mockReqResNext() {
  const req = { headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  return { req, res, next };
}

describe("authenticate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when no Authorization header", async () => {
    const { req, res, next } = mockReqResNext();

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when header is not Bearer", async () => {
    const { req, res, next } = mockReqResNext();
    req.headers.authorization = "Basic token";

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No token provided",
    });
  });

  it("sets req.user and calls next on valid token", async () => {
    const { req, res, next } = mockReqResNext();
    req.headers.authorization = "Bearer valid-token";
    authService.validateToken.mockResolvedValue({ userId: 1, email: "test@test.com" });

    await authenticate(req, res, next);

    expect(authService.validateToken).toHaveBeenCalledWith("valid-token");
    expect(req.user).toEqual({ userId: 1, email: "test@test.com" });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("returns 401 when token validation fails", async () => {
    const { req, res, next } = mockReqResNext();
    req.headers.authorization = "Bearer bad-token";
    authService.validateToken.mockRejectedValue(new Error("Invalid token"));

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("authorize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 if req.user is missing", () => {
    const { req, res, next } = mockReqResNext();

    authorize("SUPER_ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Not authenticated",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 if user role is not in allowed roles", () => {
    const { req, res, next } = mockReqResNext();
    req.user = { role: { roleName: "VENDOR_ADMIN" } };

    authorize("SUPER_ADMIN")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Insufficient permissions",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next if user has the required role", () => {
    const { req, res, next } = mockReqResNext();
    req.user = { role: { roleName: "SUPER_ADMIN" } };

    authorize("SUPER_ADMIN")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("calls next if user has one of multiple allowed roles", () => {
    const { req, res, next } = mockReqResNext();
    req.user = { role: { roleName: "SUPER_ADMIN" } };

    authorize("SUPER_ADMIN", "VENDOR_ADMIN")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
