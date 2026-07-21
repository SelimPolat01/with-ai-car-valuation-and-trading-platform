"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGetPersonalNotifications } from "@/hooks/GET/useGetPersonalNotifications";
import { usePatchNotificationRead } from "@/hooks/PATCH/usePatchNotificationRead";
import classes from "./Bildirimler.module.css";
import {
  Bell,
  CheckCircle2,
  CheckCheck,
  Filter,
  ChevronDown,
} from "lucide-react";

export default function Bildirimler() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (currentToken) {
      setToken(currentToken);
    }
  }, []);

  const { data: getPersonalNotificationsData, isLoading } =
    useGetPersonalNotifications(token);

  const { mutate: patchPersonalNotificationRead } = usePatchNotificationRead();

  const personalNotifications = Array.isArray(getPersonalNotificationsData)
    ? getPersonalNotificationsData
    : getPersonalNotificationsData?.result || [];

  const filteredNotifications = personalNotifications.filter((notification) => {
    const matchRead =
      readFilter === "all" ||
      (readFilter === "unread" && !notification.is_read);
    const matchType = typeFilter === "all" || notification.type === typeFilter;
    return matchRead && matchType;
  });

  const uniqueTypes = [
    "all",
    ...new Set(personalNotifications.map((n) => n.type)),
  ];

  const typeLabels = {
    all: "Tüm Tipler",
    sold: "Satış İşlemleri",
    appointment: "Randevular",
  };

  function notificationClickHandler(notification) {
    if (!notification.is_read) {
      const currentToken = localStorage.getItem("token");
      patchPersonalNotificationRead({
        token: currentToken,
        notificationId: notification.id,
      });
    }

    if (notification.type === "sold") {
      router.push(`/hesabim/alis-satis-islemleri`);
    } else if (notification.type === "appointment") {
      router.push(`/hesabim/randevular`);
    }
  }

  function markAllAsReadHandler() {
    const unreadNotifications = personalNotifications.filter((n) => !n.is_read);
    const currentToken = localStorage.getItem("token");

    unreadNotifications.forEach((notification) => {
      patchPersonalNotificationRead({
        token: currentToken,
        notificationId: notification.id,
      });
    });
  }

  if (!token || isLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.pageTitle}>Bildirimler</h1>

      <div className={classes.controlsSection}>
        <div className={classes.leftControls}>
          <div className={classes.tabs}>
            <button
              className={`${classes.tabButton} ${
                readFilter === "all" ? classes.activeTab : ""
              }`}
              onClick={() => setReadFilter("all")}
            >
              Tümü
            </button>
            <button
              className={`${classes.tabButton} ${
                readFilter === "unread" ? classes.activeTab : ""
              }`}
              onClick={() => setReadFilter("unread")}
            >
              Okunmamış
            </button>
          </div>

          <div className={classes.filterDropdownContainer}>
            <button
              className={`${classes.filterButton} ${
                typeFilter !== "all" ? classes.activeFilter : ""
              }`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter size={16} />
              Filtrele
              <ChevronDown size={16} />
            </button>

            {isFilterOpen && (
              <div className={classes.dropdownMenu}>
                {uniqueTypes.map((type, index) => (
                  <div
                    key={index}
                    className={`${classes.dropdownItem} ${
                      typeFilter === type ? classes.activeDropdownItem : ""
                    }`}
                    onClick={() => {
                      setTypeFilter(type);
                      setIsFilterOpen(false);
                    }}
                  >
                    {typeLabels[type] || type}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          className={classes.markAllButton}
          onClick={markAllAsReadHandler}
          disabled={!personalNotifications.some((n) => !n.is_read)}
        >
          <CheckCheck size={18} />
          Tümünü Okundu İşaretle
        </button>
      </div>

      <div className={classes.listContainer}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${classes.notificationCard} ${
                !notification.is_read ? classes.unread : ""
              }`}
              onClick={() => notificationClickHandler(notification)}
            >
              <div className={classes.iconContainer}>
                {!notification.is_read ? (
                  <Bell size={26} color="#ffffff" fill="#a855f7" />
                ) : (
                  <CheckCircle2 size={26} color="#10b981" />
                )}
              </div>
              <div className={classes.contentContainer}>
                <div className={classes.notificationTitle}>
                  {notification.title}
                </div>
                <div className={classes.notificationMessage}>
                  {notification.message}
                </div>
                <div className={classes.notificationTime}>
                  {new Date(notification.created_at).toLocaleDateString(
                    "tr-TR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={classes.emptyState}>
            Bu filtreye uygun bildirim bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}
