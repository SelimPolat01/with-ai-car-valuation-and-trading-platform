"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HasarDurumu.module.css";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AnimatePresence, motion } from "framer-motion";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { AlertTriangle } from "lucide-react";
import { setPrediction } from "@/store/predictionSlice";
import { useDispatch, useSelector } from "react-redux";

export default function HasarDurumu() {
  const router = useRouter();
  const dispatch = useDispatch();
  const prediction = useSelector((state) => state.prediction.prediction);
  const dialogRef = useRef();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const sideLabelsTr = {
    front: "ön",
    back: "arka",
    left: "sol",
    right: "sağ",
  };

  const isAllImagesUploaded =
    images.front && images.back && images.right && images.left;

  useEffect(() => {
    let scratchCount = 0;
    let dentCount = 0;
    const hasDamage = Object.values(damagePredictions).some((damage) => {
      if (!damage) return false;
      const val = String(damage).trim().toLowerCase();
      if (val.includes("scratch")) scratchCount++;
      if (val.includes("dent")) dentCount++;
      return val !== "clean";
    });

    if (
      isAllImagesUploaded &&
      hasDamage &&
      dialogRef.current &&
      !dialogRef.current.open
    ) {
      const PERCENT_PER_SCRATCH = 0.02;
      const PERCENT_PER_DENT = 0.05;
      const totalLossPercentage =
        scratchCount * PERCENT_PER_SCRATCH + dentCount * PERCENT_PER_DENT;
      const priceLoss = prediction.price * totalLossPercentage;
      const finalPrice = prediction.price - priceLoss;
      dispatch(setPrediction({ ...prediction, price: Math.round(finalPrice) }));
      dialogRef.current.showModal();
    }
  }, [images, damagePredictions, dispatch, isAllImagesUploaded]);

  const handleImageChange = async (side, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/car-direction-detection-upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        setError(`Yön API Hatası: ${errorData.message}`);
        return;
      }
      const data = await response.json();

      if (data.prediction != side) {
        setCardErrors((prev) => ({
          ...prev,
          [side]: `⚠️ Lütfen ${sideLabelsTr[side]} açıdan çekilmiş görüntü yükleyiniz.`,
        }));
        setImages((prev) => ({ ...prev, [side]: null }));
        setImagePredictions((prev) => ({ ...prev, [side]: null }));
        event.target.value = "";
        return;
      } else if (data.prediction_percent >= 80) {
        setImages((prev) => ({ ...prev, [side]: URL.createObjectURL(file) }));
        setCardErrors((prev) => ({ ...prev, [side]: null }));

        const damageResponse = await fetch(
          `${process.env.NEXT_PUBLIC_FASTAPI_URL}/car-scratch-dent-detection-upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!damageResponse.ok) {
          const errorData = await damageResponse.json();
          setCardErrors((prev) => ({
            ...prev,
            [side]: "⚠️ Hasar API'si çalışmadı.",
          }));
          setImages((prev) => ({ ...prev, [side]: null }));
          setImagePredictions((prev) => ({ ...prev, [side]: null }));
          return;
        }

        const damageData = await damageResponse.json();
        const updatedDamages = {
          ...damagePredictions,
          [side]: damageData.prediction,
        };
        setDamagePredictions(updatedDamages);

        const isScratch = Object.values(updatedDamages).some(
          (damage) => damage && damage.toLowerCase().includes("scratch"),
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
          has_scratch: prediction.hasScratch,
          has_dent: prediction.hasDent,
        };
        const currentImages = { ...images, [side]: true };
        const isAllImagesUploadedNow =
          currentImages.front &&
          currentImages.back &&
          currentImages.right &&
          currentImages.left;

        if (isAllImagesUploadedNow) {
          const averageSellResponse = await fetch(
            `${process.env.NEXT_PUBLIC_FASTAPI_URL}/predict-sell-time`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            },
          );

          if (!averageSellResponse.ok) {
            const averageSellErrorData = await averageSellResponse.json();
            console.log("Satış Süresi API Hatası:", averageSellErrorData);
            setError(
              "Tüm fotoğraflar eklendi ancak araç bilgileri eksik olduğu için satış süresi hesaplanamadı.",
            );
            setAvarageSellPrediction(null);
          } else {
            const averageData = await averageSellResponse.json();
            setAvarageSellPrediction(averageData.predicted_days_to_sell);
            dispatch(
              setPrediction({
                ...prediction,
                daysToSell: averageData.predicted_days_to_sell,
              }),
            );
          }
        }
      } else {
        setCardErrors((prev) => ({
          ...prev,
          [side]:
            "⚠️ Doğru bir ekspertiz raporu için aracın tam karşısına geçip, kamerayı dik tutarak tekrar çekim yapıp yükleyiniz.",
        }));
        setImages((prev) => ({ ...prev, [side]: null }));
        setImagePredictions((prev) => ({ ...prev, [side]: null }));

        event.target.value = "";
        return;
      }

      setImagePredictions((prev) => ({
        ...prev,
        [side]: {
          label: data.prediction,
          percent: data.prediction_percent,
        },
      }));
    } catch (err) {
      setError(`Sistem Hatası: ${err.message}`);
    } finally {
      setLoading(false);
      event.target.value = "";
    }
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

  const views = [
    {
      id: "front",
      label: "Ön",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'/%3E%3C/svg%3E",
    },
    {
      id: "back",
      label: "Arka",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM5 11l1.5-4.5h11L19 11H5zm0 2.5h3v2H5v-2zm11 0h3v2h-3v-2zm-6.5 1h5v1.5h-5v-1.5z'/%3E%3C/svg%3E",
    },
    {
      id: "right",
      label: "Sağ Yan",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='%23a0aec0'%3E%3Cg transform='translate(256, 0) scale(-1, 1)'%3E%3Cpath d='M240,112H227.2l-13.43-40.29A24,24,0,0,0,191,56H88a24,24,0,0,0-21.78,14.07L46.88,112H16a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8H30.86a32,32,0,0,0,62.28,0H162.86a32,32,0,0,0,62.28,0H240a8,8,0,0,0,8-8V120A8,8,0,0,0,240,112ZM88,72h103l13.33,40H49.11ZM62,184a16,16,0,1,1,16-16A16,16,0,0,1,62,184Zm132,0a16,16,0,1,1,16-16A16,16,0,0,1,194,184Zm38-24H217.14a32,32,0,0,0-46.28,0H85.14a32,32,0,0,0-46.28,0H24V128H232Z'/%3E%3C/g%3E%3C/svg%3E",
    },
    {
      id: "left",
      label: "Sol Yan",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='%23a0aec0'%3E%3Cpath d='M240,112H227.2l-13.43-40.29A24,24,0,0,0,191,56H88a24,24,0,0,0-21.78,14.07L46.88,112H16a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8H30.86a32,32,0,0,0,62.28,0H162.86a32,32,0,0,0,62.28,0H240a8,8,0,0,0,8-8V120A8,8,0,0,0,240,112ZM88,72h103l13.33,40H49.11ZM62,184a16,16,0,1,1,16-16A16,16,0,0,1,62,184Zm132,0a16,16,0,1,1,16-16A16,16,0,0,1,194,184Zm38-24H217.14a32,32,0,0,0-46.28,0H85.14a32,32,0,0,0-46.28,0H24V128H232Z'/%3E%3C/svg%3E",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const innerStateVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const generateDamageText = (predictions) => {
    const sidesTr = {
      front: "ön",
      back: "arka",
      right: "sağ yan",
      left: "sol yan",
    };
    let damageElements = [];
    for (const [side, damage] of Object.entries(predictions)) {
      if (damage && damage.toLowerCase() !== "clean") {
        let hasarElement;
        if (damage.toLowerCase().includes("scratch")) {
          hasarElement = (
            <span style={{ color: "#d97706", fontWeight: "600" }}>çizik</span>
          );
        } else if (damage.toLowerCase().includes("dent")) {
          hasarElement = (
            <span style={{ color: "#ea580c", fontWeight: "600" }}>göçük</span>
          );
        } else {
          hasarElement = <span>hasar</span>;
        }
        damageElements.push(
          <span key={side}>
            {sidesTr[side]} kısmında {hasarElement}
          </span>,
        );
      }
    }
    if (damageElements.length === 0) {
      return "Aracınızda herhangi bir hasar tespit edilmemiştir.";
    }
    const joinedDamages = damageElements.map((element, index) => (
      <span key={`join-${index}`}>
        {element}
        {index < damageElements.length - 1 ? ", " : " "}
      </span>
    ));

    return (
      <span>
        Yapay zekâ modelimiz aracınızın {joinedDamages} tespit etmiştir. Bu
        durum fiyat teklifine yansıtılacaktır. Hata olduğunu düşünüyorsanız
        destek hattımızla iletişime geçebilirsiniz.
      </span>
    );
  };

  return (
    <div className={styles.container}>
      {
        <ConfirmDialog
          ref={dialogRef}
          onConfirm={dialogConfirmHandler}
          cancelRedirect="/"
          title="Hasar Tespiti"
          text={generateDamageText(damagePredictions)}
          cancelButtonText="Ana Sayfaya Git"
          logo={<AlertTriangle size={35} color="#ef4444" />}
        />
      }
      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          ⚠️ {error}
        </div>
      )}
      <AnimatePresence>
        {isAllImagesUploaded && avarageSellPrediction && (
          <motion.div
            className={styles.sellTimeBubble}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 15,
            }}
          >
            <span className={styles.bubbleTitle}>Tahmini Satış Süresi</span>
            <span className={styles.bubbleValue}>{avarageSellPrediction}</span>
            <span className={styles.bubbleSubtitle}>GÜN</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {views.map((view) => (
          <motion.div
            key={view.id}
            className={styles.card}
            variants={cardVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ opacity: loading ? 0.7 : 1, transition: "opacity 0.3s" }}
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
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  <img
                    src={images[view.id]}
                    className={styles.imagePreview}
                    alt="Araç"
                  />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      handleRemoveImage(view.id, event);
                    }}
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
                    cursor: "pointer",
                    display: "block",
                  }}
                >
                  <div className={styles.overlayMask}>
                    <div className={styles.targetCross}>+</div>
                    <p className={styles.overlayMessage}>
                      {cardErrors[view.id]}
                    </p>
                    <span className={styles.clickToTry}>
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
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={view.icon}
                    className={styles.icon}
                    alt={view.label}
                  />
                  <span className={styles.label}>{view.label}</span>
                </motion.label>
              )}
            </AnimatePresence>

            <input
              id={`file-upload-${view.id}`}
              type="file"
              className={styles.fileInput}
              style={{ display: "none" }}
              accept="image/*"
              disabled={loading}
              onChange={(event) => handleImageChange(view.id, event)}
            />
          </motion.div>
        ))}

        <AnimatePresence>
          {images.front && images.back && images.right && images.left && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
              }}
            >
              <PrimaryButton
                type="submit"
                text="Fiyat teklifi al"
                onClick={(event) => router.push("/fiyat-teklifi")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
