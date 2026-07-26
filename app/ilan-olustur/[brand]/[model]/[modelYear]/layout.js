export const metadata = {
  title: "Araç Bilgilerini Gir | Aracını Hemen Sat",
  description:
    "Aracınızın donanım paketi, vites tipi, motor hacmi ve kilometre gibi detaylarını girerek yapay zeka destekli sistemimizden en doğru fiyat tahminini alın.",
  keywords: [
    "araç bilgileri",
    "kilometre bilgisi",
    "araç teknik özellikleri",
    "araba değerleme formu",
    "yapay zeka fiyat tahmini",
  ],
  openGraph: {
    title: "Araç Bilgilerini Gir | Aracını Hemen Sat",
    description:
      "Aracınızın teknik detaylarını ve kilometre bilgisini girerek en doğru fiyat tahminini anında öğrenin.",
    url: "https://yapayoto.me/tahmin-yap",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Araç Bilgilerini Gir | Aracını Hemen Sat",
    description:
      "Aracınızın teknik detaylarını ve kilometre bilgisini girerek en doğru fiyat tahminini anında öğrenin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TahminYapLayout({ children }) {
  return <>{children}</>;
}
