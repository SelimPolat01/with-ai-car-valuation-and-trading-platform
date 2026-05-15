import { fetchCarData } from "../lib/api.js";
import { db } from "../lib/db.js";

export async function dbInsertCars() {
  const allCars = [];
  try {
    for (let page = 1; page <= 1; page++) {
      const carsFromAPI = await fetchCarData(page);
      console.log(carsFromAPI);
      allCars.push(...carsFromAPI);
    }

    for (const car of allCars) {
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
        ]
      );
    }

    console.log(`${allCars.length} araç verisi veritabanına eklendi.`);
  } catch (err) {
    console.error("API verisi alınamadı veya DB hatası oluştu:", err);
  }
}
