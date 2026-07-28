export const metadata = {
  title: "Randevularım | Aracını Hemen Sat",
  description:
    "Alıcı veya satıcı olarak oluşturduğunuz araç ekspertiz ve alım-satım randevularınızı takip edin, detayları ve raporları kolayca inceleyin.",
  keywords: [
    "randevularım",
    "ekspertiz randevu takip",
    "araç alım satım",
    "hesabım randevular",
    "oto ekspertiz işlemleri",
  ],
  openGraph: {
    title: "Randevularım | Aracını Hemen Sat",
    description:
      "Alıcı veya satıcı olarak oluşturduğunuz araç ekspertiz ve alım-satım randevularınızı takip edin, detayları kolayca inceleyin.",
    url: "https://yapayoto.com.tr/hesabim/randevular",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Randevularım | Aracını Hemen Sat",
    description:
      "Alıcı veya satıcı olarak oluşturduğunuz araç ekspertiz ve alım-satım randevularınızı takip edin, detayları kolayca inceleyin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RandevularLayout({ children }) {
  return <>{children}</>;
}
