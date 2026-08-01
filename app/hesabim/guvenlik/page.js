"use client";

import Input from "@/app/components/Input";
import classes from "./Guvenlik.module.css";
import { AlertCircle, AlertTriangle, ArrowLeft, KeyRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { AnimatePresence } from "framer-motion";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import SecondaryButton from "@/app/components/SecondaryButton";
import SuccessMessage from "@/app/components/SuccessMessage";
import { usePatchPassword } from "@/hooks/PATCH/usePatchPassword";
import { useDeleteAccount } from "@/hooks/DELETE/useDeleteAccount";
import Loading from "@/app/loading";

export default function Guvenlik() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [error, setError] = useState({
    password: false,
    account: false,
  });
  const [isSuccess, setIsSuccess] = useState({
    password: false,
  });
  const deleteAccountInputRef = useRef();

  useEffect(() => {
    let timer;
    if (isSuccess.password) {
      timer = setTimeout(() => {
        setIsSuccess({
          password: false,
        });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess]);

  const [input, setInput] = useState({
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
    mutate: patchPasswordMutate,
    isPending: patchPasswordIsPending,
    isError: patchPasswordIsError,
    error: patchPasswordError,
  } = usePatchPassword();

  const {
    mutate: deleteAccountMutate,
    isPending: deleteAccountIsPending,
    isError: deleteAccountIsError,
    error: deleteAccountError,
  } = useDeleteAccount();

  function changeHandler(event) {
    const { name, value } = event.target;
    setInput((prev) => ({
      ...prev,
      [name]: { ...prev[name], letters: value },
    }));
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
      {},
      {
        onSuccess: () => {
          dispatch(logout());
          router.replace("/login");
        },
        onError: (err) =>
          setError((prev) => ({ ...prev, account: err?.message })),
      },
    );
  }

  if (patchPasswordIsPending) {
    return <Loading />;
  }

  if (patchPasswordIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{patchPasswordError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

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
                text={deleteAccountIsPending ? "Siliniyor..." : "Hesabı Sil"}
                disabled={deleteAccountIsPending}
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
