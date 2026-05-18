const serviceAuth = (req, res, next) => {
    console.log("header recibido:", req.headers["x-service-secret"]);
    console.log("secret esperado:", process.env.INTERNAL_SERVICE_SECRET);
    const secret = req.headers["x-service-secret"];
    if (secret && secret === process.env.INTERNAL_SERVICE_SECRET) {
        req.isInternalService = true; // marca la request como interna
        return next();
    }
    next();
};

module.exports = serviceAuth;
