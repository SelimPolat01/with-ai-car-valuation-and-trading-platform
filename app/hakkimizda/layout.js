export const metadata = {
  title: "Hakkımızda | YapayOto",
  description:
    "Yapay zeka destekli araç değerlemesi yapan, yenilikçi ve güvenilir ikinci el araç alım-satım platformu YapayOto'nun hikayesini, misyonunu ve vizyonunu keşfedin.",
  keywords: [
    "hakkımızda",
    "yapayoto kimdir",
    "biz kimiz",
    "yapay zeka araç değerleme",
    "ikinci el araç güvenilir platform",
    "kurumsal",
    "aracını sat vizyon",
  ],
  alternates: {
    canonical: "https://yapayoto.com.tr/hakkimizda",
  },
  openGraph: {
    title: "Hakkımızda | YapayOto",
    description:
      "Yapay zeka destekli güvenilir ikinci el araç platformu YapayOto'yu yakından tanıyın.",
    url: "https://yapayoto.com.tr/hakkimizda",
    siteName: "YapayOto",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "https://yapayoto.com.tr/icon.png",
        width: 1200,
        height: 630,
        alt: "Hakkımızda - YapayOto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hakkımızda | YapayOto",
    description:
      "Yapay zeka destekli güvenilir ikinci el araç platformu YapayOto'yu yakından tanıyın.",
    images: ["https://yapayoto.com.tr/icon.png"],
  },
};

export default function HakkimizdaLayout({ children }) {
  return <>{children}</>;
}
