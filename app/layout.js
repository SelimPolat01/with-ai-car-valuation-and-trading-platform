import { Inter, Josefin_Sans } from "next/font/google";
import Footer from "@/app/components/Footer";
import "./globals.css";
import ReactQuery from "./lib/reactQuery";
import Providers from "./lib/Providers";
import Header from "./components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
});

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
            <Header />
            {children}
            <Footer />
          </ReactQuery>
        </Providers>
      </body>
    </html>
  );
}
