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
        "/favori-ilanlar/",
        "/ilani-duzenle/",
        "/ilan-olustur/",
        "/ilan/randevu/",
        "/ilan/odeme/",
      ],
    },
    sitemap: "https://yapayoto.me/sitemap.xml",
  };
}
