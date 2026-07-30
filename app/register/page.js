"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import classes from "./Register.module.css";

import { usePostEmailVerify } from "@/hooks/POST/usePostEmailVerify";
import { usePostOtpVerify } from "@/hooks/POST/usePostOtpVerify";
import { usePostRegister } from "@/hooks/POST/usePostRegister";

import VerifyEmailStep from "@/app/components/VerifyEmailStep";
import VerifyOtpStep from "@/app/components/VerifyOtpStep";
import RegisterDetailsStep from "@/app/components/RegisterDetailsStep";

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [step, setStep] = useState(1);
  const [isConflict, setIsConflict] = useState(false);

  const [input, setInput] = useState({
    email: { value: "", isBlur: false },
    otp: { value: "", isBlur: false },
    password: { value: "", isBlur: false },
    name: { value: "", isBlur: false },
    surname: { value: "", isBlur: false },
    tel_number: { value: "", isBlur: false },
    address: { value: "", isBlur: false },
    iban: { value: "", isBlur: false },
  });

  const {
    mutate: postEmailVerifyMutate,
    isPending: postEmailVerifyIsPending,
    isError: postEmailVerifyIsError,
    error: postEmailVerifyError,
    reset: resetEmailVerify,
  } = usePostEmailVerify();

  const {
    mutate: postOtpVerifyMutate,
    isPending: postOtpVerifyIsPending,
    isError: postOtpVerifyIsError,
    error: postOtpVerifyError,
    reset: resetOtpVerify,
  } = usePostOtpVerify();

  const {
    mutate: postRegisterMutate,
    isPending: postRegisterIsPending,
    isError: postRegisterIsError,
    error: postRegisterError,
    reset: resetRegister,
  } = usePostRegister();

  function inputChangeHandler(event) {
    const { name, value } = event.target;
    setInput((prev) => ({ ...prev, [name]: { value, isBlur: false } }));

    if (name === "email" && postEmailVerifyIsError) resetEmailVerify();
    if (name === "otp" && postOtpVerifyIsError) resetOtpVerify();
    if (name === "email" && isConflict) setIsConflict(false);
    if (postRegisterIsError) resetRegister();
  }

  function inputBlurHandler(event) {
    const { name } = event.target;
    setInput((prev) => ({ ...prev, [name]: { ...prev[name], isBlur: true } }));
  }

  const setBlurForFields = (fields) => {
    setInput((prev) => {
      const newState = { ...prev };
      fields.forEach((field) => {
        newState[field] = { ...newState[field], isBlur: true };
      });
      return newState;
    });
  };

  const handleResendEmail = (variables, options) => {
    postEmailVerifyMutate({ ...variables, forLogin: false }, options);
  };

  return (
    <div className={classes.container}>
      <div className={`${classes.card} ${step === 3 ? classes.wideCard : ""}`}>
        {step === 1 && (
          <VerifyEmailStep
            input={input}
            inputChangeHandler={inputChangeHandler}
            inputBlurHandler={inputBlurHandler}
            setBlurForFields={setBlurForFields}
            nextStep={() => setStep(2)}
            isConflict={isConflict}
            setIsConflict={setIsConflict}
            mutate={postEmailVerifyMutate}
            isPending={postEmailVerifyIsPending}
            isError={postEmailVerifyIsError}
            error={postEmailVerifyError}
            forLogin={false}
            title="Kayıt Ol"
            subHeading="Kayıt olmak için e-posta adresinizi girin."
            buttonText="Devam Et"
            backLinkHref="/login"
            backLinkText="Zaten hesabınız var mı? Giriş Yapın"
          />
        )}

        {step === 2 && (
          <VerifyOtpStep
            input={input}
            inputChangeHandler={inputChangeHandler}
            inputBlurHandler={inputBlurHandler}
            setBlurForFields={setBlurForFields}
            nextStep={() => setStep(3)}
            prevStep={() => setStep(1)}
            mutateOtp={postOtpVerifyMutate}
            isPendingOtp={postOtpVerifyIsPending}
            isErrorOtp={postOtpVerifyIsError}
            errorOtp={postOtpVerifyError}
            mutateEmail={handleResendEmail}
            isPendingEmail={postEmailVerifyIsPending}
            forLogin={false}
            title="Kodu Doğrula"
            subHeading="E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin."
            buttonText="Devam Et"
            resendText="Kodu Tekrar Gönder"
            changeEmailText="E-posta adresini değiştir"
          />
        )}

        {step === 3 && (
          <RegisterDetailsStep
            input={input}
            inputChangeHandler={inputChangeHandler}
            inputBlurHandler={inputBlurHandler}
            setBlurForFields={setBlurForFields}
            isConflict={isConflict}
            setIsConflict={setIsConflict}
            dispatch={dispatch}
            router={router}
            mutate={postRegisterMutate}
            isPending={postRegisterIsPending}
            isError={postRegisterIsError}
            error={postRegisterError}
          />
        )}
      </div>
    </div>
  );
}
