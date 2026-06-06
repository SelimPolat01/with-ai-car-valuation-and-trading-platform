"use client";

import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Heart,
  Megaphone,
  MoreVertical,
} from "lucide-react";
import Frame from "../../components/Frame";
import classes from "./Garajim.module.css";
import { useEffect, useMemo, useState } from "react";
import ChartBar from "../../components/ChartBar";
import HalfCircleProgress from "../../components/HalfCircleProgress";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetAdverts } from "@/hooks/GET/useGetAdverts";

export default function Garajim() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/admin/login");
      return;
    }
  }, [router]);
  const {
    data: advertsData,
    isLoading: advertsIsLoading,
    isError: advertsIsError,
    error: advertsError,
  } = useGetAdverts(token);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const ilanlarDizisi = advertsData?.result?.adverts || [];
  const favoriIlanSayisi = advertsData?.result?.favoriteAdverts || 0;

  const toplamCiro = ilanlarDizisi.reduce((toplam, ilan) => {
    return toplam + Number(ilan.price || 0);
  }, 0);
  const aylar = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  const aylikIlanVerileri = useMemo(() => {
    const aylarDizisi = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    const sonuc = aylarDizisi.map((ay, indeks) => {
      const ilanSayisi = ilanlarDizisi.filter((ilan) => {
        if (!ilan.created_at) return false;
        const ilanTarihi = new Date(ilan.created_at);
        if (isNaN(ilanTarihi.getTime())) return false;
        return ilanTarihi.getMonth() === indeks;
      }).length;
      return {
        name: ay,
        ilanSayisi: ilanSayisi,
      };
    });
    console.log("Hesaplanan Aylık Grafik Verileri:", sonuc);
    return sonuc;
  }, [ilanlarDizisi]);

  const formatMaliDeger = (deger) => {
    if (deger >= 1000000) {
      const milyon = deger / 1000000;
      return milyon % 1 === 0
        ? `${milyon} Milyon ₺`
        : `${milyon.toFixed(1)} Milyon ₺`;
    }
    if (deger >= 1000) {
      const bin = deger / 1000;
      return bin % 1 === 0 ? `${bin} Bin ₺` : `${bin.toFixed(1)} Bin ₺`;
    }
    return `${deger} $`;
  };

  // if (isLoading || projectIsLoading) {
  //   return (
  //     <div className="loadingContainer">
  //       <p>{texts[lang].loading}</p>
  //     </div>
  //   );
  // }

  // if (isError) {
  //   return (
  //     <div className="loadingContainer">
  //       <p>{error?.message || "An error occured"}</p>
  //     </div>
  //   );
  // }

  return (
    <div className={classes.div}>
      <div className={classes.divContainer}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={classes.frameDiv}
        >
          <Frame
            className={classes.frame}
            icon={<Megaphone />}
            text="Mevcut İlanlarım"
            total={advertsIsLoading ? "..." : ilanlarDizisi.length}
            change="11.46%"
            changeIcon={<ArrowUp />}
            upChange
          />
          <Frame
            className={classes.frame}
            icon={<DollarSign />}
            text="Satılan İlanlarım"
            total="1"
            change="32.63%"
            changeIcon={<ArrowDown />}
            downChange
          />
          <Frame
            className={classes.frame}
            icon={<Heart />}
            text={"Favori İlanlarım"}
            total={advertsIsLoading ? "..." : favoriIlanSayisi}
            change="7.13%"
            changeIcon={<ArrowDown />}
            downChange
          />
          <ChartBar
            width="696"
            height="250"
            text="Aylık İlanlar"
            optionsIcon={<MoreVertical />}
            data={aylikIlanVerileri}
          />
          <HalfCircleProgress
            text="Aylık Gelir Hedefi"
            subText="Her ay için belirlediğin hedefler"
            percent={75}
            change="21"
            description="Bugün 4 Milyon ₺ kazandın. Geçen aya göre daha yüksek. Devam et!"
            upChange={<ArrowUp />}
            downChange={<ArrowDown />}
            optionsIcon={<MoreVertical />}
            targetValue="9.7 Milyon ₺"
            revenueValue={formatMaliDeger(toplamCiro)}
            netIncome="750 Bin ₺"
          />
        </motion.div>
      </div>
    </div>
  );
}
