"use client";

import { useSearchParams } from "next/navigation";
import classes from "./Arama.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SearchAdvert() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [similarAdverts, setSimilarAdverts] = useState([]);
  const searchParams = useSearchParams();
  const searchText = searchParams.get("q") || "";

  useEffect(() => {
    let isMounted = true;

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
            body: JSON.stringify({
              text: searchText.toLocaleLowerCase("tr-TR"),
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Benzer ilanlar getirilirken bir hata oluştu.");
        }

        const data = await response.json();

        if (isMounted) {
          if (data.success) {
            setSimilarAdverts(data.results || []);
          } else {
            setError(data.message || "Arama başarısız oldu.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("FastAPI Bağlantı Hatası:", err);
          setError(err.message || "Bir bağlantı hatası oluştu.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSimilarAdverts();

    return () => {
      isMounted = false;
    };
  }, [searchText]);

  function capitalize(text) {
    if (typeof text !== "string" || !text) return "";
    return (
      text.charAt(0).toLocaleUpperCase("tr-TR") +
      text.slice(1).toLocaleLowerCase("tr-TR")
    );
  }

  if (error) {
    return (
      <div className={classes.errorDiv}>
        <p className="error">{error}</p>
      </div>
    );
  }

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
            similarAdverts.map((advert) => {
              const matchPercentage =
                typeof advert.distance === "number"
                  ? ((1 - advert.distance) * 100).toFixed(1)
                  : "0";

              const safeTitle = advert.title || "İlan Başlığı Yok";
              const safeDescription = (
                advert.description || ""
              ).toLocaleUpperCase("tr-TR");

              return (
                <Link
                  key={advert.id}
                  href={`/ilan/detay/${advert.id}`}
                  className={classes.listItem}
                >
                  <img
                    className={classes.img}
                    src={advert.image_src || "/default-car.png"}
                    alt={safeTitle}
                  />

                  <span className={classes.title}>{safeTitle}</span>

                  <span className={classes.price}>% {matchPercentage}</span>

                  <span className={classes.description}>{safeDescription}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
