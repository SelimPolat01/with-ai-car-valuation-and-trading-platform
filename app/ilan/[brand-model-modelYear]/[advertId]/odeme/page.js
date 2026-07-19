"use client";

import CreditCard from "@/app/components/CreditCard";
import classes from "./Odeme.module.css";
import SecondaryButton from "@/app/components/SecondaryButton";
import { usePatchSoldAdvert } from "@/hooks/PATCH/usePatchSoldAdvert";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SuccessMessage from "@/app/components/SuccessMessage";

export default function Odeme() {
  const params = useParams();
  const router = useRouter();
  const creditCardRef = useRef();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const randevuVerisi = sessionStorage.getItem("randevuVerisi");
    if (!randevuVerisi)
      router.replace(
        `/ilan/${params["brand-model-modelYear"]}/${params.advertId}`,
      );
    else setIsAuthorized(true);
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
  } = usePatchSoldAdvert();

  function advertBuyHandler() {
    const isFormValid = creditCardRef.current.validateForm();
    if (!isFormValid) return;
    const randevuVerisiStr = sessionStorage.getItem("randevuVerisi");
    if (!randevuVerisiStr) return;
    const randevuVerisi = JSON.parse(randevuVerisiStr);
    const token = localStorage.getItem("token");
    patchSoldAdvertMutate(
      {
        token,
        body: {
          advertId: params.advertId,
          slot_date: randevuVerisi.date,
          slot_time: randevuVerisi.hour,
        },
      },
      {
        onSuccess: (soldAdvertData) => {
          console.log(soldAdvertData?.result?.message);
          setIsSuccess(true);
          sessionStorage.removeItem("randevuVerisi");
        },
        onError: (soldAdvertError) => {
          setError(soldAdvertError?.message);
        },
      },
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className={classes.div}>
      {!isSuccess ? (
        <div className={classes.paymentDiv}>
          <CreditCard ref={creditCardRef} />
          <SecondaryButton
            className={classes.paymentButton}
            text="Ödemeyi Tamamla"
            onClick={advertBuyHandler}
          />
        </div>
      ) : (
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
      )}
    </div>
  );
}
