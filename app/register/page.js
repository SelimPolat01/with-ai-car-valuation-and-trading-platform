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
    email: { value: "", isBlur: false },
    password: { value: "", isBlur: false },
    name: { value: "", isBlur: false },
    surname: { value: "", isBlur: false },
    tel_number: { value: "", isBlur: false },
    city: { value: "", isBlur: false },
    iban: { value: "", isBlur: false },
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

  const isEmailValid = input.email.value.includes("@");
  const isPasswordValid = input.password.value.length >= 6;
  const isNameValid = input.name.value.trim().length !== 0;
  const isSurnameValid = input.surname.value.trim().length !== 0;
  const isTelNumberValid = input.tel_number.value.trim().length === 11;
  const isCityValid = input.city.value.trim().length !== 0;
  const isIbanValid = input.iban.value.trim().length === 26;

  async function submitHandler(event) {
    event.preventDefault();

    setIsLoading(true);

    if (
      !isEmailValid ||
      !isPasswordValid ||
      !isNameValid ||
      !isSurnameValid ||
      !isCityValid ||
      !isIbanValid ||
      !isTelNumberValid
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
        <div className={classes.inputColumn}>
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
          {isConflict && (
            <p className={classes.error}>
              Bu E-posta zaten kayıtlı!{" "}
              <Link
                style={{ color: "blue", textDecoration: "underline" }}
                href="/login"
              >
                Giriş yapmak için tıklayın.
              </Link>
            </p>
          )}
        </div>

        <div className={classes.inputColumn}>
          <Input
            type="password"
            identifier="password"
            className={classes.input}
            onChange={inputChangeHandler}
            onBlur={inputBlurHandler}
            value={input.password.value}
            label="Parola"
            autoComplete="new-password"
          />
          {input.password.isBlur && input.password.value === "" && (
            <p className={classes.error}>Bu alan boş bırakılamaz.</p>
          )}
          {input.password.isBlur &&
            input.password.value !== "" &&
            !isPasswordValid && (
              <p className={classes.error}>
                Lütfen en az 6 karakterden oluşan parola giriniz.
              </p>
            )}
        </div>

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
            {input.name.isBlur && !isNameValid && (
              <p className={classes.error}>Bu alan boş bırakılamaz.</p>
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
            {input.surname.isBlur && !isSurnameValid && (
              <p className={classes.error}>Bu alan boş bırakılamaz.</p>
            )}
          </div>
        </div>

        <div className={classes.inputColumn}>
          <Input
            type="text"
            identifier="iban"
            className={classes.input}
            onChange={inputChangeHandler}
            onBlur={inputBlurHandler}
            value={input.iban.value}
            label="IBAN"
          />
          {input.iban.isBlur && input.iban.value.trim() === "" && (
            <p className={classes.error}>Bu alan boş bırakılamaz.</p>
          )}
          {input.iban.isBlur &&
            input.iban.value.trim() !== "" &&
            !isIbanValid && (
              <p className={classes.error}>
                Lütfen 26 karakterden oluşan IBAN giriniz.
              </p>
            )}
        </div>

        <div className={classes.telCityDiv}>
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
            {input.tel_number.isBlur &&
              input.tel_number.value.trim() === "" && (
                <p className={classes.error}>Bu alan boş bırakılamaz.</p>
              )}
            {input.tel_number.isBlur &&
              input.tel_number.value.trim() !== "" &&
              !isTelNumberValid && (
                <p className={classes.error}>
                  Lütfen geçerli 11 haneli bir telefon giriniz.
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
            {input.city.isBlur && !isCityValid && (
              <p className={classes.error}>Bu alan boş bırakılamaz.</p>
            )}
          </div>
        </div>

        <div className={classes.globalErrorWrapper}>
          {error && <p className={classes.error}>{error}</p>}
        </div>

        <SecondaryButton
          type="submit"
          text={isLoading ? "Yükleniyor..." : "Kayıt ol"}
          className={classes.button}
        />
      </form>
    </div>
  );
}
