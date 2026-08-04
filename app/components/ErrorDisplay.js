// components/ErrorDisplay.jsx (veya kendi yoluna göre ayarla)
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

// error ve reset proplarını dışarıdan alacak şekilde ayarladık
export default function ErrorDisplay({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="notFoundDiv">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="notFoundContainer"
      >
        <div className="glassCard">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="notFoundTitle"
            style={{ fontSize: "clamp(50px, 10vw, 110px)" }}
          >
            HATA
          </motion.h1>

          <div className="textWrapper">
            <AlertTriangle size={28} className="alertIcon" />
            <p className="notFoundText">
              {error?.message ||
                "Hay aksi! Beklenmeyen bir sistem hatası oluştu."}
            </p>
          </div>

          <motion.img
            src="/images/error.svg"
            alt="Hata Oluştu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="notFoundImage"
          />

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {/* Eğer reset fonksiyonu gönderilmişse butonu göster */}
            {reset && (
              <button
                onClick={() => reset()}
                className="backHomeButton"
                style={{ cursor: "pointer", fontFamily: "inherit" }}
              >
                <RotateCcw size={20} />
                <span>Tekrar Dene</span>
              </button>
            )}

            <Link
              href="/"
              className="backHomeButton"
              style={{
                backgroundColor: "transparent",
                color: "blanchedalmond",
                border: "2px solid blanchedalmond",
              }}
            >
              <Home size={20} />
              <span>Ana Sayfa</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
