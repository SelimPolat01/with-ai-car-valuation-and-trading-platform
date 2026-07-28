export const metadata = {
  title: "İletişim | Aracını Hemen Sat",
  description:
    "Yapay zeka destekli ikinci el araç platformumuz hakkında soru, görüş ve önerileriniz için bizimle iletişime geçin. Size yardımcı olmaktan memnuniyet duyarız.",
  keywords: [
    "iletişim",
    "bize ulaşın",
    "müşteri hizmetleri",
    "destek",
    "yapayoto iletişim",
    "aracını sat destek",
    "oto ilan iletişim",
  ],
  openGraph: {
    title: "İletişim | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli ikinci el araç platformumuz hakkında soru, görüş ve önerileriniz için bizimle iletişime geçin.",
    url: "https://yapayoto.com.tr/iletisim",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "İletişim | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli ikinci el araç platformumuz hakkında soru, görüş ve önerileriniz için bizimle iletişime geçin.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function IletisimLayout({ children }) {
  return <>{children}</>;
}
