"use client";

import AdvertItem from "../components/AdvertItem.js";
import { setAdverts } from "@/store/advertsSlice.js";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classes from "./TumIlanlar.module.css";
import { useRouter } from "next/navigation.js";
import { useCheckAuth } from "@/backend/utils/useCheckAuth.js";
import LoadingSpinner from "../components/LoadingSpinner.js";
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
  const filteredAdverts = useSelector((state) => state.adverts.filteredAdverts);
  const uniqueBrands = Array.from(
    new Set(allAdverts.map((advert) => advert.brand))
  );
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

      dispatch(
        setAdverts(allAdverts.filter((prevAdvert) => prevAdvert.id !== id))
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

  // if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;
  if (!allAdverts || allAdverts.length === 0) return <p>İlan Bulunamadı</p>;

  return (
    <main className={classes.main}>
      <ConfirmDialog
        ref={deleteDialogRef}
        onConfirm={() => advertDeleteHandler(selectedAdvertId)}
        text="Bu ilanı yayından kaldırmak"
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
                <FilterBrand brand={brand} key={index} />
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className={classes.div}>
        <AnimatePresence>
          {filteredAdverts.map((advert) => (
            <AdvertItem
              id={advert.id}
              key={advert.id}
              imgSrc={advert.image_src}
              brand={advert.brand}
              model={advert.model}
              engineCapacity={advert.engine_capacity}
              modelYear={advert.model_year}
              price={advert.price}
              city={advert.city}
              onDeleteDialog={() => openDeleteModal(advert.id)}
              showDeleteButton={user && user.id === advert.user_id}
              showEditButton={user && user.id === advert.user_id}
            />
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}
