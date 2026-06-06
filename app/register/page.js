"use client";
import { useEffect, useState } from "react";
import Input from "@/app/components/Input";
import classes from "./Register.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";
import SecondaryButton from "../components/SecondaryButton";

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConflict, setIsConflict] = useState(false);
  const [input, setInput] = useState({
    email: {
      value: "",
      isBlur: false,
    },
    password: {
      value: "",
      isBlur: false,
    },
    name: {
      value: "",
      isBlur: false,
    },
    surname: {
      value: "",
      isBlur: false,
    },
    tel_number: {
      value: "",
      isBlur: false,
    },
    city: {
      value: "",
      isBlur: false,
    },
    iban: {
      value: "",
      isBlur: false,
    },
  });

  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/");
    }
  }, [router]);

  function inputChangeHandler(event) {
    const { name, value } = event.target;
    setInput((prevInput) => ({
      ...prevInput,
      [name]: { ...prevInput[name], value, isBlur: false },
    }));
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
  const isNameValid = input.name.value.length !== 0 && input.name.isBlur;
  const isSurnameValid =
    input.surname.value.length !== 0 && input.surname.isBlur;
  const isTelNumberValid =
    input.tel_number.value.length === 11 && input.tel_number.isBlur;
  const isCityValid = input.city.value.length !== 0 && input.city.isBlur;
  const isIbanValid = input.iban.value.length === 26 && input.iban.isBlur;

  async function submitHandler(event) {
    event.preventDefault();

    setIsLoading(true);

    if (
      !isEmailValid ||
      !isPasswordValid ||
      !isNameValid ||
      !isSurnameValid ||
      !isCityValid ||
      !isIbanValid
    ) {
      setInput((prevInput) => ({
        email: { ...prevInput.email, isBlur: true },
        password: { ...prevInput.password, isBlur: true },
        name: { ...prevInput.name, isBlur: true },
        surname: { ...prevInput.surname, isBlur: true },
        tel_number: { ...prevInput.tel_number, isBlur: true },
        city: { ...prevInput.city, isBlur: true },
        iban: { ...prevInput.iban, isBlur: true },
      }));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: input.email.value,
            password: input.password.value,
            name: input.name.value,
            surname: input.surname.value,
            tel_number: input.tel_number.value,
            city: input.city.value,
            iban: input.iban.value,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setIsLoading(false);
        if (response.status === 409) {
          localStorage.setItem("email", data.user.email);
          setIsConflict(true);
        } else {
          setError(data.message);
        }
        return;
      }
      const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
      const expire = decodedToken.exp * 1000;
      localStorage.setItem("token", data.token);
      localStorage.setItem("tokenExpire", expire);
      dispatch(loginSuccess(data.user));
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={classes.div}>
      <form className={classes.form} onSubmit={submitHandler}>
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
          <p className="error">Lütfen geçerli bir e-posta giriniz.</p>
        )}
        <Input
          type="password"
          identifier="password"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler}
          value={input.password.value}
          label="Parola"
          autoComplete="new-password"
        />
        {!isPasswordValid && input.password.isBlur && (
          <p className="error">
            Lütfen en az 6 karakterden oluşan parola giriniz.
          </p>
        )}
        {isConflict && (
          <p className="error">
            Bu E-posta zaten kayıtlı!{" "}
            <Link
              style={{ color: "blue", textDecoration: "underline" }}
              href="/login"
            >
              Giriş yapmak için tıklayın.
            </Link>
          </p>
        )}
        <div className={classes.nameSurnameDiv}>
          <div className={classes.inputColumn}>
            <Input
              className={classes.halfInput}
              type="text"
              identifier="name"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.name.value}
              label="İsim"
            />
            {!isNameValid && input.name.isBlur && (
              <p className="error">Lütfen geçerli bir isim giriniz.</p>
            )}
          </div>
          <div className={classes.inputColumn}>
            <Input
              className={classes.halfInput}
              type="text"
              identifier="surname"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.surname.value}
              label="Soyisim"
            />
            {!isSurnameValid && input.surname.isBlur && (
              <p className="error" style={{ margin: "5px 0 0 0" }}>
                Lütfen geçerli bir soyisim giriniz.
              </p>
            )}
          </div>
        </div>
        <Input
          type="text"
          identifier="iban"
          onChange={inputChangeHandler}
          onBlur={inputBlurHandler}
          value={input.iban.value}
          label="IBAN"
        />
        {!isIbanValid && input.iban.isBlur && (
          <p className="error">Lütfen 26 karakterden oluşan IBAN giriniz.</p>
        )}
        <div className={classes.nameSurnameDiv}>
          <div className={classes.inputColumn}>
            <Input
              type="tel"
              className={classes.halfInput}
              identifier="tel_number"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.tel_number.value}
              label="Telefon"
            />
            {!isTelNumberValid && input.tel_number.isBlur && (
              <p className="error">
                Lütfen geçerli bir telefon numarası giriniz.
              </p>
            )}
          </div>
          <div className={classes.inputColumn}>
            <Input
              type="text"
              className={classes.halfInput}
              identifier="city"
              onChange={inputChangeHandler}
              onBlur={inputBlurHandler}
              value={input.city.value}
              label="Şehir"
            />
            {!isCityValid && input.city.isBlur && (
              <p className="error">Lütfen geçerli bir şehir giriniz.</p>
            )}
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <SecondaryButton
          type="submit"
          text={isLoading ? "Yükleniyor..." : "Kayıt ol"}
          className={classes.button}
        />
      </form>
    </div>
  );
}
