import express from "express";
import { db } from "../lib/db.js";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

router.get("/brands", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT DISTINCT brand FROM cars ORDER BY brand ASC"
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log("Markalar getirilemedi: ", err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/models/:brand", async (req, res) => {
  try {
    const { brand } = req.params;
    const result = await db.query(
      "SELECT DISTINCT model FROM cars WHERE brand = $1 ORDER BY model ASC",
      [brand]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log("Modeller getirilemedi: ", err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/model_years/:brand/:model", async (req, res) => {
  try {
    const { brand, model } = req.params;
    const result = await db.query(
      "SELECT DISTINCT model_year FROM cars WHERE brand = $1 AND model = $2 ORDER BY model_year ASC",
      [brand, model]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log("Yıllar getirilemedi: ", err);
    return res.status(500).json({ message: "Sunucu hataıas!" });
  }
});

router.get("/car-value/:brand/:model/:modelYear", async (req, res) => {
  try {
    const { brand, model, modelYear } = req.params;
    const result = await db.query(
      `SELECT ARRAY_AGG(DISTINCT body_type) AS body_types, ARRAY_AGG(DISTINCT engine_capacity) AS engine_capacities, ARRAY_AGG(DISTINCT horsepower) AS horsepowers, ARRAY_AGG(DISTINCT transmission) AS transmissions, ARRAY_AGG(DISTINCT fuel_type) AS fuel_types
       FROM cars
       WHERE brand = $1 AND model = $2 AND model_year = $3`,
      [brand, model, Number(modelYear)]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log("Yıllar getirilemedi: ", err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
});
