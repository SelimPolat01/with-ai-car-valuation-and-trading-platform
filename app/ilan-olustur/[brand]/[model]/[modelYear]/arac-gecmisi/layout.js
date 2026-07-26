export const metadata = {
  title: "Araç Geçmişi ve Ekspertiz | Aracını Hemen Sat",
  description:
    "Aracınızın tramer kaydı, muayene tarihi, donanım özellikleri ve ekspertiz raporu gibi geçmiş bilgilerini eksiksiz doldurarak ilanınızı alıcılar için güvenilir hale getirin.",
  keywords: [
    "araç geçmişi",
    "tramer kaydı",
    "ekspertiz raporu yükle",
    "araç muayene tarihi",
    "güvenilir araç ilanı",
    "oto ekspertiz",
  ],
  openGraph: {
    title: "Araç Geçmişi ve Ekspertiz | Aracını Hemen Sat",
    description:
      "Aracınızın geçmiş bilgilerini ve ekspertiz belgelerini ekleyerek satış sürecini hızlandırın.",
    url: "https://yapayoto.me/arac-gecmisi",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Araç Geçmişi ve Ekspertiz | Aracını Hemen Sat",
    description:
      "Aracınızın geçmiş bilgilerini ve ekspertiz belgelerini ekleyerek satış sürecini hızlandırın.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AracGecmisiLayout({ children }) {
  return <>{children}</>;
}
