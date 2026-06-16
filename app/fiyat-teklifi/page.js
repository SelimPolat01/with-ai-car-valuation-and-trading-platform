"use client";

import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import { useDispatch, useSelector } from "react-redux";
import classes from "./FiyatTeklifi.module.css";
import { animate, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CancelButton from "../components/CancelButton";
import SecondaryButton from "../components/SecondaryButton";

export default function PriceOffer() {
  useCheckAuth();

  const [displayPrice, setDisplayPrice] = useState(0);
  const [animationFinished, setAnimationFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const prediction = useSelector((state) => state.prediction.prediction);
  const router = useRouter();
  const today = new Date();
  const validatyDate = new Date();
  validatyDate.setDate(today.getDate() + 3);
  const formattedValidatyDate = validatyDate.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const priceOffer = Number(prediction.price);

  useEffect(() => {
    const controls = animate(0, priceOffer, {
      duration: 3,
      ease: "easeOut",
      onUpdate: (value) => setDisplayPrice(value),
      onComplete: () => setAnimationFinished(true),
    });

    return () => controls.stop();
  }, [priceOffer]);

  function capitalize(text) {
    if (typeof text !== "string") {
      return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  function engineCapacityFormat(engineCapacity) {
    if (!engineCapacity) return "";
    return (+engineCapacity / 1000).toFixed(1);
  }

  function fuelTypeFormat(fuelType) {
    if (!fuelType) return "";
    const parsedFuelType = {
      gasoline: "Benzin",
      diesel: "Dizel",
      hybrid: "Hibrit",
      lpg: "LPG",
    };
    return parsedFuelType[fuelType];
  }

  return (
    <div className={classes.wrapperDiv}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeIn" }}
        className={classes.carModel}
      >
        <h2>
          {decodeURIComponent(prediction.brand.toUpperCase())}{" "}
          {decodeURIComponent(prediction.model.toUpperCase())}{" "}
          {engineCapacityFormat(prediction.engineCapacity)}
        </h2>
        <div className={classes.svgTechParamsWrapper}>
          <svg
            className={classes.svg}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "20px", height: "20px" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="8" />
          </svg>
          <div className={classes.techParams}>
            <ul>
              <li>
                <strong>Marka: </strong>
                <span>{decodeURIComponent(capitalize(prediction.brand))}</span>
              </li>
              <li>
                <strong>Model: </strong>
                <span>{decodeURIComponent(capitalize(prediction.model))}</span>
              </li>
              <li>
                <strong>Yıl: </strong>
                <span>{prediction.modelYear}</span>
              </li>
              <li>
                <strong>Motor Hacmi: </strong>
                <span>{prediction.engineCapacity} cc</span>
              </li>
              <li>
                <strong>Motor Gücü: </strong>
                <span>{prediction.horsepower} hp</span>
              </li>
              <li>
                <strong>Kilometre: </strong>
                <span>{prediction.kilometer} km</span>
              </li>
              <li>
                <strong>Yakıt Tipi: </strong>
                <span>{fuelTypeFormat(prediction.fuelType)}</span>
              </li>
              <li>
                <strong>Paket: </strong>
                <span>{capitalize(prediction.trimLevel)}</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
      <div className={classes.div}>
        <div className={classes.svgCircleDiv}>
          <motion.div
            initial={{ opacity: 0, backgroundColor: "#d4f7dc" }}
            animate={{
              opacity: 1,
              backgroundColor: ["#a8f0b0", "#6edc7b", "#39b44a", "#1b8a2d"],
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className={classes.circle}
          >
            <h1 className={classes.priceOfferText}>
              <strong>Fiyat teklifi: </strong>
              <span>{Math.floor(displayPrice).toLocaleString("tr-TR")} ₺</span>
            </h1>

            {animationFinished && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeIn" }}
                className={classes.svgPriceParamsWrapper}
              >
                <svg
                  className={classes.svg}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "20px", height: "20px" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="8" />
                </svg>
                <ul className={classes.priceParams}>
                  <li>
                    Aracınızın marka, model, yıl, motor hacmi ve kilometresi
                    gibi faktörler ile piyasa verilerini analiz ederek size en
                    güncel ve adil fiyat teklifini sunuyoruz.
                  </li>
                </ul>
              </motion.div>
            )}
          </motion.div>
        </div>
        {animationFinished && (
          <motion.div
            className={classes.validatyDateDiv}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeIn" }}
          >
            <p className={classes.validatyDate}>
              <strong>Fiyat teklif geçerlilik tarihi: </strong>
              <span>{formattedValidatyDate}</span>
            </p>
          </motion.div>
        )}
      </div>

      {animationFinished && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeIn" }}
          className={classes.buttonDiv}
        >
          <CancelButton
            text="Ana Sayfaya Dön"
            type="button"
            className={classes.cancelButton}
            onClick={() => router.replace("/")}
          />
          <SecondaryButton
            text="Son Detayları Gir"
            type="button"
            onClick={() => router.replace("/ilan-olustur/detaylar")}
            className={classes.button}
          />
        </motion.div>
      )}
    </div>
  );
}
