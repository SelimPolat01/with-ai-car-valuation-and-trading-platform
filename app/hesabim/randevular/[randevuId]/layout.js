export async function generateMetadata({ params }) {
  const randevuId = params.randevuId;

  return {
    title: `Randevu Detayları #${randevuId} | Aracını Hemen Sat`,
    description:
      "Araç alım-satım ve ekspertiz randevunuzun saat, konum, QR kod ve diğer işlem detaylarını güvenle inceleyin veya randevunuzu yönetin.",
    keywords: [
      "randevu detayı",
      "ekspertiz konumu",
      "randevu iptali",
      "araç randevu QR kodu",
      "alım satım randevusu",
    ],
    openGraph: {
      title: `Randevu Detayları #${randevuId} | Aracını Hemen Sat`,
      description:
        "Araç alım-satım ve ekspertiz randevunuzun saat, konum ve işlem detaylarını güvenle inceleyin.",
      url: `https://yapayoto.com.tr/hesabim/randevular/${randevuId}`,
      siteName: "Aracını Sat",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Randevu Detayları #${randevuId} | Aracını Hemen Sat`,
      description:
        "Araç alım-satım ve ekspertiz randevunuzun saat, konum ve işlem detaylarını güvenle inceleyin.",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function RandevuLayout({ children }) {
  return <>{children}</>;
}
