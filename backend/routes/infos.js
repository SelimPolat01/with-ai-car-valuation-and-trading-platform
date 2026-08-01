import express from "express";
import { db } from "../lib/db.js";
import verifyToken from "../middlewares/verifyToken.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";

export const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const upload = multer({ storage: storage });

router.get("/personal-infos", verifyToken, async (req, res) => {
  const id = req.user.id;
  try {
    const queryText =
      "SELECT name, surname, address, iban, image_src FROM USERS WHERE id = $1";
    const result = await db.query(queryText, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Veritabanı sorgu hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.get("/email", verifyToken, async (req, res) => {
  const id = req.user.id;
  try {
    const queryText = "SELECT email FROM USERS WHERE id = $1";
    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Veritabanı sorgu hatası:", err.message);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.get("/token-duration", verifyToken, async (req, res) => {
  const id = req.user.id;
  try {
    const queryText = "SELECT token_duration FROM users WHERE id = $1";
    const result = await db.query(queryText, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.get("/adverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);

  try {
    const advertsQuery = `
      SELECT * 
      FROM adverts 
      WHERE user_id = $1 AND is_deleted = false AND is_sold = false
      ORDER BY created_at DESC
    `;
    const advertsResult = await db.query(advertsQuery, [userId]);

    const favoritesQuery = `
      SELECT COUNT(*)::int AS count 
      FROM favorite_adverts f 
      JOIN adverts a ON f.advert_id = a.id 
      WHERE f.user_id = $1 AND a.is_deleted = false AND a.is_sold = false
    `;
    const favoritesResult = await db.query(favoritesQuery, [userId]);

    res.status(200).json({
      personalAdverts: advertsResult.rows,
      personalFavoriteAdverts: favoritesResult.rows[0].count || 0,
    });
  } catch (err) {
    console.error("Veritabanı hatası:", err);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.get("/soldAdverts", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  try {
    const result = await db.query(
      `SELECT a.*, 
              (SELECT image_url 
               FROM advert_images 
               WHERE advert_id = a.id 
               ORDER BY is_main DESC, id ASC
               LIMIT 1) AS image_data
       FROM adverts AS a 
       WHERE a.user_id = $1 AND a.is_sold = true AND a.is_deleted = false
       ORDER BY a.sold_at DESC`,
      [userId],
    );

    res.status(200).json({
      personalSoldAdverts: result.rows,
    });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.patch(
  "/personal-infos",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    const id = req.user.id;
    const { name, surname, address, iban } = req.body;

    try {
      let query = "UPDATE users SET ";
      const values = [];
      const sets = [];
      let counter = 1;
      const fields = { name, surname, address, iban };

      if (req.file) {
        fields.image_src = `/uploads/${req.file.filename}`;
      }

      for (let key in fields) {
        if (fields[key] !== undefined && fields[key] !== null) {
          sets.push(`${key} = $${counter}`);
          values.push(fields[key]);
          counter++;
        }
      }

      if (sets.length === 0)
        return res.status(400).json({ message: "Güncellenecek veri yok" });

      query += sets.join(", ") + ` WHERE id = $${counter} RETURNING *`;
      values.push(id);

      const result = await db.query(query, values);

      res.status(200).json({
        message: "Güncelleme başarılı",
        result: result.rows[0],
      });
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      res.status(500).json({ message: "Güncelleme hatası: " + err.message });
    }
  },
);

router.patch("/email", verifyToken, async (req, res) => {
  const id = req.user.id;
  const { email } = req.body;
  try {
    const queryText = "UPDATE users SET email = $1 WHERE id = $2";
    await db.query(queryText, [email, id]);
    res.status(200).json({ message: "E-posta başarıyla güncellenmiştir." });
  } catch (err) {
    res.status(500).json({ message: "Güncelleme hatası: " + err.message });
  }
});

router.patch("/password", verifyToken, async (req, res) => {
  const id = req.user.id;
  const { currentPassword, password } = req.body;
  try {
    const queryText1 = "SELECT password FROM users WHERE id = $1";
    const result = await db.query(queryText1, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }
    const existingHashedPassword = result.rows[0].password;
    const isMatch = await bcrypt.compare(
      currentPassword,
      existingHashedPassword,
    );
    if (!isMatch) {
      return res.status(400).json({
        message:
          "Girilen parola, mevcut parolanız ile uyuşmamaktadır. Lütfen tekrar deneyiniz.",
      });
    }
    const hashedNewPassword = await bcrypt.hash(password, 10);
    const queryText2 = "UPDATE users SET password = $1 WHERE id = $2";
    await db.query(queryText2, [hashedNewPassword, id]);
    res.status(200).json({ message: "Parola başarıyla güncellenmiştir." });
  } catch (err) {
    res.status(500).json({ message: "Güncelleme hatası: " + err.message });
  }
});

router.delete("/account", verifyToken, async (req, res) => {
  const id = req.user.id;

  try {
    const queryText = "DELETE FROM users WHERE id = $1";
    await db.query(queryText, [id]);
    res.status(200).json({
      message: "Hesap başarıyla silindi.",
    });
  } catch (err) {
    res.status(500).json({ message: "Silme işlemi hatası: " + err.message });
  }
});
