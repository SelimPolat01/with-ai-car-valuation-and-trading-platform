"use client";

import { useEffect, useState, useMemo } from "react";
import classes from "./AlisSatisİslemleri.module.css";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CarFront,
  ChevronRight,
  Banknote,
  Calendar,
  CreditCard,
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

export default function AlisSatisiIslemleri() {
  const router = useRouter();
  const pathName = usePathname();
  const [token, setToken] = useState(null);
  const [role, setRole] = useState("buyer");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      router.replace("/admin/login");
      return;
    }
    setToken(currentToken);
  }, [router]);

  const {
    data: getTradingValuesData,
    isLoading: getTradingValuesIsLoading,
    isError: getTradingValuesIsError,
    error: getTradingValuesError,
  } = useGetPersonalTransactions(token);

  const currentData = useMemo(() => {
    if (!getTradingValuesData) return [];

    const tradingValues = Array.isArray(getTradingValuesData)
      ? getTradingValuesData
      : Array.isArray(getTradingValuesData?.result)
        ? getTradingValuesData.result
        : [];

    const roleFilteredData = tradingValues.filter((t) =>
      role === "buyer" ? t.role === "buyer" : t.role === "seller",
    );

    return roleFilteredData.filter((t) => {
      if (activeTab === "active") {
        return (
          t.payment_status !== "completed" && t.payment_status !== "canceled"
        );
      } else if (activeTab === "past") {
        return t.payment_status === "completed";
      } else {
        return t.payment_status === "canceled";
      }
    });
  }, [getTradingValuesData, role, activeTab]);

  if (!token || getTradingValuesIsLoading) {
    return <Loading />;
  }

  if (getTradingValuesIsError) {
    return (
      <div className={classes.errorContainer}>
        <AlertCircle size={48} className={classes.iconSecondary} />
        <h2>Bir Hata Oluştu</h2>
        <p>{getTradingValuesError?.message}</p>
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
        <button
          className={`${classes.tabButton} ${role === "buyer" ? classes.activeTab : ""}`}
          onClick={() => setRole("buyer")}
        >
          Alıcı Olduğum
        </button>
        <button
          className={`${classes.tabButton} ${role === "seller" ? classes.activeTab : ""}`}
          onClick={() => setRole("seller")}
        >
          Satıcı Olduğum
        </button>
      </div>

      <div className={classes.tabs} style={{ marginBottom: "2rem" }}>
        <button
          className={`${classes.tabButton} ${activeTab === "active" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Aktif İşlemlerim
        </button>
        <button
          className={`${classes.tabButton} ${activeTab === "past" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Geçmiş İşlemlerim
        </button>
        <button
          className={`${classes.tabButton} ${activeTab === "cancel" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("cancel")}
        >
          İptal İşlemlerim
        </button>
      </div>

      <div className={classes.listContainer}>
        {currentData.length === 0 ? (
          <div className={classes.emptyState}>
            Şu anda bu kategoride bir işlem bulunmamaktadır.
          </div>
        ) : (
          currentData.map((transaction, index) => {
            const statusData = getTransactionStatusData(
              transaction.payment_status,
            );

            return (
              <div
                key={transaction.transaction_reference || index}
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
                  <div className={`${classes.badge} ${statusData.className}`}>
                    {statusData.icon}
                    <span>{statusData.text}</span>
                  </div>
                </div>

                <div className={classes.cardBody}>
                  {transaction.image_url && (
                    <img
                      src={transaction.image_url}
                      alt={`${transaction.brand} ${transaction.model}`}
                      className={classes.carThumbnail}
                    />
                  )}
                  <div className={classes.infoCol}>
                    <div className={classes.infoRow}>
                      <Banknote size={18} className={classes.iconSecondary} />
                      <span>
                        Fiyat:{" "}
                        <strong>
                          {formatPrice(transaction.total_price)} ₺
                        </strong>
                      </span>
                    </div>

                    {transaction.deposit_amount ? (
                      <div className={classes.infoRow}>
                        <CreditCard
                          size={18}
                          className={classes.iconSecondary}
                        />
                        <span>
                          Kapora:{" "}
                          <strong>
                            {formatPrice(transaction.deposit_amount)} ₺
                          </strong>
                        </span>
                      </div>
                    ) : null}

                    {(transaction.slot_date || transaction.created_at) && (
                      <div className={classes.infoRow}>
                        <Calendar size={18} className={classes.iconSecondary} />
                        <span>
                          {transaction.slot_date
                            ? formatAppointmentDateTime(
                                transaction.slot_date,
                                transaction.slot_time,
                              )
                            : formatDate(transaction.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={classes.cardFooter}>
                  <span className={classes.transactionId}>
                    #
                    {transaction.transaction_reference ||
                      transaction.payment_id}
                  </span>

                  <button
                    onClick={() =>
                      router.push(`${pathName}/${transaction.payment_id}`)
                    }
                    className={classes.actionButton}
                  >
                    Detayları Gör
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
