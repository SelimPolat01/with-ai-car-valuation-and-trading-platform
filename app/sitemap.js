export default async function sitemap() {
  const baseUrl = "https://yapayoto.com.tr";

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

      dynamicRoutes = ilanlar.map((ilan) => {
        const brandFormat = (ilan.brand || "")
          .toLowerCase()
          .replace(/\s+/g, "-");
        const modelFormat = (ilan.model || "")
          .toLowerCase()
          .replace(/\s+/g, "-");
        const slug = `${brandFormat}-${modelFormat}-${ilan.model_year}`;
        const advertId = ilan.id || ilan.advert_id;

        return {
          url: `${baseUrl}/ilan/${slug}/${advertId}`,
          lastModified: new Date(
            ilan.updated_at || ilan.created_at || new Date(),
          ),
          changeFrequency: "daily",
          priority: 0.8,
        };
      });
    }
  } catch (error) {
    console.error("Sitemap oluşturulurken API'den ilanlar çekilemedi:", error);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
