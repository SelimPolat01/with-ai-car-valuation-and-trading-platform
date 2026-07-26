export const metadata = {
  title: "Tüm İlanlar | Aracını Hemen Sat",
  description:
    "Yapay zeka ile değerlemesi yapılmış, güvenilir ve uygun fiyatlı ikinci el araç ilanlarını inceleyin. Marka ve modele göre filtreleme yaparak aradığınız aracı hemen bulun.",
  keywords: [
    "ikinci el araçlar",
    "tüm ilanlar",
    "ikinci el araba",
    "oto pazar",
    "sahibinden araba",
    "aracını sat ilanlar",
    "araç filtrele",
  ],
  openGraph: {
    title: "Tüm İlanlar | Aracını Hemen Sat",
    description:
      "Yapay zeka onaylı ikinci el araç ilanlarını inceleyin ve size en uygun aracı hemen bulun.",
    url: "https://yapayoto.me/tum-ilanlar",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tüm İlanlar | Aracını Hemen Sat",
    description:
      "Yapay zeka onaylı ikinci el araç ilanlarını inceleyin ve size en uygun aracı hemen bulun.",
  },
};

export default function TumIlanlarLayout({ children }) {
  return <>{children}</>;
}
