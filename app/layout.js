import Footer from "@/app/components/Footer";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import AuthInitializer from "@/app/components/AuthInitializer";
import Providers from "./components/Providers";
import Header from "./components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Dancing+Script:wght@400..700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Oswald:wght@200..700&family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Quicksand:wght@300..700&display=swap"
          rel="stylesheet"
        ></link>
        <link
          href="https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800"
          rel="stylesheet"
          type="text/css"
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
      <body className="rootBody">
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
