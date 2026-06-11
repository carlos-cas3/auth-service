/**
 * Express middleware that checks for an internal service secret (`x-service-secret` header).
 * If the secret matches `INTERNAL_SERVICE_SECRET`, sets `req.isInternalService = true`
 * so the route can skip JWT authentication for internal calls.
 * Always calls `next()` — this middleware does not block requests.
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 *
 * @example
 * router.patch("/users/:id/status", serviceAuth, (req, res, next) => {
 *   if (req.isInternalService) return next();
 *   authenticate(req, res, next);
 * }, handler);
 */
const serviceAuth = (req, res, next) => {
    const secret = req.headers["x-service-secret"];
    if (secret && secret === process.env.INTERNAL_SERVICE_SECRET) {
        req.isInternalService = true;
        return next();
    }
    return res.status(401).json({ error: "Unauthorized internal call" });
};

module.exports = serviceAuth;
