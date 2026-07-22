"use client";

import { usePathname } from "next/navigation";

export default function BackgroundWrapper({ children }) {
  const pathname = usePathname();
  const isFiyatTeklifiPage = pathname.includes("/fiyat-teklifi");
  const bgClass = isFiyatTeklifiPage ? "priceOfferBg" : "";

  return <div className={bgClass}>{children}</div>;
}
