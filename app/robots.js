export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*?mode=*",
        "/hesabim/",
        "/hesabim/randevular/",
        "/hesabim/faturalar-odemeler/",
        "/hesabim/kisisel-bilgiler/",
        "/hesabim/guvenlik/",
        "/hesabim/garaj/",
        "/hesabim/bildirimler/",
        "/hesabim/alis-satis-islemleri/",
        "/ilanlarim/",
        "/satilan-ilanlarim/",
        "/satin-aldigim-ilanlar/",
        "/kaldirilan-ilanlarim/",
        "/favori-ilanlarim/",
        "/ilani-duzenle/",
        "/ilan-olustur/",
        "/ilan/randevu/",
        "/ilan/odeme/",
        "/sifremi-unuttum/",
        "/login/",
        "/kayit-ol/",
      ],
    },
    sitemap: "https://yapayoto.com.tr/sitemap.xml",
  };
}
