import express from "express";
import { db } from "../lib/db.js";
import verifyToken from "../middlewares/verifyToken.js";
import multer from "multer";
import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";

export const router = express.Router();

router.get("/", async (req, res) => {
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
          ROW_NUMBER() OVER (PARTITION BY advert_id ORDER BY is_main DESC, id ASC) as rn
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
               ORDER BY is_main DESC, id ASC
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

router.get("/check-favorite/:advertId", verifyToken, async (req, res) => {
  const userId = Number(req.user.id);
  const { advertId } = req.params;
  try {
    const result = await db.query(
      `SELECT EXISTS(SELECT 1 FROM favorite_adverts WHERE user_id = $1 AND advert_id = $2)`,
      [userId, advertId],
    );
    res.status(200).json({ isFavorite: result.rows[0].exists });
  } catch (err) {
    console.error("Favori Kontrol Hatası:", err);
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
               ORDER BY is_main DESC, id ASC
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

router.get("/:advertId", async (req, res) => {
  const { advertId } = req.params;

  if (!advertId || advertId === "undefined" || isNaN(Number(advertId))) {
    return res.status(400).json({ message: "ID bekleniyor" });
  }

  let userId = 9999;

  const token = req.cookies?.token;

  if (token && token !== "null" && token !== "undefined") {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = Number(decoded.id) || 9999;
    } catch (err) {
      console.error("Token doğrulama hatası:", err.message);
    }
  }

  try {
    const result = await db.query(
      `SELECT 
        a.*, 
        u.name AS user_name, 
        u.surname AS user_surname, 
        u.tel_number AS user_tel, 
        u.address AS address,
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
              ) ORDER BY ai.is_main DESC, ai.id ASC
            ), 
            '[]'
          )
          FROM advert_images AS ai
          WHERE ai.advert_id = a.id
        ) AS images
      FROM adverts AS a 
      JOIN users AS u ON u.id = a.user_id 
      WHERE a.id = $2 AND a.is_sold = false`,
      [userId, Number(advertId)],
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 50 * 1024 * 1024,
  },
});

router.post("/post", verifyToken, upload.any(), async (req, res) => {
  const data = req.body;
  const user = req.user;
  const isScratched = data.hasScratch === "true" || data.hasScratch === true;
  const hasDent = data.hasDent === "true" || data.hasDent === true;
  const hasPledge = data.hasPledge === "true" || data.hasPledge === true;
  const hasServiceMaintence =
    data.hasServiceMaintence === "yes"
      ? "yes"
      : data.hasServiceMaintence === "no"
        ? "no"
        : null;
  const hasWarrenty = data.hasWarrenty === "true" || data.hasWarrenty === true;
  const hasSpareKey = data.hasSpareKey === "true" || data.hasSpareKey === true;

  const trimLevel = data.trimLevel;
  const {
    coverImageIdentifier,
    plate,
    chassisNumber,
    tramerRecord,
    inspectionDate,
    ownerCount,
    tireType,
    tireCondition,
    extras,
    lpgStatus,
  } = data;

  let imageEmbedding = null;
  if (data.image_embedding) {
    try {
      const parsedArray = JSON.parse(data.image_embedding);
      if (Array.isArray(parsedArray)) {
        imageEmbedding = JSON.stringify(parsedArray);
      }
    } catch (err) {
      console.warn("Embedding parse edilemedi", err);
    }
  }

  let descEmbedding = null;
  if (data.description_embedding) {
    try {
      const parsedArray = JSON.parse(data.description_embedding);
      if (Array.isArray(parsedArray)) {
        descEmbedding = JSON.stringify(parsedArray);
      }
    } catch (err) {}
  }

  let sumEmbedding = null;
  if (data.description_summary_embedding) {
    try {
      const parsedArray = JSON.parse(data.description_summary_embedding);
      if (Array.isArray(parsedArray)) {
        sumEmbedding = JSON.stringify(parsedArray);
      }
    } catch (err) {}
  }

  try {
    const advertResult = await db.query(
      `INSERT INTO adverts (
          user_id, brand, model, model_year, body_type, 
          engine_capacity, horsepower, transmission, kilometer, 
          fuel_type, price, title, description, summary, has_scratch, has_dent, trim_level, 
          image_embedding, description_embedding, description_summary_embedding, plate,
          chassis_number, tramer_record, inspection_date, owner_count, has_pledge, 
          has_service_maintenance, has_warranty, has_spare_key, tire_type, tire_condition, 
          extras, lpg_status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33
        ) RETURNING id`,
      [
        Number(user.id),
        data.brand || null,
        data.model || null,
        data.modelYear && !isNaN(Number(data.modelYear))
          ? Number(data.modelYear)
          : null,
        data.bodyType || null,
        data.engineCapacity && !isNaN(Number(data.engineCapacity))
          ? Number(data.engineCapacity)
          : null,
        data.horsepower && !isNaN(Number(data.horsepower))
          ? Number(data.horsepower)
          : null,
        data.transmission || null,
        data.kilometer && !isNaN(Number(data.kilometer))
          ? Number(data.kilometer)
          : null,
        data.fuelType || null,
        data.price && !isNaN(Number(data.price))
          ? Math.round(Number(data.price))
          : null,
        data.title || null,
        data.description || null,
        data.summary || null,
        isScratched,
        hasDent,
        trimLevel || null,
        imageEmbedding,
        descEmbedding,
        sumEmbedding,
        plate || null,
        chassisNumber || null,
        tramerRecord !== undefined &&
        tramerRecord !== "" &&
        !isNaN(Number(tramerRecord))
          ? Number(tramerRecord)
          : null,
        inspectionDate || null,
        ownerCount && !isNaN(Number(ownerCount)) ? Number(ownerCount) : null,
        hasPledge,
        hasServiceMaintence,
        hasWarrenty,
        hasSpareKey,
        tireType || null,
        tireCondition || null,
        extras || null,
        lpgStatus || null,
      ],
    );

    const newAdvertId = advertResult.rows[0].id;

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const valuesQueryParts = [];
      const queryArgs = [newAdvertId];
      let paramOffset = 2;
      let isMainAssigned = false;

      req.files.forEach((file) => {
        const base64Str = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
        let isMain = false;
        let isExpertise = false;
        let isPermit = false;

        if (file.fieldname && file.fieldname.startsWith("expertise")) {
          isExpertise = true;
        } else if (file.fieldname && file.fieldname.startsWith("permit")) {
          isPermit = true;
        } else {
          if (
            coverImageIdentifier &&
            file.originalname === coverImageIdentifier
          ) {
            isMain = true;
            isMainAssigned = true;
          } else if (!coverImageIdentifier && !isMainAssigned) {
            isMain = true;
            isMainAssigned = true;
          }
        }

        valuesQueryParts.push(
          `($1, $${paramOffset}, $${paramOffset + 1}, $${paramOffset + 2}, $${paramOffset + 3})`,
        );
        queryArgs.push(base64Str, isMain, isExpertise, isPermit);
        paramOffset += 4;
      });

      const imagesInsertQuery = `
          INSERT INTO advert_images (advert_id, image_url, is_main, is_expertise, is_permit) 
          VALUES ${valuesQueryParts.join(", ")}
        `;
      await db.query(imagesInsertQuery, queryArgs);
    }

    res.status(200).json({
      message: "İlan ve fotoğraflar başarıyla yayınlandı.",
      advertId: newAdvertId,
    });
  } catch (err) {
    console.error("Post endpoint hatası:", err);
    res.status(500).json({ message: "Sunucu hatası oluştu" });
  }
});

router.put("/edit", verifyToken, upload.any(), async (req, res) => {
  const {
    id,
    title,
    description,
    summary,
    existingImages,
    image_embedding,
    description_embedding,
    description_summary_embedding,
    coverImageIdentifier,
    coverImageType,
  } = req.body;

  const user = req.user;
  const newFiles = req.files;

  let imageEmbeddingObj = null;
  if (image_embedding) {
    try {
      const parsedArray = JSON.parse(image_embedding);
      if (Array.isArray(parsedArray)) {
        imageEmbeddingObj = JSON.stringify(parsedArray);
      }
    } catch (e) {}
  }

  let descEmbedding = null;
  if (description_embedding) {
    try {
      const parsedArray = JSON.parse(description_embedding);
      if (Array.isArray(parsedArray)) {
        descEmbedding = JSON.stringify(parsedArray);
      }
    } catch (error) {}
  }

  let sumEmbedding = null;
  if (description_summary_embedding) {
    try {
      const parsedArray = JSON.parse(description_summary_embedding);
      if (Array.isArray(parsedArray)) {
        sumEmbedding = JSON.stringify(parsedArray);
      }
    } catch (error) {}
  }

  try {
    if (imageEmbeddingObj) {
      await db.query(
        `UPDATE adverts SET 
            title = $1, 
            description = $2, 
            summary = $3, 
            image_embedding = $4, 
            description_embedding = $5, 
            description_summary_embedding = $6,
            edited_at = NOW()
           WHERE user_id = $7 AND id = $8`,
        [
          title || null,
          description || null,
          summary || null,
          imageEmbeddingObj,
          descEmbedding,
          sumEmbedding,
          Number(user.id),
          id,
        ],
      );
    } else {
      await db.query(
        `UPDATE adverts SET 
            title = $1, 
            description = $2, 
            summary = $3, 
            description_embedding = $4, 
            description_summary_embedding = $5,
            edited_at = NOW()
           WHERE user_id = $6 AND id = $7`,
        [
          title || null,
          description || null,
          summary || null,
          descEmbedding,
          sumEmbedding,
          Number(user.id),
          id,
        ],
      );
    }

    await db.query("DELETE FROM advert_images WHERE advert_id = $1", [id]);

    let isMainAssigned = false;

    if (existingImages) {
      try {
        const imagesToKeep = JSON.parse(existingImages);
        if (Array.isArray(imagesToKeep)) {
          for (const url of imagesToKeep) {
            if (url && url !== "null" && url !== "") {
              let isMain = false;

              if (
                coverImageType === "existing_url" &&
                url === coverImageIdentifier
              ) {
                isMain = true;
                isMainAssigned = true;
              }

              await db.query(
                "INSERT INTO advert_images (advert_id, image_url, is_main, is_expertise, is_permit) VALUES ($1, $2, $3, $4, $5)",
                [id, url, isMain, false, false],
              );
            }
          }
        }
      } catch (parseErr) {}
    }

    if (newFiles && newFiles.length > 0) {
      for (const file of newFiles) {
        const base64Str = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

        let isMain = false;
        let isExpertise = false;
        let isPermit = false;

        if (file.fieldname && file.fieldname.startsWith("expertise")) {
          isExpertise = true;
        } else if (file.fieldname && file.fieldname.startsWith("permit")) {
          isPermit = true;
        } else {
          if (
            coverImageType === "new_file" &&
            file.originalname === coverImageIdentifier
          ) {
            isMain = true;
            isMainAssigned = true;
          }
        }

        await db.query(
          "INSERT INTO advert_images (advert_id, image_url, is_main, is_expertise, is_permit) VALUES ($1, $2, $3, $4, $5)",
          [id, base64Str, isMain, isExpertise, isPermit],
        );
      }
    }

    if (!isMainAssigned) {
      await db.query(
        `UPDATE advert_images 
           SET is_main = true 
           WHERE id = (
             SELECT id FROM advert_images WHERE advert_id = $1 AND is_expertise = false AND is_permit = false ORDER BY id ASC LIMIT 1
           )`,
        [id],
      );
    }

    res.status(200).json({ message: "İlan başarıyla güncellendi." });
  } catch (err) {
    console.error("Edit endpoint hatası:", err);
    res.status(500).json({ message: "Sunucu hatası oluştu." });
  }
});

router.patch("/soldAdvert", verifyToken, async (req, res) => {
  const { advertId, slot_date, slot_time } = req.body;
  try {
    await db.query("BEGIN");

    const checkStatus = await db.query(
      `SELECT is_sold FROM adverts WHERE id = $1 FOR UPDATE`,
      [advertId],
    );

    if (checkStatus.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "İlan bulunamadı." });
    }

    if (checkStatus.rows[0].is_sold === true) {
      await db.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Bu araç zaten daha önce satın alınmış!" });
    }

    const soldAdvertDetailRaw = await db.query(
      `UPDATE adverts SET is_sold = True WHERE id = $1 RETURNING *`,
      [advertId],
    );

    const soldAdvertDetail = soldAdvertDetailRaw.rows[0];
    const createdDate = new Date(soldAdvertDetail.created_at);
    const currentDate = new Date();
    const diffInMs = currentDate.getTime() - createdDate.getTime();
    const daysToSell = Math.max(
      0,
      Math.floor(diffInMs / (1000 * 60 * 60 * 24)),
    );

    await db.query(
      `INSERT INTO sold_adverts (brand, model, model_year, body_type, engine_capacity, horsepower, transmission, kilometer, fuel_type, price, trim_level, days_to_sell, has_scratch, has_dent, user_id, advert_id, sold_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        soldAdvertDetail.brand,
        soldAdvertDetail.model,
        soldAdvertDetail.model_year,
        soldAdvertDetail.body_type,
        soldAdvertDetail.engine_capacity,
        soldAdvertDetail.horsepower,
        soldAdvertDetail.transmission,
        soldAdvertDetail.kilometer,
        soldAdvertDetail.fuel_type,
        soldAdvertDetail.price,
        soldAdvertDetail.trim_level,
        daysToSell,
        soldAdvertDetail.has_scratch,
        soldAdvertDetail.has_dent,
        req.user.id,
        advertId,
        currentDate,
      ],
    );

    await db.query(`DELETE FROM favorite_adverts WHERE advert_id = $1`, [
      advertId,
    ]);

    const appointment = await db.query(
      `INSERT INTO appointments (user_id, advert_id, slot_date, slot_time, location) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, advertId, slot_date, slot_time, "Üsküdar Merkez Şube"],
    );

    await db.query(
      `UPDATE available_slots SET is_booked = true WHERE slot_date = $1 AND slot_time = $2`,
      [slot_date, slot_time],
    );

    const formatBrand = (brand) => {
      if (!brand) return "";
      const b = brand.trim().toLowerCase();
      const specialBrands = {
        bmw: "BMW",
        "mercedes-benz": "Mercedes-Benz",
      };
      if (specialBrands[b]) return specialBrands[b];
      return b
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const formatModel = (model) => {
      if (!model) return "";
      const m = model.trim().toLowerCase();
      const specialModels = {
        "a series": "A Serisi",
        "e series": "E Serisi",
        "1 series": "1 Series",
        "3 series": "3 Series",
        "5 series": "5 Series",
        "c-elysee": "C-Elysee",
        i20: "i20",
        "t-roc": "T-Roc",
      };
      if (specialModels[m]) return specialModels[m];
      return m
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    await db.query(
      `INSERT INTO notifications (user_id, title, message, type, related_entity_id) VALUES ($1, $2, $3, $4, $5)`,
      [
        soldAdvertDetail.user_id,
        "İlanınız Satıldı! 🎉",
        `${formatBrand(soldAdvertDetail.brand)} ${formatModel(soldAdvertDetail.model)} aracınız satın alındı. Alıcı ${slot_date} saat ${slot_time} için randevu oluşturdu.`,
        "sold",
        advertId,
      ],
    );

    const carPrice = Number(soldAdvertDetail.price);
    const depositAmount = carPrice <= 1000000 ? 10000 : 25000;
    const transactionRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await db.query(
      `INSERT INTO advert_payments 
   (advert_id, buyer_id, seller_id, appointment_id, total_price, deposit_amount, payment_status, payment_method, transaction_reference) 
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        advertId,
        req.user.id,
        soldAdvertDetail.user_id,
        appointment.rows[0].id,
        soldAdvertDetail.price,
        depositAmount,
        "pending",
        "credit card",
        transactionRef,
      ],
    );

    await db.query("COMMIT");

    res.status(200).json({
      message: "İlan başarıyla satın alınmış ve randevu oluşturulmuştur.",
    });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Satış hatası detayı:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        message:
          "Bu araç aynı anda başka biri tarafından satın alındı veya bu saat dolu.",
      });
    }

    res
      .status(500)
      .json({ message: "İlan satın alınırken sunucu hatası meydana geldi." });
  }
});

router.get("/similar-by-ai/:advertId", async (req, res) => {
  const { advertId } = req.params;

  try {
    const similarAdverts = await db.query(
      `SELECT a.id, a.brand, a.model, a.price, a.model_year, a.kilometer,
        (SELECT image_url FROM advert_images WHERE advert_id = a.id ORDER BY is_main DESC LIMIT 1) as image_data
       FROM adverts a
       WHERE a.id != $1 AND a.is_sold = false
       ORDER BY a.image_embedding <=> (SELECT image_embedding FROM adverts WHERE id = $1)
       LIMIT 5`,
      [advertId],
    );

    res.status(200).json(similarAdverts.rows);
  } catch (err) {
    console.error("Yapay Zeka Benzer İlan Hatası:", err);
    res.status(500).json({ message: "Benzer araçlar getirilemedi." });
  }
});

router.get("/favoriteCount/:advertId", async (req, res) => {
  const advertId = Number(req.params.advertId);
  const queryText =
    "SELECT COUNT(*)::int AS count FROM favorite_adverts WHERE advert_id = $1";
  try {
    const result = await db.query(queryText, [advertId]);
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err?.message);
    return res.status(500).json({
      message: "Favori sayısı getirilirken sunucu hatası meydana geldi.",
    });
  }
});

router.get("/:advertId/view", async (req, res) => {
  try {
    const { advertId } = req.params;

    const result = await db.query(
      "SELECT view_count FROM adverts WHERE id = $1",
      [advertId],
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "İlan bulunamadı.",
      });
    }

    const viewCount = result.rows[0].view_count || 0;

    return res.status(200).json({
      viewCount: viewCount,
    });
  } catch (error) {
    console.error("Görüntülenme sayısı çekilirken hata oluştu:", error);
    return res.status(500).json({
      success: false,
      message: "Sunucu kaynaklı bir hata oluştu.",
    });
  }
});

router.post("/:advertId/view", async (req, res) => {
  const { advertId } = req.params;
  const userId = req.user ? req.user.id : null;
  const ipAddress = req.headers["x-forwarded-for"] || req.ip;
  const identifier = userId ? `user:${userId}` : `ip:${ipAddress}`;
  const redisKey = `view:advert${advertId}:${identifier}`;

  try {
    const redisResult = await redis.set(redisKey, "1", "EX", 86400, "NX");
    if (redisResult === "OK") {
      await Promise.all([
        db.query(
          "UPDATE adverts SET view_count = view_count + 1 WHERE id = $1",
          [advertId],
        ),

        db.query(
          "INSERT INTO advert_views (advert_id, user_id, ip_address) VALUES ($1, $2, $3)",
          [advertId, userId, ipAddress],
        ),
      ]);
    }

    return res
      .status(200)
      .json({ success: true, message: "Görüntüleme işlendi." });
  } catch (err) {
    console.error("Görüntüleme kaydedilirken hata meydana geldi", err);
    return res.status(500).json({ success: false, message: "Sunucu hatası" });
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
