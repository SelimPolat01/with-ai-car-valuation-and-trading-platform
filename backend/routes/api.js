import express from "express";
import { db } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import verifyToken from "../middlewares/verifyToken.js";

export const router = express.Router();

const resend = new Resend(process.env.SMTP_PASS);

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
};

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, surname, tel_number, address, iban } =
      req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "E-posta ve şifre alanları zorunludur." });
    }

    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message:
          "Bu e-posta adresi ile sistemimizde kayıtlı bir hesap bulunmaktadır.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (email, password, name, surname, tel_number, address, iban) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, name, surname, tel_number, address, iban",
      [email, hashedPassword, name, surname, tel_number, address, iban],
    );

    await db.query("DELETE FROM otp_codes WHERE email = $1", [email]);

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
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ message: "Kayıt işlemi başarıyla tamamlandı.", user });
  } catch (err) {
    console.error(err?.message);
    res
      .status(500)
      .json({
        message:
          "Kayıt işlemi sırasında sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
      });
  }
});

router.post("/login", async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length === 0) {
      return res
        .status(401)
        .json({ message: "E-posta adresi veya şifre hatalı." });
    }

    const user = existingUser.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "E-posta adresi veya şifre hatalı." });
    }

    const durationDays = rememberMe === true ? 30 : 1;
    const maxAgeMs = durationDays * 24 * 60 * 60 * 1000;

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        tel_number: user.tel_number,
        address: user.address,
      },
      process.env.JWT_SECRET,
      { expiresIn: `${durationDays}d` },
    );

    res.cookie("token", token, {
      ...cookieOptions,
      maxAge: maxAgeMs,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Başarıyla giriş yapıldı.",
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error(err?.message);
    return res
      .status(500)
      .json({
        message:
          "Giriş yapılırken sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
      });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    ...cookieOptions,
  });

  res.status(200).json({ message: "Başarıyla çıkış yapıldı." });
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, email, name, surname, tel_number, address FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({
          message: "Kullanıcı bilgileri bulunamadı veya oturum süresi dolmuş.",
        });

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err?.message);
    res
      .status(500)
      .json({
        message: "Kullanıcı bilgileri alınırken sistemsel bir hata oluştu.",
      });
  }
});

router.post("/contact", async (req, res) => {
  try {
    const { name, surname, email, subject, message } = req.body;

    if (!name || !surname || !email || !subject || !message) {
      return res
        .status(400)
        .json({ message: "Lütfen tüm zorunlu alanları eksiksiz doldurunuz." });
    }

    if (subject === "Konu") {
      return res.status(400).json({
        message:
          "Lütfen iletmek istediğiniz mesaj için geçerli bir konu başlığı seçiniz.",
      });
    }

    const result = await db.query(
      "INSERT INTO contact_messages (name, surname, email, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, surname, email, subject, message],
    );

    const { error } = await resend.emails.send({
      from: `İletişim Formu <${process.env.CONTACT_RECEIVER_EMAIL_SUPPORT}>`,
      reply_to: email,
      to: process.env.CONTACT_RECEIVER_EMAIL_SUPPORT,
      subject: `[İletişim] ${subject} - ${name} ${surname}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px;">Yeni İletişim Mesajı</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 10px 0; color: #666; width: 100px; border-bottom: 1px solid #f9f9f9;"><strong>Gönderen:</strong></td>
              <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #f9f9f9;">${name} ${surname}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #f9f9f9;"><strong>E-posta:</strong></td>
              <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #f9f9f9;"><a href="mailto:${email}" style="color: #934b8e; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #f9f9f9;"><strong>Konu:</strong></td>
              <td style="padding: 10px 0; color: #333; border-bottom: 1px solid #f9f9f9;">${subject}</td>
            </tr>
          </table>
          
          <h3 style="color: #444; margin-bottom: 12px; font-size: 16px;">Mesaj Detayı:</h3>
          <div style="background: #f8f9fa; padding: 18px; border-left: 4px solid #934b8e; color: #333; line-height: 1.6; border-radius: 0 4px 4px 0; font-size: 15px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0 15px 0;" />
          <p style="color: #999; font-size: 12px; line-height: 1.5; text-align: center; margin: 0;">
            Bu e-posta sistem tarafından otomatik olarak iletilmiştir.<br>
            Doğrudan bu e-postayı yanıtlayarak göndericiye (<strong>${email}</strong>) cevap verebilirsiniz.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Gönderim Hatası:", error);
      return res
        .status(500)
        .json({
          message:
            "Mesajınız iletilirken sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
        });
    }

    return res.status(200).json({
      message:
        "Mesajınız başarıyla iletilmiştir. En kısa sürede tarafınıza dönüş yapılacaktır.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err?.message);
    return res
      .status(500)
      .json({
        message:
          "Mesajınız iletilirken sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
      });
  }
});

router.post("/email", async (req, res) => {
  const { email } = req.body;
  const { forLogin } = req.query;

  if (!email) {
    return res
      .status(400)
      .json({ message: "Lütfen geçerli bir e-posta adresi giriniz." });
  }

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTime = new Date(Date.now() + 5 * 60000);

    if (forLogin === "true") {
      const userCheck = await db.query("SELECT 1 FROM users WHERE email = $1", [
        email,
      ]);
      if (userCheck.rows.length === 0) {
        return res
          .status(404)
          .json({
            message:
              "Sistemimizde bu e-posta adresine ait bir hesap bulunamadı.",
          });
      }

      await db.query(
        "UPDATE users SET otp = $1, otp_expires_at = $2 WHERE email = $3",
        [otpCode, expireTime, email],
      );

      const { error } = await resend.emails.send({
        from: `Güvenlik Ekibi <${process.env.CONTACT_RECEIVER_EMAIL_AUTH}>`,
        to: email,
        subject: "Giriş ve Şifre Sıfırlama Doğrulama Kodu",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #333;">Hesap Doğrulama Talebi</h2>
            <p style="color: #555; line-height: 1.5;">Hesabınıza giriş yapmak veya şifrenizi sıfırlamak için aşağıdaki 6 haneli doğrulama kodunu kullanabilirsiniz:</p>
            <div style="text-align: center; margin: 20px 0;">
              <h1 style="color: #934b8e; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
            </div>
            <p style="color: #555;">Bu kodun geçerlilik süresi <strong>5 dakikadır</strong>.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #dc2626; font-size: 13px; line-height: 1.4; font-weight: 600; background-color: #fef2f2; padding: 10px; border-radius: 6px; border: 1px solid #fecaca; margin: 0;">Eğer bu işlemi siz başlatmadıysanız, hesabınızın güvenliği için lütfen bu e-postayı dikkate almayınız ve şifrenizi güncelleyiniz.</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend OTP Hatası:", error);
        return res
          .status(500)
          .json({
            message:
              "Doğrulama kodu e-posta adresinize gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
          });
      }

      return res.status(200).json({
        success: true,
        message: "Doğrulama kodu e-posta adresinize gönderildi.",
      });
    } else {
      const existingUser = await db.query(
        "SELECT 1 FROM users WHERE email = $1",
        [email],
      );
      if (existingUser.rows.length > 0) {
        return res
          .status(409)
          .json({
            message:
              "Bu e-posta adresi zaten kullanımda. Lütfen giriş yapmayı deneyiniz.",
          });
      }

      await db.query(
        `INSERT INTO otp_codes (email, otp, expires_at) 
         VALUES ($1, $2, $3)
         ON CONFLICT (email) 
         DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
        [email, otpCode, expireTime],
      );

      const { error } = await resend.emails.send({
        from: `Güvenlik Ekibi <${process.env.CONTACT_RECEIVER_EMAIL_AUTH}>`,
        to: email,
        subject: "Yeni Kayıt Doğrulama Kodu",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #333;">Aramıza Hoş Geldiniz!</h2>
            <p style="color: #555; line-height: 1.5;">Kayıt işleminizi tamamlamak ve e-posta adresinizi doğrulamak için aşağıdaki 6 haneli kodu kullanabilirsiniz:</p>
            <div style="text-align: center; margin: 20px 0;">
              <h1 style="color: #934b8e; letter-spacing: 5px; margin: 0;">${otpCode}</h1>
            </div>
            <p style="color: #555;">Bu kodun geçerlilik süresi <strong>5 dakikadır</strong>.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #dc2626; font-size: 13px; line-height: 1.4; font-weight: 600; background-color: #fef2f2; padding: 10px; border-radius: 6px; border: 1px solid #fecaca; margin: 0;">Bu talebi siz oluşturmadıysanız, herhangi bir işlem yapmanıza gerek yoktur.</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend OTP Hatası:", error);
        return res
          .status(500)
          .json({
            message:
              "Doğrulama kodu e-posta adresinize gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
          });
      }

      return res.status(200).json({
        success: true,
        message: "Kayıt doğrulama kodu e-postanıza gönderildi.",
      });
    }
  } catch (err) {
    console.error("Sunucu Hatası Detayı:", err?.message);
    return res.status(500).json({
      message:
        "İşlem sırasında sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
    });
  }
});

router.post("/otp", async (req, res) => {
  const { email, otp } = req.body;
  const { forLogin } = req.query;

  if (!email || !otp) {
    return res
      .status(400)
      .json({
        message: "E-posta adresi ve doğrulama kodu alanları zorunludur.",
      });
  }

  try {
    if (forLogin === "true") {
      const queryText =
        "SELECT otp, otp_expires_at FROM users WHERE email = $1";
      const result = await db.query(queryText, [email]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({
            message:
              "Sistemimizde bu e-posta adresine ait bir hesap bulunamadı.",
          });
      }

      const user = result.rows[0];

      if (new Date() > new Date(user.otp_expires_at)) {
        await db.query(
          "UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE email = $1",
          [email],
        );
        return res.status(400).json({
          message:
            "Doğrulama kodunun geçerlilik süresi dolmuştur. Lütfen yeni bir kod talep ediniz.",
        });
      }

      if (!user.otp || String(user.otp) !== String(otp)) {
        return res
          .status(400)
          .json({
            message:
              "Girdiğiniz doğrulama kodu hatalıdır. Lütfen kontrol edip tekrar deneyiniz.",
          });
      }

      await db.query(
        "UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE email = $1",
        [email],
      );

      return res.status(200).json({
        success: true,
        message: "Doğrulama işlemi başarıyla tamamlandı.",
      });
    } else {
      const queryText =
        "SELECT otp, expires_at FROM otp_codes WHERE email = $1";
      const result = await db.query(queryText, [email]);

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({
            message:
              "Bu e-posta adresi için aktif bir doğrulama kodu talebi bulunmamaktadır.",
          });
      }

      const otpRecord = result.rows[0];

      if (new Date() > new Date(otpRecord.expires_at)) {
        await db.query("DELETE FROM otp_codes WHERE email = $1", [email]);
        return res.status(400).json({
          message:
            "Doğrulama kodunun geçerlilik süresi dolmuştur. Lütfen yeni bir kod talep ediniz.",
        });
      }

      if (!otpRecord.otp || String(otpRecord.otp) !== String(otp)) {
        return res
          .status(400)
          .json({
            message:
              "Girdiğiniz doğrulama kodu hatalıdır. Lütfen kontrol edip tekrar deneyiniz.",
          });
      }

      return res.status(200).json({
        success: true,
        message: "Doğrulama işlemi başarıyla tamamlandı.",
      });
    }
  } catch (err) {
    console.error("OTP Doğrulama Hatası:", err?.message);
    return res.status(500).json({
      message: "Doğrulama işlemi sırasında sistemsel bir hata oluştu.",
    });
  }
});

router.patch("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ message: "Lütfen tüm alanları eksiksiz doldurunuz." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({
        message:
          "Yeni şifreniz güvenlik amacıyla en az 6 karakterden oluşmalıdır.",
      });
  }

  try {
    const result = await db.query(
      "SELECT otp, otp_expires_at FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({
          message: "Sistemimizde bu e-posta adresine ait bir hesap bulunamadı.",
        });
    }

    const user = result.rows[0];

    if (!user.otp || user.otp !== otp) {
      return res
        .status(400)
        .json({
          message: "Girdiğiniz doğrulama kodu hatalı veya geçersizdir.",
        });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res
        .status(400)
        .json({
          message:
            "Doğrulama kodunun geçerlilik süresi dolmuştur. Lütfen yeni bir kod talep ediniz.",
        });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = $1, otp = NULL, otp_expires_at = NULL WHERE email = $2",
      [hashedPassword, email],
    );

    return res.status(200).json({
      success: true,
      message:
        "Şifreniz başarıyla güncellenmiştir. Yeni şifrenizle giriş yapabilirsiniz.",
    });
  } catch (err) {
    console.error("Şifre Sıfırlama Hatası: ", err);
    return res.status(500).json({
      message:
        "Şifre sıfırlama işlemi sırasında sistemsel bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.",
    });
  }
});
