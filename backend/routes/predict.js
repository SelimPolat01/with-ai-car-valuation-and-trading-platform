import express from "express";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  const carData = req.body;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FASTAPI_URL}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      },
    );
    if (!response.ok)
      throw new Error("FastAPI modelinden fiyat teklifi alınamadı.");
    const data = await response.json();
    return res.status(200).json({ price: data.predicted_price });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Fiyat tahmini sırasında bir hata oluştu." });
  }
});
