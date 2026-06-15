"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./AiCarDetector.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SecondaryButton from "./SecondaryButton";
import { Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setPrediction as setPredictionAction } from "@/store/predictionSlice";
import { motion } from "framer-motion";
import { usePostCarDetection } from "@/hooks/POST/usePostCarDetection";

export default function AiCarDetector() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
      return;
    }
  }, [router]);
  const {
    mutate: carDetectionMutate,
    isPending: carDetectionIsPending,
    isError: carDetectionIsError,
    error: carDetectionError,
  } = usePostCarDetection();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const predictionCarValues = useSelector(
    (state) => state.prediction.prediction,
  );
  const dispatch = useDispatch();
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
  const [showYearInterval, setShowYearInterval] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function brandParser(brand) {
    if (!brand) return;
    const normalizedBrand = brand.toLowerCase();
    if (normalizedBrand == "bmw") return "BMW";
    else return brand;
  }

  function modelParser(model, choice) {
    if (!model) return;
    const normalizedModel = model.toLowerCase();
    const parsedModel = {
      celysee: choice == "url" ? "c-elysee" : "C-Elysee",
      cseries: choice == "url" ? "c series" : "C Serisi",
      eseries: choice == "url" ? "e series" : "E Serisi",
      "1series": choice == "url" ? "1 series" : "1 Serisi",
      "3series": choice == "url" ? "3 series" : "3 Serisi",
      "5series": choice == "url" ? "5 series" : "5 Serisi",
      troc: choice == "url" ? "t-roc" : "T-Roc",
      megane: choice == "url" ? "megane" : "Megane",
      civic: choice == "url" ? "civic" : "Civic",
      egea: choice == "url" ? "egea" : "Egea",
      clio: choice == "url" ? "clio" : "Clio",
      corolla: choice == "url" ? "corolla" : "Corolla",
      passat: choice == "url" ? "passat" : "Passat",
      polo: choice == "url" ? "polo" : "Polo",
      i20: "i20",
      duster: choice == "url" ? "duster" : "Duster",
      tiguan: choice == "url" ? "tiguan" : "Tiguan",
      focus: choice == "url" ? "focus" : "Focus",
      fiesta: choice == "url" ? "fiesta" : "Fiesta",
      golf: choice == "url" ? "golf" : "Golf",
      a3: choice == "url" ? "a3" : "A3",
      jetta: choice == "url" ? "jetta" : "Jetta",
      c3: choice == "url" ? "c3" : "C3",
      a4: choice == "url" ? "a4" : "A4",
      cruze: choice == "url" ? "cruze" : "Cruze",
      c4: choice == "url" ? "c4" : "C4",
    };
    return parsedModel[normalizedModel] || model;
  }

  function bodyTypeParser(bodyType) {
    if (!bodyType) return;
    const normalizedBodyType = bodyType.toLowerCase();
    if (normalizedBodyType == "suv") return "SUV";
    else return bodyType;
  }

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
  }

  async function handleUpload() {
    if (!file || loading) return;
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");
    carDetectionMutate(
      { token: token, body: formData },
      {
        onSuccess: (data) => {
          const parsedPrediction = data.result.prediction.split("-");
          setPrediction({
            prediction: parsedPrediction,
            predictionPercent: data.result.prediction_percent,
          });

          if (parsedPrediction && parsedPrediction.length >= 4) {
            const capitalize = (str) => {
              if (!str) return "";
              return str.charAt(0).toUpperCase() + str.slice(1);
            };

            const startYearShort = parsedPrediction[3];
            const endYearShort =
              parsedPrediction[4] && parsedPrediction[4].trim() !== ""
                ? parsedPrediction[4]
                : startYearShort;

            const calculatedYearFull = Number(`20${startYearShort}`);
            const isSingleYear = startYearShort === endYearShort;

            setCar({
              brand: capitalize(parsedPrediction[0]),
              model: capitalize(parsedPrediction[1]),
              bodyType: capitalize(parsedPrediction[2]),
              yearInterval: isSingleYear
                ? `20${startYearShort}`
                : `20${startYearShort}-20${endYearShort}`,
              selectedYear: isSingleYear ? calculatedYearFull : null,
            });
          } else {
            setError("API'den gelen veri formatı geçersiz (Eksik parametre).");
          }
        },
        onError: (err) => {
          console.log(err.message);
          setError(err.message);
          return;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
        <div className={classes.photoContainer} onClick={handleClick}>
          <div className={classes.photoUploadTextContainer}>
            <span
              onClick={(event) => event.stopPropagation()}
              className={classes.customUpload}
            >
              Fotoğraf Yükle
            </span>
            <Camera size={32} stroke="url(#custom-text-stroke)" />
          </div>
          {preview ? (
            <Image
              width={400}
              height={250}
              src={preview}
              alt="preview"
              className={classes.preview}
            />
          ) : (
            <div className={classes.emptyBox}></div>
          )}
        </div>

        <SecondaryButton
          type="button"
          text={carDetectionIsPending ? "Yükleniyor..." : "Gönder"}
          onClick={handleUpload}
          disabled={carDetectionIsPending}
          className={classes.uploadButton}
        />
        {error && (
          <p
            className={classes.errorText}
            style={{ color: "red", marginTop: "10px" }}
          >
            {error}
          </p>
        )}
      </div>

      <motion.div
        key={prediction.prediction.length > 0 ? "visible" : "hidden"}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {prediction.prediction && prediction.prediction.length > 0 && (
          <div className={classes.buttonGroup}>
            <motion.div variants={itemVariants} className={classes.infoText}>
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
              variants={itemVariants}
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
                    `/ilan-olustur/${car.brand.toLowerCase()}/${encodeURIComponent(modelParser(car.model.toLowerCase(), "url"))}/${car.selectedYear}?fromImage=true`,
                  );
                }}
                className={`${classes.confirmButton} ${classes.primary}`}
                disabled={!car.selectedYear}
              >
                Evet, aracımı doğrula
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
                Bilgileri elle düzenle
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
