import { Inter, Josefin_Sans } from "next/font/google";
import Footer from "@/app/components/Footer";
import "./globals.css";
import ReactQuery from "./lib/reactQuery";
import Providers from "./lib/Providers";
import Header from "./components/Header";
import BackgroundWrapper from "./components/BackgroundWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});

export const metadata = {
  title: "Giriş Yap | Aracını Hemen Sat",
  description:
    "Yapay zeka destekli araç değerleme ve alım-satım platformumuza giriş yapın. Aracınızın gerçek değerini saniyeler içinde öğrenin ve güvenle satın.",
  verification: {
    google: "_wknVEzmwH7amGR7nb6fnqjGlMDgKpzrBbP065UOWkM",
  },
  keywords: [
    "giriş yap",
    "üye girişi",
    "aracını sat giriş",
    "yapay zeka araç değerleme",
    "ikinci el araç satışı",
  ],
  openGraph: {
    title: "Giriş Yap | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli araç değerleme platformuna giriş yapın ve aracınızın değerini anında öğrenin.",
    url: "/login",
    siteName: "Aracını Sat",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Giriş Yap | Aracını Hemen Sat",
    description:
      "Yapay zeka destekli araç değerleme platformuna giriş yapın ve aracınızın değerini anında öğrenin.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
        <title>Araç Fiyat Teklif Al / Sat</title>
      </head>
      <body className={`rootBody ${inter.variable} ${josefin.variable}`}>
        <Providers>
          <ReactQuery>
            <BackgroundWrapper>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient
                    id="magic-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00c6ff" />
                    <stop offset="50%" stopColor="#833ab4" />
                    <stop offset="100%" stopColor="#ff007f" />
                  </linearGradient>
                </defs>
              </svg>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient
                    id="gold-stroke"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#F9D423" />
                    <stop offset="50%" stopColor="#FF4E50" />
                    <stop offset="100%" stopColor="#C33764" />
                  </linearGradient>
                </defs>
              </svg>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient
                    id="custom-text-stroke"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="16.01%" stopColor="#dcb3ff" />
                    <stop offset="46.76%" stopColor="#9867ff" />
                    <stop offset="86.39%" stopColor="#68ffed" />
                  </linearGradient>
                </defs>
              </svg>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient
                    id="header-icon-gold"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFDF00" />
                    <stop offset="50%" stopColor="#FFB300" />
                    <stop offset="100%" stopColor="#FFA000" />
                  </linearGradient>
                </defs>
              </svg>

              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient
                    id="custom-icon-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="20%" stopColor="#ffffff" />
                    <stop offset="45%" stopColor="#9cf0fd" />
                    <stop offset="75%" stopColor=" #00f7ff" />
                    <stop offset="100%" stopColor="#00b7ff" />
                  </linearGradient>
                </defs>
              </svg>
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                  <linearGradient
                    id="header-stroke-gold"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFE066" />
                    <stop offset="50%" stopColor="#F5AF19" />
                    <stop offset="100%" stopColor="#E65C00" />
                  </linearGradient>
                  <linearGradient
                    id="header-stroke-cyan"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#00F2FE" />
                    <stop offset="50%" stopColor="#4FACFE" />
                    <stop offset="100%" stopColor="#0062E6" />
                  </linearGradient>
                  <linearGradient
                    id="header-stroke-rosegold"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFC3A0" />
                    <stop offset="50%" stopColor="#FFAF7B" />
                    <stop offset="100%" stopColor="#D76D77" />
                  </linearGradient>
                  <linearGradient
                    id="header-stroke-ice"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#E0EAFC" />
                    <stop offset="100%" stopColor="#CFDEF3" />
                  </linearGradient>
                </defs>
              </svg>
              <Header />
              <main className="mainRoot">{children}</main>
              <Footer />
            </BackgroundWrapper>
          </ReactQuery>
        </Providers>
      </body>
    </html>
  );
}
