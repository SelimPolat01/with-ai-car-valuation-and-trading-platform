export const metadata = {
  title: "Kişisel Bilgilerim | Aracını Hemen Sat",
  description:
    "Profil bilgilerinizi, iletişim detaylarınızı ve ödemeleriniz için IBAN numaranızı güvenle güncelleyin. Tüm verileriniz şifrelenerek saklanmaktadır.",
  keywords: [
    "kişisel bilgiler",
    "hesabım",
    "profil güncelleme",
    "iban bilgileri",
    "aracını sat profil",
    "kullanıcı bilgileri",
  ],
  openGraph: {
    title: "Kişisel Bilgilerim | Aracını Hemen Sat",
    description:
      "Profil bilgilerinizi, iletişim detaylarınızı ve ödemeleriniz için IBAN numaranızı güvenle güncelleyin.",
    url: "https://yapayoto.com.tr/hesabim/kisisel-bilgiler",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kişisel Bilgilerim | Aracını Hemen Sat",
    description:
      "Profil bilgilerinizi, iletişim detaylarınızı ve ödemeleriniz için IBAN numaranızı güvenle güncelleyin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function KisiselBilgilerLayout({ children }) {
  return <>{children}</>;
}
