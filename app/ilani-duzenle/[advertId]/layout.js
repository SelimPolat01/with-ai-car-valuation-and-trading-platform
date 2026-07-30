export async function generateMetadata({ params }) {
  const { id } = await params;

  return {
    title: `İlanı Düzenle (#${id})`,
    description:
      "Araç ilanınızı oluşturun, fotoğraflarını yükleyin veya bilgilerinizi güncelleyin.",
    keywords: [
      "ilan düzenle",
      "araç ilanı güncelle",
      "fotoğraf yükle",
      "yapayoto",
    ],
    openGraph: {
      title: `İlanı Düzenle (#${id}) | YapayOto`,
      description: "Araç ilanınızı güncelleyin.",
      url: `https://yapayoto.com.tr/ilani-duzenle/${id}`,
      siteName: "YapayOto",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `İlanı Düzenle (#${id}) | YapayOto`,
      description: "Araç ilanınızı güncelleyin.",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function IlaniDuzenleLayout({ children }) {
  return <>{children}</>;
}
