import express from "express";
import { db } from "../lib/db.js";
import verifyToken from "../middlewares/verifyToken.js";
import multer from "multer";

export const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const queryText = `
      SELECT 
        a.*, 
        i.image_url AS image_src
      FROM adverts a
      LEFT JOIN (
        SELECT 
          advert_id, 
          image_url,
          ROW_NUMBER() OVER (PARTITION BY advert_id ORDER BY id ASC) as rn
        FROM advert_images
      ) i ON a.id = i.advert_id AND i.rn = 1
      WHERE a.is_sold = false
      ORDER BY a.id DESC;
    `;
    const result = await db.query(queryText);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Veritabanı sorgu hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.get("/favoriteAdverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      `SELECT a.*, 
              (SELECT image_url 
               FROM advert_images 
               WHERE advert_id = a.id 
               LIMIT 1) AS image_data
       FROM adverts AS a 
       INNER JOIN favorite_adverts AS f ON a.id = f.advert_id 
       WHERE f.user_id = $1 AND a.is_sold = false
       ORDER BY f.id DESC`,
      [userId],
    );
    if (result.rows.length === 0) return res.status(200).json([]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Favori Getirme Hatası:", err);
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/myAdverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      `SELECT a.*, 
              (SELECT image_url 
               FROM advert_images 
               WHERE advert_id = a.id 
               LIMIT 1) AS image_data
       FROM adverts AS a 
       WHERE a.user_id = $1 AND a.is_sold = false
       ORDER BY a.id DESC`,
      [userId],
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("İlanlarım Getirme Hatası:", err);
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.get("/myMessageAdverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      `SELECT DISTINCT a.id AS advert_id, a.brand, a.model, a.model_year, a.engine_capacity, a.price, a.image_src, a.title, a.user_id AS advert_owner_id 
       FROM adverts AS a 
       JOIN messages AS m ON a.id = m.advert_id 
       WHERE (m.user_id = $1 OR m.receiver_id = $1) AND a.is_sold = false 
       ORDER BY a.id ASC`,
      [userId],
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
      [userId, advertId],
    );
    if (selectResult.rows.length === 0) {
      try {
        await db.query(
          "INSERT INTO favorite_adverts (user_id, advert_id) VALUES ($1, $2)",
          [userId, advertId],
        );
        res.status(200).json({ isFavorite: true });
      } catch (err) {
        res.status(500).json({ message: "Sunucu hatası!" });
      }
    } else {
      await db.query(
        "DELETE FROM favorite_adverts WHERE user_id = $1 AND advert_id = $2",
        [userId, advertId],
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
      `SELECT 
        a.*, 
        u.name AS user_name, 
        u.surname AS user_surname, 
        u.tel_number AS user_tel, 
        u.created_at AS user_created, 
        EXISTS (
          SELECT 1 FROM favorite_adverts AS fa 
          WHERE fa.advert_id = a.id AND fa.user_id = $1
        ) AS "isFavorite",
        (
          SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', ai.id, 
                'image_data', ai.image_url, 
                'is_main', ai.is_main
              )
            ), 
            '[]'
          )
          FROM advert_images AS ai
          WHERE ai.advert_id = a.id
        ) AS images
      FROM adverts AS a 
      JOIN users AS u ON u.id = a.user_id 
      WHERE a.id = $2 AND a.is_sold = false`,
      [userId, advertId],
    );
    if (!result.rows.length) {
      return res
        .status(404)
        .json({ message: "İlan bulunamadı veya satılmış olabilir." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("SQL Hatası Detayı:", err.message);
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.delete("/:advertId", verifyToken, async (req, res) => {
  const { advertId } = req.params;
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      "DELETE FROM adverts WHERE user_id = $1 AND id = $2",
      [userId, advertId],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "İlan bulunamadı" });
    }
    res.status(200).json({ message: "İlan başarıyla kaldırıldı." });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 50 * 1024 * 1024,
  },
});

router.post(
  "/post",
  verifyToken,
  upload.array("images", 10),
  async (req, res) => {
    const data = req.body;
    const user = req.user;
    const isScratched = data.hasScratch === "true" || data.hasScratch === true;
    const hasDent = data.hasDent === "true" || data.hasDent === true;
    const trimLevel = data.trimLevel;
    try {
      const advertResult = await db.query(
        `INSERT INTO adverts (
          user_id, brand, model, model_year, body_type, 
          engine_capacity, horsepower, transmission, kilometer, 
          fuel_type, price, city, title, description, has_scratch, has_dent, trim_level
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
        [
          Number(user.id),
          data.brand,
          data.model,
          data.modelYear ? Number(data.modelYear) : null,
          data.bodyType,
          data.engineCapacity ? Number(data.engineCapacity) : null,
          data.horsepower ? Number(data.horsepower) : null,
          data.transmission,
          data.kilometer ? Number(data.kilometer) : null,
          data.fuelType,
          data.price ? Math.round(Number(data.price)) : null,
          user.city,
          data.title,
          data.description,
          isScratched,
          hasDent,
          trimLevel,
        ],
      );
      const newAdvertId = advertResult.rows[0].id;
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const valuesQueryParts = [];
        const queryArgs = [newAdvertId];
        req.files.forEach((file, index) => {
          const imgParamIndex = index * 2 + 2;
          const mainParamIndex = index * 2 + 3;
          valuesQueryParts.push(`($1, $${imgParamIndex}, $${mainParamIndex})`);
          const base64Str = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
          queryArgs.push(base64Str);
          queryArgs.push(index === 0);
        });
        const imagesInsertQuery = `
          INSERT INTO advert_images (advert_id, image_url, is_main) 
          VALUES ${valuesQueryParts.join(", ")}
        `;
        await db.query(imagesInsertQuery, queryArgs);
      }
      res.status(200).json({
        message: "İlan ve fotoğraflar başarıyla yayınlandı.",
        advertId: newAdvertId,
      });
    } catch (err) {
      console.error("İlan Paylaşım Hatası:", err);
      res.status(500).json({ message: "Sunucu hatası." });
    }
  },
);

router.put(
  "/edit",
  verifyToken,
  upload.array("images", 10),
  async (req, res) => {
    const { id, title, description, existingImages } = req.body;
    const user = req.user;
    const newFiles = req.files;
    try {
      await db.query(
        "UPDATE adverts SET city = $1, title = $2, description = $3 WHERE user_id = $4 AND id = $5",
        [user.city, title, description, Number(user.id), id],
      );
      await db.query("DELETE FROM advert_images WHERE advert_id = $1", [id]);
      if (existingImages) {
        try {
          const imagesToKeep = JSON.parse(existingImages);
          if (Array.isArray(imagesToKeep)) {
            for (const url of imagesToKeep) {
              if (url && url !== "null" && url !== "") {
                await db.query(
                  "INSERT INTO advert_images (advert_id, image_url, is_main) VALUES ($1, $2, $3)",
                  [id, url, false],
                );
              }
            }
          }
        } catch (parseErr) {
          console.error("JSON Parse Hatası:", parseErr);
        }
      }

      if (newFiles && newFiles.length > 0) {
        for (const file of newFiles) {
          const base64Str = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
          await db.query(
            "INSERT INTO advert_images (advert_id, image_url, is_main) VALUES ($1, $2, $3)",
            [id, base64Str, false],
          );
        }
      }
      res.status(200).json({ message: "İlan başarıyla güncellendi." });
    } catch (err) {
      console.error("Güncelleme Hatası:", err);
      res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
  },
);

router.get("/messages/:advertId", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const advertId = req.params.advertId;
  try {
    const result = await db.query(
      "SELECT m.id, m.user_id, m.receiver_id, m.message FROM messages AS m JOIN users as u ON u.id = m.user_id WHERE advert_id = $1 AND (user_id = $2 OR receiver_id = $2) ORDER BY m.created_at ASC",
      [advertId, userId],
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Sunucu hatası!" });
  }
});
