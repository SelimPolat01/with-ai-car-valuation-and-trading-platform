import Link from "next/link";
import Input from "@/app/components/Input";
import SecondaryButton from "@/app/components/SecondaryButton";
import classes from "./VerifyEmailStep.module.css";

export default function VerifyEmailStep({
  input,
  inputChangeHandler,
  inputBlurHandler,
  setBlurForFields,
  nextStep,
  isConflict,
  setIsConflict,
  mutate,
  isPending,
  isError,
  error,
  forLogin = false,
  title = "Kayıt Ol",
  subHeading = "Kayıt olmak için e-posta adresinizi girin.",
  buttonText = "Devam Et",
  backLinkHref = "/login",
  backLinkText = "Zaten hesabınız var mı? Giriş Yapın",
}) {
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    input.email.value.trim(),
  );

  function submitHandler(event) {
    event.preventDefault();
    setBlurForFields(["email"]);

    if (!isEmailValid || input.email.value.trim().length === 0) return;

    mutate(
      { body: { email: input.email.value }, forLogin },
      {
        onSuccess: () => nextStep(),
        onError: (err) => {
          if (err?.status === 409 || err?.message?.includes("kullanımda")) {
            setIsConflict(true);
          }
        },
      },
    );
  }

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
            identifier="email"
            name="email"
            onChange={inputChangeHandler}
            onBlur={inputBlurHandler}
            value={input.email.value}
            label="E-posta"
            autoFocus
          />
          {input.email.isBlur && input.email.value.trim() === "" && (
            <p className={classes.error}>Bu alan boş bırakılamaz.</p>
          )}
          {input.email.isBlur &&
            input.email.value.trim() !== "" &&
            !isEmailValid && (
              <p className={classes.error}>
                Lütfen geçerli bir e-posta giriniz.
              </p>
            )}
          {isError && !isConflict && (
            <p className={classes.error}>
              {error?.message || "Bir hata oluştu."}
            </p>
          )}
          {isConflict && (
            <p className={classes.error}>
              Bu E-posta zaten kayıtlı! <Link href="/login">Giriş yapın.</Link>
            </p>
          )}
        </div>
        <SecondaryButton
          type="submit"
          text={isPending ? "Gönderiliyor..." : buttonText}
          className={classes.button}
          disabled={isPending}
        />
        {backLinkHref && backLinkText && (
          <Link href={backLinkHref} className={classes.backLink}>
            {backLinkText}
          </Link>
        )}
      </form>
    </>
  );
}
