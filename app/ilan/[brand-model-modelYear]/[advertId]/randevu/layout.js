export const metadata = {
  title: "Ekspertiz Randevusu | Aracını Hemen Sat",
  description:
    "Satın almak istediğiniz araç için size en uygun tarih ve saati seçerek ekspertiz randevunuzu hemen oluşturun.",
  keywords: [
    "ekspertiz randevusu",
    "araç satın al",
    "oto ekspertiz randevu",
    "araç satış randevusu",
    "ikinci el araç randevu",
  ],
  openGraph: {
    title: "Ekspertiz Randevusu | Aracını Hemen Sat",
    description:
      "Satın almak istediğiniz araç için size en uygun tarih ve saati seçerek ekspertiz randevunuzu hemen oluşturun.",
    url: "https://yapayoto.me/randevu",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ekspertiz Randevusu | Aracını Hemen Sat",
    description:
      "Satın almak istediğiniz araç için size en uygun tarih ve saati seçerek ekspertiz randevunuzu hemen oluşturun.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RandevuLayout({ children }) {
  return <>{children}</>;
}
