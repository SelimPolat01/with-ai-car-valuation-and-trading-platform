import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const carData = req.body;
  try {
    const fetchUrl = `${process.env.FAST_API_URL}/predict`;
    console.log("👉 NODE.JS'IN ISTEK ATTIGI TAM ADRES:", fetchUrl);

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔴 GİDİLEN ADRESTEN DÖNEN HATA KODU:", response.status);
      console.error("🔴 DÖNEN GERÇEK HATA MESAJI:", errorText);
      throw new Error(`FastAPI'ye ulaşılamadı. Kod: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ price: data.predicted_price });
  } catch (err) {
    console.error("Fiyat Tahmin Hatası Detayı:", err);
    return res
      .status(500)
      .json({ message: "Fiyat tahmini sırasında bir hata oluştu." });
  }
});
