"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import classes from "./AdvertInfos.module.css";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  MousePointerClick,
} from "lucide-react";
import SuccessMessage from "./SuccessMessage";
import SimilarAdverts from "./SimiliarAdverts";
import { motion, AnimatePresence } from "framer-motion";
import { useGetAdvert } from "@/hooks/GET/useGetAdvert";
import { usePostFavoriteAdvert } from "@/hooks/POST/usePostFavoriteAdvert";
import { useGetCheckFavoriteAdvert } from "@/hooks/GET/useGetCheckFavoriteAdvert";
import { useGetAdvertView } from "@/hooks/GET/useGetAdvertView";
import {
  formatBrandModel,
  engineCapacityFormat,
  carTypeMap,
  bodyTypeParser,
  formatPrice,
} from "@/app/utils/helpers";
import Loading from "./Loading";
import SecondaryButton from "./SecondaryButton";
import useGetAdvertFavoriteCount from "@/hooks/GET/useGetAdvertFavoriteCount";
import { useQueryClient } from "@tanstack/react-query";

export default function AdvertInfos() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useSelector((state) => state.auth.user);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [summaryText, setSummaryText] = useState(null);
  const [isShowingSummary, setIsShowingSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSimilarAdverts, setShowSimilarAdverts] = useState(false);

  const {
    data: getAdvertData,
    isLoading: getAdvertIsLoading,
    isError: getAdvertIsError,
    error: getAdvertError,
  } = useGetAdvert(params.advertId);

  if (getAdvertIsError) {
    throw getAdvertError;
  }

  const advert = Array.isArray(getAdvertData?.result)
    ? getAdvertData.result[0]
    : getAdvertData?.result;

  const { data: checkFavoriteData, isLoading: checkFavoriteIsLoading } =
    useGetCheckFavoriteAdvert(user ? advert?.id : null);

  const {
    data: getAdvertFavoriteCountData,
    isLoading: favoriteCountIsLoading,
  } = useGetAdvertFavoriteCount(advert?.id);

  const { data: advertViewData, isLoading: advertViewIsLoading } =
    useGetAdvertView(advert?.id);

  const {
    mutate: postFavorite,
    isPending: isFavoritePending,
    isError: postFavoriteIsError,
    error: postFavoriteError,
  } = usePostFavoriteAdvert(user);

  const isFavorite =
    checkFavoriteData?.result?.isFavorite ??
    checkFavoriteData?.isFavorite ??
    false;

  const favoriteCount =
    getAdvertFavoriteCountData?.result?.count ??
    getAdvertFavoriteCountData?.count ??
    0;

  const viewCount =
    advertViewData?.result?.viewCount ?? advertViewData?.viewCount ?? 0;

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
          body: JSON.stringify({ description: advert?.description || "" }),
        },
      );

      if (!response.ok) throw new Error("Özet çıkarılamadı.");

      const data = await response.json();
      setSummaryText(data.summarizated_description);
      setIsShowingSummary(true);
    } catch (err) {
      alert("Özet çıkarılırken bir hata oluştu.");
    } finally {
      setIsSummarizing(false);
    }
  }

  function toggleFavoriteClick() {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!advert || !advert.id) return;

    postFavorite(
      { advertId: advert.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["checkFavorite", advert.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["advertFavoriteCount", advert.id],
          });
        },
      },
    );
  }

  function advertBuyHandler() {
    if (!user) {
      router.replace("/login");
      return;
    }

    router.push(
      `/ilan/${params["brand-model-modelYear"]}/${params.advertId}/randevu`,
    );
  }

  if (
    getAdvertIsLoading ||
    (user && checkFavoriteIsLoading) ||
    favoriteCountIsLoading ||
    (advert && advertViewIsLoading)
  ) {
    return <Loading />;
  }

  if (!advert) {
    notFound();
  }

  const advertDetails = [
    {
      id: 1,
      label: "Fiyat",
      value: `${formatPrice(advert.price)} ₺`,
      priceClassName: classes.price,
    },
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
      value: `${engineCapacityFormat(advert.engine_capacity)} ${
        carTypeMap.trimLevelMap[advert.trim_level] || ""
      }`,
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
      layout
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
              <h2 className={classes.title}>
                {advert.title?.toLocaleUpperCase("tr-TR")}
              </h2>

              <div className={classes.actionButtonContainer}>
                <div className={classes.actionButtonsWrapper}>
                  {(!user || Number(user.id) !== Number(advert?.user_id)) && (
                    <motion.button
                      whileHover={{ scale: 1 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isFavoritePending}
                      className={
                        isFavorite
                          ? classes.favoriteButton
                          : classes.defaultButton
                      }
                      type="button"
                      onClick={toggleFavoriteClick}
                    >
                      {isFavoritePending
                        ? "İşleniyor..."
                        : isFavorite
                          ? "Favorilerimden Çıkar"
                          : "Favorilerime Ekle"}
                    </motion.button>
                  )}

                  <motion.div className={classes.favoriteCountBadge}>
                    <MousePointerClick
                      className={classes.clickIcon}
                      size={20}
                    />
                    <span className={classes.favoriteCountText}>
                      {viewCount}
                    </span>
                  </motion.div>

                  <motion.div className={classes.favoriteCountBadge}>
                    <Heart
                      className={`${classes.favoriteIcon} ${
                        isFavorite ? classes.favoriteIconActive : ""
                      }`}
                      size={20}
                    />
                    <span className={classes.favoriteCountText}>
                      {favoriteCount}
                    </span>
                  </motion.div>
                </div>
                {postFavoriteIsError && (
                  <div
                    style={{
                      color: "red",
                      fontSize: "12px",
                      marginTop: "5px",
                      textAlign: "right",
                    }}
                  >
                    {postFavoriteError?.message ||
                      "Favori işlemi başarısız oldu."}
                  </div>
                )}
              </div>
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
                      type="button"
                      className={`${classes.sliderBtn} ${classes.prevBtn}`}
                      onClick={prevImage}
                    >
                      <ChevronLeft size={24} />
                    </motion.button>
                    <motion.button
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
                          className={`${classes.dot} ${
                            idx === currentImgIndex ? classes.activeDot : ""
                          }`}
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
                      className={`${classes.li} ${
                        detail.priceClassName || ""
                      } ${
                        user &&
                        advert &&
                        Number(user.id) === Number(advert.user_id)
                          ? classes.expandedLi
                          : classes.expandlessLi
                      }`}
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
                    <SecondaryButton
                      className={classes.buyButton}
                      onClick={advertBuyHandler}
                      text="Bu Aracı Satın Al"
                      type="button"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className={classes.descriptionContainer}>
              <div
                onClick={() => setShowDescription((prev) => !prev)}
                className={`${classes.descriptionTextDiv} ${
                  showDescription
                    ? classes.semiBorderRadius
                    : classes.fullBorderRadius
                }`}
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
