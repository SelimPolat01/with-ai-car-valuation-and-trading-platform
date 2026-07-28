export const metadata = {
  title: "Ödemeler ve Faturalar | Aracını Hemen Sat",
  description:
    "Platformumuz üzerinden gerçekleştirdiğiniz araç alım-satım ve ekspertiz işlemlerine ait ödeme geçmişinizi güvenle görüntüleyin ve faturalarınızı indirin.",
  keywords: [
    "ödemeler",
    "faturalar",
    "ödeme geçmişi",
    "ekspertiz faturası",
    "araç alım satım dökümü",
    "hesabım ödemeler",
  ],
  openGraph: {
    title: "Ödemeler ve Faturalar | Aracını Hemen Sat",
    description:
      "Gerçekleştirdiğiniz işlemlere ait ödeme geçmişinizi güvenle görüntüleyin ve faturalarınızı inceleyin.",
    url: "https://yapayoto.com.tr/hesabim/odemeler-faturalar",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ödemeler ve Faturalar | Aracını Hemen Sat",
    description:
      "Gerçekleştirdiğiniz işlemlere ait ödeme geçmişinizi güvenle görüntüleyin ve faturalarınızı inceleyin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OdemelerFaturalarLayout({ children }) {
  return <>{children}</>;
}
