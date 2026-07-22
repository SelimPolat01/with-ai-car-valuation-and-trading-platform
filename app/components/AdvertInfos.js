"use client";

import { useEffect, useState } from "react";
import { toggleFavorite } from "@/store/advertsSlice";
import { useParams, useRouter } from "next/navigation";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import classes from "./AdvertInfos.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PrimaryButton from "./PrimaryButton";
import SuccessMessage from "./SuccessMessage";
import SimilarAdverts from "./SimiliarAdverts";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAdvert } from "@/hooks/GET/useGetAdvert";
import { usePostFavoriteAdvert } from "@/hooks/POST/usePostFavoriteAdvert";
import {
  formatBrandModel,
  engineCapacityFormat,
  capitalizeWords,
  carTypeMap,
} from "@/app/utils/helpers";

export default function AdvertInfos() {
  const params = useParams();
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      router.replace("/admin/login");
      return;
    }
    setToken(currentToken);
  }, [router]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [summaryText, setSummaryText] = useState(null);
  const [isShowingSummary, setIsShowingSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSimilarAdverts, setShowSimilarAdverts] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const {
    data: getAdvertData,
    isLoading: getAdvertIsLoading,
    isError: getAdvertIsError,
    error: getAdvertError,
  } = useGetAdvert(token, params.advertId);

  const { mutateAsync: postFavorite } = usePostFavoriteAdvert();

  const advert = Array.isArray(getAdvertData?.result)
    ? getAdvertData.result[0]
    : getAdvertData?.result;

  useCheckAuth();

  useEffect(() => {
    if (advert && advert.isFavorite !== undefined) {
      setIsFavorite(advert.isFavorite);
    }
  }, [advert]);

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
        router.replace("/hesabim/garajim");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [router, isSuccess]);

  async function handleToggleSummary() {
    if (isShowingSummary) {
      setIsShowingSummary(false);
      return;
    }

    if (summaryText) {
      setIsShowingSummary(true);
      return;
    }

    try {
      setIsSummarizing(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FAST_API_URL}/description-summarization`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description: advert?.description }),
        },
      );

      if (!response.ok) throw new Error("Özet çıkarılamadı.");

      const data = await response.json();
      setSummaryText(data.summarizated_description);
      setIsShowingSummary(true);
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsSummarizing(false);
    }
  }

  async function toggleFavoriteClick() {
    if (!advert || !advert.id || !token) return;

    const previousFavoriteState = isFavorite;
    setIsFavorite(!previousFavoriteState);

    try {
      const data = await postFavorite({ token, advertId: advert.id });

      if (data && data.isFavorite !== undefined) {
        setIsFavorite(data.isFavorite);
        dispatch(
          toggleFavorite({
            advert: advert,
            isFavorite: data.isFavorite,
          }),
        );
      }
    } catch (err) {
      setIsFavorite(previousFavoriteState);
      console.error(err);
    }
  }

  function advertBuyHandler() {
    router.push(
      `/ilan/${params["brand-model-modelYear"]}/${params.advertId}/randevu`,
    );
  }

  // Yardımcı fonksiyonlar artık helper.js dosyasından geliyor.

  const advertDetails = advert
    ? [
        {
          id: 1,
          label: "Fiyat",
          value: `${advert.price?.toLocaleString("tr-TR") || 0} ₺`,
          priceClassName: classes.price,
        },
        { id: 2, label: "Şehir", value: capitalizeWords(advert.city) },
        {
          id: 3,
          label: "İlan No",
          value: advert.id,
          spanClassName: classes.advertNo,
        },
        {
          id: 4,
          label: "İlan Tarihi",
          value: advert.created_at
            ? new Date(advert.created_at).toLocaleDateString("tr-TR")
            : "",
        },
        { id: 5, label: "Marka", value: formatBrandModel(advert.brand) },
        { id: 6, label: "Seri", value: formatBrandModel(advert.model) },
        {
          id: 7,
          label: "Model",
          value: `${formatBrandModel(advert.model)} ${capitalizeWords(
            advert.body_type,
          )} ${engineCapacityFormat(advert.engine_capacity)}`,
        },
        { id: 8, label: "Yıl", value: advert.model_year },
        {
          id: 9,
          label: "Yakıt Tipi",
          value: carTypeMap.fuelTypeMap[advert.fuel_type] || "",
        },
        {
          id: 10,
          label: "Vites Tipi",
          value: carTypeMap.transmissionTypeMap[advert.transmission] || "",
        },
        { id: 11, label: "Araç Durumu", value: "İkinci El" },
        {
          id: 12,
          label: "Kilometre",
          value: advert.kilometer?.toLocaleString("tr-TR") || 0,
        },
        {
          id: 13,
          label: "Kasa Tipi",
          value: capitalizeWords(advert.body_type),
        },
        { id: 14, label: "Motor Gücü", value: `${advert.horsepower} hp` },
        {
          id: 15,
          label: "Motor Hacmi",
          value: engineCapacityFormat(advert.engine_capacity),
        },
        {
          id: 16,
          label: "Hasar Durumu",
          value: "Yok",
        },
      ]
    : [];

  const advertImages =
    advert && advert.images && advert.images.length > 0
      ? advert.images.map((img) => img.image_data || "/images/no-image.png")
      : ["/images/no-image.png"];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) =>
      prev === advertImages.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) =>
      prev === 0 ? advertImages.length - 1 : prev - 1,
    );
  };

  if (!token || getAdvertIsLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
  }

  if (getAdvertIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getAdvertError?.message || "Sunucu hatası oluştu."}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  if (!advert) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>İlan Bulunamadı</h2>
        <p>Aradığınız ilan yayından kaldırılmış veya bulunamıyor.</p>
        <button
          onClick={() => router.push("/hesabim/garajim")}
          className="backButton"
        >
          <ArrowLeft size={20} /> Garajıma Dön
        </button>
      </div>
    );
  }

  return (
    <div className={classes.advertDiv}>
      {!isSuccess ? (
        <div className={classes.advertInfoDiv}>
          <div className={classes.titleFavoriteDiv}>
            <h2 className={classes.title}>{advert.title?.toUpperCase()}</h2>
            {user && advert && Number(user.id) !== Number(advert.user_id) && (
              <button
                className={
                  isFavorite ? classes.favoriteButton : classes.defaultButton
                }
                type="button"
                onClick={toggleFavoriteClick}
              >
                {isFavorite ? "Favorilerimden Çıkar" : "Favorilerime Ekle"}
              </button>
            )}
          </div>

          <div className={classes.advertInfoWrapper1}>
            <div className={classes.imgDiv}>
              <div
                className={classes.sliderTrack}
                style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
              >
                {advertImages.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    className={classes.img}
                    src={imgUrl}
                    alt={`${advert.title} - ${idx + 1}`}
                  />
                ))}
              </div>

              {advertImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`${classes.sliderBtn} ${classes.prevBtn}`}
                    onClick={prevImage}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    type="button"
                    className={`${classes.sliderBtn} ${classes.nextBtn}`}
                    onClick={nextImage}
                  >
                    <ChevronRight size={24} />
                  </button>

                  <div className={classes.sliderDots}>
                    {advertImages.map((_, idx) => (
                      <span
                        key={idx}
                        className={`${classes.dot} ${idx === currentImgIndex ? classes.activeDot : ""}`}
                        onClick={() => setCurrentImgIndex(idx)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className={classes.advertInfoWrapper2}>
              <ul
                className={`${classes.ul} ${user && advert && Number(user.id) == Number(advert.user_id) ? classes.expandedUl : ""}`}
              >
                {advertDetails.map((detail) => (
                  <li
                    key={detail.id}
                    className={`${classes.li} ${detail.priceClassName || ""}`}
                  >
                    <strong className={classes.strong}>{detail.label}</strong>
                    <span className={detail.spanClassName || ""}>
                      {detail.value}
                    </span>
                  </li>
                ))}
              </ul>
              {user && advert && Number(user.id) !== Number(advert.user_id) && (
                <div className={classes.buyButtonContainer}>
                  <PrimaryButton
                    type="button"
                    text="Bu Aracı Satın Al"
                    className={classes.buyButton}
                    onClick={advertBuyHandler}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={classes.descriptionContainer}>
            <div
              onClick={() => setShowDescription((prevValue) => !prevValue)}
              className={`${classes.descriptionTextDiv} ${
                showDescription
                  ? classes.semiBorderRadius
                  : classes.fullBorderRadius
              }`}
            >
              Açıklama
            </div>
            {showDescription && (
              <div className={classes.descriptionDiv}>
                <div className={classes.summaryButtonDiv}>
                  <button
                    onClick={handleToggleSummary}
                    disabled={isSummarizing}
                    className={classes.aiSummaryBtn}
                  >
                    {isSummarizing
                      ? "✨ Özet Çıkarılıyor..."
                      : isShowingSummary
                        ? "Orijinal Açıklamayı Göster"
                        : "✨ Yapay Zekâ ile Özetle"}
                  </button>
                </div>
                <div className={classes.descriptionWrapper}>
                  <p className={classes.description}>
                    {isShowingSummary ? summaryText : advert.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className={classes.similarAdvertsContainer}>
            <button
              type="button"
              className={classes.toggleSimilarBtn}
              onClick={() => setShowSimilarAdverts((prev) => !prev)}
            >
              {showSimilarAdverts
                ? "Benzer Araçları Gizle"
                : "Yapay Zekâ Önerisi Benzer Araçları Gör ✨"}
            </button>

            <AnimatePresence>
              {showSimilarAdverts && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ width: "100%", overflow: "hidden" }}
                >
                  <SimilarAdverts currentAdvertId={advert.id} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <SuccessMessage
          key="success-message"
          onClick={() => {
            setIsSuccess(false);
            router.replace("/hesabim/garajim");
          }}
          title="Hayırlı Olsun! 🎉"
          text="Araç başarıyla satın alındı. İşlem detaylarına garajınızdan ulaşabilirsiniz."
          buttonText="Garajıma Git"
          className={classes.successMessage}
        />
      )}
    </div>
  );
}
