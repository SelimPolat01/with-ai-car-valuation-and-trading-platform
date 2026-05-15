"use client";

import Link from "next/link";
import classes from "./Header.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import Image from "next/image";
import SearchBar from "./SearchBar";

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
        label: <i className="bi bi-person-plus"></i>,
        hideOn: "/register",
        className: "registerLink",
        title: "Kayıt Ol",
      },
      {
        href: "/login",
        label: <i className="bi bi-box-arrow-in-right"></i>,
        hideOn: "/login",
        className: "loginLink",
        title: "Giriş Yap",
      },
    ],
    loginLinks: [
      {
        href: "/",
        label: <i className="bi bi-house"></i>,
        hideOn: "/",
        className: "homeLink",
        title: "Anasayfa",
      },
    ],
  };

  return (
    <header>
      <nav className={classes.nav}>
        <Link href="/">
          <Image
            className={classes.logo}
            src="/images/logo1.png"
            alt="logo"
            width={75}
            height={60}
            priority
          />
        </Link>{" "}
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
              <Link
                className={`${classes.allAdvertsLink}${
                  className ? ` ${className}` : ""
                }`}
                title="Tüm İlanlar"
                href="/tum-ilanlar"
              >
                <i className="bi bi-card-list"></i>
              </Link>
              <li className={classes.account}>
                <Link
                  className={`${classes.accountLink}${
                    className ? ` ${className}` : ""
                  }`}
                  title="Hesabım"
                  href="/hesabim"
                >
                  <i className="bi bi-person"></i>
                </Link>
                <ul className={classes.accountMenu}>
                  <Link
                    href="/ilanlarim"
                    className={classes.myAdvertsLink}
                    title="İlanlarım"
                  >
                    <i className="bi bi-megaphone"></i> İlanlarım
                  </Link>
                  <Link
                    href="/favori-ilanlar"
                    className={classes.favoriteAdvertsLink}
                    title="Favori İlanlarım"
                  >
                    <i className="bi bi-heart-fill"></i> Favorilerim
                  </Link>
                  <Link
                    href="/hesabim"
                    className={classes.juniorAccountLink}
                    title="Hesabım"
                  >
                    <i className="bi bi-person"></i> Hesabım
                  </Link>
                  <Link
                    href="/login"
                    onClick={logoutHandler}
                    className={classes.favoriteAdvertsLink}
                    title="Çıkış Yap"
                  >
                    <i className="bi bi-box-arrow-right"></i> Çıkış Yap
                  </Link>
                </ul>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
