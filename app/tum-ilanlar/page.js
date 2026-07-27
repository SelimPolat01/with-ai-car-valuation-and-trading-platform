"use client";

import AdvertItem from "../components/AdvertItem.js";
import { setAdverts, setFilterAdverts } from "@/store/advertsSlice.js";
import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import classes from "./TumIlanlar.module.css";
import { useRouter } from "next/navigation.js";
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
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const allAdverts = useSelector((state) => state.adverts.allAdverts);
  const filteredAdverts = useSelector((state) => state.adverts.filteredAdverts);
  const selectedBrand = useSelector((state) => state.adverts.selectedBrand);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      setToken(currentToken);
    }
    setIsTokenLoaded(true);
  }, []);

  const {
    data: getAdvertsData,
    isLoading: getAdvertsIsLoading,
    isError: getAdvertsDataIsError,
    error: getAdvertsDataError,
  } = useGetAdverts(token, isTokenLoaded);

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
    if (allAdverts && allAdverts.length > 0) {
      allAdverts.forEach((advert) => {
        if (advert.brand) {
          counts[advert.brand] = (counts[advert.brand] || 0) + 1;
        }
      });
    }
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
          deleteDialogRef.current?.close();
        },
      },
    );
  }

  function openDeleteModal(id) {
    setSelectedAdvertId(id);
    deleteDialogRef.current.showModal();
  }

  function brandFilterHandler(brand) {
    if (selectedBrand === brand) {
      dispatch(setFilterAdverts(null));
    } else {
      dispatch(setFilterAdverts(brand));
    }
  }

  if (!isTokenLoaded || getAdvertsIsLoading) {
    return <Loading />;
  }

  if (getAdvertsDataIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p className="error">{getAdvertsDataError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className={classes.mainDiv}>
      <ConfirmDialog
        ref={deleteDialogRef}
        onConfirm={() => advertDeleteHandler(selectedAdvertId)}
        text={
          deleteAdvertIsPending
            ? "Siliniyor..."
            : "Bunu yapmak istediğinizden emin misiniz?"
        }
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
                  isActive={selectedBrand === brand}
                  onClick={() => brandFilterHandler(brand)}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={classes.advertsContainer}>
        <div className={classes.headerDiv}>
          <h1>TÜM İLANLAR {selectedBrand ? `- ${selectedBrand}` : ""}</h1>
        </div>

        {deleteAdvertIsError && (
          <div
            style={{
              color: "#ff4444",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            İlan silinirken bir hata oluştu: {deleteAdvertError?.message}
          </div>
        )}

        <div className={classes.div}>
          {!filteredAdverts || filteredAdverts.length === 0 ? (
            <div className={classes.notFoundAdvertDiv}>
              <p>
                {selectedBrand
                  ? "Seçtiğiniz filtreye uygun ilan bulunamadı."
                  : "Şu an için hiç ilan bulunmamaktadır."}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredAdverts.map((advert) => {
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
          )}
        </div>
      </div>
    </div>
  );
}
