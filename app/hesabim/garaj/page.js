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
import classes from "./Garajim.module.css";
import { useEffect, useMemo, useState } from "react";
import ChartBar from "../../components/ChartBar";
import HalfCircleProgress from "../../components/HalfCircleProgress";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGetPersonalAdvertsInfos } from "@/hooks/GET/useGetPersonalAdvertsInfos";
import { useGetPersonalSoldAdverts } from "@/hooks/GET/usePersonalSoldAdverts";

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
    return aylarDizisi.map((ay, indeks) => {
      const ilanSayisi = kisiselİlanlar.filter((ilan) => {
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
  }, [kisiselİlanlar]);

  const formatMaliDeger = (deger) => {
    const mutlakDeger = Math.abs(deger);
    let metin = "";

    if (mutlakDeger >= 1000000) {
      const milyon = mutlakDeger / 1000000;
      metin =
        milyon % 1 === 0
          ? `${milyon} Milyon ₺`
          : `${milyon.toFixed(1)} Milyon ₺`;
    } else if (mutlakDeger >= 1000) {
      const bin = mutlakDeger / 1000;
      metin = bin % 1 === 0 ? `${bin} Bin ₺` : `${bin.toFixed(1)} Bin ₺`;
    } else {
      metin = `${mutlakDeger} ₺`;
    }

    return deger < 0 ? `-${metin}` : metin;
  };

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
