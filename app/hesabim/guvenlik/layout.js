export const metadata = {
  title: "Güvenlik Ayarları | Aracını Hemen Sat",
  description:
    "Hesabınızın güvenliğini en üst düzeye çıkarın. E-posta adresinizi ve parolanızı güncelleyin, oturum sürenizi ayarlayın veya hesabınızı yönetin.",
  keywords: [
    "güvenlik ayarları",
    "parola değiştirme",
    "hesap silme",
    "e-posta güncelleme",
    "hesap yönetimi",
    "aracını sat güvenlik",
  ],
  openGraph: {
    title: "Güvenlik Ayarları | Aracını Hemen Sat",
    description:
      "Hesabınızın güvenliğini en üst düzeye çıkarın. E-posta adresinizi, parolanızı ve oturum ayarlarınızı güvenle güncelleyin.",
    url: "https://yapayoto.me/hesabim/guvenlik",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Güvenlik Ayarları | Aracını Hemen Sat",
    description:
      "Hesabınızın güvenliğini en üst düzeye çıkarın. E-posta adresinizi, parolanızı ve oturum ayarlarınızı güvenle güncelleyin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function GuvenlikLayout({ children }) {
  return <>{children}</>;
}
