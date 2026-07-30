"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import VerifyEmailStep from "@/app/components/VerifyEmailStep";
import VerifyOtpStep from "@/app/components/VerifyOtpStep";
import ResetPasswordStep from "@/app/components/ResetPasswordStep";
import classes from "./SifremiUnuttum.module.css";
import { usePostEmailVerify } from "@/hooks/POST/usePostEmailVerify";
import { usePostOtpVerify } from "@/hooks/POST/usePostOtpVerify";
import { usePatchResetPassword } from "@/hooks/PATCH/usePatchResetPassword";

export default function SifremiUnuttum() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isConflict, setIsConflict] = useState(false);

  const [input, setInput] = useState({
    email: { value: "", isBlur: false },
    otp: { value: "", isBlur: false },
    password: { value: "", isBlur: false },
    confirmPassword: { value: "", isBlur: false },
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
    mutate: patchResetPasswordMutate,
    isPending: patchResetPasswordIsPending,
    isError: patchResetPasswordIsError,
    error: patchResetPasswordError,
    reset: resetPatchPassword,
  } = usePatchResetPassword();

  function inputChangeHandler(event) {
    const { name, value } = event.target;

    setInput((prevInput) => ({
      ...prevInput,
      [name]: { value, isBlur: false },
    }));

    if (name === "email" && postEmailVerifyIsError) resetEmailVerify();
    if (name === "otp" && postOtpVerifyIsError) resetOtpVerify();
    if (
      (name === "password" || name === "confirmPassword") &&
      patchResetPasswordIsError
    ) {
      resetPatchPassword();
    }
  }

  function inputBlurHandler(event) {
    const { name } = event.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: { ...prevInput[name], isBlur: true },
    }));
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
    postEmailVerifyMutate({ ...variables, forLogin: true }, options);
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
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
            forLogin={true}
            title="Şifremi Unuttum"
            subHeading="Şifrenizi sıfırlamak için e-posta adresinizi girin."
            buttonText="Bağlantı Gönder"
            backLinkHref="/login"
            backLinkText="Giriş sayfasına dön"
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
            forLogin={true}
            title="Kodu Doğrula"
            subHeading="E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin."
            buttonText="Kodu Doğrula"
            resendText="Kodu Tekrar Gönder"
            changeEmailText="E-posta adresini değiştir"
          />
        )}

        {step === 3 && (
          <ResetPasswordStep
            input={input}
            inputChangeHandler={inputChangeHandler}
            inputBlurHandler={inputBlurHandler}
            setBlurForFields={setBlurForFields}
            router={router}
            mutate={patchResetPasswordMutate}
            isPending={patchResetPasswordIsPending}
            isError={patchResetPasswordIsError}
            error={patchResetPasswordError}
          />
        )}
      </div>
    </div>
  );
}
