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
      "SELECT name, surname, city, iban, image_src FROM USERS WHERE id = $1";
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
  const userId = req.user?.id;
  try {
    const queryText = "SELECT * FROM adverts WHERE user_id = $1";
    const advertsResult = await db.query(queryText, [userId]);
    const favoritesQuery =
      "SELECT COUNT(*) FROM favorite_adverts WHERE user_id = $1";
    const favoritesResult = await db.query(favoritesQuery, [userId]);
    res.status(200).json({
      personalAdverts: advertsResult.rows,
      personalFavoriteAdverts: parseInt(favoritesResult.rows[0].count || 0, 10),
    });
  } catch (err) {
    console.error("Veritabanı hatası:", err);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.get("/soldAdverts", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      "SELECT * FROM sold_adverts WHERE user_id = $1",
      [userId],
    );
    res.status(200).json({
      personalSoldAdverts: result.rows,
    });
  } catch (err) {
    console.error("Veritabanı hatası:", err);
    res.status(500).json({ message: "Sunucu hatası: " + err.message });
  }
});

router.patch(
  "/personal-infos",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    console.log("--- PATCH İSTEĞİ GELDİ ---");
    console.log("GELEN METİNLER:", req.body);
    console.log("GELEN RESİM:", req.file);

    const id = req.user.id;
    // DİKKAT: "title" kelimesini buradan sildik (Veritabanında yoktu)
    const { name, surname, city, iban } = req.body;

    try {
      let query = "UPDATE users SET "; // Küçük harf users daha güvenlidir
      const values = [];
      const sets = [];
      let counter = 1;

      // DİKKAT: "title" kelimesini fields içinden de sildik
      const fields = { name, surname, city, iban };

      // Eğer resim frontend'den başarıyla geldiyse:
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

router.patch("/token-duration", verifyToken, async (req, res) => {
  const id = req.user.id;
  const { tokenDuration } = req.body;

  try {
    const queryText =
      "UPDATE users SET token_duration = $1 WHERE id = $2 RETURNING token_duration";
    const result = await db.query(queryText, [tokenDuration, id]);
    res.status(200).json({
      message: "Token süresi başarıyla güncellendi.",
      tokenDuration: result.rows[0].token_duration,
    });
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
