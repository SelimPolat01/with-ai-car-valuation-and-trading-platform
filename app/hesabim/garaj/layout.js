export const metadata = {
  title: "Garajım | Aracını Hemen Sat",
  description:
    "Kişisel ilan istatistiklerinizi, favori araçlarınızı ve alım-satım işlemlerinden elde ettiğiniz aylık gelir tablonuzu detaylı olarak görüntüleyin.",
  keywords: [
    "garajım",
    "ilan istatistikleri",
    "araç alım satım raporu",
    "hesabım garaj",
    "gelir tablosu",
    "aktif ilanlarım",
  ],
  openGraph: {
    title: "Garajım | Aracını Hemen Sat",
    description:
      "İlan istatistiklerinizi, favori araçlarınızı ve alım-satım işlemlerinden elde ettiğiniz gelir tablonuzu görüntüleyin.",
    url: "https://yapayoto.me/hesabim/garajim",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Garajım | Aracını Hemen Sat",
    description:
      "İlan istatistiklerinizi, favori araçlarınızı ve alım-satım işlemlerinden elde ettiğiniz gelir tablonuzu görüntüleyin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function GarajLayout({ children }) {
  return <>{children}</>;
}
