"use client";

import { useRouter, useSearchParams } from "next/navigation";
import classes from "./Arama.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SearchCar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [similarAdverts, setSimilarAdverts] = useState([]);
  const searchParams = useSearchParams();
  const searchText = searchParams.get("q") || "";

  useEffect(() => {
    if (!searchText || !searchText.trim()) {
      setSimilarAdverts([]);
      setLoading(false);
      return;
    }

    async function fetchSimilarAdverts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_FAST_API_URL}/search-similar-advert`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: searchText.toLowerCase() }),
          },
        );

        if (!response.ok) {
          throw new Error("Benzer ilanlar getirilirken bir hata oluştu.");
        }

        const data = await response.json();

        if (data.success) {
          setSimilarAdverts(data.results);
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error("FastAPI Bağlantı Hatası:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSimilarAdverts();
  }, [searchText]);

  function capitalize(text) {
    if (typeof text !== "string") return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  if (error)
    return (
      <div className={classes.errorDiv}>
        <p className="error">{error}</p>
      </div>
    );

  return (
    <div className={classes.div}>
      <div className={classes.searchTextDiv}>
        <p className={classes.searchText}>
          <span className={classes.highlightText}>
            "{capitalize(searchText)}"
          </span>{" "}
          yapay zeka araması için{" "}
          <span className={classes.countText}>{similarAdverts.length}</span> en
          yakın sonuç listeleniyor.
        </p>
      </div>

      <div className={classes.listWrapper}>
        <div className={classes.listHeader}>
          <span className={classes.photoHeader}>Fotoğraf</span>
          <span className={classes.titleHeader}>İlan Başlığı</span>
          <span className={classes.matchingHeader}>Eşleşme</span>
          <span className={classes.descriptionHeader}>Açıklama Özeti</span>
        </div>

        <div className={classes.filteredAdvertDiv}>
          {loading ? (
            <p className={classes.loading}>
              Yapay zeka ilanları analiz ediyor...
            </p>
          ) : similarAdverts.length === 0 ? (
            <p className={classes.noResult}>
              Eşleşen benzer bir ilan bulunamadı.
            </p>
          ) : (
            similarAdverts.map((advert) => (
              <Link
                key={advert.id}
                href={`/ilan/detay/${advert.id}`}
                className={classes.listItem}
              >
                <img
                  className={classes.img}
                  src={advert.image_src || "/default-car.png"}
                  alt={advert.title}
                />

                <span className={classes.title}>{advert.title}</span>

                <span className={classes.price}>
                  % {((1 - advert.distance) * 100).toFixed(1)}
                </span>

                <span className={classes.description}>
                  {advert.description.toUpperCase()}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
