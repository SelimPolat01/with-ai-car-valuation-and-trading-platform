export const metadata = {
  title: "Favori İlanlarım | Aracını Hemen Sat",
  description:
    "Beğendiğiniz ve favorilerinize eklediğiniz ikinci el araç ilanlarını tek bir yerden takip edin, fiyat değişikliklerini ve fırsatları kaçırmayın.",
  keywords: [
    "favori ilanlar",
    "beğendiğim araçlar",
    "favorilerim",
    "araç takip",
    "ikinci el araç favoriler",
    "hesabım favoriler",
  ],
  openGraph: {
    title: "Favori İlanlarım | Aracını Hemen Sat",
    description:
      "Beğendiğiniz ve favorilerinize eklediğiniz ikinci el araç ilanlarını tek bir yerden takip edin.",
    url: "https://yapayoto.me/hesabim/favori-ilanlar",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Favori İlanlarım | Aracını Hemen Sat",
    description:
      "Beğendiğiniz ve favorilerinize eklediğiniz ikinci el araç ilanlarını tek bir yerden takip edin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoriIlanlarLayout({ children }) {
  return <>{children}</>;
}
