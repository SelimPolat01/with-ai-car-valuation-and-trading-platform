"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./AiCarDetector.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SecondaryButton from "./SecondaryButton";
import { Camera, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setPrediction as setPredictionAction } from "@/store/predictionSlice";
import { motion } from "framer-motion";
import { usePostCarDetection } from "@/hooks/POST/usePostCarDetection";
import {
  brandParser,
  modelParser,
  bodyTypeParser,
  capitalizeWords,
} from "@/app/utils/helpers";
import {
  aiDetectorPageVariants,
  aiDetectorPredictionContainerVariants,
  aiDetectorPredictionItemVariants,
} from "@/app/utils/animations";

export default function AiCarDetector() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.auth.isLogin);

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [showYearInterval, setShowYearInterval] = useState(false);
  const fileInputRef = useRef(null);
  const [prediction, setPrediction] = useState({
    prediction: [],
    predictionPercent: null,
  });

  const [car, setCar] = useState({
    brand: "",
    model: "",
    bodyType: "",
    yearInterval: "",
    selectedYear: null,
  });

  const {
    mutate: postCarDetectionMutate,
    isPending: postCarDetectionIsPending,
    isError: postCarDetectionIsError,
    error: postCarDetectionError,
  } = usePostCarDetection();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleClick() {
    if (!isLogin) {
      router.push("/login");
      return;
    }

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setPrediction({
        prediction: [],
        predictionPercent: null,
      });
      setCar({
        brand: "",
        model: "",
        bodyType: "",
        yearInterval: "",
        selectedYear: null,
      });
      setShowYearInterval(false);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(selectedFile));
    }
    event.target.value = "";
  }

  function handleUpload() {
    if (!isLogin) {
      router.push("/login");
      return;
    }

    if (!file || postCarDetectionIsPending) return;

    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    postCarDetectionMutate(
      { body: formData },
      {
        onSuccess: (data) => {
          const rawPrediction = data?.result?.prediction;
          if (!rawPrediction) {
            setError("API'den geçerli bir tahmin verisi alınamadı.");
            return;
          }

          const parsedPrediction = rawPrediction.split("-");
          setPrediction({
            prediction: parsedPrediction,
            predictionPercent: data.result.prediction_percent,
          });

          if (parsedPrediction && parsedPrediction.length >= 4) {
            const startYearRaw = parsedPrediction[3]?.trim() || "";
            const endYearRaw =
              parsedPrediction[4] && parsedPrediction[4].trim() !== ""
                ? parsedPrediction[4].trim()
                : startYearRaw;

            const formatYear = (yearStr) => {
              if (!yearStr) return "";
              return yearStr.length === 2 ? `20${yearStr}` : yearStr;
            };

            const startYearFull = formatYear(startYearRaw);
            const endYearFull = formatYear(endYearRaw);
            const isSingleYear = startYearFull === endYearFull;

            setCar({
              brand: capitalizeWords(parsedPrediction[0]),
              model: capitalizeWords(parsedPrediction[1]),
              bodyType: capitalizeWords(parsedPrediction[2]),
              yearInterval: isSingleYear
                ? `${startYearFull}`
                : `${startYearFull}-${endYearFull}`,
              selectedYear: isSingleYear ? Number(startYearFull) : null,
            });
          } else {
            setError("API'den gelen veri formatı geçersiz (Eksik parametre).");
          }
        },
      },
    );
  }

  const generateYearList = () => {
    if (!car.yearInterval) return [];
    const parts = car.yearInterval.split("-").map(Number);
    const startYear = parts[0];
    const endYear = parts[1] || startYear;

    if (isNaN(startYear) || isNaN(endYear)) return [];

    const years = [];
    for (let i = startYear; i <= endYear; i++) {
      years.push(i);
    }
    return years;
  };

  const yearsArray = generateYearList();

  const activeError =
    error || (postCarDetectionIsError ? postCarDetectionError?.message : null);

  return (
    <motion.div
      initial={aiDetectorPageVariants.initial}
      animate={aiDetectorPageVariants.animate}
      transition={aiDetectorPageVariants.transition}
      className={classes.div}
    >
      <div className={classes.photoDiv}>
        <input
          type="file"
          className="fileInput"
          hidden
          ref={fileInputRef}
          onChange={handleChange}
        />
        <div className={classes.photoContainer}>
          <div className={classes.photoUploadTextContainer}>
            <h1 className={classes.customUpload}>Fotoğraf Yükle</h1>
            <Camera
              className={classes.cameraIcon}
              size={38}
              stroke="url(#custom-icon-gradient)"
            />
          </div>
          {preview ? (
            <motion.div
              key={preview}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{ width: "100%" }}
            >
              <Image
                width={400}
                height={225}
                src={preview}
                alt="preview"
                className={classes.preview}
                onClick={handleClick}
              />
            </motion.div>
          ) : (
            <div className={classes.emptyBox} onClick={handleClick}></div>
          )}
        </div>

        <SecondaryButton
          type="button"
          text={postCarDetectionIsPending ? "Yükleniyor..." : "Gönder"}
          onClick={handleUpload}
          disabled={postCarDetectionIsPending || !file}
          className={classes.uploadButton}
        />
        {activeError && (
          <p
            className={classes.errorText}
            style={{ color: "#ff6b6b", marginTop: "10px" }}
          >
            {activeError}
          </p>
        )}
      </div>

      {prediction.prediction && prediction.prediction.length > 0 && (
        <motion.div
          variants={aiDetectorPredictionContainerVariants}
          initial="hidden"
          animate="visible"
          className={classes.predictionWrapper}
        >
          <div className={classes.buttonGroup}>
            <motion.div
              variants={aiDetectorPredictionItemVariants}
              className={classes.infoText}
            >
              <span>Tespit Edilen Araç:</span>
              <strong>
                {brandParser(car.brand)} {modelParser(car.model, "label")}{" "}
                {bodyTypeParser(car.bodyType)}
              </strong>

              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (yearsArray.length <= 1) return;
                  setShowYearInterval((prev) => !prev);
                }}
                className={classes.yearInterval}
                style={
                  yearsArray.length <= 1
                    ? {
                        cursor: "default",
                        backgroundColor: "transparent",
                        borderColor: "transparent",
                        padding: "4px 0",
                        marginLeft: "0",
                        boxShadow: "none",
                      }
                    : {}
                }
              >
                {!car.selectedYear ? car.yearInterval : car.selectedYear}
                {yearsArray.length > 1 && (
                  <ChevronDown
                    size={15}
                    style={{
                      transition: "transform 0.2s ease",
                      transform: showYearInterval
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                )}

                {yearsArray.length > 1 && showYearInterval && (
                  <div className={classes.yearIntervalDropdown}>
                    <ul className={classes.yearIntervalDropdownMenu}>
                      {yearsArray.map((year) => (
                        <li
                          className={classes.yearIntervalDropdownList}
                          key={year}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCar((prev) => ({
                              ...prev,
                              selectedYear: Number(year),
                            }));
                            setShowYearInterval(false);
                          }}
                        >
                          {year}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </span>
            </motion.div>

            <motion.div
              variants={aiDetectorPredictionItemVariants}
              className={classes.buttonContainer}
            >
              <button
                onClick={() => {
                  dispatch(
                    setPredictionAction({
                      brand: car.brand.toLocaleLowerCase("tr-TR"),
                      model: car.model.toLocaleLowerCase("tr-TR"),
                      bodyType: car.bodyType.toLocaleLowerCase("tr-TR"),
                    }),
                  );
                  router.push(
                    `/ilan-olustur/${car.brand.toLocaleLowerCase("tr-TR")}/${encodeURIComponent(
                      modelParser(car.model.toLocaleLowerCase("tr-TR"), "url"),
                    )}/${car.selectedYear}?fromImage=true`,
                  );
                }}
                className={`${classes.confirmButton} ${classes.primary} ${!car.selectedYear ? classes.notAllowed : ""}`}
                disabled={!car.selectedYear}
              >
                Evet, Aracımı Doğrula
              </button>

              <button
                onClick={() => {
                  dispatch(
                    setPredictionAction({
                      brand: "",
                      model: "",
                      bodyType: "",
                    }),
                  );
                  router.push("?mode=form");
                }}
                className={`${classes.confirmButton} ${classes.secondary}`}
              >
                Bilgileri Elle Düzenle
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
