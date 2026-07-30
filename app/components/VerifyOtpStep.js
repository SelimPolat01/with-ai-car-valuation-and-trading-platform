"use client";
import { useState, useEffect } from "react";
import Input from "@/app/components/Input";
import SecondaryButton from "@/app/components/SecondaryButton";
import classes from "./VerifyOtpStep.module.css";

export default function VerifyOtpStep({
  input,
  inputChangeHandler,
  inputBlurHandler,
  setBlurForFields,
  nextStep,
  prevStep,
  mutateOtp,
  isPendingOtp,
  isErrorOtp,
  errorOtp,
  mutateEmail,
  isPendingEmail,
  forLogin = false,
  title = "Kodu Doğrula",
  subHeading = "E-posta adresinize gönderilen 6 haneli kodu girin.",
  buttonText = "Kodu Doğrula",
  resendText = "Kodu Tekrar Gönder",
  changeEmailText = "E-posta adresini değiştir",
  initialTimeLeft = 300,
}) {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft);
  const isOtpValid = input.otp.value.trim().length === 6;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  function submitHandler(event) {
    event.preventDefault();
    setBlurForFields(["otp"]);

    if (!isOtpValid) return;

    mutateOtp(
      {
        body: { email: input.email.value, otp: input.otp.value },
        forLogin,
      },
      { onSuccess: () => nextStep() },
    );
  }

  function resendHandler() {
    mutateEmail(
      { body: { email: input.email.value } },
      { onSuccess: () => setTimeLeft(initialTimeLeft) },
    );
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      <div className={classes.pageHeading}>
        <h1>{title}</h1>
        <span className={classes.subHeading}>{subHeading}</span>
      </div>
      <form className={classes.form} onSubmit={submitHandler}>
        <div className={classes.inputColumn}>
          <Input
            className={classes.input}
            type="text"
            identifier="otp"
            name="otp"
            onChange={inputChangeHandler}
            onBlur={inputBlurHandler}
            value={input.otp.value}
            label="Doğrulama Kodu"
            maxLength="6"
            autoFocus
          />
          {input.otp.isBlur && input.otp.value.trim() === "" && (
            <p className={classes.error}>Kod alanı boş bırakılamaz.</p>
          )}
          {input.otp.isBlur && input.otp.value.trim() !== "" && !isOtpValid && (
            <p className={classes.error}>Kod 6 haneli olmalıdır.</p>
          )}
          {isErrorOtp && (
            <p className={classes.error}>
              {errorOtp?.message || "Kod doğrulanamadı."}
            </p>
          )}
        </div>

        <div className={classes.timerContainer}>
          {timeLeft > 0 ? (
            <p className={classes.timerText}>
              Kalan Süre: <strong>{formatTime(timeLeft)}</strong>
            </p>
          ) : (
            <p className={classes.timerExpiredText}>Kodun süresi doldu!</p>
          )}
        </div>

        <SecondaryButton
          type="submit"
          text={isPendingOtp ? "Doğrulanıyor..." : buttonText}
          className={classes.button}
          disabled={isPendingOtp || timeLeft === 0}
        />

        {timeLeft === 0 && (
          <button
            type="button"
            onClick={resendHandler}
            className={classes.textButton}
            disabled={isPendingEmail}
          >
            {isPendingEmail ? "Gönderiliyor..." : resendText}
          </button>
        )}
        <button type="button" onClick={prevStep} className={classes.textButton}>
          {changeEmailText}
        </button>
      </form>
    </>
  );
}
