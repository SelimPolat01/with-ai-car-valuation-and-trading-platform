import express from "express";
import jwt from "jsonwebtoken";

export const router = express.Router();

router.get("/me", (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Yetkisiz erişim" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      surname: decoded.surname,
    });
  } catch (error) {
    return res.status(401).json({ message: "Geçersiz token" });
  }
});
