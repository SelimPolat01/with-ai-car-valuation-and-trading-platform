export const metadata = {
  title: "Şifremi Unuttum | Aracını Hemen Sat",
  description:
    "Yapay zeka destekli araç değerleme platformumuzdaki hesabınızın şifresini unuttuysanız, e-posta adresinizi girerek şifrenizi güvenle sıfırlayabilirsiniz.",
  keywords: [
    "şifremi unuttum",
    "şifre sıfırlama",
    "parola yenileme",
    "hesap kurtarma",
    "aracını sat şifre yenileme",
    "yapay oto şifre sıfırlama",
  ],
  openGraph: {
    title: "Şifremi Unuttum | Aracını Hemen Sat",
    description:
      "Hesabınızın şifresini mi unuttunuz? Güvenli bir şekilde şifrenizi sıfırlamak için e-posta adresinizi girin.",
    url: "https://yapayoto.com.tr/sifremi-unuttum",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Şifremi Unuttum | Aracını Hemen Sat",
    description:
      "Hesabınızın şifresini mi unuttunuz? Güvenli bir şekilde şifrenizi sıfırlamak için e-posta adresinizi girin.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SifremiUnuttumLayout({ children }) {
  return <>{children}</>;
}
