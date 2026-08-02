export default async function sitemap() {
  const baseUrl = "https://yapayoto.com.tr";

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

  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tum-ilanlar`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/arama`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sikca-sorulan-sorular`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  let dynamicRoutes = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/adverts`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const ilanlar = Array.isArray(data.result)
        ? data.result
        : Array.isArray(data)
          ? data
          : [];

      const aktifIlanlar = ilanlar.filter(
        (ilan) => ilan.is_sold === false && ilan.is_deleted === false,
      );

      dynamicRoutes = aktifIlanlar.map((ilan) => {
        const brandFormat = slugify(ilan.brand);
        const modelFormat = slugify(ilan.model);
        const slug = `${brandFormat}-${modelFormat}-${ilan.model_year}`;
        const advertId = ilan.id || ilan.advert_id;

        return {
          url: `${baseUrl}/ilan/${slug}/${advertId}`,
          lastModified: new Date(
            ilan.edited_at || ilan.created_at || new Date(),
          ),
          changeFrequency: "daily",
          priority: 0.8,
        };
      });
    }
  } catch (error) {}

  return [...staticRoutes, ...dynamicRoutes];
}
