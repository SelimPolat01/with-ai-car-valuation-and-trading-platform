"use client";

import { useEffect, useState } from "react";
import Input from "@/app/components/Input";
import classes from "./Login.module.css";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";

export default function Login() {
  const [input, setInput] = useState({
    email: {
      value: "",
      isBlur: false,
    },
    password: {
      value: "",
      isBlur: false,
    },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/");
    }
  }, []);

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
    if (
      error === "Girilen e-postaya ait kullanıcı bulunamadı." &&
      name === "email"
    ) {
      setError("");
    }
    if (error === "Girilen parola hatalı." && name === "password") {
      setError("");
    }
  }

  function inputBlurHandler(event) {
    const { name } = event.target;

    setInput((prevInput) => ({
      ...prevInput,
      [name]: { ...prevInput[name], isBlur: true },
    }));
  }

  const isEmailValid = input.email.value.includes("@") && input.email.isBlur;
  const isPasswordValid =
    input.password.value.length >= 6 && input.password.isBlur;

  async function submitHandler(event) {
    event.preventDefault();
    if (input.email.value.trim().length === 0) return;
    setLoading(true);
    setInput((prevInput) => ({
      email: { ...prevInput.email, isBlur: true },
      password: { ...prevInput.password, isBlur: true },
    }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email.value,
          password: input.password.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      const expire = new Date().getTime() + 60 * 60 * 1000;
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpire", expire);
      dispatch(loginSuccess(data.user));
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={classes.div}>
      <form onSubmit={submitHandler}>
        <Input
          className={classes.input}
          type="text"
          identifier="email"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler}
          value={input.email.value}
          label="E-posta"
          autoFocus
          autoComplete="email"
        />
        {!isEmailValid && input.email.isBlur && (
          <p className="error">Lütfen geçerli bir e-posta girin.</p>
        )}
        {error === "Girilen e-postaya ait kullanıcı bulunamadı." && (
          <p className="error">{error}</p>
        )}
        <Input
          type="password"
          identifier="password"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler}
          value={input.password.value}
          label="Parola"
          className={classes.input}
          autoComplete="current-password"
        />
        {!isPasswordValid && input.password.isBlur && (
          <p className="error">Parola en az 6 karakterden oluşmalı.</p>
        )}
        {error === "Girilen parola hatalı." && <p className="error">{error}</p>}
        <Button
          className={classes.button}
          type="submit"
          text={loading ? "Yükleniyor..." : "Giriş Yap"}
        />
      </form>
    </div>
  );
}
