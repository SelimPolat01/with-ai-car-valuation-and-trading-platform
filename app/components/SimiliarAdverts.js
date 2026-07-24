"use client";

import { useEffect, useState } from "react";
import classes from "./SimiliarAdverts.module.css";
import { useRouter } from "next/navigation";
import { formatBrandModel, generateSlug } from "../utils/helpers";
import { motion } from "framer-motion";

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
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSimilar();
  }, [currentAdvertId]);

  if (loading)
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={classes.loadingText}
      >
        Benzer Yapay Zekâ Önerileri Yükleniyor...
      </motion.p>
    );

  if (similarCars.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={classes.container}
    >
      <h3 className={classes.title}>
        Görsel Olarak Benzer Araçlar (Yapay Zekâ Önerisi)
      </h3>

      <div className={classes.scrollContainer}>
        {similarCars.map((car) => {
          const formattedBrand = formatBrandModel(car.brand);
          const formattedModel = formatBrandModel(car.model);

          return (
            <motion.div
              key={car.id}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.05 }}
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
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
