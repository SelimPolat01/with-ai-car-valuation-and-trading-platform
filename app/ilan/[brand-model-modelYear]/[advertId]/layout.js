export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const advertId = resolvedParams.advertId;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/adverts/${advertId}`,
      {
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) throw new Error("İlan bulunamadı");

    const advertData = await res.json();
    const advert = Array.isArray(advertData.result)
      ? advertData.result[0]
      : advertData.result || advertData;

    const pageTitle = `${advert.model_year} ${advert.brand?.toUpperCase()} ${advert.model?.toUpperCase()} | Aracını Sat`;
    const pageDescription = advert.description
      ? advert.description.substring(0, 150) + "..."
      : "Bu ilanın detaylarını inceleyin.";

    const mainImgObj =
      advert.images?.find((img) => img.is_main) || advert.images?.[0];

    const imageUrl = mainImgObj
      ? mainImgObj.image_data || mainImgObj.image_url
      : "https://yapayoto.com.tr/images/default-car.svg";

    const slugify = (text) => {
      if (!text) return "";
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    };

    const cleanSlug = `${slugify(advert.brand)}-${slugify(advert.model)}-${advert.model_year}`;

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: [
        "ikinci el araç",
        advert.brand,
        advert.model,
        `${advert.model_year} ${advert.brand}`,
        "araba ilanı",
        "aracını sat",
      ],
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        url: `https://yapayoto.com.tr/ilan/${cleanSlug}/${advertId}`,
        siteName: "Aracını Sat",
        locale: "tr_TR",
        type: "website",
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: pageTitle,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
        images: [imageUrl],
      },
    };
  } catch (error) {
    return {
      title: "İlan Detayı | Aracını Hemen Sat",
      description: "Aradığınız ilanın detaylarını inceleyin.",
    };
  }
}

export default function IlanLayout({ children }) {
  return <>{children}</>;
}
