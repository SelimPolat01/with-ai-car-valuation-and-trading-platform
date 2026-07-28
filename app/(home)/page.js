import Dropdown from "@/app/components/Dropdown";
import AiCarDetector from "@/app/components/AiCarDetector";

export const metadata = {
  title: "Yapay Zeka ile Araç Değerleme ve Satış Platformu",
  description:
    "Aracınızın fotoğrafını yükleyin, yapay zeka marka, model ve yılını anında tespit etsin. İster AI araç tespiti ister manuel form ile aracınızı hemen satabilirsiniz.",
  keywords: [
    "yapay zeka araç tespiti",
    "araç değerleme",
    "araba sat",
    "oto AI",
    "ikinci el araç fiyatı",
    "oto alım satım",
  ],
  openGraph: {
    title: "Yapay Zeka ile Araç Değerleme ve Satış Platformu",
    description:
      "Fotoğraftan araç tanıyan yapay zeka teknolojisi ile aracınızın değerini öğrenin ve hızlıca satım ilanınızı oluşturun.",
    url: "https://yapayoto.com.tr",
    siteName: "YapayOto",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aracını Hemen Sat | Yapay Zeka ile Araç Değerleme",
    description:
      "Aracınızın fotoğrafını yükleyin, yapay zeka aracınızı tanısın veya bilgileri girerek anında değerleme yapın.",
  },
};

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const mode = params?.mode;

  return (
    <div className="homeContainer">
      {mode === "form" ? (
        <div className="dropdownDiv">
          <div className="dropdownContainer">
            <div>
              <h2 style={{ margin: 0 }}>Araç bilgilerini gir.</h2>
            </div>
            <div>
              <p style={{ color: "#FF6B6B" }}>Aracını hemen sat.</p>
            </div>
            <Dropdown />
          </div>
        </div>
      ) : (
        <AiCarDetector />
      )}
    </div>
  );
}
