# Makine Öğrenmesi ile Otomobil Fiyat Tahmin ve Al-Sat Web Uygulaması 

Bu proje,

1- kullanıcıların otomobil ilanlarını görüntüleyebildiği, 
2- ilan oluşturabildiği, 
3- araç fiyat tahmini alabildiği,
4- gerçek zamanlı mesajlaşma yapabildiği, 

bir web uygulamasıdır. Projede **Next.js**, **React**, **Node.js**, **Express**, **PostgreSQL** ve **Socket.IO** kullanılmıştır.

---

## Özellikler

- Kullanıcı kaydı ve girişi (JWT tabanlı kimlik doğrulama)
- İlan oluşturma, düzenleme ve silme
- Favori ilanları ekleme ve silme
- İlan arama ve filtreleme
- Menüler arası gezinebilme
- Otomobil fiyat tahmini
- Gerçek zamanlı mesajlaşma (Socket.IO)
- Responsive ve modern tasarım
- PostgreSQL veritabanı ile veri yönetimi

---

## Teknolojiler

**Frontend:**

- Next.js 16
- React 19
- Redux Toolkit
- Framer Motion (animasyonlar)
- Socket.io Client

**Backend:**

- Node.js
- Express
- Socket.IO (gerçek zamanlı mesajlaşma)
- PostgreSQL (veritabanı)
- dotenv (çevresel değişkenler)
- bcrypt (şifreleme)
- jsonwebtoken (JWT)
- cors

---

## Kurulum

### 1. Backend

1. Backend klasörüne gidin:

cd backend

2. Gerekli paketleri yükleyin:

npm install

3. .env dosyası oluşturun ve aşağıdaki değişkenleri ekleyin.

PORT=5000
FRONT_END_URL=http://localhost:3000
DATABASE_URL=postgres://username:password@localhost:5432/databasename
JWT_SECRET=your_jwt_secret

4. Database'i oluşturun ve tabloları ekleyin.

-- Users tablosu
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  password TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adverts tablosu
CREATE TABLE adverts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  brand VARCHAR(50),
  model VARCHAR(50),
  model_year INTEGER,
  engine_capacity INTEGER,
  price NUMERIC,
  city VARCHAR(50),
  image_src TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages tablosu (WebSocket üzerinden gerçek zamanlı mesajlaşma)
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  advert_id INTEGER REFERENCES adverts(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

5. Sunucuyu başlatın.

nodemon index.js

### 2. Frontend

1. Proje root klasörüne gidin.

2. Paketleri yükleyin:

npm install

3. .env.local dosyası oluşturun ve backend URL'sini ekleyin.

NEXT_PUBLIC_URL=http://localhost:5000

5. Geliştirme suncusunu başlatın:

npm run dev

### 3. Kullanım

- Kullanıcı kaydı ve giriş yapın.

- İlanlar oluşturun veya mevcut ilanları görüntüleyin.
- Araçları markaya göre filtreleyebilir veya arama yapabilirsiniz.
- Fiyat tahmini almak için araç detaylarını girin.
- Mesajlaşma bölümünden, ilan üzerinden diğer kullanıcılarla gerçek zamanlı mesajlaşma yapabilirsiniz.

### 3. Gerçek Zamanlı Mesajlaşma (WebSocket)

1. Socket.IO kullanılarak uygulamada gerçek zamanlı mesajlaşma sağlanmıştır.
2. Kullanıcılar register event’i ile bağlanır ve socketId üzerinden mesaj gönderilir.
3. sendMessageToUser event’i ile tek bir kullanıcıya mesaj gönderilir.
4. Mesajlar veritabanına kaydedilir, böylece kullanıcı offline olsa bile mesajlar saklanır.

### 4. Notlar

1. Frontend ve backend ayrı ayrı npm install ister.
2. PostgreSQL çalışır durumda olmalıdır.
3. Socket.io backend içinde Express ile çalışır.
4. Next.js API Routes bilinçli olarak kullanılmamıştır.

### 5. GELİŞTİRİCİ BİLGİSİ

SELİM POLAT
BİLGİSAYAR MÜHENDİSİ
FULL-STACK DEVELOPER
LINKEDIN ---> https://www.linkedin.com/in/selim-polat-6245553a1/

Bu proje eğitim ve portföy amaçlı geliştirilmiştir.
