"use client";

import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Heart,
  Megaphone,
  MoreVertical,
  TurkishLira,
} from "lucide-react";
import Frame from "../../components/Frame";
import classes from "./Garaj.module.css";
import { useEffect, useState } from "react";
import ChartBar from "../../components/ChartBar";
import HalfCircleProgress from "../../components/HalfCircleProgress";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetPersonalAdvertsInfos } from "@/hooks/GET/useGetPersonalAdvertsInfos";
import { useGetPersonalSoldAdverts } from "@/hooks/GET/usePersonalSoldAdverts";
import { formatMaliDeger, getAylikIlanVerileri } from "@/app/utils/helpers";

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
    data: getPersonalAdvertsData,
    isLoading: getPersonalAdvertsIsLoading,
    isError: getPersonalAdvertsIsError,
    error: getPersonalAdvertsError,
  } = useGetPersonalAdvertsInfos(token);

  const {
    data: personalSoldAdvertsData,
    isLoading: personalSoldAdvertsIsLoading,
  } = useGetPersonalSoldAdverts(token);

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

  const kisiselİlanlar = getPersonalAdvertsData?.result?.personalAdverts || [];
  const favoriIlanSayisi =
    getPersonalAdvertsData?.result?.personalFavoriteAdverts || 0;
  const kisiselSatinAldigimIlanlar =
    personalSoldAdvertsData?.result?.personalSoldAdverts || [];

  const kisiselMevcutİlanlar = kisiselİlanlar.filter(
    (ilan) =>
      ilan.is_sold === false || ilan.is_sold === "false" || !ilan.is_sold,
  );

  const satilanIlanlarim = kisiselİlanlar.filter(
    (ilan) => ilan.is_sold === true || ilan.is_sold === "true",
  );

  const toplamGelir = satilanIlanlarim.reduce((toplam, ilan) => {
    return toplam + Number(ilan.price || 0);
  }, 0);

  const toplamGider = kisiselSatinAldigimIlanlar.reduce((toplam, ilan) => {
    return toplam + Number(ilan.price || 0);
  }, 0);

  const netKar = toplamGelir - toplamGider;

  const aylikIlanVerileri = getAylikIlanVerileri(kisiselİlanlar);

  if (!token || personalSoldAdvertsIsLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
  }

  if (getPersonalAdvertsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getPersonalAdvertsError?.message}</p>
        <button get={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

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
            total={
              getPersonalAdvertsIsLoading ? "..." : kisiselMevcutİlanlar.length
            }
            change="11.46%"
            changeIcon={<ArrowUp />}
            upChange
          />

          <Frame
            className={classes.frame}
            icon={<TurkishLira />}
            text="Satılan İlanlarım"
            total={
              getPersonalAdvertsIsLoading ? "..." : satilanIlanlarim.length
            }
            change="32.63%"
            changeIcon={<ArrowDown />}
            downChange
          />

          <Frame
            className={classes.frame}
            icon={<Heart />}
            text={"Favori İlanlarım"}
            total={getPersonalAdvertsIsLoading ? "..." : favoriIlanSayisi}
            change="7.13%"
            changeIcon={<ArrowDown />}
            downChange
          />

          <ChartBar
            width="696"
            height="250"
            text="Aylık İlanlarım"
            optionsIcon={<MoreVertical />}
            data={aylikIlanVerileri}
          />

          <HalfCircleProgress
            text="Aylık Gelir Hedefi"
            subText="Her ay için belirlenen hedefler"
            percent={netKar > 0 ? 75 : 0}
            change="21"
            description={
              toplamGelir === 0 && toplamGider === 0
                ? "Bu ay henüz hiçbir araç alım-satımı yapmadınız."
                : netKar >= 0
                  ? `Bu ay ${formatMaliDeger(netKar)} net kâr elde ettin. Harika gidiyorsun!`
                  : `Bu ay ${formatMaliDeger(toplamGider)} harcama yaptın, henüz kârda değilsin.`
            }
            upChange={<ArrowUp />}
            downChange={<ArrowDown />}
            optionsIcon={<MoreVertical />}
            targetValue="14.7 Milyon ₺"
            revenueValue={formatMaliDeger(toplamGelir)}
            netIncome={formatMaliDeger(netKar)}
          />
        </motion.div>
      </div>
    </div>
  );
}
