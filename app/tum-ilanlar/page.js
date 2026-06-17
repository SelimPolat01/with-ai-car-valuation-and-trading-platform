"use client";

import AdvertItem from "../components/AdvertItem.js";
import { setAdverts } from "@/store/advertsSlice.js";
import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import classes from "./TumIlanlar.module.css";
import { useRouter } from "next/navigation.js";
import { useCheckAuth } from "@/backend/utils/useCheckAuth.js";
import ConfirmDialog from "../components/ConfirmDialog.js";
import { AnimatePresence } from "framer-motion";
import FilterBrand from "../components/FilterBrand.js";

export default function AllAdverts() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const deleteDialogRef = useRef(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);
  const allAdverts = useSelector((state) => state.adverts.allAdverts);
  const user = useSelector((state) => state.auth.user);
  const filteredAdverts = useSelector(
    (state) => state.adverts.filteredAdverts || [],
  );
  const displayAdverts =
    filteredAdverts.length > 0 ? filteredAdverts : allAdverts;

  const { uniqueBrands, brandCounts } = useMemo(() => {
    const counts = {};
    allAdverts.forEach((advert) => {
      if (advert.brand) {
        counts[advert.brand] = (counts[advert.brand] || 0) + 1;
      }
    });
    return {
      uniqueBrands: Object.keys(counts),
      brandCounts: counts,
    };
  }, [allAdverts]);

  useCheckAuth();

  useEffect(() => {
    const fetchAdverts = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/adverts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        const advertData = await response.json();
        dispatch(setAdverts(advertData));
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdverts();
  }, [dispatch, router]);

  async function advertDeleteHandler(id) {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/adverts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
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
      dispatch(
        setAdverts(allAdverts.filter((prevAdvert) => prevAdvert.id !== id)),
      );
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openDeleteModal(id) {
    setSelectedAdvertId(id);
    deleteDialogRef.current.showModal();
  }

  if (error) return <p>{error}</p>;
  if (!allAdverts || allAdverts.length === 0)
    return (
      <div className={classes.notFoundAdvertDiv}>
        <p>İlan Bulunmamaktadır</p>
      </div>
    );

  return (
    <main className={classes.main}>
      <ConfirmDialog
        ref={deleteDialogRef}
        onConfirm={() => advertDeleteHandler(selectedAdvertId)}
        text="Bunu yapmak istediğinizden emin misiniz?"
        title="Kaldır"
      />
      <div className={classes.filterDiv}>
        <div className={classes.filterTextDiv}>
          <h2>
            Otomobil <i className="fa fa-filter"></i>
          </h2>
        </div>
        <div className={classes.filterWrapper1}>
          <div className={classes.filterWrapper2}>
            <ul className={classes.ul}>
              {uniqueBrands.map((brand, index) => (
                <FilterBrand
                  brand={brand}
                  count={brandCounts[brand]}
                  key={index}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={classes.advertsContainer}>
        <div className={classes.headerDiv}>
          <h1>TÜM İLANLAR</h1>
        </div>
        <div className={classes.div}>
          <AnimatePresence>
            {displayAdverts.map((advert) => {
              const mainImgObj = advert.images
                ? advert.images.find((img) => img.is_main) || advert.images[0]
                : null;

              const coverImage = mainImgObj
                ? mainImgObj.image_data || mainImgObj.image_url
                : advert.image_src;

              return (
                <AdvertItem
                  id={advert.id}
                  key={advert.id}
                  imgSrc={coverImage}
                  brand={advert.brand}
                  model={advert.model}
                  engineCapacity={advert.engine_capacity}
                  modelYear={advert.model_year}
                  price={advert.price}
                  city={advert.city}
                  onDeleteDialog={() => openDeleteModal(advert.id)}
                  showDeleteButton={
                    user && Number(user.id) === Number(advert.user_id)
                  }
                  showEditButton={
                    user && Number(user.id) === Number(advert.user_id)
                  }
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
