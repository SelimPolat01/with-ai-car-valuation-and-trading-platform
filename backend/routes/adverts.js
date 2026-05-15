import express from "express";
import { db } from "../lib/db.js";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM adverts ORDER BY id DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/favoriteAdverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      "SELECT a.* FROM adverts AS a INNER JOIN favorite_adverts AS f ON a.id = f.advert_id WHERE f.user_id = $1 ORDER BY f.id DESC",
      [userId]
    );
    if (result.rows.length === 0) return res.status(200).json([]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/myAdverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const result = await db.query("SELECT * FROM adverts WHERE user_id = $1", [
      userId,
    ]);

    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/myMessageAdverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      "SELECT DISTINCT a.id AS advert_id, a.brand, a.model, a.model_year, a.engine_capacity, a.price, a.image_src, a.title, a.user_id AS advert_owner_id FROM adverts AS a JOIN messages AS m ON a.id = m.advert_id WHERE m.user_id = $1 OR m.receiver_id = $1 ORDER BY a.id ASC",
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.post("/favoriteAdverts/:advertId", verifyToken, async (req, res) => {
  const advertId = Number(req.params.advertId);
  const userId = Number(req.user.id);

  try {
    const selectResult = await db.query(
      "SELECT * FROM favorite_adverts WHERE user_id = $1 AND advert_id = $2",
      [userId, advertId]
    );
    if (selectResult.rows.length === 0) {
      try {
        const insertResult = await db.query(
          "INSERT INTO favorite_adverts (user_id, advert_id) VALUES ($1, $2)",
          [userId, advertId]
        );
        res.status(200).json({ isFavorite: true });
      } catch (err) {
        res.status(500).json({ message: "Sunucu hatası!" });
      }
    } else {
      const deleteResult = await db.query(
        "DELETE FROM favorite_adverts WHERE user_id = $1 AND advert_id = $2",
        [userId, advertId]
      );
      res.status(200).json({ isFavorite: false });
    }
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/:advertId", verifyToken, async (req, res) => {
  const { advertId } = req.params;
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      `SELECT a.*, u.name AS user_name, u.surname AS user_surname, u.tel_number AS user_tel, u.created_at AS user_created, EXISTS (SELECT 1 FROM favorite_adverts AS fa WHERE fa.advert_id = a.id AND fa.user_id = $1) AS "isFavorite" FROM adverts AS a JOIN users AS u ON u.id = a.user_id WHERE a.id = $2`,
      [userId, advertId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.delete("/:advertId", verifyToken, async (req, res) => {
  const { advertId } = req.params;
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      "DELETE FROM adverts WHERE user_id = $1 AND id = $2",
      [userId, advertId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }

    res.status(200).json({ message: "İlan başarıyla kaldırıldı." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.post("/post", verifyToken, async (req, res) => {
  const data = req.body;
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      "INSERT INTO adverts (user_id, brand, model, model_year, body_type, engine_capacity, horsepower, transmission, kilometer, fuel_type, changed_part_count, price, image_src, city, title, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)",
      [
        userId,
        data.brand,
        data.model,
        data.modelYear,
        data.bodyType,
        data.engineCapacity,
        data.horsepower,
        data.transmission,
        data.kilometer,
        data.fuelType,
        data.changedPartCount,
        data.price,
        data.imageSrc,
        data.city,
        data.title,
        data.description,
      ]
    );

    res.status(200).json({ message: "İlan başarıyla yayınlandı." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.put("/edit", verifyToken, async (req, res) => {
  const data = req.body;
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      "UPDATE adverts SET city = $1, image_src = $2, title = $3, description = $4 WHERE user_id = $5 AND id = $6",
      [data.city, data.imageSrc, data.title, data.description, userId, data.id]
    );

    res.status(200).json({ message: "İlan başarıyla yayınlandı." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/messages/:advertId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const advertId = req.params.advertId;

  try {
    const result = await db.query(
      "SELECT m.id, m.user_id, m.receiver_id, m.message FROM messages AS m JOIN users as u ON u.id = m.user_id WHERE advert_id = $1 AND (user_id = $2 OR receiver_id = $2) ORDER BY m.created_at ASC",
      [advertId, userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
});
