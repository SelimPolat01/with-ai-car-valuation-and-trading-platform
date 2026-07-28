export const metadata = {
  title: "Ödeme ve Randevu Onayı | Aracını Hemen Sat",
  description:
    "Seçtiğiniz araç için ekspertiz ve satın alım randevusu ödemenizi güvenle tamamlayın. İşlemleriniz uçtan uca şifrelenerek korunmaktadır.",
  keywords: [
    "güvenli ödeme",
    "araç satın alma ödemesi",
    "ekspertiz ücreti",
    "randevu onayı",
    "kredi kartı ile ödeme",
  ],
  openGraph: {
    title: "Ödeme ve Randevu Onayı | Aracını Hemen Sat",
    description:
      "Seçtiğiniz araç için ekspertiz ve satın alım randevusu ödemenizi güvenle tamamlayın.",
    url: "https://yapayoto.com.tr/odeme",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ödeme ve Randevu Onayı | Aracını Hemen Sat",
    description:
      "Seçtiğiniz araç için ekspertiz ve satın alım randevusu ödemenizi güvenle tamamlayın.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function OdemeLayout({ children }) {
  return <>{children}</>;
}
