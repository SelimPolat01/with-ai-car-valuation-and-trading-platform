"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./AiCarDetector.module.css";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SecondaryButton from "./SecondaryButton";
import { Camera } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setPrediction as setPredictionAction } from "@/store/predictionSlice";

export default function AiCarDetector() {
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
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

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
  }

  async function handleUpload() {
    if (!file || loading) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://127.0.0.1:8000/car-detection-upload",
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
        console.log(errorData);
        setError(errorData.message);
        return;
      }

      const data = await response.json();
      const parsedPrediction = data.prediction.split("-");
      setPrediction({
        prediction: parsedPrediction,
        predictionPercent: data.prediction_percent,
      });
      if (parsedPrediction && parsedPrediction.length >= 5) {
        const capitalize = (str) => {
          if (!str) return "";
          return str.charAt(0).toUpperCase() + str.slice(1);
        };

        setCar({
          brand: capitalize(parsedPrediction[0]),
          model: capitalize(parsedPrediction[1]),
          bodyType: capitalize(parsedPrediction[2]),
          yearInterval: `20${parsedPrediction[3]}-20${parsedPrediction[4]}`,
          selectedYear: null,
        });
      } else {
        setError("API'den gelen veri formatı geçersiz (Eksik parametre).");
      }
      console.log(data.prediction_percent);
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className={classes.div}>
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
            <Camera size={32} stroke="url(#gold-stroke)" />
          </div>
          {preview ? (
            <Image
              width={300}
              height={300}
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
          text="Gönder"
          onClick={handleUpload}
          disabled={loading || !file}
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

      <div>
        {prediction.prediction && prediction.prediction.length > 0 && (
          <div className={classes.buttonGroup}>
            <div className={classes.infoText}>
              Tahmin Edilen:{" "}
              <strong>
                {car.brand} {car.model} {car.bodyType}{" "}
                <span
                  onClick={() => setShowYearInterval((prev) => !prev)}
                  className={classes.yearInterval}
                >
                  {!car.selectedYear ? car.yearInterval : car.selectedYear}
                  {showYearInterval && (
                    <div className={classes.yearIntervalDropdown}>
                      <ul className={classes.yearIntervalDropdownMenu}>
                        {yearsArray.map((year) => (
                          <li
                            className={classes.yearIntervalDropdownList}
                            key={year}
                            onClick={(e) => {
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
              </strong>
            </div>

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
                  `/ilan-olustur/${car.brand.toLowerCase()}/${car.model.toLowerCase()}/${car.selectedYear}?fromImage=true`,
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
          </div>
        )}
      </div>
    </div>
  );
}
