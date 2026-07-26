export const metadata = {
  title: "Fiyat Teklifi | Aracını Hemen Sat",
  description:
    "Yapay zeka analizimiz sonucunda aracınıza özel olarak sunulan adil ve güncel fiyat teklifini inceleyin, satış adımlarına hemen geçin.",
  keywords: [
    "araç fiyat teklifi",
    "araba değerleme sonucu",
    "ikinci el araç fiyatı",
    "yapay zeka araç teklifi",
    "oto fiyat hesaplama",
  ],
  openGraph: {
    title: "Fiyat Teklifi | Aracını Hemen Sat",
    description:
      "Aracınıza özel olarak hesaplanan güncel fiyat teklifini inceleyin ve anında satış adımlarına geçin.",
    url: "https://yapayoto.me/fiyat-teklifi",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiyat Teklifi | Aracını Hemen Sat",
    description:
      "Aracınıza özel olarak hesaplanan güncel fiyat teklifini inceleyin ve anında satış adımlarına geçin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function FiyatTeklifiLayout({ children }) {
  return <>{children}</>;
}
