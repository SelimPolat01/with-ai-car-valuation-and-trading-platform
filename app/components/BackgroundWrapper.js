"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function BackgroundWrapper({ children }) {
  const pathname = usePathname();
  const searcParams = useSearchParams();
  const isPriceOfferPage = pathname.includes("/fiyat-teklifi");
  const isLoginPage = pathname.startsWith("/login");
  const isRegisterPage = pathname.startsWith("/register");
  const isFormHomePage = searcParams.get("mode") === "form";
  const isResetPasswordPage = pathname.startsWith("/sifremi-unuttum");

  const bgClass = isPriceOfferPage
    ? "priceOfferBg"
    : isFormHomePage
      ? "bgForm"
      : isLoginPage
        ? "bgLogin"
        : isRegisterPage
          ? "bgRegister"
          : isResetPasswordPage
            ? "bgResetPasswordBg"
            : "bgAiCarDetector";

  return <div className={bgClass}>{children}</div>;
}
