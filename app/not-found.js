"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
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
          >
            404
          </motion.h1>

          <div className="textWrapper">
            <AlertCircle size={28} className="alertIcon" />
            <p className="notFoundText">
              Hay aksi! Aradığınız sayfa duman olmuş.
            </p>
          </div>

          <motion.img
            src="/images/not-found.svg"
            alt="Sayfa Bulunamadı"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="notFoundImage"
          />

          <Link href="/" className="backHomeButton">
            <Home size={20} />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
