"use client";

import Link from "next/link";
import classes from "./Hesabim.module.css";
import {
  User,
  Settings,
  CarFront,
  LogOut,
  CalendarClock,
  BellDot,
  Handshake,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/store/authSlice";
import { useDispatch } from "react-redux";

export default function SettingsLayout({ children }) {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const icons = [Handshake, CalendarClock, BellDot, CarFront, User, Settings];
  const links = [
    { href: "/hesabim/alis-satis-islemleri", text: "Alış-Satış İşlemleri" },
    { href: "/hesabim/randevular", text: "Randevular" },
    { href: "/hesabim/bildirimler", text: "Bildirimler" },
    { href: "/hesabim/garaj", text: "Garaj" },
    { href: "/hesabim/kisisel-bilgiler", text: "Kişisel Bilgiler" },
    { href: "/hesabim/guvenlik", text: "Güvenlik Ayarları" },
  ];

  function logoutHandler() {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }

  return (
    <main className={classes.main}>
      <div className={classes.wrapper}>
        <div className={classes.linkDiv}>
          <div className={classes.linkContainer}>
            <ul className={classes.linkMenu}>
              {links.map((link, index) => {
                const Icon = icons[index];
                return (
                  <li
                    className={`${classes.list} ${pathName.startsWith(link.href) ? classes.active : ""}`}
                    key={index}
                  >
                    <Link className={classes.link} href={link.href}>
                      <Icon />
                      {link.text}
                    </Link>
                  </li>
                );
              })}
              <li className={classes.list}>
                <Link
                  href="/login"
                  onClick={logoutHandler}
                  className={`${classes.logoutLink} ${classes.link}`}
                >
                  <LogOut />
                  Çıkış Yap
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={classes.mainContent}>{children}</div>
      </div>
    </main>
  );
}
