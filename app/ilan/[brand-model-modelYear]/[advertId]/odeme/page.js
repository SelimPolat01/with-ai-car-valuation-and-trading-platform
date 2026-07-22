"use client";

import CreditCard from "@/app/components/CreditCard";
import classes from "./Odeme.module.css";
import SecondaryButton from "@/app/components/SecondaryButton";
import { usePatchSoldAdvert } from "@/hooks/PATCH/usePatchSoldAdvert";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SuccessMessage from "@/app/components/SuccessMessage";

export default function Odeme() {
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

  const creditCardRef = useRef();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const appointmentData = sessionStorage.getItem("appointmentData");
    if (!appointmentData)
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
    reset,
  } = usePatchSoldAdvert();

  function advertBuyHandler() {
    const isFormValid = creditCardRef.current.validateForm();
    if (!isFormValid) return;
    const appointmentDataStr = sessionStorage.getItem("appointmentData");
    if (!appointmentDataStr) return;
    const appointmentData = JSON.parse(appointmentDataStr);
    const token = localStorage.getItem("token");

    patchSoldAdvertMutate(
      {
        token,
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
      {!isSuccess ? (
        <div
          className={classes.paymentDiv}
          onClick={() => {
            if (patchSoldAdvertIsError) {
              reset();
            }
          }}
        >
          <CreditCard ref={creditCardRef} />

          {patchSoldAdvertIsError && (
            <div className={classes.errorMessage}>
              {patchSoldAdvertError?.message ||
                "Ödeme işlemi sırasında bir hata oluştu."}
            </div>
          )}

          <SecondaryButton
            className={classes.paymentButton}
            text={patchSoldAdvertIsPending ? "İşleniyor..." : "Ödemeyi Tamamla"}
            onClick={advertBuyHandler}
            disabled={patchSoldAdvertIsPending}
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
