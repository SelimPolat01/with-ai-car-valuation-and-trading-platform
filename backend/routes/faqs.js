import express from "express";
import { db } from "../lib/db.js";

export const router = express.Router();

router.get("/", async (req, res) => {
  const queryText = "SELECT * FROM faqs ORDER BY id ASC";

  try {
    const result = await db.query(queryText);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Sistemimizde henüz kayıtlı Sıkça Sorulan Soru (SSS) bulunmamaktadır.",
      });
    }

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Sıkça Sorulan Sorular hatası:", err?.message);

    return res.status(500).json({
      message:
        "Sıkça sorulan sorular yüklenirken sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
    });
  }
});
