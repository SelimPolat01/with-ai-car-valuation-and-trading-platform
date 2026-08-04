import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const carData = req.body;

  try {
    const fetchUrl = `${process.env.FAST_API_URL}/predict`;

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(carData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI Hata Detayı:", errorText);
      throw new Error(
        `Model servisine ulaşılamadı. HTTP Kod: ${response.status}`,
      );
    }

    const data = await response.json();
    return res.status(200).json({ price: data.predicted_price });
  } catch (err) {
    console.error("Fiyat Tahmin Hatası:", err);
    return res.status(500).json({
      message:
        "Araç değerleme işlemi sırasında sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
    });
  }
});
