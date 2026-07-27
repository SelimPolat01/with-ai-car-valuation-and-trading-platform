"use client";

import { useEffect, useState } from "react";
import { toggleFavorite } from "@/store/advertsSlice";
import { useParams, useRouter } from "next/navigation";
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
  bodyTypeParser,
  formatPrice,
} from "@/app/utils/helpers";
import Loading from "./Loading";

export default function AdvertInfos() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [token, setToken] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [summaryText, setSummaryText] = useState(null);
  const [isShowingSummary, setIsShowingSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSimilarAdverts, setShowSimilarAdverts] = useState(false);
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      setToken(currentToken);
    }
    setIsTokenLoaded(true);
  }, []);

  const {
    data: getAdvertData,
    isLoading: getAdvertIsLoading,
    isError: getAdvertIsError,
    error: getAdvertError,
  } = useGetAdvert(token, params.advertId, isTokenLoaded);

  const { mutateAsync: postFavorite } = usePostFavoriteAdvert();

  const advert = Array.isArray(getAdvertData?.result)
    ? getAdvertData.result[0]
    : getAdvertData?.result;

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: advert?.description }),
        },
      );

      if (!response.ok) throw new Error("Özet çıkarılamadı.");

      const data = await response.json();
      setSummaryText(data.summarizated_description);
      setIsShowingSummary(true);
    } catch (err) {
      console.error(err.message);
      alert("Özet çıkarılırken bir hata oluştu.");
    } finally {
      setIsSummarizing(false);
    }
  }

  async function toggleFavoriteClick() {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!advert || !advert.id) return;

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
    if (!token) {
      router.push("/login");
      return;
    }
    router.push(
      `/ilan/${params["brand-model-modelYear"]}/${params.advertId}/randevu`,
    );
  }

  if (!isTokenLoaded || getAdvertIsLoading) {
    return <Loading />;
  }

  if (getAdvertIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getAdvertError?.message || "Sunucu kaynaklı bir hata oluştu."}</p>
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
        <p>Aradığınız ilan yayından kaldırılmış veya sistemde mevcut değil.</p>
        <button onClick={() => router.push("/")} className="backButton">
          <ArrowLeft size={20} /> Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const advertDetails = [
    {
      id: 1,
      label: "Fiyat",
      value: `${formatPrice(advert.price)} ₺`,
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
      value: `${engineCapacityFormat(advert.engine_capacity)} ${carTypeMap.trimLevelMap[advert.trim_level] || ""}`,
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
    { id: 13, label: "Kasa Tipi", value: bodyTypeParser(advert.body_type) },
    { id: 14, label: "Motor Gücü", value: `${advert.horsepower} hp` },
    {
      id: 15,
      label: "Motor Hacmi",
      value: engineCapacityFormat(advert.engine_capacity),
    },
    { id: 16, label: "Hasar Durumu", value: advert.has_dent ? "Var" : "Yok" },
    {
      id: 17,
      label: "Çizik Durumu",
      value: advert.has_scratch ? "Var" : "Yok",
    },
  ];

  const advertImages =
    advert.images && advert.images.length > 0
      ? advert.images.map(
          (img) => img.image_data || img.image_url || "/images/no-image.png",
        )
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

  return (
    <motion.div
      className={classes.advertDiv}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="advert-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={classes.advertInfoDiv}
          >
            <div className={classes.titleFavoriteDiv}>
              <h2 className={classes.title}>{advert.title?.toUpperCase()}</h2>
              {(!user || Number(user.id) !== Number(advert.user_id)) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className={
                    isFavorite ? classes.favoriteButton : classes.defaultButton
                  }
                  type="button"
                  onClick={toggleFavoriteClick}
                >
                  {isFavorite ? "Favorilerimden Çıkar" : "Favorilerime Ekle"}
                </motion.button>
              )}
            </div>

            <div className={classes.advertInfoWrapper1}>
              <div className={classes.imgDiv}>
                <div
                  className={classes.sliderTrack}
                  style={{
                    transform: `translateX(-${currentImgIndex * 100}%)`,
                  }}
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
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className={`${classes.sliderBtn} ${classes.prevBtn}`}
                      onClick={prevImage}
                    >
                      <ChevronLeft size={24} />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className={`${classes.sliderBtn} ${classes.nextBtn}`}
                      onClick={nextImage}
                    >
                      <ChevronRight size={24} />
                    </motion.button>
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
                <ul className={classes.ul}>
                  {advertDetails.map((detail) => (
                    <li
                      key={detail.id}
                      className={`${classes.li} ${detail.priceClassName || ""} ${user && advert && Number(user.id) === Number(advert.user_id) ? classes.expandedLi : classes.expandlessLi}`}
                    >
                      <strong className={classes.strong}>{detail.label}</strong>
                      <span className={detail.spanClassName || ""}>
                        {detail.value}
                      </span>
                    </li>
                  ))}
                </ul>

                {(!user || Number(user.id) !== Number(advert.user_id)) && (
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
                onClick={() => setShowDescription((prev) => !prev)}
                className={`${classes.descriptionTextDiv} ${showDescription ? classes.semiBorderRadius : classes.fullBorderRadius}`}
              >
                Açıklama
              </div>
              <AnimatePresence>
                {showDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={classes.descriptionDiv}
                    style={{ overflow: "hidden" }}
                  >
                    <div className={classes.summaryButtonDiv}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggleSummary}
                        disabled={isSummarizing}
                        className={classes.aiSummaryBtn}
                      >
                        {isSummarizing
                          ? "✨ Özet Çıkarılıyor..."
                          : isShowingSummary
                            ? "Orijinal Açıklamayı Göster"
                            : "✨ Yapay Zekâ ile Özetle"}
                      </motion.button>
                    </div>
                    <div className={classes.descriptionWrapper}>
                      <p className={classes.description}>
                        {isShowingSummary ? summaryText : advert.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={classes.similarAdvertsContainer}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className={classes.toggleSimilarBtn}
                onClick={() => setShowSimilarAdverts((prev) => !prev)}
              >
                {showSimilarAdverts
                  ? "Benzer Araçları Gizle"
                  : "Yapay Zekâ Önerisi Benzer Araçları Gör ✨"}
              </motion.button>
              <AnimatePresence>
                {showSimilarAdverts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    style={{ width: "100%", overflow: "hidden" }}
                  >
                    <SimilarAdverts currentAdvertId={advert.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <SuccessMessage
              onClick={() => {
                setIsSuccess(false);
                router.replace("/hesabim/garajim");
              }}
              title="Hayırlı Olsun! 🎉"
              text="Araç başarıyla satın alındı. İşlem detaylarına garajınızdan ulaşabilirsiniz."
              buttonText="Garajıma Git"
              className={classes.successMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
