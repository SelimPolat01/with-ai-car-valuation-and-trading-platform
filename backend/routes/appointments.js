import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { db } from "../lib/db.js";

export const router = express.Router();

router.get("/personal-appointments", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT 
      a.id AS appointment_id, 
      a.slot_date AS appointment_date, 
      a.slot_time AS appointment_time, 
      a.status AS appointment_status, 
      a.location AS appointment_location, 
      adv.id AS advert_id, 
      adv.brand, 
      adv.model, 
      adv.model_year AS year,
      adv.trim_level,
      adv.fuel_type,
      adv.kilometer,
      adv.transmission,
      adv.horsepower,
      adv.engine_capacity,
      adv.body_type,
      adv.has_scratch,
      adv.has_dent, 
      adv.price,
      adv.summary,
      img.image_url,
      CASE 
        WHEN a.user_id = $1 THEN 'buyer' 
        ELSE 'seller' 
      END AS role
    FROM appointments AS a 
    INNER JOIN adverts AS adv ON adv.id = a.advert_id 
    LEFT JOIN advert_images img ON img.advert_id = adv.id AND img.is_main = TRUE
    WHERE a.user_id = $1 OR adv.user_id = $1 
    ORDER BY a.slot_date DESC, a.slot_time DESC
  `;

  try {
    const result = await db.query(query, [userId]);
    return res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası." });
  }
});

router.patch(
  "/personal-appointments/:appointmentId",
  verifyToken,
  async (req, res) => {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    try {
      const checkQuery = `
        SELECT * 
        FROM appointments 
        WHERE id = $1 AND user_id = $2
      `;
      const checkResult = await db.query(checkQuery, [appointmentId, userId]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          message:
            "Randevu bulunamadı veya bu işlemi yapmak için yetkiniz yok.",
        });
      }

      const appointment = checkResult.rows[0];
      const currentStatus =
        appointment.status || appointment.appointment_status;

      if (currentStatus !== "pending") {
        return res.status(400).json({
          message:
            "Yalnızca bekleyen (pending) durumdaki randevular iptal edilebilir.",
        });
      }

      const updateQuery = `
        UPDATE appointments 
        SET status = 'canceled' 
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `;
      const updateResult = await db.query(updateQuery, [appointmentId, userId]);

      return res.status(200).json({
        message: "Randevu başarıyla iptal edildi.",
        appointment: updateResult.rows[0],
      });
    } catch (err) {
      return res.status(500).json({ message: "Sunucu hatası." });
    }
  },
);
