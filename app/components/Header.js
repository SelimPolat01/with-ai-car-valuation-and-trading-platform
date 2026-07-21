"use client";

import Link from "next/link";
import classes from "./Header.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/store/authSlice";
import Image from "next/image";
import SearchBar from "./SearchBar";
import {
  BellDot,
  FolderHeart,
  Home,
  LayoutGrid,
  LogIn,
  LogOut,
  Tags,
  User,
  UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useGetPersonalNotifications } from "@/hooks/GET/useGetPersonalNotifications";
import { usePatchNotificationRead } from "@/hooks/PATCH/usePatchNotificationRead";

export default function Header({ className }) {
  const path = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      setToken(currentToken);
    }
  }, []);

  const [clickNotificationIcon, setClickNotificationIcon] = useState(false);
  const { isInitialized, isLogin } = useSelector((state) => state.auth);

  const {
    data: getPersonalNotificationsData,
    isLoading: getPersonalNotificationsIsLoading,
    isError: getPersonalNotificationsIsError,
    error: getPersonalNotificationsError,
  } = useGetPersonalNotifications(token);

  const {
    mutate: patchPersonalNotificationRead,
    isPending: patchPersonalNotificationPending,
    isError: patchPersonalNotificationIsError,
    error: patchPersonalNotificationError,
  } = usePatchNotificationRead();

  if (!isInitialized) return null;

  const personalNotifications = Array.isArray(getPersonalNotificationsData)
    ? getPersonalNotificationsData
    : getPersonalNotificationsData?.result || [];

  function notificationClickHandler(notification) {
    setClickNotificationIcon(false);
    const currentToken = localStorage.getItem("token");

    if (!notification.is_read) {
      patchPersonalNotificationRead({
        token: currentToken,
        notificationId: notification.id,
      });
    }

    if (notification.type === "sold") {
      router.push(`/hesabim/alis-satis-islemleri`);
    } else if (notification.type === "appointment") {
      router.push(`/hesabim/randevular`);
    } else {
      router.push(`/hesabim/bildirimler`);
    }
  }

  function notificationIconClickHandler() {
    setClickNotificationIcon((prev) => !prev);
  }

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

          {!isLogin &&
            links.notLoginlinks.map((notLoginlink, index) => (
              <li
                className={classes.li}
                key={index}
                style={{
                  visibility:
                    notLoginlink.hideOn === path ? "hidden" : "visible",
                }}
              >
                <Link
                  title={notLoginlink.title}
                  className={classes[notLoginlink.className]}
                  href={notLoginlink.href}
                >
                  {notLoginlink.label}
                </Link>
              </li>
            ))}

          {isLogin &&
            links.loginLinks.map((loginLink, index) => (
              <li
                className={classes.li}
                key={index}
                style={{
                  visibility: loginLink.hideOn === path ? "hidden" : "visible",
                }}
              >
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
            <div
              className={classes.notificationContainer}
              style={{
                visibility: path.startsWith("/hesabim/bildirimler")
                  ? "hidden"
                  : "visible",
              }}
            >
              <button
                className={`${classes.notificationButton}${
                  className ? ` ${className}` : ""
                }`}
                title="Bildirimler"
                type="button"
                onClick={notificationIconClickHandler}
              >
                <BellDot
                  className={classes.icon}
                  size={30}
                  stroke="url(#header-icon-gold)"
                />
                {personalNotifications?.some((n) => !n.is_read) && (
                  <span className={classes.notificationBadge}></span>
                )}
              </button>

              {clickNotificationIcon && (
                <div className={classes.notificationDropdown}>
                  <div className={classes.notificationHeader}>
                    <h4>Bildirimler</h4>
                  </div>
                  <div className={classes.notificationList}>
                    {personalNotifications?.length > 0 ? (
                      personalNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`${classes.notificationItem} ${
                            !notification.is_read ? classes.unread : ""
                          }`}
                          onClick={() => notificationClickHandler(notification)}
                        >
                          <div className={classes.notificationTitle}>
                            {notification.title}
                          </div>
                          <div className={classes.notificationMessage}>
                            {notification.message}
                          </div>
                          <div className={classes.notificationTime}>
                            {new Date(
                              notification.created_at,
                            ).toLocaleDateString("tr-TR")}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={classes.emptyNotification}>
                        Henüz bildiriminiz yok.
                      </div>
                    )}
                  </div>
                  <Link
                    href="/hesabim/bildirimler"
                    className={classes.viewAllButton}
                  >
                    Tümünü Gör
                  </Link>
                </div>
              )}
            </div>
          )}

          {isLogin && (
            <Link
              className={`${classes.allAdvertsLink}${
                className ? ` ${className}` : ""
              }`}
              title="Tüm İlanlar"
              href="/tum-ilanlar"
              style={{
                visibility: path.startsWith("/tum-ilanlar")
                  ? "hidden"
                  : "visible",
              }}
            >
              <LayoutGrid
                className={classes.icon}
                size={30}
                stroke="url(#header-icon-gold)"
              />
            </Link>
          )}

          {isLogin && (
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
                      stroke="currentColor"
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
                      stroke="currentColor"
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
                      stroke="currentColor"
                    />
                    Hesabım
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    onClick={logoutHandler}
                    className={classes.logoutLink}
                    title="Çıkış Yap"
                  >
                    <LogOut
                      className={classes.juniorIcon}
                      size={20}
                      stroke="currentColor"
                    />
                    Çıkış Yap
                  </Link>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
