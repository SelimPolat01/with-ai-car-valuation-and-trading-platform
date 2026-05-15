"use client";

import { useRouter, useSearchParams } from "next/navigation";
import classes from "./Arama.module.css";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useEffect, useState } from "react";
import { setAdverts } from "@/store/advertsSlice";

export default function SearchCar() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchText = searchParams.get("q") || "";
  const allAdverts = useSelector((state) => state.adverts.allAdverts);
  const filteredAdverts = searchText
    ? allAdverts.filter((advert) =>
        `${advert.brand} ${advert.model} ${advert.title}`
          .toLowerCase()
          .startsWith(encodeURIComponent(searchText.toLowerCase()))
      )
    : allAdverts;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (allAdverts.length === 0) {
      async function fetchAdverts() {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/adverts`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 401) {
            localStorage.removeItem("token");
            router.replace("/login");
            return;
          }

          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.message);
            return;
          }

          const advertsData = await response.json();
          dispatch(setAdverts(advertsData));
        } catch (err) {
          console.log("Error: " + err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchAdverts();
    }
  }, [dispatch, router, allAdverts.length]);

  function capitalize(text) {
    if (typeof text !== "string") {
      return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  if (error) return <p>{error}</p>;

  return (
    <div className={classes.div}>
      <div className={classes.searchTextDiv}>
        <p>
          "{capitalize(searchText)}" araması için{" "}
          <span style={{ color: "brown" }}>{filteredAdverts.length}</span> sonuç
          bulundu.
        </p>
      </div>
      <div className={classes.listWrapper}>
        <div className={classes.listHeader}>
          <span>Fotoğraf</span>
          <span>İlan Başlığı</span>
          <span>Fiyat</span>
          <span>İlan Tarihi</span>
          <span>İl</span>
        </div>
        <div className={classes.filteredAdvertDiv}>
          {filteredAdverts.map((filteredAdvert) => (
            <Link
              key={filteredAdvert.id}
              href={`/ilan/${filteredAdvert.brand}-${filteredAdvert.model}-${filteredAdvert.model_year}/${filteredAdvert.id}`}
              className={classes.listItem}
            >
              <img
                className={classes.img}
                src={filteredAdvert.image_src}
                alt={filteredAdvert.title}
              />

              <span className={classes.title}>{filteredAdvert.title}</span>
              <span className={classes.price}>
                {filteredAdvert.price.toLocaleString("tr-TR")} ₺
              </span>
              <span>
                {new Date(filteredAdvert.created_at).toLocaleDateString(
                  "tr-TR",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
              <span>{capitalize(filteredAdvert.city)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
