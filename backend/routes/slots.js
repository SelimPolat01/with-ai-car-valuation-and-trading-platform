import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { db } from "../lib/db.js";

export const router = express.Router();

router.get("/available-slots", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, TO_CHAR(slot_date, 'YYYY-MM-DD') as slot_date, slot_time, is_booked FROM available_slots",
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Müsait slotlar getirilirken hata oluştu:", err);
    res.status(500).json({ message: "Sunucu tarafında bir hata oluştu." });
  }
});
