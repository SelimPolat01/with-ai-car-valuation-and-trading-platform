"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
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
import Loading from "@/app/loading";
import { motion, AnimatePresence } from "framer-motion";
import {
  bildirimlerContainerVariants,
  bildirimlerItemVariants,
} from "@/app/utils/animations";

export default function Bildirimler() {
  const router = useRouter();
  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { isInitialized, isLogin, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isInitialized && !isLogin) {
      router.replace("/login");
    }
  }, [isInitialized, isLogin, router]);

  const {
    data: getPersonalNotificationsData,
    isLoading: getPersonalNotificationsIsLoading,
    isError: getPersonalNotificationsIsError,
    error: getPersonalNotificationsError,
  } = useGetPersonalNotifications(user);

  const {
    mutate: patchPersonalNotificationRead,
    isPending: patchPersonalNotificationIsPending,
  } = usePatchNotificationRead();

  if (getPersonalNotificationsIsError) {
    throw (
      getPersonalNotificationsError ||
      new Error("Bildirimler yüklenirken bir hata oluştu.")
    );
  }

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
      patchPersonalNotificationRead({
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

    unreadNotifications.forEach((notification) => {
      patchPersonalNotificationRead({
        notificationId: notification.id,
      });
    });
  }

  if (
    !isInitialized ||
    getPersonalNotificationsIsLoading ||
    patchPersonalNotificationIsPending
  ) {
    return <Loading />;
  }

  if (!isLogin) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={classes.container}
    >
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

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={classes.dropdownMenu}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
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
      <motion.div
        variants={bildirimlerContainerVariants}
        initial="hidden"
        animate="show"
        className={classes.listContainer}
      >
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <motion.div
                layout
                variants={bildirimlerItemVariants}
                initial="hidden"
                animate="show"
                exit="exit"
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
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={classes.emptyState}
            >
              Bu filtreye uygun bildirim bulunamadı.
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
