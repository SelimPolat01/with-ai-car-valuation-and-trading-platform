export async function generateMetadata({ params }) {
  const islemId = params.islemId;

  return {
    title: `İşlem Detayları #${islemId} | Aracını Hemen Sat`,
    description:
      "Araç alım-satım sürecinizin tüm adımlarını, güvenli havuz hesabındaki (escrow) ödeme durumunu ve noter işlemlerini detaylı olarak takip edin.",
    keywords: [
      "işlem detayları",
      "araç satış süreci",
      "güvenli ödeme",
      "noter satışı",
      "escrow hesabı",
      "araç devir işlemleri",
    ],
    openGraph: {
      title: `İşlem Detayları #${islemId} | Aracını Hemen Sat`,
      description:
        "Araç alım-satım sürecinizin tüm adımlarını ve ödeme/noter durumunu detaylı olarak takip edin.",
      url: `https://yapayoto.com.tr/hesabim/alis-satis-islemleri/${islemId}`,
      siteName: "Aracını Sat",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `İşlem Detayları #${islemId} | Aracını Hemen Sat`,
      description:
        "Araç alım-satım sürecinizin tüm adımlarını ve ödeme/noter durumunu detaylı olarak takip edin.",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function İslemLayout({ children }) {
  return <>{children}</>;
}
