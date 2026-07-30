export const metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "Yapay zeka destekli araç değerleme ve alım-satım platformumuz hakkında merak ettiğiniz soruların cevapları. Sistem nasıl çalışır, yapay zeka ve randevu süreci nasıl işler öğrenin.",
  keywords: [
    "sıkça sorulan sorular",
    "sss",
    "yapayoto yardım",
    "yapay zeka araç değerleme nasıl çalışır",
    "yapayoto güvenli ödeme",
    "oto ekspertiz randevu",
    "ikinci el araç alım satım destek",
  ],
  openGraph: {
    title: "Sıkça Sorulan Sorular | YapayOto",
    description:
      "Yapay zeka destekli araç değerleme platformumuz hakkında merak ettiğiniz tüm soruların cevapları.",
    url: "https://yapayoto.com.tr/sikca-sorulan-sorular",
    siteName: "YapayOto",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sıkça Sorulan Sorular | YapayOto",
    description:
      "Yapay zeka destekli araç değerleme platformumuz hakkında merak ettiğiniz tüm soruların cevapları.",
  },
};

export default function SikcaSorulanSorularLayout({ children }) {
  return <>{children}</>;
}
