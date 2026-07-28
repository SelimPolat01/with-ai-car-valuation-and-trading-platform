export const metadata = {
  title: "İlan Detayları ve Fotoğraflar | Aracını Hemen Sat",
  description:
    "Aracınızın fotoğraflarını yükleyin, ilgi çekici bir başlık ve detaylı bir açıklama yazarak ilanınızı yayınlamaya hazır hale getirin.",
  keywords: [
    "ilan yayınla",
    "araba ilanı fotoğrafları",
    "ilan açıklaması yaz",
    "araç detayları gir",
    "ikinci el araç ilanı",
  ],
  openGraph: {
    title: "İlan Detayları ve Fotoğraflar | Aracını Hemen Sat",
    description:
      "Aracınızın fotoğraflarını yükleyin ve detaylı bir açıklama yazarak ilanınızı hemen yayına alın.",
    url: "https://yapayoto.com.tr/detaylar",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İlan Detayları ve Fotoğraflar | Aracını Hemen Sat",
    description:
      "Aracınızın fotoğraflarını yükleyin ve detaylı bir açıklama yazarak ilanınızı hemen yayına alın.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function IlanDetaylarfiLayout({ children }) {
  return <>{children}</>;
}
