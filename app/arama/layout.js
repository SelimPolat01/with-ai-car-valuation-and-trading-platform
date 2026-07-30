export const metadata = {
  title: "Yapay Zeka ile İlan Arama | YapayOto",
  description:
    "Yapay zeka destekli akıllı arama motorumuz ile aradığınız ikinciel aracı doğal dilde tarif edin. İhtiyacınıza ve bütçenize en uygun araç ilanlarını saniyeler içinde listeleyin.",
  keywords: [
    "yapay zeka araç arama",
    "akıllı araç arama",
    "ikinci el araç arama",
    "yapayoto arama",
    "benzer araç bulma",
    "yapay zeka ilan analizi",
    "araba arama motoru",
  ],
  openGraph: {
    title: "Yapay Zeka ile İlan Arama | YapayOto",
    description:
      "Yapay zeka destekli akıllı arama ile aradığınız aracı tarif edin, en uygun araç ilanlarını anında keşfedin.",
    url: "https://yapayoto.com.tr/arama",
    siteName: "YapayOto",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yapay Zeka ile İlan Arama | YapayOto",
    description:
      "Yapay zeka destekli akıllı arama ile aradığınız aracı tarif edin, en uygun araç ilanlarını anında keşfedin.",
  },
};

export default function AramaLayout({ children }) {
  return <>{children}</>;
}
