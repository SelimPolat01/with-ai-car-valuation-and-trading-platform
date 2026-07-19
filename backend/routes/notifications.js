import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { db } from "../lib/db.js";

export const router = express.Router();

router.get("/personal-notifications", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT * 
    FROM notifications 
    WHERE user_id = $1 
    ORDER BY created_at DESC
  `;

  try {
    const result = await db.query(query, [userId]);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Bildirimler getirilirken hata oluştu:", err);
    res.status(500).json({ message: "Sunucu tarafında bir hata oluştu." });
  }
});

router.patch("/:id/read", verifyToken, async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user.id;

  try {
    await db.query(
      `UPDATE notifications 
   SET is_read = TRUE 
   WHERE id = $1 AND user_id = $2 AND is_read = FALSE`,
      [notificationId, userId],
    );
    res.status(200).json({ message: "Bildirim okundu olarak işaretlendi." });
  } catch (err) {
    console.error("Bildirim güncellenirken hata:", err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});
