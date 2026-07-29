import express from "express";
import { db } from "../lib/db.js";

export const router = express.Router();

router.get("/", async (req, res) => {
  const queryText = "SELECT * FROM faqs ORDER BY id ASC";

  try {
    const result = await db.query(queryText);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Henüz kayıtlı Sıkça Sorulan Soru bulunamadı.",
      });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Sıkça Sorulan Sorular hatası:", err?.message);

    return res.status(500).json({
      message:
        "Sıkça Sorulan Sorular getirilirken bir sunucu hatası meydana geldi.",
    });
  }
});
