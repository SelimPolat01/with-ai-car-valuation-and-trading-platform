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
import { useGetAdverts } from "@/hooks/GET/useGetAdverts";
import { useDeleteAdvert } from "@/hooks/DELETE/useDeleteAdvert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Loading from "../loading.js";

export default function AllAdverts() {
  const dispatch = useDispatch();
  const router = useRouter();
  const deleteDialogRef = useRef(null);

  const [token, setToken] = useState(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);

  const allAdverts = useSelector((state) => state.adverts.allAdverts);
  const user = useSelector((state) => state.auth.user);
  const filteredAdverts = useSelector(
    (state) => state.adverts.filteredAdverts || [],
  );
  const displayAdverts =
    filteredAdverts.length > 0 ? filteredAdverts : allAdverts;

  useCheckAuth();

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
  }, []);

  const {
    data: getAdvertsData,
    isLoading: getAdvertsIsLoading,
    isError: getAdvertsDataIsError,
    error: getAdvertsDataError,
  } = useGetAdverts(token);

  const {
    mutate: deleteAdvertMutate,
    isPending: deleteAdvertIsPending,
    isError: deleteAdvertIsError,
    error: deleteAdvertError,
  } = useDeleteAdvert();

  useEffect(() => {
    if (getAdvertsData) {
      dispatch(setAdverts(getAdvertsData?.result || getAdvertsData));
    }
  }, [getAdvertsData, dispatch]);

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

  function advertDeleteHandler(id) {
    if (!token) return;

    deleteAdvertMutate(
      { token, advertId: id },
      {
        onSuccess: () => {
          dispatch(
            setAdverts(allAdverts.filter((prevAdvert) => prevAdvert.id !== id)),
          );
        },
      },
    );
  }

  function openDeleteModal(id) {
    setSelectedAdvertId(id);
    deleteDialogRef.current.showModal();
  }

  if (!token || getAdvertsIsLoading || deleteAdvertIsPending) {
    return <Loading />;
  }

  if (getAdvertsDataIsError || deleteAdvertIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p className="error">
          {getAdvertsDataError?.message || deleteAdvertError?.message}
        </p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  if (!allAdverts || allAdverts.length === 0)
    return (
      <div className={classes.notFoundAdvertDiv}>
        <p>İlan Bulunmamaktadır...</p>
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
