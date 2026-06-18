"use client";

import Link from "next/link";
import classes from "./Header.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import Image from "next/image";
import SearchBar from "./SearchBar";
import {
  FolderHeart,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Tags,
  User,
  UserPlus,
} from "lucide-react";

export default function Header({ className }) {
  const path = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isInitialized, isLogin } = useSelector((state) => state.auth);
  if (!isInitialized) return null;

  function logoutHandler() {
    dispatch(logout());
    router.replace("/login");
    localStorage.removeItem("token");
  }

  const links = {
    notLoginlinks: [
      {
        href: "/register",
        label: (
          <UserPlus
            className={classes.icon}
            size={30}
            stroke="url(#header-icon-gold)"
          />
        ),
        hideOn: "/register",
        className: "registerLink",
        title: "Kayıt Ol",
      },
      {
        href: "/login",
        label: (
          <LogIn
            className={classes.icon}
            size={30}
            stroke="url(#header-icon-gold)"
          />
        ),
        hideOn: "/login",
        className: "loginLink",
        title: "Giriş Yap",
      },
    ],
    loginLinks: [
      {
        href: "/",
        label: (
          <Home
            className={classes.icon}
            size={30}
            stroke="url(#header-icon-gold)"
          />
        ),
        hideOn: "/",
        className: "homeLink",
        title: "Anasayfa",
      },
    ],
  };

  return (
    <header className={`${classes.header} ${className ? className : ""}`}>
      <nav className={classes.nav}>
        <Link href="/">
          <Image
            className={classes.logo}
            src="/images/logo.svg"
            alt="logo"
            width={55}
            height={55}
            priority
          />
        </Link>
        <ul className={classes.ul}>
          {isLogin && <SearchBar />}
          {links.notLoginlinks
            .filter((notLoginlink) => notLoginlink.hideOn !== path)
            .filter(() => !isLogin)
            .map((notLoginlink, index) => (
              <li className={classes.li} key={index}>
                <Link
                  title={notLoginlink.title}
                  className={classes[notLoginlink.className]}
                  href={notLoginlink.href}
                >
                  {notLoginlink.label}
                </Link>
              </li>
            ))}
          {links.loginLinks
            .filter(() => isLogin)
            .filter((loginLinks) => loginLinks.hideOn !== path)
            .map((loginLink, index) => (
              <li className={classes.li} key={index}>
                <Link
                  title={loginLink.title}
                  className={`${classes[loginLink.className]}${
                    className ? ` ${className}` : ""
                  }`}
                  href={loginLink.href}
                >
                  {loginLink.label}
                </Link>
              </li>
            ))}
          {isLogin && (
            <>
              {isLogin && !path.startsWith("/tum-ilanlar") && (
                <Link
                  className={`${classes.allAdvertsLink}${
                    className ? ` ${className}` : ""
                  }`}
                  title="Tüm İlanlar"
                  href="/tum-ilanlar"
                >
                  <LayoutGrid
                    className={classes.icon}
                    size={30}
                    stroke="url(#header-icon-gold)"
                  />
                </Link>
              )}
              {isLogin && !path.startsWith("/hesabim") && (
                <li className={classes.account}>
                  <Link
                    className={`${classes.accountLink}${
                      className ? ` ${className}` : ""
                    }`}
                    title="Hesabım"
                    href="/hesabim"
                  >
                    <User
                      className={classes.icon}
                      size={30}
                      stroke="url(#header-icon-gold)"
                    />
                  </Link>
                  <ul className={classes.accountMenu}>
                    <li>
                      <Link
                        href="/ilanlarim"
                        className={classes.myAdvertsLink}
                        title="İlanlarım"
                      >
                        <Tags
                          className={classes.juniorIcon}
                          size={20}
                          stroke="url(#header-icon-gold))"
                        />
                        İlanlarım
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/favori-ilanlar"
                        className={classes.favoriteAdvertsLink}
                        title="Favori İlanlarım"
                      >
                        <FolderHeart
                          className={classes.juniorIcon}
                          size={20}
                          stroke="url(#header-icon-gold)"
                        />
                        Favorilerim
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/hesabim"
                        className={classes.juniorAccountLink}
                        title="Hesabım"
                      >
                        <User
                          className={classes.juniorIcon}
                          size={20}
                          stroke="url(#header-icon-gold)"
                        />
                        Hesabım
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/login"
                        onClick={logoutHandler}
                        className={classes.favoriteAdvertsLink}
                        title="Çıkış Yap"
                      >
                        <LogOut
                          className={classes.juniorIcon}
                          size={20}
                          stroke="url(#header-icon-gold)"
                        />
                        Çıkış Yap
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
