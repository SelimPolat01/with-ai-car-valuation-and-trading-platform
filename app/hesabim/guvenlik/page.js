"use client";

import Input from "@/app/components/Input";
import classes from "./Guvenlik.module.css";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
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
import { usePatchTokenDuration } from "@/hooks/PATCH/usePatchTokenDuration";
import { useGetTokenDuration } from "@/hooks/GET/useGetTokenDuration";
import { useDeleteAccount } from "@/hooks/DELETE/useDeleteAccount";

export default function Guvenlik() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [error, setError] = useState({
    email: false,
    password: false,
    tokenDuration: false,
    account: false,
  });
  const [isSuccess, setIsSuccess] = useState({
    email: false,
    password: false,
    tokenDuration: false,
  });
  const [accountDelete, setAccountDelete] = useState(false);
  const deleteAccountInputRef = useRef();

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
    if (isSuccess.email || isSuccess.password || isSuccess.tokenDuration) {
      timer = setTimeout(() => {
        setIsSuccess({
          email: false,
          password: false,
        });
      }, 1000);
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
    tokenDuration: { letters: "1", isBlur: false },
  });

  const {
    data: getEmailInfo,
    isLoading: getEmailInfoIsLoading,
    isError: getEmailInfoIsError,
    error: getEmailInfoError,
  } = useGetEmail(token);
  const {
    data: getTokenDuration,
    isLoading: getTokenDurationIsLoading,
    isError: getTokenDurationIsError,
    error: getTokenDurationError,
  } = useGetTokenDuration(token);
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
    mutate: patchTokenDurationMutate,
    isPending: patchTokenDurationIsPending,
    isError: patchTokenDurationIsError,
    error: patchTokenDurationError,
  } = usePatchTokenDuration();
  const {
    mutate: deleteAccountMutate,
    isPending: deleteAccountIsPending,
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

  useEffect(() => {
    if (getTokenDuration) {
      setInput((prev) => ({
        ...prev,
        tokenDuration: {
          letters: getTokenDuration?.result?.token_duration || "1",
          isBlur: false,
        },
      }));
    }
  }, [getTokenDuration, isSuccess]);

  function changeHandler(event) {
    const { name, value } = event.target;
    setInput((prev) => ({
      ...prev,
      [name]: { ...prev[name], letters: value },
    }));
  }

  function emailSubmitHandler(event) {
    event.preventDefault();
    if (input.email.letters.trim().length == 0) {
      setError({
        email: "Lütfen geçerli bir e-posta adresi girip tekrar deneyiniz.",
      });
      return;
    } else if (input.currentEmail === input.email.letters) {
      setError({
        email:
          "Yeni e-posta adresiniz mevcut e-posta adresinizle aynı olamaz. Lütfen farklı bir adres giriniz.",
      });
      return;
    } else if (input.email.letters !== input.confirmEmail.letters) {
      setError({
        email:
          "Girdiğiniz e-posta adresleri eşleşmiyor. Lütfen tekrar deneyiniz.",
      });
      return;
    }
    const token = localStorage.getItem("token");
    patchEmailMutate(
      {
        token,
        body: {
          email: input.email.letters,
        },
      },
      {
        onSuccess: (data) => {
          setIsSuccess((prev) => ({ ...prev, email: true }));
          setInput((prev) => ({
            ...prev,
            email: { letters: "", isBlur: false },
            confirmEmail: { letters: "", isBlur: false },
          }));
          setError((prev) => ({ ...prev, email: false }));
        },
        onError: (err) => setError({ email: err?.message }),
      },
    );
  }

  function passwordSubmitHandler(event) {
    event.preventDefault();
    if (input.password.letters !== input.confirmPassword.letters) {
      setError({
        password: "Girdiğiniz parolalar eşleşmiyor. Lütfen tekrar deneyiniz.",
      });
      return;
    }
    const token = localStorage.getItem("token");
    patchPasswordMutate(
      {
        token,
        body: {
          currentPassword: input.currentPassword.letters,
          password: input.password.letters,
        },
      },
      {
        onSuccess: (data) => {
          setIsSuccess((prev) => ({ ...prev, password: true }));
          setInput((prev) => ({
            ...prev,
            currentPassword: { letters: "", isBlur: false },
            confirmPassword: { letters: "", isBlur: false },
            password: { letters: "", isBlur: false },
          }));
          setError((prev) => ({ ...prev, password: false }));
        },
        onError: (err) => setError({ password: err?.message }),
      },
    );
  }

  function tokenDurationSubmitHandler(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    patchTokenDurationMutate(
      {
        token,
        body: {
          tokenDuration: input.tokenDuration.letters,
        },
      },
      {
        onSuccess: (data) => {
          setIsSuccess((prev) => ({ ...prev, tokenDuration: true }));
          setError((prev) => ({ ...prev, tokenDuration: false }));
        },
        onError: (err) => setError({ tokenDuration: err?.message }),
      },
    );
  }

  function accountDeleteSubmitHandler(event) {
    event.preventDefault();
    deleteAccountInputRef.current.showModal();
    setAccountDelete(true);
  }

  function confirmDeleteHandler() {
    if (!accountDelete) return;
    const token = localStorage.getItem("token");
    deleteAccountMutate(
      { token },
      {
        onSuccess: (data) => {
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpire");
        },
        onError: (err) =>
          setError((prev) => ({ ...prev, account: err?.message })),
      },
    );
  }

  if (!token || getEmailInfoIsLoading || getTokenDurationIsLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
  }

  if (getEmailInfoIsError || getTokenDurationIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getEmailInfoError?.message || getTokenDurationError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

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
              {error.email && (
                <div className={classes.errorDiv}>
                  <p>{error.email}</p>
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
              {error.password && (
                <div className={classes.errorDiv}>
                  <p>{error.password}</p>
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
        <div className={classes.settingBlock}>
          <div className={classes.blockInfo}>
            <h3>
              <Clock size={20} className={classes.icon} /> Oturum Ayarları
            </h3>
            <p>
              Oturumunuz açık kaldıktan sonra tekrar kimlik doğrulaması yapmanız
              gereken süreyi ayarlayın.
            </p>
          </div>
          {!isSuccess.tokenDuration ? (
            <form
              onSubmit={tokenDurationSubmitHandler}
              className={classes.blockForm}
            >
              <Input
                type="number"
                name="tokenDuration"
                label="Token Geçerlilik Süresi (Gün)"
                min="1"
                max="30"
                className={classes.input}
                value={input.tokenDuration.letters}
                onChange={changeHandler}
              />

              <div className={classes.submitContainer}>
                <SecondaryButton
                  type="submit"
                  text={
                    patchTokenDurationIsPending
                      ? "Güncelleniyor"
                      : "Oturum Süresini Güncelle"
                  }
                  className={classes.button}
                  disabled={patchTokenDurationIsPending}
                />
              </div>
            </form>
          ) : (
            <SuccessMessage
              key="success-message"
              onClick={() =>
                setIsSuccess((prev) => ({ ...prev, tokenDuration: false }))
              }
              title="Oturum Süresi Güncellendi"
              text="Oturum süreniz başarıyla güncellendi. Belirlediğiniz yeni süre, bir sonraki giriş işleminizle birlikte aktif hale gelecektir."
              buttonText="Kapat"
              iconSize={50}
              className={classes.tokenDurationSuccessMessage}
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
          </form>
        </div>
      </div>
    </div>
  );
}
