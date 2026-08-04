"use client";

import { useState, useMemo, useEffect } from "react";
import classes from "./AlisSatisİslemleri.module.css";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowLeft,
  CarFront,
  ChevronRight,
  Banknote,
  Calendar,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import {
  formatBrandModel,
  formatPrice,
  getTransactionStatusData,
  formatDate,
  formatAppointmentDateTime,
} from "@/app/utils/helpers";
import Loading from "@/app/loading";
import useGetPersonalTransactions from "@/hooks/GET/useGetPersonalTransactions";
import { motion, AnimatePresence } from "framer-motion";

export default function AlisSatisiIslemleri() {
  const router = useRouter();
  const pathName = usePathname();
  const [role, setRole] = useState("buyer");
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useSelector((state) => state.auth);

  const {
    data: getTradingValuesData,
    isLoading: getTradingValuesIsLoading,
    isError: getTradingValuesIsError,
    error: getTradingValuesError,
  } = useGetPersonalTransactions(user);

  const currentData = useMemo(() => {
    if (!getTradingValuesData) return [];

    const rawValues = Array.isArray(getTradingValuesData)
      ? getTradingValuesData
      : getTradingValuesData?.result || getTradingValuesData?.data || [];

    const tradingValues = Array.isArray(rawValues) ? rawValues : [];

    const roleFilteredData = tradingValues.filter((t) =>
      role === "buyer" ? t.role === "buyer" : t.role === "seller",
    );

    return roleFilteredData.filter((t) => {
      const status = t.payment_status || t.appointment_status;

      if (activeTab === "active") {
        return status === "pending";
      } else if (activeTab === "past") {
        return status === "completed";
      } else if (activeTab === "cancel") {
        return status === "canceled";
      }
      return true;
    });
  }, [getTradingValuesData, role, activeTab]);

  if (getTradingValuesIsLoading) {
    return <Loading />;
  }

  if (getTradingValuesIsError) {
    return (
      <div className={classes.errorContainer}>
        <AlertCircle size={48} className={classes.iconSecondary} />
        <h2>Bir Hata Oluştu</h2>
        <p>
          {getTradingValuesError?.message ||
            "İşlemleriniz yüklenirken bir sorun oluştu."}
        </p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <h1 className={classes.pageTitle}>Alış-Satış İşlemleri</h1>

      <div className={classes.tabs}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${classes.tabButton} ${
            role === "buyer" ? classes.activeTab : ""
          }`}
          onClick={() => setRole("buyer")}
        >
          Alıcı Olduğum İşlemler
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${classes.tabButton} ${
            role === "seller" ? classes.activeTab : ""
          }`}
          onClick={() => setRole("seller")}
        >
          Satıcı Olduğum İşlemler
        </motion.button>
      </div>

      <div className={classes.tabs} style={{ marginBottom: "2rem" }}>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${classes.tabButton} ${
            activeTab === "active" ? classes.activeTab : ""
          }`}
          onClick={() => setActiveTab("active")}
        >
          Aktif İşlemler
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${classes.tabButton} ${
            activeTab === "past" ? classes.activeTab : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          Tamamlanan İşlemler
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className={`${classes.tabButton} ${
            activeTab === "cancel" ? classes.activeTab : ""
          }`}
          onClick={() => setActiveTab("cancel")}
        >
          İptal işlemler
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${role}-${activeTab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={classes.listContainer}
        >
          {currentData.length === 0 ? (
            <div className={classes.emptyState}>
              Şu anda bu kategoride bir işlem kaydı bulunmamaktadır.
            </div>
          ) : (
            currentData.map((transaction, index) => {
              const currentStatus =
                transaction.payment_status || transaction.appointment_status;
              const statusData = getTransactionStatusData(currentStatus);
              const detailTargetId =
                transaction.payment_id || transaction.appointment_id;

              const isCanceledOrDeleted =
                transaction.is_advert_deleted || currentStatus === "canceled";

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  key={
                    transaction.transaction_reference ||
                    transaction.appointment_id ||
                    index
                  }
                  className={classes.card}
                >
                  <div className={classes.cardHeader}>
                    <div className={classes.dateTime}>
                      <CarFront size={20} className={classes.iconPrimary} />
                      <span>
                        <strong>
                          {formatBrandModel(transaction.brand)}{" "}
                          {formatBrandModel(transaction.model)}
                        </strong>{" "}
                        {transaction.model_year}
                      </span>
                    </div>
                    <div
                      className={`${classes.badge} ${
                        statusData?.className || ""
                      }`}
                    >
                      {statusData?.icon}
                      <span>
                        {transaction.is_advert_deleted
                          ? "İlan Silindi"
                          : statusData?.text || "İşlemde"}
                      </span>
                    </div>
                  </div>

                  <div className={classes.cardBody}>
                    {transaction.image_url ? (
                      <img
                        src={transaction.image_url}
                        alt={`${transaction.brand} ${transaction.model}`}
                        className={classes.carThumbnail}
                      />
                    ) : (
                      <div className={classes.carThumbnailPlaceholder}>
                        <CarFront size={32} opacity={0.3} />
                      </div>
                    )}

                    <div className={classes.infoCol}>
                      <div className={classes.infoRow}>
                        <Banknote size={18} className={classes.iconSecondary} />
                        <span>
                          Araç Fiyatı:{" "}
                          <strong>
                            {formatPrice(transaction.total_price)} ₺
                          </strong>
                        </span>
                      </div>

                      {transaction.deposit_amount && (
                        <div className={classes.infoRow}>
                          <CreditCard
                            size={18}
                            className={classes.iconSecondary}
                          />
                          <span>
                            Ödenen Kapora:{" "}
                            <strong>
                              {formatPrice(transaction.deposit_amount)} ₺
                            </strong>
                          </span>
                        </div>
                      )}

                      {(transaction.slot_date || transaction.created_at) && (
                        <div className={classes.infoRow}>
                          <Calendar
                            size={18}
                            className={classes.iconSecondary}
                          />
                          <span>
                            Randevu:{" "}
                            {transaction.slot_date
                              ? formatAppointmentDateTime(
                                  transaction.slot_date,
                                  transaction.slot_time,
                                )
                              : formatDate(transaction.created_at)}
                          </span>
                        </div>
                      )}

                      <div className={classes.infoRow}>
                        <ShieldCheck size={18} style={{ color: "#16a34a" }} />
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#16a34a",
                            fontWeight: 500,
                          }}
                        >
                          Güvenli Köprü İşlemi (Tarafların Gizliliği
                          Korunmaktadır)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={classes.cardFooter}>
                    <span className={classes.transactionId}>
                      Ref No: #
                      {transaction.transaction_reference ||
                        `RND-${transaction.appointment_id}`}
                    </span>

                    {isCanceledOrDeleted ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          router.push(`${pathName}/${detailTargetId}`)
                        }
                        className={`${classes.actionButton} ${classes.mutedButton}`}
                      >
                        İptal/Özet Detayı
                        <ChevronRight size={16} />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          router.push(`${pathName}/${detailTargetId}`)
                        }
                        className={classes.actionButton}
                      >
                        İşlem Detayı
                        <ChevronRight size={16} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
