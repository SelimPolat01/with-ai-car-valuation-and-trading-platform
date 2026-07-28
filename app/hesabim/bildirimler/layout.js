export const metadata = {
  title: "Bildirimler | Aracını Hemen Sat",
  description:
    "Hesabınızla ilgili güncel bildirimleri, araç alım-satım süreçlerindeki gelişmeleri ve ekspertiz randevu hatırlatmalarını buradan takip edin.",
  keywords: [
    "bildirimler",
    "hesabım bildirimler",
    "araç satış duyuruları",
    "randevu hatırlatmaları",
    "sistem bildirimleri",
  ],
  openGraph: {
    title: "Bildirimler | Aracını Hemen Sat",
    description:
      "Hesabınızla ilgili güncel bildirimleri, araç alım-satım süreçlerindeki gelişmeleri ve randevu hatırlatmalarını takip edin.",
    url: "https://yapayoto.com.tr/hesabim/bildirimler",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bildirimler | Aracını Hemen Sat",
    description:
      "Hesabınızla ilgili güncel bildirimleri, araç alım-satım süreçlerindeki gelişmeleri ve randevu hatırlatmalarını takip edin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function BildirimlerLayout({ children }) {
  return <>{children}</>;
}
