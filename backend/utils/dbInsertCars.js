import "dotenv/config";

import { fetchCarData } from "../lib/api.js";
import { db } from "../lib/db.js";

export async function dbInsertCars() {
  let totalInserted = 0;
  let totalSkipped = 0;
  try {
    for (let page = 11; page <= 32; page++) {
      console.log(`\n📄 Sayfa ${page} işleniyor...`);

      const carsFromAPI = await fetchCarData(page);
      console.log(
        `📥 Sayfa ${page} için ${carsFromAPI.length} araç API'den alındı.`,
      );

      for (const car of carsFromAPI) {
        if (
          !car.brand ||
          !car.model ||
          !car.year ||
          !car.bodyType ||
          !car.engineCapacity ||
          !car.horsepower ||
          !car.transmission ||
          !car.fuelType ||
          car.kilometer === null ||
          car.kilometer === undefined ||
          !car.price
        ) {
          console.warn(
            `⚠️ Eksik veri tespit edildi, ilan atlanıyor: ${car.brand || "Bilinmeyen"} ${car.model || "Model"}`,
          );
          totalSkipped++;
          continue;
        }

        await db.query(
          `INSERT INTO cars 
            (brand, model, model_year, body_type, engine_capacity, horsepower, transmission, kilometer, fuel_type, price) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            car.brand,
            car.model,
            car.year,
            car.bodyType,
            car.engineCapacity,
            car.horsepower,
            car.transmission,
            car.kilometer,
            car.fuelType,
            car.price,
          ],
        );
        totalInserted++;
      }

      console.log(`⚡ Sayfa ${page} başarıyla veritabanına yazıldı.`);
    }

    console.log(`\n--- 🎉 TÜM İŞLEMLER TAMAMLANDI ---`);
    console.log(`✅ Toplam eklenen araç sayısı: ${totalInserted}`);
    console.log(
      `❌ Toplam eksik veri nedeniyle atlanan araç sayısı: ${totalSkipped}`,
    );
  } catch (err) {
    console.error("❌ Kritik Hata (İşlem yarıda kesildi):", err);
  }
}

dbInsertCars();
