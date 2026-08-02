export const metadata = {
  title: "Satılan İlanlarım | Aracını Hemen Sat",
  description:
    "Yapay zeka destekli platformumuz üzerinden başarıyla sattığınız araçların listesini ve geçmiş satış geçmişinizi görüntüleyin.",
  keywords: [
    "satılan ilanlarım",
    "satılmış araçlar",
    "araç satış geçmişi",
    "başarılı satışlar",
    "yapayoto satılan araçlar",
    "ikinci el araç satış geçmişi",
  ],
  openGraph: {
    title: "Satılan İlanlarım | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli platformumuz üzerinden başarıyla sattığınız araçların listesini ve geçmiş satış geçmişinizi görüntüleyin.",
    url: "https://yapayoto.com.tr/satilan-ilanlarim",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Satılan İlanlarım | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli platformumuz üzerinden başarıyla sattığınız araçların listesini ve geçmiş satış geçmişinizi görüntüleyin.",
  },
};

export default function SatilanIlanlarimLayout({ children }) {
  return <>{children}</>;
}
