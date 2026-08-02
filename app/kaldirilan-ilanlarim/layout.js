export const metadata = {
  title: "Kaldırılan İlanlarım | Aracını Hemen Sat",
  description:
    "Yapay zeka destekli platformumuz üzerinden yayından kaldırdığınız veya sildiğiniz araç ilanlarınızın geçmişine bu sayfadan ulaşabilirsiniz.",
  keywords: [
    "kaldırılan ilanlarım",
    "yayından kalkan ilanlar",
    "silinen araç ilanları",
    "pasif ilanlar",
    "araç satış geçmişi",
    "yapayoto kaldırılan araçlar",
  ],
  openGraph: {
    title: "Kaldırılan İlanlarım | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli platformumuz üzerinden yayından kaldırdığınız veya sildiğiniz araç ilanlarınızın geçmişine bu sayfadan ulaşabilirsiniz.",
    url: "https://yapayoto.com.tr/kaldirilan-ilanlarim",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kaldırılan İlanlarım | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli platformumuz üzerinden yayından kaldırdığınız veya sildiğiniz araç ilanlarınızın geçmişine bu sayfadan ulaşabilirsiniz.",
  },
};

export default function KaldirilanIlanlarimLayout({ children }) {
  return <>{children}</>;
}
