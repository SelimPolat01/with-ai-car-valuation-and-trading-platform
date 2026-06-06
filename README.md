# 🚗 Yapay Zeka Destekli Otomobil Değerleme ve Alım-Satım Platformu

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge\&logo=next.js\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge\&logo=fastapi\&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge\&logo=pytorch\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge\&logo=postgresql\&logoColor=white)

Araç alım-satım süreçlerindeki fiyat belirsizliğini azaltmak, ilan güvenilirliğini artırmak ve kullanıcı deneyimini iyileştirmek amacıyla geliştirilmiş uçtan uca bir Full-Stack ve Yapay Zeka projesidir. Platform; görüntü işleme, makine öğrenmesi ve veri analitiği tekniklerini kullanarak araç değerleme, hasar analizi ve ilan doğrulama işlemlerini otomatikleştirmektedir.

---

## 🌟 Yapay Zeka Modelleri ve Temel Özellikler

Projede PyTorch ile eğitilmiş CNN modelleri ve XGBoost algoritmaları kullanılmaktadır. Modeller, üretim ortamında aşağıdaki performans metrikleriyle çalışmaktadır:

### 📸 Araç Tanıma Sistemi (CNN)

Yüklenen araç fotoğraflarından marka, model, kasa tipi ve yıl aralığını otomatik olarak tespit eder.

* Doğruluk (Accuracy): **%90.03**
* Manuel form girişini büyük ölçüde azaltır.
* Kullanıcılar tespit edilen bilgileri dilerse düzenleyebilir.

### 🛠 Hasar Analizi Sistemi (CNN)

Araç kaportasındaki çizik ve göçükleri tespit ederek otomatik hasar değerlendirmesi oluşturur.

* Doğruluk (Accuracy): **%88.44**
* Çizik ve göçük tespiti için özel olarak eğitilmiş CNN modeli kullanılmıştır.
* Fiyat tahmin sürecine doğrudan katkı sağlar.

### 🛡 İlan Doğrulama Sistemi (CNN)

Sahte veya eksik ilanların önüne geçebilmek amacıyla araç fotoğraflarının doğru açılardan yüklenip yüklenmediğini kontrol eder.

* Doğruluk (Accuracy): **%100**
* Ön, arka, sağ ve sol görünüm doğrulaması gerçekleştirir.
* Veri kalitesini artırarak model performansını destekler.

### 📊 Fiyat Tahmini ve Satış Süresi Öngörüsü (XGBoost)

#### Araç Fiyat Tahmini

Araç özellikleri, kilometre bilgisi ve hasar durumunu analiz ederek piyasa değerine yakın fiyat tahmini üretir.

* R² Skoru: **0.9345**
* MAE: **73.775 TL**
* RMSE: **107.948 TL**

#### Satış Süresi Tahmini

Belirlenen fiyat ve araç özelliklerine göre ilanın ortalama kaç gün içerisinde satılabileceğini öngörür.

* R² Skoru: **0.9081**
* MAE: **1.76 Gün**
* RMSE: **2.89 Gün**

---

## 💻 Platform Özellikleri

Yapay zeka modelleri yalnızca analiz amacıyla değil, doğrudan kullanıcı deneyiminin bir parçası olacak şekilde entegre edilmiştir.

### 🔍 Gelişmiş İlan Arama ve Filtreleme

* Marka, model ve hasar durumuna göre filtreleme
* Çoklu sıralama seçenekleri
* Favori ilan sistemi

### 🚘 Garajım Paneli

Kullanıcılara araç ve ilan yönetimini tek noktadan gerçekleştirebilecekleri dinamik bir dashboard sunar.

* Favori ilan takibi
* Aktif ilan sayısı görüntüleme
* Toplam satış hasılatı takibi
* Net kâr analizleri

### 👤 Profil ve Hesap Yönetimi

* Profil bilgilerini güncelleme
* E-posta değiştirme
* Şifre güncelleme
* Hesap güvenliği kontrolleri

### 🔐 Güvenlik Altyapısı

* JWT tabanlı Authentication & Authorization
* Refresh Token mekanizması
* Otomatik oturum yenileme
* Yetkilendirme ve erişim kontrolü

---

## ⚙️ Teknoloji Yığını

### Frontend

* React
* Next.js
* Framer Motion

### Backend

* Node.js
* Express.js
* FastAPI

### Yapay Zeka ve Veri Bilimi

* Python
* PyTorch
* XGBoost
* CUDA
* Automatic Mixed Precision (AMP)

### Veritabanı

* PostgreSQL

### Güvenlik

* JWT Authentication
* Refresh Token Mekanizması

---

## 🚀 Kurulum

### 1. Repoyu Klonlayın

```bash
https://github.com/SelimPolat01/with-ai-car-valuation-and-trading-platform.git
```

### 2. Backend Kurulumu (Node.js)

```bash
cd backend
npm install
npm run dev
```

### 3. Yapay Zeka Servisleri (FastAPI)

```bash
cd ai-services
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Frontend Kurulumu (Next.js)

```bash
cd frontend
npm install
npm run dev
```

### 5. Çevre Değişkenleri

Frontend ve backend klasörlerinde bulunan `.env.example` dosyalarını `.env` olarak kopyalayın ve gerekli yapılandırmaları yapın.

Örnek:

```env
DATABASE_URL=
JWT_SECRET=
REFRESH_TOKEN_SECRET=
```

---

## 🎓 Proje Hakkında

Bu proje, bilgisayar/yazılım mühendisliği lisans eğitimi kapsamında geliştirilen bir mezuniyet projesidir. Çalışmada görüntü işleme, derin öğrenme, makine öğrenmesi ve modern web teknolojileri kullanılarak gerçek dünya problemlerine yönelik uçtan uca bir otomobil değerleme ve alım-satım platformu geliştirilmiştir.
