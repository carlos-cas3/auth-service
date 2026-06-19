const serviceAuth = require("../serviceAuth");

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV, INTERNAL_SERVICE_SECRET: "shared-secret" };
});

afterAll(() => {
  process.env = OLD_ENV;
});

describe("serviceAuth", () => {
  it("sets isInternalService when x-service-secret matches", () => {
    const req = { headers: { "x-service-secret": "shared-secret" } };
    const res = {};
    const next = jest.fn();

    serviceAuth(req, res, next);

    expect(req.isInternalService).toBe(true);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("does not set isInternalService when header is missing", () => {
    const req = { headers: {} };
    const res = {};
    const next = jest.fn();

    serviceAuth(req, res, next);

    expect(req.isInternalService).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("does not set isInternalService when header is wrong", () => {
    const req = { headers: { "x-service-secret": "wrong-secret" } };
    const res = {};
    const next = jest.fn();

    serviceAuth(req, res, next);

    expect(req.isInternalService).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("always calls next regardless of auth result", () => {
    const req = { headers: { "x-service-secret": "shared-secret" } };
    const res = {};
    const next = jest.fn();

    serviceAuth(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    const req2 = { headers: {} };
    serviceAuth(req2, res, next);
    expect(next).toHaveBeenCalledTimes(2);
  });
});
