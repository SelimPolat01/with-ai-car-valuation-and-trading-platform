"use client";

import classes from "./KisiselBilgiler.module.css";
import Input from "@/app/components/Input";
import { AlertCircle, ArrowLeft, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import SecondaryButton from "@/app/components/SecondaryButton";
import { useGetPersonalInfos } from "@/hooks/GET/useGetPersonalInfos";
import { usePatchPersonalInfos } from "@/hooks/PATCH/usePatchPersonalInfos";
import SuccessMessage from "@/app/components/SuccessMessage";
import Loading from "@/app/loading";

const formatIBAN = (value) => {
  if (!value) return value;

  let cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (/^\d/.test(cleaned)) {
    cleaned = "TR" + cleaned;
  } else if (cleaned.length > 0 && !cleaned.startsWith("T")) {
    cleaned = "TR" + cleaned;
  }

  cleaned = cleaned.slice(0, 26);

  const match = cleaned.match(/.{1,4}/g);
  if (match) {
    return match.join(" ");
  }
  return cleaned;
};

export default function Hesabim() {
  const router = useRouter();
  const imageInputRef = useRef();
  const { user } = useSelector((state) => state.auth);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const DEFAULT_BLANK_AVATAR =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22%23e0e0e0%22%2F%3E%3Cpath%20d%3D%22M50%2050c11.046%200%2020-8.954%2020-20s-8.954-20-20-20-20%208.954-20%2020%208.954%2020%2020%2020zm0%2010c-15.012%200-45%207.525-45%2022.5V100h90V82.5C95%2067.525%2065.012%2060%2050%2060z%22%20fill%3D%22%239e9e9e%22%2F%3E%3C%2Fsvg%3E";
  const [imagePreview, setImagePreview] = useState(DEFAULT_BLANK_AVATAR);

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const [input, setInput] = useState({
    name: { letters: "", isBlur: false },
    surname: { letters: "", isBlur: false },
    address: { letters: "", isBlur: false },
    iban: { letters: "", isBlur: false },
  });

  const {
    data: getPersonalInfosData,
    isLoading: getPersonalInfosIsLoading,
    isError: getPersonalInfosIsError,
    error: getPersonalInfosError,
  } = useGetPersonalInfos(user);

  const {
    mutate: patchPersonalInfosMutate,
    isPending: patchPersonalInfosIsPending,
    isError: patchPersonalInfosIsError,
    error: patchPersonalInfosError,
  } = usePatchPersonalInfos();

  useEffect(() => {
    if (getPersonalInfosData) {
      const data = getPersonalInfosData.result || getPersonalInfosData;
      setInput({
        name: {
          letters: data?.name || "",
          isBlur: false,
        },
        surname: {
          letters: data?.surname || "",
          isBlur: false,
        },
        address: {
          letters: data?.address || "",
          isBlur: false,
        },
        iban: {
          letters: formatIBAN(data?.iban || ""),
          isBlur: false,
        },
      });

      if (data?.image_src) {
        const baseUrl = (process.env.NEXT_PUBLIC_URL || "").replace(/\/$/, "");
        const imagePath = data.image_src.startsWith("/")
          ? data.image_src
          : `/${data.image_src}`;

        setImagePreview(`${baseUrl}${imagePath}?v=${new Date().getTime()}`);
      } else {
        setImagePreview(DEFAULT_BLANK_AVATAR);
      }
    }
  }, [getPersonalInfosData]);

  function changeHandler(event) {
    const { name, value } = event.target;
    let finalValue = value;
    if (name === "iban") {
      finalValue = formatIBAN(value);
    }
    setInput((prev) => ({
      ...prev,
      [name]: { ...prev[name], letters: finalValue },
    }));
  }

  function imageChangeHandler(event) {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function submitHandler(event) {
    event.preventDefault();
    const cleanIban = input.iban.letters.replace(/\s/g, "");

    const formData = new FormData();
    formData.append("name", input.name.letters);
    formData.append("surname", input.surname.letters);
    formData.append("address", input.address.letters);
    formData.append("iban", cleanIban);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    patchPersonalInfosMutate(
      {
        body: formData,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setSelectedFile(null);
        },
        onError: (err) => console.log(err?.message),
      },
    );
  }

  if (getPersonalInfosIsLoading) {
    return <Loading />;
  }

  if (getPersonalInfosIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getPersonalInfosError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className={classes.div}>
      <h1 className={classes.pageTitle}>Kişisel Bilgiler</h1>
      <div className={classes.formWrapper}>
        {!isSuccess ? (
          <form onSubmit={submitHandler} className={classes.gridContainer}>
            <div className={classes.mediaColumn}>
              <div className={classes.avatarSection}>
                <div
                  className={classes.avatarPreview}
                  onClick={() => imageInputRef.current.click()}
                >
                  <img
                    src={imagePreview}
                    alt="profile"
                    className={classes.profileImg}
                    onError={() => {
                      setImagePreview(DEFAULT_BLANK_AVATAR);
                    }}
                    style={{
                      width: "180px",
                      height: "180px",
                      borderRadius: "50%",
                    }}
                  />
                  <div className={classes.uploadOverlay}>
                    <UploadCloud />
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className={classes.hiddenInput}
                  ref={imageInputRef}
                  onChange={imageChangeHandler}
                />
              </div>
            </div>
            <div className={classes.textColumn}>
              <div className={classes.row}>
                <Input
                  type="text"
                  name="name"
                  label="İsim"
                  onChange={changeHandler}
                  value={input.name.letters}
                  className={classes.input}
                />
                <Input
                  type="text"
                  name="surname"
                  label="Soyisim"
                  onChange={changeHandler}
                  value={input.surname.letters}
                  className={classes.input}
                />
              </div>
              <div className={classes.row}>
                <Input
                  type="text"
                  name="address"
                  label="Adres"
                  onChange={changeHandler}
                  value={input.address.letters}
                  className={classes.input}
                />
              </div>
              <Input
                type="text"
                name="iban"
                label="IBAN"
                onChange={changeHandler}
                value={input.iban.letters}
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                className={classes.input}
              />
              <div className={classes.submitContainer}>
                {patchPersonalInfosIsError && (
                  <p
                    style={{
                      color: "#ff6363",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    {patchPersonalInfosError?.message ||
                      "Bilgiler güncellenirken bir hata oluştu."}
                  </p>
                )}
                <SecondaryButton
                  type="submit"
                  text={
                    patchPersonalInfosIsPending
                      ? "Kaydediliyor..."
                      : "Bilgileri Güncelle"
                  }
                  className={classes.button}
                  disabled={patchPersonalInfosIsPending}
                />
              </div>
            </div>
          </form>
        ) : (
          <SuccessMessage
            key="success-message"
            onClick={() => setIsSuccess(false)}
            title="Bilgileriniz Güncellendi"
            text="Kişisel bilgileriniz başarıyla güncellendi ve sistemimize kaydedildi."
            buttonText="Kapat"
            className={classes.successMessage}
          />
        )}
      </div>
    </div>
  );
}
