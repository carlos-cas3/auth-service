require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const { authRoutes, adminRoutes } = require("./routes");
const {
    errorHandler,
    notFoundHandler,
    generalLimiter,
} = require("./middlewares");

const app = express();
const PORT = process.env.PORT || 3006;

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:5173", // frontend Vite
        "http://localhost:3001", // vendor-service
    ],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", generalLimiter);

app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
