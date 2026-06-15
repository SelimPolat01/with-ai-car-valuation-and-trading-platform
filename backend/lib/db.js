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

export async function createTables() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        tel_number VARCHAR(20) NOT NULL UNIQUE,
        city VARCHAR(50) NOT NULL,
        iban VARCHAR(26) NOT NULL UNIQUE,
        token_duration INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await db.query(sql);
  console.log("Tablolar oluşturuldu!");
}
