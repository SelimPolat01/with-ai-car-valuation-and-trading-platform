"use client";

import AdvertItem from "../components/AdvertItem.js";
import { setAdverts, setFilterAdverts } from "@/store/advertsSlice.js";
import { useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import classes from "./TumIlanlar.module.css";
import { useRouter } from "next/navigation.js";
import ConfirmDialog from "../components/ConfirmDialog.js";
import { AnimatePresence, motion } from "framer-motion";
import FilterBrand from "../components/FilterBrand.js";
import { useGetAdverts } from "@/hooks/GET/useGetAdverts";
import { useDeleteAdvert } from "@/hooks/DELETE/useDeleteAdvert";
import { AlertCircle, ArrowLeft, ChevronDown } from "lucide-react";
import Loading from "../loading.js";
import { usePostAdvertView } from "@/hooks/POST/usePostAdvertView.js";

export default function AllAdverts() {
  const dispatch = useDispatch();
  const router = useRouter();
  const deleteDialogRef = useRef(null);
  const dropdownRef = useRef(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);
  const [sortOption, setSortOption] = useState("default");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const allAdverts = useSelector((state) => state.adverts.allAdverts);
  const filteredAdverts = useSelector((state) => state.adverts.filteredAdverts);
  const selectedBrand = useSelector((state) => state.adverts.selectedBrand);
  const { user } = useSelector((state) => state.auth);

  const {
    data: getAdvertsData,
    isLoading: getAdvertsIsLoading,
    isError: getAdvertsDataIsError,
    error: getAdvertsDataError,
  } = useGetAdverts();

  const {
    mutate: deleteAdvertMutate,
    isPending: deleteAdvertIsPending,
    isError: deleteAdvertIsError,
    error: deleteAdvertError,
  } = useDeleteAdvert();

  const {
    mutate: postAdvertViewMutate,
    isPending: postAdvertViewIsPending,
    isError: postAdvertViewIsError,
    error: postAdvertViewError,
  } = usePostAdvertView();

  useEffect(() => {
    if (getAdvertsData) {
      dispatch(setAdverts(getAdvertsData?.result || getAdvertsData));
    }
  }, [getAdvertsData, dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const sortedAdverts = useMemo(() => {
    if (!filteredAdverts) return [];

    let advertsToSort = [...filteredAdverts];

    switch (sortOption) {
      case "price-asc":
        return advertsToSort.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-desc":
        return advertsToSort.sort((a, b) => Number(b.price) - Number(a.price));
      case "year-desc":
        return advertsToSort.sort(
          (a, b) => Number(b.model_year) - Number(a.model_year),
        );
      case "year-asc":
        return advertsToSort.sort(
          (a, b) => Number(a.model_year) - Number(b.model_year),
        );
      case "views-desc":
        return advertsToSort.sort(
          (a, b) => Number(b.view_count || 0) - Number(a.view_count || 0),
        );
      case "views-asc":
        return advertsToSort.sort(
          (a, b) => Number(a.view_count || 0) - Number(b.view_count || 0),
        );
      case "fav-desc":
        return advertsToSort.sort(
          (a, b) => Number(b.fav_count || 0) - Number(a.fav_count || 0),
        );
      case "fav-asc":
        return advertsToSort.sort(
          (a, b) => Number(a.fav_count || 0) - Number(b.fav_count || 0),
        );
      case "oldest":
        return advertsToSort.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at),
        );
      case "default":
      default:
        return advertsToSort.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
    }
  }, [filteredAdverts, sortOption]);

  function advertDeleteHandler(id) {
    if (!user) {
      router.push("/login");
      return;
    }

    deleteAdvertMutate(
      { advertId: id },
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
    if (!user) {
      router.replace("/login");
      return;
    }

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

  function handleAdvertClick(advertId) {
    postAdvertViewMutate(
      { advertId },
      { onSuccess: (data) => {}, onError: (err) => console.log(err?.message) },
    );
  }

  const sortOptionsList = [
    { value: "default", label: "Varsayılan Sıralama (En Yeni)" },
    { value: "oldest", label: "Tarihe Göre (En Eski)" },
    { value: "price-asc", label: "Fiyata Göre Artan" },
    { value: "price-desc", label: "Fiyata Göre Azalan" },
    { value: "views-desc", label: "Tıklamaya Göre Azalan" },
    { value: "views-asc", label: "Tıklamaya Göre Artan" },
    { value: "fav-desc", label: "Favorilemeye Göre Azalan" },
    { value: "fav-asc", label: "Favorilemeye Göre Artan" },
    { value: "year-desc", label: "Model Yılına Göre Azalan" },
    { value: "year-asc", label: "Model Yılına Göre Artan" },
  ];

  const currentSortLabel = sortOptionsList.find(
    (opt) => opt.value === sortOption,
  )?.label;

  if (getAdvertsIsLoading) {
    return <Loading />;
  }

  if (getAdvertsDataIsError || deleteAdvertIsError || postAdvertViewIsError) {
    const errorMessage =
      getAdvertsDataError?.message ||
      deleteAdvertError?.message ||
      postAdvertViewError?.message ||
      "Sunucu kaynaklı bir hata oluştu.";

    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p className="error">{errorMessage}</p>
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
          <h1>
            TÜM İLANLAR{" "}
            {selectedBrand ? `- ${selectedBrand.toUpperCase()}` : ""}
          </h1>

          <div className={classes.customDropdownContainer} ref={dropdownRef}>
            <div
              className={`${classes.dropdownHeader} ${isDropdownOpen ? classes.dropdownHeaderActive : ""}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{currentSortLabel}</span>
              <ChevronDown
                size={18}
                className={`${classes.dropdownIcon} ${isDropdownOpen ? classes.iconRotated : ""}`}
              />
            </div>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={classes.dropdownList}
                >
                  {sortOptionsList.map((option) => (
                    <li
                      key={option.value}
                      className={`${classes.dropdownItem} ${sortOption === option.value ? classes.dropdownItemActive : ""}`}
                      onClick={() => {
                        setSortOption(option.value);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className={classes.div}>
          {!sortedAdverts || sortedAdverts.length === 0 ? (
            <div className={classes.notFoundAdvertDiv}>
              <p>
                {selectedBrand
                  ? "Seçtiğiniz filtreye uygun ilan bulunamadı."
                  : "Şu an için hiç ilan bulunmamaktadır."}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {sortedAdverts.map((advert) => {
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
                    onClick={() => handleAdvertClick(advert.id)}
                    imgSrc={coverImage}
                    brand={advert.brand}
                    model={advert.model}
                    engineCapacity={advert.engine_capacity}
                    modelYear={advert.model_year}
                    price={advert.price}
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
