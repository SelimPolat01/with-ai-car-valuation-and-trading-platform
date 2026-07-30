"use client";
import { useEffect, useState } from "react";
import Input from "@/app/components/Input";
import classes from "./SifremiUnuttum.module.css";
import SecondaryButton from "../components/SecondaryButton";
import Link from "next/link";
import { usePostEmailVerify } from "@/hooks/POST/usePostEmailVerify";
import { usePostOtpVerify } from "@/hooks/POST/usePostOtpVerify";
import { usePatchResetPassword } from "@/hooks/PATCH/usePatchResetPassword";
import { useRouter } from "next/navigation";

export default function SifremiUnuttum() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(300);
  const [input, setInput] = useState({
    email: { value: "", isBlur: false },
    otp: { value: "", isBlur: false },
    password: { value: "", isBlur: false },
    confirmPassword: { value: "", isBlur: false },
  });

  useEffect(() => {
    let interval = null;
    if (step === 2 && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const {
    mutate: postEmailVerifyMutate,
    isPending: postEmailVerifyIsPending,
    isError: postEmailVerifyIsError,
    error: postEmailVerifyError,
  } = usePostEmailVerify();

  const {
    mutate: postOtpVerifyMutate,
    isPending: postOtpVerifyIsPending,
    isError: postOtpVerifyIsError,
    error: postOtpVerifyError,
  } = usePostOtpVerify();

  const {
    mutate: patchResetPasswordMutate,
    isPending: patchResetPasswordIsPending,
    isError: patchResetPasswordIsError,
    error: patchResetPasswordError,
  } = usePatchResetPassword();

  const isEmailValid = input.email.value.includes("@");
  const isOtpValid = input.otp.value.trim().length === 6;
  const isPasswordValid = input.password.value.trim().length >= 6;
  const isConfirmPasswordValid =
    input.password.value === input.confirmPassword.value;

  function inputChangeHandler(event) {
    const { name, value } = event.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: { value, isBlur: false },
    }));
  }

  function inputBlurHandler(event) {
    const { name } = event.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: { ...prevInput[name], isBlur: true },
    }));
  }

  function emailSubmitHandler(event) {
    event.preventDefault();
    setInput((prevInput) => ({
      ...prevInput,
      email: { ...prevInput.email, isBlur: true },
    }));

    if (!isEmailValid || input.email.value.trim().length === 0) return;

    postEmailVerifyMutate(
      { body: { email: input.email.value } },
      {
        onSuccess: () => {
          setTimeLeft(300);
          setStep(2);
        },
        onError: (err) => console.log(err?.message),
      },
    );
  }

  function otpSubmitHandler(event) {
    event.preventDefault();
    setInput((prev) => ({ ...prev, otp: { ...prev.otp, isBlur: true } }));

    if (!isOtpValid) return;

    postOtpVerifyMutate(
      {
        body: {
          email: input.email.value,
          otp: input.otp.value,
        },
      },
      {
        onSuccess: () => setStep(3),
        onError: (err) => console.log(err?.message),
      },
    );
  }

  function passwordSubmitHandler(event) {
    event.preventDefault();
    setInput((prev) => ({
      ...prev,
      password: { ...prev.password, isBlur: true },
      confirmPassword: { ...prev.confirmPassword, isBlur: true },
    }));

    if (!isPasswordValid || !isConfirmPasswordValid) return;

    patchResetPasswordMutate(
      {
        body: {
          email: input.email.value,
          otp: input.otp.value,
          newPassword: input.password.value,
        },
      },
      {
        onSuccess: () => {
          router.replace("/login");
        },
        onError: (err) => console.log(err?.message),
      },
    );
  }

  function resendOtpHandler() {
    postEmailVerifyMutate(
      { body: { email: input.email.value } },
      {
        onSuccess: () => {
          setTimeLeft(300);
        },
      },
    );
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  return (
    <div className={classes.container}>
      <div className={classes.card}>
        {step === 1 && (
          <>
            <div className={classes.pageHeading}>
              <h1>Şifremi Unuttum</h1>
              <span className={classes.subHeading}>
                Şifrenizi sıfırlamak için e-posta adresinizi girin.
              </span>
            </div>

            <form onSubmit={emailSubmitHandler} className={classes.form}>
              <div className={classes.inputColumn}>
                <Input
                  className={classes.input}
                  type="text"
                  identifier="email"
                  name="email"
                  onChange={inputChangeHandler}
                  onBlur={inputBlurHandler}
                  value={input.email.value}
                  label="E-posta"
                  autoFocus
                  autoComplete="email"
                />
                {input.email.isBlur &&
                  input.email.value.trim().length === 0 && (
                    <p className={classes.error}>
                      E-posta alanı boş bırakılamaz.
                    </p>
                  )}
                {!isEmailValid &&
                  input.email.isBlur &&
                  input.email.value.trim().length > 0 && (
                    <p className={classes.error}>
                      Lütfen geçerli bir e-posta girin.
                    </p>
                  )}
                {postEmailVerifyIsError && (
                  <p className={classes.error}>
                    {postEmailVerifyError?.message || "Bir hata oluştu."}
                  </p>
                )}
              </div>

              <SecondaryButton
                type="submit"
                text={
                  postEmailVerifyIsPending
                    ? "Gönderiliyor..."
                    : "Bağlantı Gönder"
                }
                className={classes.button}
                disabled={postEmailVerifyIsPending}
              />

              <Link href="/login" className={classes.backLink}>
                Giriş sayfasına dön
              </Link>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className={classes.pageHeading}>
              <h1>Kodu Doğrula</h1>
              <span className={classes.subHeading}>
                E-posta adresinize gönderilen 6 haneli kodu girin.
              </span>
            </div>

            <form onSubmit={otpSubmitHandler} className={classes.form}>
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
                  autoFocus
                  maxLength="6"
                />
                {input.otp.isBlur && input.otp.value.trim().length === 0 && (
                  <p className={classes.error}>Kod alanı boş bırakılamaz.</p>
                )}
                {!isOtpValid &&
                  input.otp.isBlur &&
                  input.otp.value.trim().length > 0 && (
                    <p className={classes.error}>Kod 6 haneli olmalıdır.</p>
                  )}
                {postOtpVerifyIsError && (
                  <p className={classes.error}>
                    {postOtpVerifyError?.message || "Kod doğrulanamadı."}
                  </p>
                )}
              </div>

              <div className={classes.timerContainer}>
                {timeLeft > 0 ? (
                  <p className={classes.timerText}>
                    Kalan Süre: <strong>{formatTime(timeLeft)}</strong>
                  </p>
                ) : (
                  <p className={classes.error}>Kodun süresi doldu!</p>
                )}
              </div>

              <SecondaryButton
                type="submit"
                text={
                  postOtpVerifyIsPending ? "Doğrulanıyor..." : "Kodu Doğrula"
                }
                className={classes.button}
                disabled={postOtpVerifyIsPending || timeLeft === 0}
              />

              {timeLeft === 0 && (
                <button
                  type="button"
                  onClick={resendOtpHandler}
                  className={classes.textButton}
                  disabled={postEmailVerifyIsPending}
                >
                  {postEmailVerifyIsPending
                    ? "Gönderiliyor..."
                    : "Kodu Tekrar Gönder"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setStep(1)}
                className={classes.textButton}
              >
                E-posta adresini değiştir
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <div className={classes.pageHeading}>
              <h1>Yeni Şifre Belirle</h1>
              <span className={classes.subHeading}>
                Lütfen hesabınız için yeni bir şifre girin.
              </span>
            </div>

            <form onSubmit={passwordSubmitHandler} className={classes.form}>
              <div className={classes.inputColumn}>
                <Input
                  className={classes.input}
                  type="password"
                  identifier="password"
                  name="password"
                  onChange={inputChangeHandler}
                  onBlur={inputBlurHandler}
                  value={input.password.value}
                  label="Yeni Şifre"
                  autoFocus
                />
                {input.password.isBlur && !isPasswordValid && (
                  <p className={classes.error}>
                    Şifre en az 6 karakter olmalıdır.
                  </p>
                )}
              </div>

              <div className={classes.inputColumn}>
                <Input
                  className={classes.input}
                  type="password"
                  identifier="confirmPassword"
                  name="confirmPassword"
                  onChange={inputChangeHandler}
                  onBlur={inputBlurHandler}
                  value={input.confirmPassword.value}
                  label="Yeni Şifre Tekrar"
                />
                {input.confirmPassword.isBlur && !isConfirmPasswordValid && (
                  <p className={classes.error}>
                    Girdiğiniz şifreler eşleşmiyor.
                  </p>
                )}
                {patchResetPasswordIsError && (
                  <p className={classes.error}>
                    {patchResetPasswordError?.message ||
                      "Şifre güncellenemedi."}
                  </p>
                )}
              </div>

              <SecondaryButton
                type="submit"
                text={
                  patchResetPasswordIsPending
                    ? "Kaydediliyor..."
                    : "Şifreyi Güncelle"
                }
                className={classes.button}
                disabled={patchResetPasswordIsPending}
              />
            </form>
          </>
        )}
      </div>
    </div>
  );
}
