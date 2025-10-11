// DEPENDENCIAS & ENV
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Seguridad / CORS / body
app.set("trust proxy", 1);
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Mongo
mongoose.set("strictQuery", true);
const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ferreteria_db";
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => console.error("Mongo error:", err.message));
require("./models/User");
require("./models/Category");
require("./models/Supplier");
require("./models/Product");
require("./models/Customer");
require("./models/Sale");
require("./models/InventoryMovement");

// Rutas API
const apiRouter = require("./routes/router");
app.use("/api", apiRouter);

// 404 global
app.use("*", (_req, res) =>
  res.status(404).json({ message: "Ruta no encontrada en el servidor" })
);

// Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`Health:  http://localhost:${PORT}/api/health`);
});
