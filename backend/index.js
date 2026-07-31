import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router as authRoutes } from "./routes/auth.js";
import { router as apiRoutes } from "./routes/api.js";
import { router as carsRoutes } from "./routes/cars.js";
import { router as advertsRoutes } from "./routes/adverts.js";
import { router as predictRoutes } from "./routes/predict.js";
import { router as personalInfoRoutes } from "./routes/infos.js";
import { router as slotsRoutes } from "./routes/slots.js";
import { router as appointmentsRoutes } from "./routes/appointments.js";
import { router as notificationsRoutes } from "./routes/notifications.js";
import { router as transactionRoutes } from "./routes/transactions.js";
import { router as faqsRoutes } from "./routes/faqs.js";
import { rateLimit } from "express-rate-limit";
import path from "path";
// import { createTable } from "./lib/db.js";
// import { dbInsertCars } from "./utils/dbInsertCars.js";

const app = express();

app.set("trust proxy", 1);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    status: 429,
    error: "Çok fazla istek atıldı. Lütfen 15 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: [
      "https://with-ai-car-valuation-and-trading-sy9d.onrender.com",
      "http://localhost:3000",
      "https://with-ai-car-valuation-and-trading-p.vercel.app",
      "https://yapayoto.me",
      "https://www.yapayoto.me",
      "https://yapayoto.com.tr",
      "https://www.yapayoto.com.tr",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Node.js Backend Başarıyla Çalışıyor! 🚀");
});

app.use("/auth", authRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use("/api", globalLimiter, apiRoutes);
app.use("/cars", carsRoutes);
app.use("/adverts", advertsRoutes);
app.use("/predict", globalLimiter, predictRoutes);
app.use("/infos", personalInfoRoutes);
app.use("/slots", globalLimiter, slotsRoutes);
app.use("/appointments", appointmentsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/transactions", transactionRoutes);
app.use("/faqs", faqsRoutes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT} portunda başarıyla çalışıyor.`);
});
