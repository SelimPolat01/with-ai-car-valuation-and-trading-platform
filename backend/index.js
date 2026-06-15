import "dotenv/config";
import express from "express";
import cors from "cors";
import { router as authRoutes } from "./routes/auth.js";
import { router as carsRoutes } from "./routes/cars.js";
import { router as advertsRoutes } from "./routes/adverts.js";
import { router as predictRoutes } from "./routes/predict.js";
import { router as personalInfoRoutes } from "./routes/infos.js";
import http from "http";
import { db } from "./lib/db.js";
import { rateLimit } from "express-rate-limit";
import path from "path";
import { createTables } from "./lib/db.js";
// import { dbInsertCars } from "./utils/dbInsertCars.js";

const app = express();

app.set("trust proxy", 1);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: "Çok fazla istek atıldı. Lütfen 15 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_URL = process.env.FRONT_END_URL || "*";

await db.query("SELECT 1");
await createTables();

app.use(
  cors({
    origin: [
      "https://with-ai-car-valuation-and-trading-sy9d.onrender.com",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Node.js Backend Başarıyla Çalışıyor! 🚀");
});

app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use("/api", globalLimiter, authRoutes);
app.use("/cars", globalLimiter, carsRoutes);
app.use("/adverts", globalLimiter, advertsRoutes);
app.use("/predict", globalLimiter, predictRoutes);
app.use("/infos", personalInfoRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT} portunda başarıyla çalışıyor.`);
});
