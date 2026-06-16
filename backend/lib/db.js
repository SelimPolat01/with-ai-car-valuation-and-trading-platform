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

// export async function createTable() {
//   const query = `
//    ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS surname VARCHAR(100);
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS iban VARCHAR(50);
//     ALTER TABLE users ADD COLUMN IF NOT EXISTS image_src TEXT;
//     `;

//   try {
//     await db.query(query);
//     console.log(
//       "Veritabanı tabloları başarıyla oluşturuldu veya kontrol edildi.",
//     );
//   } catch (error) {
//     console.error("Tablolar oluşturulurken hata oluştu:", error);
//   }
// }
