"use client";

import { useEffect, useState } from "react";
import classes from "./Randevu.module.css";
import SecondaryButton from "@/app/components/SecondaryButton";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useGetAvailableSlots } from "@/hooks/GET/useGetSlots";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  formatDayName,
  formatDayNumber,
  formatForDB,
  formatMonthName,
} from "@/app/utils/helpers";
import Loading from "@/app/loading";
import {
  cardVariants,
  fadeItemVariants,
  gridContainerVariants,
  pageVariants,
} from "@/app/utils/animations";

const ALL_HOURS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

export default function Randevu() {
  const router = useRouter();
  const params = useParams();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/admin/login");
      return;
    }
  }, [router]);

  const days = Array.from({ length: 17 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return d;
  }).filter((date) => date.getDay() !== 0);

  const [selectedDate, setSelectedDate] = useState(days[0].toDateString());
  const [selectedHour, setSelectedHour] = useState(null);

  const {
    data: getAvailableSlotsData,
    isLoading: getAvailableSlotsIsLoading,
    isError: getAvailableSlotsIsError,
    error: getAvailableSlotsError,
  } = useGetAvailableSlots(token);

  function appointmentClickHandler() {
    const appointmentData = {
      date: formatForDB(selectedDate),
      hour: selectedHour,
      advertId: params.advertId,
    };

    sessionStorage.setItem("appointmentData", JSON.stringify(appointmentData));
    router.replace(
      `/ilan/${params["brand-model-modelYear"]}/${params.advertId}/odeme`,
    );
  }

  const dbSlots = getAvailableSlotsData?.result || [];

  if (!token || getAvailableSlotsIsLoading) {
    return <Loading />;
  }

  if (getAvailableSlotsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getAvailableSlotsError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <motion.div
        className={classes.div}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={fadeItemVariants} className={classes.title}>
          RANDEVU TARİHİ SEÇİN
        </motion.h2>

        <motion.div
          className={classes.daysWrapper}
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {days.map((date) => {
            const dateStr = date.toDateString();
            const dbDateStr = formatForDB(date);
            const isSelected = selectedDate === dateStr;

            const todaysSlots = dbSlots.filter(
              (slot) => slot.slot_date === dbDateStr,
            );

            const isAllHoursFull =
              todaysSlots.length > 0 &&
              todaysSlots.every((slot) => slot.is_booked);

            return (
              <motion.button
                key={dateStr}
                variants={cardVariants}
                whileHover={!isAllHoursFull ? { scale: 1.05 } : {}}
                whileTap={!isAllHoursFull ? { scale: 0.95 } : {}}
                disabled={isAllHoursFull}
                className={`${classes.dayCard} ${isSelected ? classes.activeDay : ""} ${
                  isAllHoursFull ? classes.fullDay : ""
                }`}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setSelectedHour(null);
                }}
              >
                <span className={classes.dayNumber}>
                  {formatDayNumber(date)}
                </span>
                <span className={classes.dayMonth}>
                  {formatMonthName(date)}
                </span>
                <span className={classes.dayName}>{formatDayName(date)}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <motion.hr variants={fadeItemVariants} className={classes.divider} />

        <motion.h3 variants={fadeItemVariants} className={classes.subtitle}>
          SAAT SEÇİN
        </motion.h3>

        <motion.div
          className={classes.hoursGrid}
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {ALL_HOURS.map((saat) => {
            const isSelected = selectedHour === saat;
            const selectedDateDBStr = formatForDB(selectedDate);

            const currentSlot = dbSlots.find(
              (slot) =>
                slot.slot_date === selectedDateDBStr && slot.slot_time === saat,
            );

            const isFull = currentSlot ? currentSlot.is_booked : false;

            return (
              <motion.button
                key={saat}
                variants={cardVariants}
                whileHover={!isFull ? { scale: 1.05 } : {}}
                whileTap={!isFull ? { scale: 0.95 } : {}}
                disabled={isFull}
                className={`${classes.hourCard} ${
                  isFull
                    ? classes.fullHour
                    : isSelected
                      ? classes.activeHour
                      : classes.emptyHour
                }`}
                onClick={() =>
                  setSelectedHour(selectedHour === saat ? null : saat)
                }
              >
                <span className={classes.hourTime}>{saat}</span>
                <span className={classes.hourStatus}>
                  {isFull ? "DOLU" : isSelected ? "SEÇİLDİ" : "BOŞ"}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        <AnimatePresence>
          {selectedDate !== null && selectedHour !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <SecondaryButton
                className={classes.appointmentButton}
                text="Ödeme Adımına Geç"
                onClick={appointmentClickHandler}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
