import express from "express";
import { db } from "../lib/db.js";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

router.get("/brands", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT DISTINCT brand FROM cars ORDER BY brand ASC",
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
      [brand],
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
      [brand, model],
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
    const { bodyType } = req.query;
    let result;
    if (bodyType && bodyType !== "Kasa Tipi") {
      result = await db.query(
        `
        SELECT ARRAY_AGG(DISTINCT engine_capacity ORDER BY engine_capacity ASC) AS engine_capacities
        FROM cars
        WHERE LOWER(brand) = $1 AND LOWER(model) = $2 AND model_year = $3 AND LOWER(body_type) = $4
        `,
        [
          brand.toLowerCase(),
          model.toLowerCase(),
          Number(modelYear),
          bodyType.toLowerCase(),
        ],
      );
    } else {
      result = await db.query(
        `
        SELECT ARRAY_AGG(DISTINCT engine_capacity ORDER BY engine_capacity ASC) AS engine_capacities
        FROM cars
        WHERE LOWER(brand) = $1 AND LOWER(model) = $2 AND model_year = $3
        `,
        [brand.toLowerCase(), model.toLowerCase(), Number(modelYear)],
      );
    }
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log("Motor hacimleri getirilemedi: ", err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get(
  "/car-value/:brand/:model/:modelYear/:engineCapacity",
  async (req, res) => {
    try {
      const { brand, model, modelYear, engineCapacity } = req.params;
      const result = await db.query(
        `SELECT ARRAY_AGG(DISTINCT fuel_type) AS fuel_types
       FROM cars
       WHERE brand = $1 AND model = $2 AND model_year = $3 AND engine_capacity = $4`,
        [brand, model, Number(modelYear), Number(engineCapacity)],
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Yakıt tipleri getirilemedi: ", err);
      return res.status(500).json({ message: "Sunucu hatası!" });
    }
  },
);

router.get(
  "/car-value/:brand/:model/:modelYear/:engineCapacity/:fuelType",
  async (req, res) => {
    try {
      const { brand, model, modelYear, engineCapacity, fuelType } = req.params;
      const result = await db.query(
        `SELECT ARRAY_AGG(DISTINCT horsepower) AS horsepowers
       FROM cars
       WHERE brand = $1 AND model = $2 AND model_year = $3 AND engine_capacity = $4 AND fuel_type = $5`,
        [brand, model, Number(modelYear), Number(engineCapacity), fuelType],
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Beygir güçleri getirilemedi: ", err);
      return res.status(500).json({ message: "Sunucu hatası!" });
    }
  },
);

router.get(
  "/car-value/:brand/:model/:modelYear/:engineCapacity/:fuelType/:horsepower",
  async (req, res) => {
    try {
      const { brand, model, modelYear, engineCapacity, fuelType, horsepower } =
        req.params;
      const result = await db.query(
        `SELECT ARRAY_AGG(DISTINCT transmission) AS transmissions
       FROM cars
       WHERE brand = $1 AND model = $2 AND model_year = $3 AND engine_capacity = $4 AND fuel_type = $5 AND horsepower = $6`,
        [
          brand,
          model,
          Number(modelYear),
          Number(engineCapacity),
          fuelType,
          Number(horsepower),
        ],
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Vites tipleri getirilemedi: ", err);
      return res.status(500).json({ message: "Sunucu hatası!" });
    }
  },
);

router.get(
  "/car-value/:brand/:model/:modelYear/:engineCapacity/:fuelType/:horsepower/:transmission",
  async (req, res) => {
    try {
      const {
        brand,
        model,
        modelYear,
        engineCapacity,
        fuelType,
        horsepower,
        transmission,
      } = req.params;
      const result = await db.query(
        `SELECT ARRAY_AGG(DISTINCT body_type) AS body_types
       FROM cars
       WHERE brand = $1 AND model = $2 AND model_year = $3 AND engine_capacity = $4 AND fuel_type = $5 AND horsepower = $6 AND transmission = $7`,
        [
          brand,
          model,
          Number(modelYear),
          Number(engineCapacity),
          fuelType,
          Number(horsepower),
          transmission,
        ],
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Kasa tipleri getirilemedi: ", err);
      return res.status(500).json({ message: "Sunucu hatası!" });
    }
  },
);

router.get(
  "/car-value/:brand/:model/:modelYear/:engineCapacity/:fuelType/:horsepower/:transmission/:bodyType",
  async (req, res) => {
    try {
      const {
        brand,
        model,
        modelYear,
        engineCapacity,
        fuelType,
        horsepower,
        transmission,
        bodyType,
      } = req.params;
      const result = await db.query(
        `SELECT ARRAY_AGG(DISTINCT trim_level) AS trim_levels
       FROM cars
       WHERE brand = $1 AND model = $2 AND model_year = $3 AND engine_capacity = $4 AND fuel_type = $5 AND horsepower = $6 AND transmission = $7 AND body_type = $8`,
        [
          brand,
          model,
          Number(modelYear),
          Number(engineCapacity),
          fuelType,
          Number(horsepower),
          transmission,
          bodyType,
        ],
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.log("Paketler getirilemedi: ", err);
      return res.status(500).json({ message: "Sunucu hatası!" });
    }
  },
);
