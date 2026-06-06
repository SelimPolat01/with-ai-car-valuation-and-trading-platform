import "dotenv/config";
import express from "express";
import cors from "cors";
import { router as authRoutes } from "./routes/auth.js";
import { router as carsRoutes } from "./routes/cars.js";
import { router as advertsRoutes } from "./routes/adverts.js";
import { router as predictRoutes } from "./routes/predict.js";
import { router as personalInfoRoutes } from "./routes/infos.js";
import http from "http";
import { Server } from "socket.io";
import { db } from "./lib/db.js";
import { rateLimit } from "express-rate-limit";
import path from "path";

// import { dbInsertCars } from "./utils/dbInsertCars.js";

const app = express();
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
const PORT = Number(process.env.PORT);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Bir kullanıcı bağlandı: ", socket.id);

  socket.on("register", (userId) => {
    console.log(`Kullanıcı ${userId} kaydoldu.`);
    onlineUsers.set(userId.toString(), socket.id);
  });

  socket.on(
    "sendMessageToUser",
    async ({ senderId, receiverId, advertId, message }) => {
      console.log(`Mesaj gönderiliyor: ${message} -> ${receiverId}`);
      try {
        const result = await db.query(
          "INSERT INTO messages (user_id, receiver_id, advert_id, message) VALUES ($1, $2, $3, $4) RETURNING *",
          [senderId, receiverId, advertId, message],
        );
        const savedMessage = result.rows[0];
        const receiverSocketId = onlineUsers.get(receiverId.toString());
        const senderSocketId = onlineUsers.get(senderId.toString());

        if (receiverSocketId)
          io.to(receiverSocketId).emit("receiveMessage", savedMessage);

        if (senderSocketId)
          io.to(senderSocketId).emit("receiveMessage", savedMessage);
      } catch (err) {
        console.log(err);
      }
    },
  );

  socket.on("disconnect", () => {
    console.log("Bir kullanıcı ayrıldı: ", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) onlineUsers.delete(userId);
    }
  });
});

app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));
app.use("/api", globalLimiter, authRoutes);
app.use("/cars", globalLimiter, carsRoutes);
app.use("/adverts", globalLimiter, advertsRoutes);
app.use("/predict", globalLimiter, predictRoutes);
app.use("/infos", personalInfoRoutes);

server.listen(PORT, () => {
  console.log(`Server ve Socket.IO ${PORT} portunda çalışıyor.`);
});
