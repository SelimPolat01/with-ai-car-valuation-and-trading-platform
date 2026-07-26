export const metadata = {
  title: "Kayıt Ol | Aracını Hemen Sat",
  description:
    "Yapay zeka destekli araç değerleme ve alım-satım platformumuza ücretsiz kayıt olun. Hemen üye olarak aracınızın gerçek değerini öğrenin ve güvenle satın.",
  keywords: [
    "kayıt ol",
    "üye ol",
    "yeni hesap oluştur",
    "aracını sat kayıt",
    "yapay zeka araç değerleme üyelik",
    "ikinci el araç satışı",
  ],
  openGraph: {
    title: "Kayıt Ol | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli araç değerleme platformuna ücretsiz kayıt olun ve aracınızın değerini anında öğrenin.",
    url: "/register",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kayıt Ol | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli araç değerleme platformuna ücretsiz kayıt olun ve aracınızın değerini anında öğrenin.",
  },
};

export default function RegisterLayout({ children }) {
  return <>{children}</>;
}
