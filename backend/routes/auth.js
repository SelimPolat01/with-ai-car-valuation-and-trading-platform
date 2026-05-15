import express from "express";
import { db } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();
const SECRET = process.env.SECRET;

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, surname, tel_number } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email ve password gerekli!" });
    }

    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Bu email zaten kayıtlı!",
        user: existingUser.rows[0],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (email, password, name, surname, tel_number) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, surname, tel_number",
      [email, hashedPassword, name, surname, tel_number]
    );

    const user = result.rows[0];

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Kayıt başarılı!", user, token });
  } catch (err) {
    console.log("Error: ", err);
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users where email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Girilen parola hatalı." });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname,
          tel_number: user.tel_number,
        },
        SECRET,
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).json({ message: "Giriş başarılı.", user, token });
    } else {
      return res
        .status(400)
        .json({ message: "Girilen e-postaya ait kullanıcı bulunamadı." });
    }
  } catch (err) {
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, email, name, surname, tel_number FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});
