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
   CREATE TABLE favorite_adverts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    advert_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) 
        REFERENCES users (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_advert
        FOREIGN KEY (advert_id) 
        REFERENCES adverts (id)
        ON DELETE CASCADE,
    -- Aynı kullanıcının aynı ilanı birden fazla kez favorilere eklemesini önlemek için:
    CONSTRAINT unique_user_favorite UNIQUE (user_id, advert_id)
);

   CREATE TABLE sold_adverts (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    model_year INTEGER NOT NULL,
    body_type VARCHAR(50) NOT NULL,
    engine_capacity INTEGER NOT NULL,
    horsepower INTEGER NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    kilometer INTEGER NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    price BIGINT NOT NULL,
    trim_level VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sold_at TIMESTAMP NOT NULL,
    days_to_sell INTEGER NOT NULL,
    has_scratch BOOLEAN NOT NULL,
    has_dent BOOLEAN NOT NULL,
    user_id INT NOT NULL,
    advert_id INT NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) 
        REFERENCES users (id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_advert
        FOREIGN KEY (advert_id) 
        REFERENCES adverts (id) 
        ON DELETE RESTRICT
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
