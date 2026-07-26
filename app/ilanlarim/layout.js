export const metadata = {
  title: "İlanlarım | Aracını Hemen Sat",
  description:
    "Satışa çıkardığınız araç ilanlarınızı yönetin, fiyatları güncelleyin veya ilanlarınızı yayından kaldırın. Yapay zeka destekli platformumuzda kontrol tamamen sizde.",
  keywords: [
    "ilanlarım",
    "araç yönetimi",
    "ilan düzenle",
    "ilan kaldır",
    "ikinci el araç satışı",
    "aracını sat profil",
    "oto ilan yönetimi",
  ],
  openGraph: {
    title: "İlanlarım | Aracını Hemen Sat",
    description:
      "Satışa çıkardığınız araç ilanlarınızı yönetin, fiyatları güncelleyin veya ilanlarınızı anında yayından kaldırın.",
    url: "https://yapayoto.me/ilanlarim",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İlanlarım | Aracını Hemen Sat",
    description:
      "Satışa çıkardığınız araç ilanlarınızı yönetin, fiyatları güncelleyin veya ilanlarınızı anında yayından kaldırın.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function IlanlarimLayout({ children }) {
  return <>{children}</>;
}
