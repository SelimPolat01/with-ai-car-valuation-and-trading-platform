"use client";

import Link from "next/link";
import classes from "./Hesabim.module.css";
import { useEffect, useState } from "react";
import { User, Settings, CarFront, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import { logout } from "@/store/authSlice";
import { useDispatch } from "react-redux";

export default function SettingsLayout({ children }) {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const [token, setToken] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      setToken(currentToken);
    }
  }, []);

  const icons = [User, CarFront, Settings];
  const links = [
    { href: "/hesabim/kisisel-bilgiler", text: "Kişisel Bilgiler" },
    { href: "/hesabim/garajim", text: "Garajım" },
    { href: "/hesabim/guvenlik", text: "Güvenlik" },
  ];

  function logoutHandler() {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }

  if (!mounted) return null;

  return (
    <main className={classes.main}>
      <Header className={classes.header} />
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
                    <Icon />
                    <Link className={classes.link} href={link.href}>
                      {link.text}
                    </Link>
                  </li>
                );
              })}
              <li className={classes.list}>
                <LogOut />
                <Link
                  href="/login"
                  onClick={logoutHandler}
                  className={classes.logoutLink}
                >
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
