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
  LogOut,
  Tags,
  User,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { useGetPersonalNotifications } from "@/hooks/GET/useGetPersonalNotifications";
import { usePatchNotificationRead } from "@/hooks/PATCH/usePatchNotificationRead";
import { headerLinks } from "../utils/helpers";
import { usePostLogout } from "@/hooks/POST/usePostLogout";

export default function Header({ className }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [clickNotificationIcon, setClickNotificationIcon] = useState(false);
  const { isInitialized, isLogin } = useSelector((state) => state.auth);
  const { mutate: logoutMutate } = usePostLogout();

  const {
    data: getPersonalNotificationsData,
    isLoading: getPersonalNotificationsIsLoading,
    isError: getPersonalNotificationsIsError,
  } = useGetPersonalNotifications(isLogin);

  const { mutate: patchPersonalNotificationRead } = usePatchNotificationRead();

  if (!isInitialized) return null;

  const personalNotifications = Array.isArray(getPersonalNotificationsData)
    ? getPersonalNotificationsData
    : getPersonalNotificationsData?.result || [];

  function notificationClickHandler(notification) {
    setClickNotificationIcon(false);

    if (!notification.is_read) {
      patchPersonalNotificationRead({
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
    logoutMutate(undefined, {
      onSettled: () => {
        dispatch(logout());
        router.replace("/login");
      },
    });
  }

  const links = headerLinks;
  const hideSearchBar = pathname === "/login" || pathname === "/register";

  return (
    <header className={`${classes.header} ${className ? className : ""} `}>
      <nav className={classes.nav}>
        <Link href="/" className={classes.logoLink}>
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
          {!hideSearchBar && <SearchBar />}

          {links.commonLinks.map((commonLink, index) => (
            <li className={classes.li} key={index}>
              <Link
                title={commonLink.title}
                className={`${classes[commonLink.className]}${
                  className ? ` ${className}` : ""
                }`}
                href={commonLink.href}
              >
                {commonLink.label}
              </Link>
            </li>
          ))}

          {!isLogin &&
            links.notLoginlinks.map((notLoginlink, index) => (
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

          {isLogin && (
            <li className={classes.li}>
              <div className={classes.notificationContainer}>
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
                      {getPersonalNotificationsIsLoading ? (
                        <div className={classes.emptyNotification}>
                          Yükleniyor...
                        </div>
                      ) : getPersonalNotificationsIsError ? (
                        <div className={classes.emptyNotification}>
                          Bildirimler yüklenemedi.
                        </div>
                      ) : personalNotifications?.length > 0 ? (
                        personalNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`${classes.notificationItem} ${
                              !notification.is_read ? classes.unread : ""
                            }`}
                            onClick={() =>
                              notificationClickHandler(notification)
                            }
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
            </li>
          )}

          {isLogin && (
            <li className={`${classes.li} ${classes.account}`}>
              <Link
                className={`${classes.accountLink}${
                  className ? ` ${className}` : ""
                }`}
                title="Hesabım"
                href="/hesabim"
              >
                <UserCog
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
                    href="/favorilerim"
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
                  <button
                    type="button"
                    onClick={logoutHandler}
                    className={classes.logoutButton}
                    title="Çıkış Yap"
                  >
                    <LogOut
                      className={classes.juniorIcon}
                      size={20}
                      stroke="currentColor"
                    />
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
