import express from "express";
import { db } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();
const SECRET = process.env.SECRET;

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, surname, tel_number, address, iban } =
      req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email ve password gerekli!" });
    }

    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: "Bu email zaten kayıtlı!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (email, password, name, surname, tel_number, address, iban) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, surname, tel_number, address, iban",
      [email, hashedPassword, name, surname, tel_number, address, iban],
    );

    const user = result.rows[0];
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        tel_number: user.tel_number,
        address: user.address,
      },
      SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({ message: "Kayıt başarılı!", user, token });
  } catch (err) {
    console.log("Kayıt Hatası: ", err);
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Girilen parola hatalı." });
      }

      const durationDays = user.token_duration || 1;

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          surname: user.surname,
          tel_number: user.tel_number,
          address: user.address,
        },
        SECRET,
        { expiresIn: `${durationDays}d` },
      );

      const { password: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        message: "Giriş başarılı.",
        user: userWithoutPassword,
        token,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Girilen e-postaya ait kullanıcı bulunamadı." });
    }
  } catch (err) {
    console.error("Login Hatası: ", err);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, email, name, surname, tel_number, address FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.post("/contact", async (req, res) => {
  try {
    const { name, surname, email, subject, message } = req.body;

    if (!name || !surname || !email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Lütfen tüm zorunlu alanları doldurun." });
    }

    if (subject === "Konu") {
      return res.status(400).json({
        message: "Lütfen geçerli bir konu seçiniz.",
      });
    }

    const result = await db.query(
      "INSERT INTO contact_messages (name, surname, email, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, surname, email, subject, message],
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${name} ${surname}" <info@yapayoto.com.tr>`,
      replyTo: email,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: `[İletişim Formu] ${subject}`,
      html: `
        <h2>Yeni İletişim Formu Mesajı</h2>
        <p><strong>Gönderen:</strong> ${name} ${surname} (${email})</p>
        <p><strong>Konu:</strong> ${subject}</p>
        <p><strong>Mesaj:</strong></p>
        <div style="background: #f4f4f4; padding: 12px; border-left: 4px solid #00f4ff;">
          ${message.replace(/\n/g, "<br>")}
        </div>
      `,
    });

    return res.status(200).json({
      message: "Mesajınız başarıyla iletildi.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("İletişim Formu Hatası: ", err);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});
