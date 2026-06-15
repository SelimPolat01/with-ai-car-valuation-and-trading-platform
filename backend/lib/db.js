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
