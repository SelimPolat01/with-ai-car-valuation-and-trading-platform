"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./HasarDurumu.module.css";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { AlertTriangle } from "lucide-react";
import { setPrediction } from "@/store/predictionSlice";
import { useDispatch, useSelector } from "react-redux";
import { usePostCarScratchDentDection } from "@/hooks/POST/usePostCarScratchDentDetection";
import { usePostCarDirectionDetection } from "@/hooks/POST/usePostCarDirectionDetection";
import { usePostCarSellTimePredict } from "@/hooks/POST/usePostCarSellTimePredict";
import { generateDamageText, viewsList } from "@/app/utils/helpers";
import {
  hasarDurumuCardVariants,
  hasarDurumuContainerVariants,
  innerStateVariants,
} from "@/app/utils/animations";

export default function HasarDurumu() {
  const router = useRouter();
  const dispatch = useDispatch();
  const prediction = useSelector((state) => state.prediction.prediction);
  const dialogRef = useRef();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [images, setImages] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [imagePredictions, setImagePredictions] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [damagePredictions, setDamagePredictions] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [avarageSellPrediction, setAvarageSellPrediction] = useState(null);
  const [cardErrors, setCardErrors] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });

  const sideLabelsTr = { front: "ön", back: "arka", left: "sol", right: "sağ" };

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
    }
  }, [router]);

  const {
    mutate: carDirectionDetectionMutate,
    isPending: carDirectionDetectionIsPending,
    isError: carDirectionDetectionIsError,
    error: carDirectionDetectionError,
  } = usePostCarDirectionDetection();

  const {
    mutate: carScratchDentDetectionMutate,
    isPending: carScratchDentDetectionIsPending,
    isError: carScratchDentDetectionIsError,
    error: carScratchDentDetectionError,
  } = usePostCarScratchDentDection();

  const {
    mutate: carSellTimePredictMutate,
    isPending: carSellTimePredictIsPending,
    isError: carSellTimePredictIsError,
    error: carSellTimePredictError,
  } = usePostCarSellTimePredict();

  const isAnyPending =
    carDirectionDetectionIsPending ||
    carScratchDentDetectionIsPending ||
    carSellTimePredictIsPending;

  const isAllImagesUploaded =
    images.front && images.back && images.right && images.left;

  const calculateFinalPriceAndShowDialog = (currentDamages) => {
    let scratchCount = 0;
    let dentCount = 0;

    const hasDamage = Object.values(currentDamages).some((damage) => {
      if (!damage) return false;
      const val = String(damage).trim().toLowerCase();
      if (val.includes("scratch")) scratchCount++;
      if (val.includes("dent")) dentCount++;
      return val !== "clean";
    });

    if (hasDamage && dialogRef.current && !dialogRef.current.open) {
      const PERCENT_PER_SCRATCH = 0.02;
      const PERCENT_PER_DENT = 0.05;
      const totalLossPercentage =
        scratchCount * PERCENT_PER_SCRATCH + dentCount * PERCENT_PER_DENT;

      const priceLoss = prediction.price * totalLossPercentage;
      const finalPrice = prediction.price - priceLoss;

      dispatch(setPrediction({ ...prediction, price: Math.round(finalPrice) }));
      dialogRef.current.showModal();
    }
  };

  const handleImageChange = async (side, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    carDirectionDetectionMutate(
      { token, body: formData },
      {
        onSuccess: (carDirectionDetectionData) => {
          if (carDirectionDetectionData.result?.prediction !== side) {
            setCardErrors((prev) => ({
              ...prev,
              [side]: `⚠️ Lütfen ${sideLabelsTr[side]} açıdan çekilmiş görüntü yükleyiniz.`,
            }));
            setImages((prev) => ({ ...prev, [side]: null }));
            setImagePredictions((prev) => ({ ...prev, [side]: null }));
            event.target.value = "";
            return;
          }

          if (carDirectionDetectionData.result?.prediction_percent >= 96) {
            setImages((prev) => ({
              ...prev,
              [side]: URL.createObjectURL(file),
            }));
            setCardErrors((prev) => ({ ...prev, [side]: null }));

            setImagePredictions((prev) => ({
              ...prev,
              [side]: {
                label: carDirectionDetectionData.result?.prediction,
                percent: carDirectionDetectionData.result?.prediction_percent,
              },
            }));

            carScratchDentDetectionMutate(
              { token, body: formData },
              {
                onSuccess: (carScratchDentDetectionData) => {
                  const updatedDamages = {
                    ...damagePredictions,
                    [side]: carScratchDentDetectionData.result?.prediction,
                  };

                  setDamagePredictions(updatedDamages);

                  const isScratch = Object.values(updatedDamages).some(
                    (damage) =>
                      damage && damage.toLowerCase().includes("scratch"),
                  );
                  const isDent = Object.values(updatedDamages).some(
                    (damage) => damage && damage.toLowerCase().includes("dent"),
                  );

                  const updatedPrediction = {
                    ...prediction,
                    has_scratch: isScratch,
                    has_dent: isDent,
                    hasScratch: isScratch,
                    hasDent: isDent,
                  };

                  dispatch(setPrediction(updatedPrediction));

                  const currentImages = { ...images, [side]: true };
                  const isAllImagesUploadedNow =
                    currentImages.front &&
                    currentImages.back &&
                    currentImages.right &&
                    currentImages.left;

                  if (isAllImagesUploadedNow) {
                    const payload = {
                      brand: prediction.brand,
                      model: prediction.model,
                      model_year: Number(prediction.modelYear),
                      body_type: prediction.bodyType,
                      engine_capacity: Number(prediction.engineCapacity),
                      horsepower: Number(prediction.horsepower),
                      transmission: prediction.transmission,
                      kilometer: Number(prediction.kilometer),
                      fuel_type: prediction.fuelType,
                      trim_level: prediction.trimLevel,
                      price: Number(prediction.price),
                      has_scratch: isScratch,
                      has_dent: isDent,
                    };

                    carSellTimePredictMutate(
                      { token, body: payload },
                      {
                        onSuccess: (carSellPredictData) => {
                          setAvarageSellPrediction(
                            carSellPredictData.result?.predicted_days_to_sell,
                          );
                          dispatch(
                            setPrediction({
                              ...updatedPrediction,
                              daysToSell:
                                carSellPredictData.result
                                  ?.predicted_days_to_sell,
                            }),
                          );
                          calculateFinalPriceAndShowDialog(updatedDamages);
                        },
                        onError: () => {
                          setError(
                            "Tüm fotoğraflar eklendi ancak araç bilgileri eksik olduğu için satış süresi hesaplanamadı.",
                          );
                          setAvarageSellPrediction(null);
                          calculateFinalPriceAndShowDialog(updatedDamages);
                        },
                      },
                    );
                  }
                },
                onError: () => {
                  setCardErrors((prev) => ({
                    ...prev,
                    [side]: "⚠️ Hasar API'si çalışmadı.",
                  }));
                  setImages((prev) => ({ ...prev, [side]: null }));
                  setImagePredictions((prev) => ({ ...prev, [side]: null }));
                },
              },
            );
          } else {
            setCardErrors((prev) => ({
              ...prev,
              [side]:
                "⚠️ Doğru bir ekspertiz raporu için aracın tam karşısına geçip, kamerayı dik tutarak tekrar çekim yapıp yükleyiniz.",
            }));
            setImages((prev) => ({ ...prev, [side]: null }));
            setImagePredictions((prev) => ({ ...prev, [side]: null }));
            event.target.value = "";
          }
        },
        onError: (err) => {
          setError(`Yön API Hatası: ${err.message}`);
        },
      },
    );
  };

  const handleRemoveImage = (side, event) => {
    event.preventDefault();
    setImages((prev) => ({ ...prev, [side]: null }));
    setImagePredictions((prev) => ({ ...prev, [side]: null }));
    setCardErrors((prev) => ({ ...prev, [side]: null }));
    setDamagePredictions((prev) => ({ ...prev, [side]: null }));
    setAvarageSellPrediction(null);
  };

  function dialogConfirmHandler() {
    dialogRef.current.close();
  }

  const views = viewsList;

  return (
    <div className={classes.container}>
      <ConfirmDialog
        ref={dialogRef}
        onConfirm={dialogConfirmHandler}
        cancelRedirect="/"
        title="Hasar Tespiti"
        text={generateDamageText(damagePredictions)}
        cancelButtonText="Ana Sayfaya Git"
        logo={<AlertTriangle size={35} color="#ef4444" />}
      />

      {(error ||
        carDirectionDetectionIsError ||
        carScratchDentDetectionIsError ||
        carSellTimePredictIsError) && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            textAlign: "center",
            fontWeight: "600",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          {error && <span>⚠️ {error}</span>}
          {carDirectionDetectionIsError && (
            <span>
              ⚠️ Yön Tespiti Hatası: {carDirectionDetectionError?.message}
            </span>
          )}
          {carScratchDentDetectionIsError && (
            <span>
              ⚠️ Hasar Tespiti Hatası: {carScratchDentDetectionError?.message}
            </span>
          )}
          {carSellTimePredictIsError && (
            <span>
              ⚠️ Satış Tahmin Hatası: {carSellTimePredictError?.message}
            </span>
          )}
        </div>
      )}

      <AnimatePresence>
        {isAllImagesUploaded && avarageSellPrediction && (
          <motion.div
            className={classes.sellTimeBubble}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <span className={classes.bubbleTitle}>Tahmini Satış Süresi</span>
            <span className={classes.bubbleValue}>{avarageSellPrediction}</span>
            <span className={classes.bubbleSubtitle}>GÜN</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={classes.grid}
        variants={hasarDurumuContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {views.map((view) => (
          <motion.div
            key={view.id}
            className={classes.card}
            variants={hasarDurumuCardVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <AnimatePresence mode="wait">
              {images[view.id] ? (
                <motion.label
                  key="image"
                  htmlFor={`file-upload-${view.id}`}
                  variants={innerStateVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    cursor: isAnyPending ? "not-allowed" : "pointer",
                    display: "block",
                  }}
                >
                  <img
                    src={images[view.id]}
                    className={classes.imagePreview}
                    alt="Araç"
                  />
                  <button
                    type="button"
                    className={classes.removeBtn}
                    onClick={(e) => handleRemoveImage(view.id, e)}
                    disabled={isAnyPending}
                  >
                    ✕
                  </button>
                </motion.label>
              ) : cardErrors[view.id] ? (
                <motion.label
                  key="error"
                  htmlFor={`file-upload-${view.id}`}
                  variants={innerStateVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    width: "100%",
                    height: "100%",
                    cursor: isAnyPending ? "not-allowed" : "pointer",
                    display: "block",
                  }}
                >
                  <div className={classes.overlayMask}>
                    <div className={classes.targetCross}>+</div>
                    <p className={classes.overlayMessage}>
                      {cardErrors[view.id]}
                    </p>
                    <span className={classes.clickToTry}>
                      Yeniden denemek için tıklayın
                    </span>
                  </div>
                </motion.label>
              ) : (
                <motion.label
                  key="empty"
                  htmlFor={`file-upload-${view.id}`}
                  variants={innerStateVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isAnyPending ? "not-allowed" : "pointer",
                  }}
                >
                  <img
                    src={view.icon}
                    className={classes.icon}
                    alt={view.label}
                  />
                  <span className={classes.label}>{view.label}</span>
                </motion.label>
              )}
            </AnimatePresence>
            <input
              id={`file-upload-${view.id}`}
              type="file"
              className={classes.fileInput}
              accept="image/*"
              onChange={(e) => handleImageChange(view.id, e)}
              disabled={isAnyPending}
            />
          </motion.div>
        ))}

        <AnimatePresence>
          {isAllImagesUploaded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <PrimaryButton
                type="submit"
                text="Fiyat Teklifi Al"
                onClick={() => router.push("fiyat-teklifi")}
                disabled={isAnyPending}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
