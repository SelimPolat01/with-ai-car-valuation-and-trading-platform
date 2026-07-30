"use client";
import Input from "@/app/components/Input";
import SecondaryButton from "@/app/components/SecondaryButton";
import classes from "./ResetPasswordStep.module.css";

export default function ResetPasswordStep({
  input,
  inputChangeHandler,
  inputBlurHandler,
  setBlurForFields,
  router,
  mutate,
  isPending,
  isError,
  error,
  title = "Yeni Şifre Belirle",
  subHeading = "Lütfen hesabınız için yeni bir şifre girin.",
  buttonText = "Şifreyi Güncelle",
}) {
  const isPasswordValid = input.password.value.trim().length >= 6;
  const isConfirmPasswordValid =
    input.password.value === input.confirmPassword.value;

  function passwordSubmitHandler(event) {
    event.preventDefault();
    setBlurForFields(["password", "confirmPassword"]);

    if (!isPasswordValid || !isConfirmPasswordValid) return;

    mutate(
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
      },
    );
  }

  return (
    <>
      <div className={classes.pageHeading}>
        <h1>{title}</h1>
        <span className={classes.subHeading}>{subHeading}</span>
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
            <p className={classes.error}>Şifre en az 6 karakter olmalıdır.</p>
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
            <p className={classes.error}>Girdiğiniz şifreler eşleşmiyor.</p>
          )}
          {isError && (
            <p className={classes.error}>
              {error?.message || "Şifre güncellenemedi."}
            </p>
          )}
        </div>

        <SecondaryButton
          type="submit"
          text={isPending ? "Kaydediliyor..." : buttonText}
          className={classes.button}
          disabled={isPending}
        />
      </form>
    </>
  );
}
