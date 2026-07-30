import express from "express";
import { db } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();
const SECRET = process.env.SECRET;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
    console.error(err?.message);
    res.status(500).json({ message: "Sunucu hatası!" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: "Girilen parola hatalı." });
      }

      const durationDays = rememberMe === true ? 30 : 1;

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
        .status(404)
        .json({ message: "Girilen e-postaya ait kullanıcı bulunamadı." });
    }
  } catch (err) {
    console.error(err?.message);
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
    console.error(err?.message);
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

    await transporter.sendMail({
      from: `"${name} ${surname}" <${process.env.CONTACT_RECEIVER_EMAIL_SUPPORT}>`,
      replyTo: email,
      to: process.env.CONTACT_RECEIVER_EMAIL_SUPPORT,
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
    console.error(err?.message);
    return res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.post("/email", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "E-posta adresi gerekli." });
  }

  const queryText = "SELECT 1 FROM users WHERE email = $1";

  try {
    const existingEmail = await db.query(queryText, [email]);
    if (existingEmail.rows.length > 0) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expireTime = new Date(Date.now() + 5 * 60000);

      await db.query(
        "UPDATE users SET otp = $1, otp_expires_at = $2 WHERE email = $3",
        [otpCode, expireTime, email],
      );

      await transporter.sendMail({
        from: `"Güvenlik Ekibi" <${process.env.CONTACT_RECEIVER_EMAIL_AUTH}>`,
        to: email,
        subject: "Şifre Sıfırlama Doğrulama Kodunuz",
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2>Şifre Sıfırlama Talebi</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki 6 haneli doğrulama kodunu kullanabilirsiniz:</p>
          <h1 style="color: #934b8e; letter-spacing: 4px;">${otpCode}</h1>
          <p>Bu kod <strong>5 dakika</strong> boyunca geçerlidir.</p>
          <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı dikkate almayınız.</p>
        </div>
      `,
      });

      return res.status(200).json({
        success: true,
        message: "Doğrulama kodu e-postanıza gönderildi.",
      });
    } else {
      return res
        .status(404)
        .json({ message: "Girilen e-postaya ait kullanıcı bulunamadı." });
    }
  } catch (err) {
    console.error(err?.message);
    return res.status(500).json({
      message: "E-posta kontrol edilirken sunucu hatası meydana geldi.",
    });
  }
});

router.post("/otp", async (req, res) => {
  const { email, otp } = req.body;
  const queryText = "SELECT otp, otp_expires_at FROM users WHERE email = $1";

  try {
    const result = await db.query(queryText, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const user = result.rows[0];

    if (!user.otp || user.otp !== otp) {
      return res
        .status(400)
        .json({ message: "Girilen doğrulama kodu hatalı." });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res
        .status(400)
        .json({ message: "Doğrulama kodunun süresi dolmuş." });
    }

    return res.status(200).json({
      success: true,
      message: "Doğrulama başarılı.",
    });
  } catch (err) {
    console.error(err?.message);
    return res.status(500).json({
      message: "OTP doğrulanırken sunucu hatası meydana geldi.",
    });
  }
});

router.patch("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Yeni şifre en az 6 karakter olmalıdır." });
  }

  try {
    const result = await db.query(
      "SELECT otp, otp_expires_at FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const user = result.rows[0];

    if (!user.otp || user.otp !== otp) {
      return res
        .status(400)
        .json({ message: "Geçersiz veya hatalı doğrulama kodu." });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res
        .status(400)
        .json({ message: "Doğrulama kodunun süresi dolmuş." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = $1, otp = NULL, otp_expires_at = NULL WHERE email = $2",
      [hashedPassword, email],
    );

    return res.status(200).json({
      success: true,
      message: "Şifreniz başarıyla güncellendi.",
    });
  } catch (err) {
    console.error("Şifre Sıfırlama Hatası: ", err);
    return res.status(500).json({
      message: "Şifre güncellenirken sunucu hatası meydana geldi.",
    });
  }
});
