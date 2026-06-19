const { errorHandler, notFoundHandler } = require("../errorHandler");

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV, NODE_ENV: "development" };
});

afterAll(() => {
  process.env = OLD_ENV;
});

function createMocks() {
  const req = {};
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  const next = jest.fn();
  return { req, res, next };
}

describe("errorHandler", () => {
  it("responds with 500 and error message by default", () => {
    const { req, res, next } = createMocks();
    const err = new Error("Something went wrong");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Something went wrong",
    });
  });

  it("uses err.statusCode when set", () => {
    const { req, res, next } = createMocks();
    const err = new Error("Bad request");
    err.statusCode = 400;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Bad request",
    });
  });

  it("hides internal error details in production", () => {
    process.env.NODE_ENV = "production";
    const { req, res, next } = createMocks();
    const err = new Error("Internal crash: DB timeout");
    err.statusCode = 500;

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });

  it("does not hide non-500 errors in production", () => {
    process.env.NODE_ENV = "production";
    const { req, res, next } = createMocks();
    const err = new Error("Validation failed");
    err.statusCode = 422;

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
    });
  });
});

describe("notFoundHandler", () => {
  it("responds with 404", () => {
    const { req, res } = createMocks();

    notFoundHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Route not found",
    });
  });
});
