"use client";
import { useEffect, useState } from "react";
import Input from "@/app/components/Input";
import classes from "./Login.module.css";
import { useRouter } from "next/navigation";
import SecondaryButton from "../components/SecondaryButton";
import Link from "next/link";
import { usePostLogin } from "@/hooks/POST/usePostLogin";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";

export default function Login() {
  const [input, setInput] = useState({
    email: { value: "", isBlur: false },
    password: { value: "", isBlur: false },
  });

  const router = useRouter();
  const dispatch = useDispatch();

  const {
    mutate: postLoginMutate,
    isPending: postLoginIsPending,
    isError: postLoginIsError,
    error: postLoginError,
    reset: resetLoginMutation,
  } = usePostLogin();

  useEffect(() => {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");

    if (token) {
      router.replace("/");
    }
  }, [router]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");

    if (storedEmail) {
      setInput((prevInput) => ({
        ...prevInput,
        email: { value: storedEmail, isBlur: false },
        password: { value: "", isBlur: false },
      }));

      localStorage.removeItem("email");
    }
  }, []);

  function inputChangeHandler(event) {
    const { name, value } = event.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: { value, isBlur: false },
    }));

    if (postLoginIsError) {
      resetLoginMutation();
    }
  }

  function inputBlurHandler(event) {
    const { name } = event.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: { ...prevInput[name], isBlur: true },
    }));
  }

  const isEmailValid = input.email.value.includes("@");
  const isPasswordValid = input.password.value.length >= 6;

  async function submitHandler(event) {
    event.preventDefault();

    setInput((prevInput) => ({
      email: { ...prevInput.email, isBlur: true },
      password: { ...prevInput.password, isBlur: true },
    }));

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    const formData = new FormData(event.target);
    const isRememberMe = formData.get("rememberMe") === "on";

    postLoginMutate(
      {
        body: {
          email: input.email.value,
          password: input.password.value,
        },
      },
      {
        onSuccess: (data) => {
          const token = data?.result?.token;

          const decodedToken = JSON.parse(atob(token.split(".")[1]));
          const expire = decodedToken.exp * 1000;

          if (isRememberMe) {
            localStorage.setItem("token", token);
            localStorage.setItem("tokenExpire", expire.toString());
          } else {
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("tokenExpire", expire.toString());
          }

          dispatch(loginSuccess(data?.result?.user));
          router.replace("/");
        },
      },
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.pageHeading}>
        <h1>Giriş Yap</h1>
        <span className="subHeading">Tekrar Hoşgeldiniz!</span>
      </div>
      <div className={classes.div}>
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
              autoComplete="email"
            />
            {input.email.isBlur && input.email.value.trim().length === 0 && (
              <p className={classes.error}>E-posta alanı boş bırakılamaz.</p>
            )}
            {!isEmailValid &&
              input.email.isBlur &&
              input.email.value.trim().length > 0 && (
                <p className={classes.error}>
                  Lütfen geçerli bir e-posta girin.
                </p>
              )}
            {postLoginIsError &&
              postLoginError?.message ===
                "Girilen e-postaya ait kullanıcı bulunamadı." && (
                <p className={classes.error}>{postLoginError.message}</p>
              )}
          </div>

          <div className={classes.inputColumn}>
            <Input
              type="password"
              identifier="password"
              name="password"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.password.value}
              label="Parola"
              className={classes.input}
              autoComplete="current-password"
            />
            {input.password.isBlur &&
              input.password.value.trim().length === 0 && (
                <p className={classes.error}>Parola alanı boş bırakılamaz.</p>
              )}
            {!isPasswordValid &&
              input.password.isBlur &&
              input.password.value.trim().length > 0 && (
                <p className={classes.error}>
                  Parola en az 6 karakterden oluşmalı.
                </p>
              )}
            {postLoginIsError &&
              postLoginError?.message === "Girilen parola hatalı." && (
                <p className={classes.error}>{postLoginError.message}</p>
              )}
            {postLoginIsError &&
              postLoginError?.message !==
                "Girilen e-postaya ait kullanıcı bulunamadı." &&
              postLoginError?.message !== "Girilen parola hatalı." && (
                <p className={classes.error}>
                  {postLoginError?.message || "Bir hata oluştu."}
                </p>
              )}
          </div>

          <div className={classes.rememberMeForgetPasswordDiv}>
            <div className={classes.checkboxWrapper}>
              <input
                className={classes.rememberMeCheckbox}
                id="remember-me"
                name="rememberMe"
                type="checkbox"
              />
              <label htmlFor="remember-me" className={classes.checkboxLabel}>
                Oturumu açık tut
              </label>
            </div>
            <Link
              className={classes.forgetPasswordLink}
              href="/sifremi-unuttum"
            >
              Şifremi unuttum
            </Link>
          </div>

          <SecondaryButton
            type="submit"
            text={postLoginIsPending ? "Giriş Yapılıyor..." : "Giriş Yap"}
            className={classes.button}
            disabled={postLoginIsPending}
          />
        </form>
      </div>
    </div>
  );
}
