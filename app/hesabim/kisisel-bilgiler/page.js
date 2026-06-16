"use client";

import classes from "./KisiselBilgiler.module.css";
import Input from "@/app/components/Input";
import { UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SecondaryButton from "@/app/components/SecondaryButton";
import { useGetPersonalInfos } from "@/hooks/GET/useGetPersonalInfos";
import { usePatchPersonalInfos } from "@/hooks/PATCH/usePatchPersonalInfos";
import SuccessMessage from "@/app/components/SuccessMessage";

export default function Hesabim() {
  const router = useRouter();
  const imageInputRef = useRef();
  const [token, setToken] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const DEFAULT_BLANK_AVATAR =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iI2UwZTBlMCIvPjxwYXRoIGQ9Ik01MCA1MGMxMS4wNDYgMCAyMC04Ljk1NCAyMC0yMHMtOC45NTQtMjAtMjAtMjAtMjAtMjAgOC45NTQtMjAgMjAgOC45NTQgMjAgMjAgMjB6bTAgMTBjLTE1LjAxMiAwLTQ1IDcuNTI1LTQ1IDIyLjVWMTAwaDkwVjgyLjVDOTUgNjcuNTI1IDY1LjAxMiA2MCA1MCA2MHoiIGZpbGw9IiM5ZTllOWUiLz48L3N2Zz4=";

  const [imagePreview, setImagePreview] = useState(DEFAULT_BLANK_AVATAR);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/admin/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        setIsSuccess(false);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const [input, setInput] = useState({
    name: { letters: "", isBlur: false },
    surname: { letters: "", isBlur: false },
    city: { letters: "", isBlur: false },
    iban: { letters: "", isBlur: false },
  });

  const {
    data: getPersonalInfosData,
    isLoading: getPersonalInfosIsLoading,
    isError: getPersonalInfosIsError,
    error: getPersonalInfosError,
  } = useGetPersonalInfos(token);

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
        city: {
          letters: data?.city || "",
          isBlur: false,
        },
        iban: {
          letters:
            data?.iban && data.iban.startsWith("TR")
              ? data.iban.substring(2)
              : data?.iban || "",
          isBlur: false,
        },
      });

      if (data?.image_src) {
        setImagePreview(
          `${process.env.NEXT_PUBLIC_URL}${data.image_src}?v=${new Date().getTime()}`,
        );
      } else {
        setImagePreview(DEFAULT_BLANK_AVATAR);
      }
    }
  }, [getPersonalInfosData]);

  function changeHandler(event) {
    const { name, value } = event.target;
    let finalValue = value;
    if (name === "iban") {
      const rawNumbers = value.replace(/[^0-9]/g, "");
      finalValue = rawNumbers.substring(0, 24);
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
    const token = localStorage.getItem("token");
    const finalIban = input.iban.letters ? `TR${input.iban.letters}` : "";

    const formData = new FormData();
    formData.append("name", input.name.letters);
    formData.append("surname", input.surname.letters);
    formData.append("city", input.city.letters);
    formData.append("iban", finalIban);
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    patchPersonalInfosMutate(
      {
        token,
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
                  name="city"
                  label="Şehir"
                  onChange={changeHandler}
                  value={input.city.letters}
                  className={classes.input}
                />
              </div>
              <Input
                type="text"
                name="iban"
                label="IBAN"
                onChange={changeHandler}
                value={`TR${input.iban.letters}`}
                className={classes.input}
              />
              <div className={classes.submitContainer}>
                <SecondaryButton
                  type="submit"
                  text={
                    patchPersonalInfosIsPending
                      ? "Kaydediliyor..."
                      : "Save Changes"
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
