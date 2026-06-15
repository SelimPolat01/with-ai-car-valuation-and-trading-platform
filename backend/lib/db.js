import pkg from "pg";

const { Pool } = pkg;

export const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

db.query("SELECT NOW()")
  .then((res) => console.log("DB Bağlantısı başarılı:", res.rows))
  .catch((err) => console.log("DB bağlantı hatası:", err));

export async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      email VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      brand VARCHAR(100),
      model VARCHAR(100),
      model_year INTEGER,
      body_type VARCHAR(50),
      engine_capacity INTEGER,
      horsepower INTEGER,
      transmission VARCHAR(50),
      fuel_type VARCHAR(50),
      kilometer INTEGER,
      trim_level VARCHAR(100),
      price NUMERIC(15, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS adverts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      price NUMERIC(15, 2),
      user_id INTEGER REFERENCES users(id),
      is_sold BOOLEAN DEFAULT FALSE,
      has_dent BOOLEAN DEFAULT FALSE,
      has_scratch BOOLEAN DEFAULT FALSE,
      brand VARCHAR(100),
      model VARCHAR(100),
      model_year INTEGER,
      body_type VARCHAR(50),
      engine_capacity INTEGER,
      horsepower INTEGER,
      transmission VARCHAR(50),
      fuel_type VARCHAR(50),
      kilometer INTEGER,
      trim_level VARCHAR(100),
      edited_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(query);
    console.log(
      "Veritabanı tabloları başarıyla oluşturuldu veya kontrol edildi.",
    );
  } catch (error) {
    console.error("Tablolar oluşturulurken hata oluştu:", error);
  }
}
