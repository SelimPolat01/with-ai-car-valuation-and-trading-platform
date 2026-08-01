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
  Receipt,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { usePostLogout } from "@/hooks/POST/usePostLogout";

export default function SettingsLayout({ children }) {
  const pathName = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { mutate: postLogoutMutate, isPending: postLogoutIsPending } =
    usePostLogout();

  const icons = [
    Handshake,
    CalendarClock,
    BellDot,
    CarFront,
    User,
    Settings,
    Receipt,
  ];

  const links = [
    { href: "/hesabim/alis-satis-islemleri", text: "Alış-Satış İşlemleri" },
    { href: "/hesabim/randevular", text: "Randevular" },
    { href: "/hesabim/bildirimler", text: "Bildirimler" },
    { href: "/hesabim/garaj", text: "Garaj" },
    { href: "/hesabim/kisisel-bilgiler", text: "Kişisel Bilgiler" },
    { href: "/hesabim/guvenlik", text: "Güvenlik Ayarları" },
    { href: "/hesabim/odemeler-faturalar", text: "Ödemeler Faturalar" },
  ];

  function logoutHandler(event) {
    event.preventDefault();

    if (!user) {
      router.replace("/login");
      return;
    }

    postLogoutMutate(null, {
      onSuccess: () => {
        dispatch(logout());
        router.replace("/login");
      },
      onError: (error) => {
        console.error("Çıkış yapılırken bir hata oluştu:", error);
      },
    });
  }

  return (
    <div className={classes.div}>
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={classes.linkDiv}
      >
        <div className={classes.linkContainer}>
          <ul className={classes.linkMenu}>
            {links.map((link, index) => {
              const Icon = icons[index];
              return (
                <li
                  className={`${classes.list} ${
                    pathName.startsWith(link.href) ? classes.active : ""
                  }`}
                  key={index}
                >
                  <Link className={classes.link} href={link.href}>
                    <Icon size={22} className={classes.icon} />
                    <span className={classes.linkText}>{link.text}</span>
                  </Link>
                </li>
              );
            })}

            <li className={classes.list}>
              <button
                onClick={logoutHandler}
                disabled={postLogoutIsPending}
                className={`${classes.logoutButton} ${classes.link}`}
              >
                <LogOut size={22} className={classes.icon} />
                <span className={classes.logoutText}>
                  {postLogoutIsPending ? "Çıkış Yapılıyor..." : "Çıkış Yap"}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathName}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={classes.mainContent}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
