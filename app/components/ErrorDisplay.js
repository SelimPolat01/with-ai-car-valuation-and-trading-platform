"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorDisplay({
  error,
  reset,
  title = "HATA",
  message,
  imageSrc = "/images/error.svg",
}) {
  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const displayMessage =
    message ||
    error?.message ||
    "Hay aksi! Beklenmeyen bir sistem hatası oluştu.";

  return (
    <div className="errorDiv">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="errorMainContainer"
      >
        <div className="glassCard">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="errorTitle"
          >
            {title}
          </motion.h1>

          <div className="textWrapper">
            <AlertTriangle size={28} className="alertIcon" />
            <p className="errorText">{displayMessage}</p>
          </div>

          <motion.img
            src={imageSrc}
            alt={title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="errorImage"
          />

          <div
            style={{
              display: "flex",
              gap: "1rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {reset && (
              <button onClick={() => reset()} className="backHomeButton">
                <RotateCcw size={20} />
                <span>Tekrar Dene</span>
              </button>
            )}

            <Link href="/" className="backHomeButton">
              <Home size={20} />
              <span>Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
