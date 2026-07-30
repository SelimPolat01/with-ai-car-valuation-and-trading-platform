"use client";

import Input from "@/app/components/Input";
import classes from "./Guvenlik.module.css";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Mail,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import SecondaryButton from "@/app/components/SecondaryButton";
import SuccessMessage from "@/app/components/SuccessMessage";
import { useGetEmail } from "@/hooks/GET/useGetEmail";
import { usePatchEmail } from "@/hooks/PATCH/usePatchEmail";
import { usePatchPassword } from "@/hooks/PATCH/usePatchPassword";
import { useDeleteAccount } from "@/hooks/DELETE/useDeleteAccount";
import Loading from "@/app/loading";

export default function Guvenlik() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [error, setError] = useState({
    email: false,
    password: false,
    account: false,
  });
  const [isSuccess, setIsSuccess] = useState({
    email: false,
    password: false,
  });
  const deleteAccountInputRef = useRef();

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    let timer;
    if (isSuccess.email || isSuccess.password) {
      timer = setTimeout(() => {
        setIsSuccess({
          email: false,
          password: false,
        });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const [input, setInput] = useState({
    currentEmail: "",
    email: {
      letters: "",
      isBlur: false,
    },
    confirmEmail: {
      letters: "",
      isBlur: false,
    },
    currentPassword: {
      letters: "",
      isBlur: false,
    },
    password: {
      letters: "",
      isBlur: false,
    },
    confirmPassword: {
      letters: "",
      isBlur: false,
    },
  });

  const {
    data: getEmailInfo,
    isLoading: getEmailInfoIsLoading,
    isError: getEmailInfoIsError,
    error: getEmailInfoError,
  } = useGetEmail(token);

  const {
    mutate: patchEmailMutate,
    isPending: patchEmailIsPending,
    isError: patchEmailIsError,
    error: patchEmailError,
  } = usePatchEmail();

  const {
    mutate: patchPasswordMutate,
    isPending: patchPasswordIsPending,
    isError: patchPasswordIsError,
    error: patchPasswordError,
  } = usePatchPassword();

  const {
    mutate: deleteAccountMutate,
    isError: deleteAccountIsError,
    error: deleteAccountError,
  } = useDeleteAccount();

  useEffect(() => {
    if (getEmailInfo) {
      setInput((prev) => ({
        ...prev,
        currentEmail: getEmailInfo?.result?.email || "",
      }));
    }
  }, [getEmailInfo, isSuccess]);

  function changeHandler(event) {
    const { name, value } = event.target;
    setInput((prev) => ({
      ...prev,
      [name]: { ...prev[name], letters: value },
    }));
  }

  function emailSubmitHandler(event) {
    event.preventDefault();
    setError((prev) => ({ ...prev, email: false }));

    if (input.email.letters.trim().length === 0) {
      setError((prev) => ({
        ...prev,
        email: "Lütfen geçerli bir e-posta adresi girip tekrar deneyiniz.",
      }));
      return;
    } else if (input.currentEmail === input.email.letters) {
      setError((prev) => ({
        ...prev,
        email:
          "Yeni e-posta adresiniz mevcut e-posta adresinizle aynı olamaz. Lütfen farklı bir adres giriniz.",
      }));
      return;
    } else if (input.email.letters !== input.confirmEmail.letters) {
      setError((prev) => ({
        ...prev,
        email:
          "Girdiğiniz e-posta adresleri eşleşmiyor. Lütfen tekrar deneyiniz.",
      }));
      return;
    }

    patchEmailMutate(
      {
        token,
        body: {
          email: input.email.letters,
        },
      },
      {
        onSuccess: () => {
          setIsSuccess((prev) => ({ ...prev, email: true }));
          setInput((prev) => ({
            ...prev,
            email: { letters: "", isBlur: false },
            confirmEmail: { letters: "", isBlur: false },
          }));
          setError((prev) => ({ ...prev, email: false }));
        },
        onError: (err) =>
          setError((prev) => ({ ...prev, email: err?.message })),
      },
    );
  }

  function passwordSubmitHandler(event) {
    event.preventDefault();
    setError((prev) => ({ ...prev, password: false }));

    if (input.currentPassword.letters.trim().length < 6) {
      setError((prev) => ({
        ...prev,
        password:
          "Lütfen mevcut parolanızı en az 6 karakter olacak şekilde giriniz.",
      }));
      return;
    }

    if (
      input.password.letters.trim().length < 6 ||
      input.confirmPassword.letters.trim().length < 6
    ) {
      setError((prev) => ({
        ...prev,
        password: "Yeni parolanız en az 6 karakter uzunluğunda olmalıdır.",
      }));
      return;
    }

    if (input.password.letters !== input.confirmPassword.letters) {
      setError((prev) => ({
        ...prev,
        password:
          "Girdiğiniz yeni parolalar eşleşmiyor. Lütfen tekrar deneyiniz.",
      }));
      return;
    }

    patchPasswordMutate(
      {
        token,
        body: {
          currentPassword: input.currentPassword.letters,
          password: input.password.letters,
        },
      },
      {
        onSuccess: () => {
          setIsSuccess((prev) => ({ ...prev, password: true }));
          setInput((prev) => ({
            ...prev,
            currentPassword: { letters: "", isBlur: false },
            confirmPassword: { letters: "", isBlur: false },
            password: { letters: "", isBlur: false },
          }));
          setError((prev) => ({ ...prev, password: false }));
        },
        onError: (err) =>
          setError((prev) => ({ ...prev, password: err?.message })),
      },
    );
  }

  function accountDeleteSubmitHandler(event) {
    event.preventDefault();
    deleteAccountInputRef.current.showModal();
  }

  function confirmDeleteHandler() {
    setError((prev) => ({ ...prev, account: false }));
    deleteAccountMutate(
      { token },
      {
        onSuccess: () => {
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpire");
          router.replace("/admin/login");
        },
        onError: (err) =>
          setError((prev) => ({ ...prev, account: err?.message })),
      },
    );
  }

  if (!token || getEmailInfoIsLoading) {
    return <Loading />;
  }

  if (getEmailInfoIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getEmailInfoError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const emailErrorMessage =
    error.email || (patchEmailIsError && patchEmailError?.message);
  const passwordErrorMessage =
    error.password || (patchPasswordIsError && patchPasswordError?.message);
  const accountErrorMessage =
    error.account || (deleteAccountIsError && deleteAccountError?.message);

  return (
    <div className={classes.div}>
      <AnimatePresence>
        <ConfirmDialog
          text="Bunu yapmak istediğinizden emin misiniz?"
          title="Hesabı Sil"
          confirmRedirect="/login"
          onConfirm={confirmDeleteHandler}
          ref={deleteAccountInputRef}
        />
      </AnimatePresence>
      <h1 className={classes.pageTitle}>Güvenlik Ayarları</h1>
      <div className={classes.settingsContainer}>
        <div className={classes.settingBlock}>
          <div className={classes.blockInfo}>
            <h3>
              <Mail size={20} className={classes.icon} /> E-Posta
            </h3>
            <p>
              Hesabınıza giriş yapmak ve bildirim almak için kullandığınız
              e-posta adresini güncelleyin.
            </p>
          </div>
          {!isSuccess.email ? (
            <form onSubmit={emailSubmitHandler} className={classes.blockForm}>
              <Input
                disabled
                type="email"
                name="currentEmail"
                label="Güncel E-Posta Adresi"
                value={input.currentEmail}
                className={`${classes.input} ${classes.currentEmailInput}`}
              />
              <Input
                type="email"
                name="email"
                label="Yeni E-Posta Adresi"
                value={input.email.letters}
                onChange={changeHandler}
                className={classes.input}
              />
              <Input
                type="email"
                name="confirmEmail"
                label="E-Posta Doğrula"
                value={input.confirmEmail.letters}
                onChange={changeHandler}
                className={classes.input}
              />
              {emailErrorMessage && (
                <div className={classes.errorDiv}>
                  <p>{emailErrorMessage}</p>
                </div>
              )}
              <div className={classes.submitContainer}>
                <SecondaryButton
                  type="submit"
                  text={
                    patchEmailIsPending ? "Güncelleniyor" : "E-Postayı Güncelle"
                  }
                  className={classes.button}
                  disabled={patchEmailIsPending}
                />
              </div>
            </form>
          ) : (
            <SuccessMessage
              key="success-message"
              onClick={() =>
                setIsSuccess((prev) => ({ ...prev, email: false }))
              }
              title="E-Posta Güncellendi"
              text="E-posta adresiniz başarıyla güncellendi. Artık hesabınıza yeni adresinizle giriş yapabilirsiniz."
              buttonText="Kapat"
              className={classes.emailSuccessMessage}
            />
          )}
        </div>

        <div className={classes.settingBlock}>
          <div className={classes.blockInfo}>
            <h3>
              <KeyRound size={20} className={classes.icon} /> Parola Güncelle
            </h3>
            <p>
              Hesabınızın güvenliğini sağlamak için güçlü, uzun ve rastgele bir
              parola kullandığınızdan emin olun.
            </p>
          </div>
          {!isSuccess.password ? (
            <form
              onSubmit={passwordSubmitHandler}
              className={classes.blockForm}
            >
              <Input
                type="password"
                name="currentPassword"
                label="Güncel Parola"
                value={input.currentPassword.letters}
                onChange={changeHandler}
                className={classes.input}
              />
              <div className={classes.row}>
                <Input
                  type="password"
                  name="password"
                  label="Yeni Parola"
                  value={input.password.letters}
                  onChange={changeHandler}
                  className={classes.input}
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  label="Parola Doğrula"
                  value={input.confirmPassword.letters}
                  onChange={changeHandler}
                  className={classes.input}
                />
              </div>
              {passwordErrorMessage && (
                <div className={classes.errorDiv}>
                  <p>{passwordErrorMessage}</p>
                </div>
              )}
              <div className={classes.submitContainer}>
                <SecondaryButton
                  type="submit"
                  text={
                    patchPasswordIsPending
                      ? "Güncelleniyor"
                      : "Parolayı Güncelle"
                  }
                  className={classes.button}
                  disabled={patchPasswordIsPending}
                />
              </div>
            </form>
          ) : (
            <SuccessMessage
              key="success-message"
              onClick={() =>
                setIsSuccess((prev) => ({ ...prev, password: false }))
              }
              title="Parola Güncellendi"
              text="Parolanız başarıyla güncellendi. Artık hesabınıza yeni parolanızla giriş yapabilirsiniz."
              buttonText="Kapat"
              className={classes.passwordSuccessMessage}
            />
          )}
        </div>

        <div className={`${classes.settingBlock} ${classes.dangerZone}`}>
          <div className={classes.blockInfo}>
            <h3 className={classes.dangerText}>
              <AlertTriangle size={20} /> Tehlikeli İşlem
            </h3>
            <p>Hesabınız ve verilerinizle ilgili geri döndürülemez işlemler.</p>
          </div>
          <form
            onSubmit={accountDeleteSubmitHandler}
            className={classes.blockForm}
          >
            <div className={classes.dangerBox}>
              <div className={classes.dangerBoxText}>
                <h4>Hesabı Sil</h4>
                <p>
                  Hesabınızı ve ilanlarınızı kalıcı olarak silin. Bu işlem geri
                  alınamaz.
                </p>
              </div>
              <SecondaryButton
                type="submit"
                className={classes.dangerBtn}
                text="Hesabı Sil"
              />
            </div>
            {accountErrorMessage && (
              <div className={classes.errorDiv}>
                <p>{accountErrorMessage}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
