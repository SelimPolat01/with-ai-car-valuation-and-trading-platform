"use client";

import CreditCard from "@/app/components/CreditCard";
import classes from "./Odeme.module.css";
import SecondaryButton from "@/app/components/SecondaryButton";
import { usePatchSoldAdvert } from "@/hooks/PATCH/usePatchSoldAdvert";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SuccessMessage from "@/app/components/SuccessMessage";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";

export default function Odeme() {
  const router = useRouter();
  const params = useParams();
  const creditCardRef = useRef();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const appointmentData = sessionStorage.getItem("appointmentData");
    if (!appointmentData) {
      router.replace(
        `/ilan/${params["brand-model-modelYear"]}/${params.advertId}`,
      );
    } else {
      setIsAuthorized(true);
    }
  }, [router, params]);

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
        router.replace("/hesabim/randevular");
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [router, isSuccess]);

  const {
    mutate: patchSoldAdvertMutate,
    isPending: patchSoldAdvertIsPending,
    isError: patchSoldAdvertIsError,
    error: patchSoldAdvertError,
    reset,
  } = usePatchSoldAdvert();

  function advertBuyHandler() {
    const isFormValid = creditCardRef.current.validateForm();
    if (!isFormValid) return;

    const appointmentDataStr = sessionStorage.getItem("appointmentData");
    if (!appointmentDataStr) return;

    const appointmentData = JSON.parse(appointmentDataStr);

    patchSoldAdvertMutate(
      {
        body: {
          advertId: params.advertId,
          slot_date: appointmentData.date,
          slot_time: appointmentData.hour,
        },
      },
      {
        onSuccess: (soldAdvertData) => {
          console.log(soldAdvertData?.result?.message);
          setIsSuccess(true);
          sessionStorage.removeItem("appointmentData");
        },
        onError: (soldAdvertError) => {
          console.error(soldAdvertError?.message);
        },
      },
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className={classes.div}>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="payment-form"
            className={classes.paymentDiv}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={() => {
              if (patchSoldAdvertIsError) {
                reset();
              }
            }}
          >
            <CreditCard ref={creditCardRef} />

            <AnimatePresence>
              {patchSoldAdvertIsError && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={classes.errorMessage}
                >
                  {patchSoldAdvertError?.message ||
                    "Ödeme işlemi sırasında bir hata oluştu."}
                </motion.div>
              )}
            </AnimatePresence>

            <SecondaryButton
              className={classes.paymentButton}
              text={
                patchSoldAdvertIsPending ? "İşleniyor..." : "Ödemeyi Tamamla"
              }
              onClick={advertBuyHandler}
              disabled={patchSoldAdvertIsPending}
            />
          </motion.div>
        ) : (
          <motion.div
            key="success-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <SuccessMessage
              key="success-message"
              onClick={() => {
                setIsSuccess(false);
                router.replace("/hesabim/randevular");
              }}
              title="İşlem Başarılı! 🎉"
              text="Ödemeniz başarıyla alındı ve randevunuz oluşturuldu. Araç teslim detaylarına profilinizdeki randevularım kısmından ulaşabilirsiniz."
              buttonText="Ana Sayfaya Git"
              className={classes.successMessage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
