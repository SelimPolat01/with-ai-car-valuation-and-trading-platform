"use client";

import { useEffect, useState } from "react";
import classes from "./SimiliarAdverts.module.css";
import { useRouter } from "next/navigation";

export default function SimilarAdverts({ currentAdvertId }) {
  const router = useRouter();
  const [similarCars, setSimilarCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSimilar() {
      if (!currentAdvertId) return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/adverts/similar-by-ai/${currentAdvertId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setSimilarCars(data);
        }
      } catch (error) {
        console.error("Benzer araçlar çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [currentAdvertId]);

  if (loading)
    return (
      <p className={classes.loadingText}>
        Benzer Yapay Zekâ Önerileri Yükleniyor...
      </p>
    );

  if (similarCars.length === 0) return null;

  const generateSlug = (text) => {
    if (!text) return "";
    return text.toString().toLowerCase().trim().replace(/\s+/g, "-");
  };

  const formatCarName = (text) => {
    if (!text) return "";
    const words = text.toString().trim().split(/\s+/);

    return words
      .map((word) => {
        const lowerWord = word.toLowerCase();
        if (lowerWord === "bmw") return "BMW";
        if (lowerWord === "series") return "Serisi";
        return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
      })
      .join(" ");
  };

  return (
    <div className={classes.container}>
      <h3 className={classes.title}>
        Görsel Olarak Benzer Araçlar (Yapay Zekâ Önerisi)
      </h3>

      <div className={classes.scrollContainer}>
        {similarCars.map((car) => {
          const formattedBrand = formatCarName(car.brand);
          const formattedModel = formatCarName(car.model);

          return (
            <div
              key={car.id}
              onClick={() => {
                const brandSlug = generateSlug(car.brand);
                const modelSlug = generateSlug(car.model);
                router.push(
                  `/ilan/${brandSlug}-${modelSlug}-${car.model_year}/${car.id}`,
                );
              }}
              className={classes.card}
            >
              <img
                src={car.image_data || "/images/no-image.png"}
                alt={`${formattedBrand} ${formattedModel}`}
                className={classes.image}
              />
              <h4 className={classes.carName}>
                {formattedBrand} {formattedModel}
              </h4>
              <p className={classes.carDetails}>
                {car.model_year} • {car.kilometer?.toLocaleString("tr-TR")} km
              </p>
              <p className={classes.carPrice}>
                {car.price?.toLocaleString("tr-TR")} ₺
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
