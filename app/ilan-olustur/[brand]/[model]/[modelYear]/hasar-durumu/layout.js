export const metadata = {
  title: "Hasar Durumu Tespiti | Aracını Hemen Sat",
  description:
    "Aracınızın dört farklı cepheden fotoğraflarını yükleyin. Yapay zeka destekli hasar tespit sistemimiz çizik ve göçükleri otomatik olarak analiz etsin.",
  keywords: [
    "hasar tespiti",
    "yapay zeka araç ekspertiz",
    "araç hasar sorgulama",
    "çizik ve göçük tespiti",
    "araç değer kaybı hesaplama",
  ],
  openGraph: {
    title: "Hasar Durumu Tespiti | Aracını Hemen Sat",
    description:
      "Aracınızın dört farklı cepheden fotoğraflarını yükleyin, yapay zeka hasar durumunu otomatik analiz etsin.",
    url: "https://yapayoto.com.tr/hasar-durumu",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hasar Durumu Tespiti | Aracını Hemen Sat",
    description:
      "Aracınızın dört farklı cepheden fotoğraflarını yükleyin, yapay zeka hasar durumunu otomatik analiz etsin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function HasarDurumuLayout({ children }) {
  return <>{children}</>;
}
