"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./AiCarDetector.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SecondaryButton from "./SecondaryButton";
import { Camera } from "lucide-react";
import { useDispatch } from "react-redux";
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
  const [token, setToken] = useState(null);
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
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleClick() {
    fileInputRef.current.click();
  }

  function handleChange(event) {
    const selectedFile = event.target.files[0];
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
    if (!file || postCarDetectionIsPending || !token) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    postCarDetectionMutate(
      { token, body: formData },
      {
        onSuccess: (data) => {
          const parsedPrediction = data.result.prediction.split("-");
          setPrediction({
            prediction: parsedPrediction,
            predictionPercent: data.result.prediction_percent,
          });

          if (parsedPrediction && parsedPrediction.length >= 4) {
            const startYearShort = parsedPrediction[3];
            const endYearShort =
              parsedPrediction[4] && parsedPrediction[4].trim() !== ""
                ? parsedPrediction[4]
                : startYearShort;

            const calculatedYearFull = Number(`20${startYearShort}`);
            const isSingleYear = startYearShort === endYearShort;

            setCar({
              brand: capitalizeWords(parsedPrediction[0]),
              model: capitalizeWords(parsedPrediction[1]),
              bodyType: capitalizeWords(parsedPrediction[2]),
              yearInterval: isSingleYear
                ? `20${startYearShort}`
                : `20${startYearShort}-20${endYearShort}`,
              selectedYear: isSingleYear ? calculatedYearFull : null,
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
    const [startYear, endYear] = car.yearInterval.split("-").map(Number);
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
            <span className={classes.customUpload}>Fotoğraf Yükle</span>
            <Camera
              className={classes.cameraIcon}
              size={32}
              stroke="url(#custom-text-stroke)"
            />
          </div>
          {preview ? (
            <Image
              width={400}
              height={250}
              src={preview}
              alt="preview"
              className={classes.preview}
              onClick={handleClick}
            />
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
                      }
                    : {}
                }
              >
                {!car.selectedYear ? car.yearInterval : car.selectedYear}

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
                      brand: car.brand.toLowerCase(),
                      model: car.model.toLowerCase(),
                      bodyType: car.bodyType.toLowerCase(),
                    }),
                  );
                  router.push(
                    `/ilan-olustur/${car.brand.toLowerCase()}/${encodeURIComponent(
                      modelParser(car.model.toLowerCase(), "url"),
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
