import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { db } from "../lib/db.js";

export const router = express.Router();

router.get("/trading-values", verifyToken, async (req, res) => {
  const userId = req.user.id;

  const queryText = `
    SELECT 
      appo.id AS appointment_id,
      a.id AS advert_id,
      a.brand, 
      a.model, 
      a.model_year,
      a.engine_capacity,
      a.trim_level,
      a.plate,
      a.chassis_number,
      a.tramer_record,
      a.inspection_date,
      a.has_pledge,
      a.has_service_maintenance,
      a.has_warranty,
      a.has_spare_key,
      a.tire_type,
      a.tire_condition,
      a.extras,
      a.lpg_status,
      a.owner_count,
      a.price AS total_price, 
      appo.status, 
      appo.slot_date, 
      appo.slot_time, 
      appo.location,
      pay.payment_status,
      pay.deposit_amount, 
      pay.remaining_amount, 
      pay.transaction_reference,
      img.image_url,
      (
        SELECT COALESCE(json_agg(image_url), '[]'::json) 
        FROM advert_images 
        WHERE advert_id = a.id AND is_expertise = TRUE
      ) AS expertise_images,
      (
        SELECT COALESCE(json_agg(image_url), '[]'::json) 
        FROM advert_images 
        WHERE advert_id = a.id AND is_permit = TRUE
      ) AS permit_images,
      CASE 
        WHEN appo.user_id = $1 THEN 'buyer' 
        WHEN a.user_id = $1 THEN 'seller'    
      END as role
    FROM adverts AS a
    INNER JOIN appointments AS appo ON appo.advert_id = a.id
    LEFT JOIN advert_payments AS pay ON pay.appointment_id = appo.id
    LEFT JOIN advert_images img ON img.advert_id = a.id AND img.is_main = TRUE
    WHERE appo.user_id = $1 OR a.user_id = $1
    ORDER BY appo.created_at DESC;
  `;

  try {
    const result = await db.query(queryText, [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "İşlemler getirilirken sunucu hatası oluştu.",
    });
  }
});
