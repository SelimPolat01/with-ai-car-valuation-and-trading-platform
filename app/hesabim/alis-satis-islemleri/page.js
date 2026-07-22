"use client";

import { useEffect, useState, useMemo } from "react";
import classes from "./AlisSatisİslemleri.module.css";
import useGetTradingValues from "@/hooks/GET/useGetTradingValues";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AlisSatisİslemleri() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [role, setRole] = useState("buyer");
  const [ruhsatVisible, setRuhsatVisible] = useState(true);

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
  } = useGetTradingValues(token);

  const activeTransaction = useMemo(() => {
    if (!getTradingValuesData) return null;

    const tradingValues = Array.isArray(getTradingValuesData)
      ? getTradingValuesData
      : Array.isArray(getTradingValuesData?.result)
        ? getTradingValuesData.result
        : [];

    const filteredTransactions = tradingValues.filter((t) =>
      role === "buyer" ? t.role === "buyer" : t.role === "seller",
    );

    return filteredTransactions.length > 0 ? filteredTransactions[0] : null;
  }, [getTradingValuesData, role]);

  if (!token || getTradingValuesIsLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
  }

  if (getTradingValuesIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getTradingValuesError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const getStepFromStatus = (status) => {
    if (!status) return 1;
    const s = String(status).toLowerCase();

    if (s === "1" || s === "pending") return 1;
    if (s === "2" || s === "appointment") return 2;
    if (s === "3" || s === "expertise" || s === "control") return 3;
    if (s === "4" || s === "escrow" || s === "payment") return 4;
    if (s === "5" || s === "notary") return 5;
    if (s === "success" || s === "completed") return 6;

    return 1;
  };

  const getStatusBadgeText = (status) => {
    if (!status) return "Satın Alma Sürecinde";
    const s = String(status).toLowerCase();

    if (s === "success") return "İlan Alım Satım Tamamlandı";
    if (s === "5") return "Noter Sürecinde";
    if (s === "4") return "Ödeme Sürecinde";
    if (s === "3") return "Ekspertiz Kontrolünde";
    if (s === "2") return "Yetkili Randevu Sürecinde";
    if (s === "1") return "Satın Alma Sürecinde";

    return "Satın Alma Sürecinde";
  };

  const currentStep = activeTransaction
    ? getStepFromStatus(activeTransaction.status)
    : 1;

  const getExpertiseStatusText = (step) => {
    if (step === 2) return "Randevu Alındı";
    if (step >= 3) return "Tamamlandı";
    return "Bekleniyor";
  };

  const formatPrice = (price) => {
    if (!price) return "";
    return Number(price).toLocaleString("tr-TR") + " TL";
  };

  const formatBrand = (brand) => {
    if (!brand) return "";
    const b = brand.trim().toLowerCase();
    const specialBrands = {
      bmw: "BMW",
      "mercedes-benz": "Mercedes-Benz",
    };
    if (specialBrands[b]) return specialBrands[b];
    return b
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatModel = (model) => {
    if (!model) return "";
    const m = model.trim().toLowerCase();
    const specialModels = {
      "a series": "A Serisi",
      "e series": "E Serisi",
      "1 series": "1 Series",
      "3 series": "3 Series",
      "5 series": "5 Series",
      "c-elysee": "C-Elysee",
      i20: "i20",
      "t-roc": "T-Roc",
    };
    if (specialModels[m]) return specialModels[m];
    return m
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const engineCapacityFormat = (engineCapacity) => {
    if (!engineCapacity) return "";
    return (+engineCapacity / 1000).toFixed(1);
  };

  const capitalize = (text) => {
    if (typeof text !== "string" || !text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const formatAppointmentDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";

    let cleanDateStr = dateStr;
    if (typeof dateStr === "string" && dateStr.includes("T")) {
      cleanDateStr = dateStr.split("T")[0];
    }

    let day, month, year;
    if (cleanDateStr.includes("-")) {
      const parts = cleanDateStr.split("-");
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    } else if (cleanDateStr.includes(".")) {
      const parts = cleanDateStr.split(".");
      day = parts[0];
      month = parts[1];
      year = parts[2];
    } else if (cleanDateStr.includes("/")) {
      const parts = cleanDateStr.split("/");
      if (parts[0].length === 4) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    } else {
      return `${cleanDateStr} ${timeStr}`;
    }

    const formattedDate = `${day}-${month}-${year}`;

    const timeParts = timeStr.split(":");
    const formattedTime =
      timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : timeStr;

    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.pageTitle}>Alış-Satış İşlemleri</h1>
      <div className={classes.tabs}>
        <button
          className={`${classes.tabButton} ${role === "buyer" ? classes.activeTab : ""}`}
          onClick={() => setRole("buyer")}
        >
          Alıcı Olduğum İşlemler
        </button>
        <button
          className={`${classes.tabButton} ${role === "seller" ? classes.activeTab : ""}`}
          onClick={() => setRole("seller")}
        >
          Satıcı Olduğum İşlemler
        </button>
      </div>

      {!activeTransaction ? (
        <div className={classes.emptyState}>
          Şu anda {role === "buyer" ? "alıcı" : "satıcı"} olduğunuz aktif bir
          işlem bulunmamaktadır.
        </div>
      ) : (
        <>
          <div className={classes.card}>
            <div className={classes.vehicleHeader}>
              <div>
                <span className={classes.badge}>
                  İşlem No: #
                  {activeTransaction.transaction_reference || "Bekleniyor"}
                </span>
                <h2 className={classes.vehicleTitle}>
                  {formatBrand(activeTransaction.brand)}{" "}
                  {formatModel(activeTransaction.model)}{" "}
                  {activeTransaction.model_year}{" "}
                  {engineCapacityFormat(activeTransaction.engine_capacity)}L{" "}
                  {capitalize(activeTransaction.trim_level)}
                </h2>
              </div>
              <span className={classes.statusBadge}>
                {getStatusBadgeText(activeTransaction.status)}
              </span>
            </div>

            <div className={classes.financialGrid}>
              <div className={classes.financialBox}>
                <span className={classes.financialLabel}>
                  Toplam Araç Bedeli
                </span>
                <span className={classes.financialValue}>
                  {formatPrice(activeTransaction.total_price)}
                </span>
              </div>

              <div
                className={`${classes.financialBox} ${classes.highlightBox}`}
              >
                <span className={classes.financialLabel}>Yatırılan Kapora</span>
                <span className={classes.financialValueCyan}>
                  {formatPrice(activeTransaction.deposit_amount)}{" "}
                  <span className={classes.checkIcon}>✓</span>
                </span>
                <span className={classes.subInfo}>
                  {role === "buyer"
                    ? "Güvenli Havuzda"
                    : "Alıcı Tarafından Ödendi"}
                </span>
              </div>

              <div className={classes.financialBox}>
                <span className={classes.financialLabel}>
                  Kalan Ödenecek Bakiye
                </span>
                <span className={classes.financialValuePurple}>
                  {formatPrice(activeTransaction.remaining_amount)}
                </span>
                <span className={classes.subInfo}>
                  Noter öncesi bloke edilecek
                </span>
              </div>
            </div>
          </div>

          <div className={classes.card}>
            <h3 className={classes.sectionTitle}>Süreç Adımları</h3>
            <div className={classes.stepper}>
              <div
                className={`${classes.step} ${currentStep > 1 ? classes.completedStep : currentStep === 1 ? classes.activeStep : ""}`}
              >
                <div className={classes.stepCircle}>
                  {currentStep > 1 ? "✓" : "1"}
                </div>
                <div className={classes.stepLabel}>Satın Alma</div>
                <span className={classes.stepSub}>Kapora Ödendi</span>
              </div>

              <div
                className={`${classes.stepLine} ${currentStep > 1 ? classes.completedLine : currentStep === 2 ? classes.activeLine : ""}`}
              ></div>

              <div
                className={`${classes.step} ${currentStep > 2 ? classes.completedStep : currentStep === 2 ? classes.activeStep : ""}`}
              >
                <div className={classes.stepCircle}>
                  {currentStep > 2 ? "✓" : "2"}
                </div>
                <div className={classes.stepLabel}>Yetkili Randevu</div>
                <span className={classes.stepSub}>
                  {formatAppointmentDateTime(
                    activeTransaction.slot_date,
                    activeTransaction.slot_time,
                  )}
                </span>
              </div>

              <div
                className={`${classes.stepLine} ${currentStep > 2 ? classes.completedLine : currentStep === 3 ? classes.activeLine : ""}`}
              ></div>

              <div
                className={`${classes.step} ${currentStep > 3 ? classes.completedStep : currentStep === 3 ? classes.activeStep : ""}`}
              >
                <div className={classes.stepCircle}>
                  {currentStep > 3 ? "✓" : "3"}
                </div>
                <div className={classes.stepLabel}>Ekspertiz Kontrolü</div>
                <span className={classes.stepSub}>İnceleme Aşaması</span>
              </div>

              <div
                className={`${classes.stepLine} ${currentStep > 3 ? classes.completedLine : currentStep === 4 ? classes.activeLine : ""}`}
              ></div>

              <div
                className={`${classes.step} ${currentStep > 4 ? classes.completedStep : currentStep === 4 ? classes.activeStep : ""}`}
              >
                <div className={classes.stepCircle}>
                  {currentStep > 4 ? "✓" : "4"}
                </div>
                <div className={classes.stepLabel}>Ödeme Süreci</div>
                <span className={classes.stepSub}>Bakiye Blokesi</span>
              </div>

              <div
                className={`${classes.stepLine} ${currentStep > 4 ? classes.completedLine : currentStep === 5 ? classes.activeLine : ""}`}
              ></div>

              <div
                className={`${classes.step} ${currentStep > 5 ? classes.completedStep : currentStep === 5 ? classes.activeStep : ""}`}
              >
                <div className={classes.stepCircle}>
                  {currentStep > 5 ? "✓" : "5"}
                </div>
                <div className={classes.stepLabel}>Noter Süreci</div>
                <span className={classes.stepSub}>Devir & Onay</span>
              </div>
            </div>
          </div>

          <div className={classes.gridTwoColumn}>
            <div className={classes.card}>
              <h3 className={classes.sectionTitle}>
                {role === "buyer"
                  ? "🛒 Alıcı Paneli & Aksiyonlar"
                  : "🏷️ Satıcı Paneli & Aksiyonlar"}
              </h3>

              {role === "buyer" ? (
                <div className={classes.actionContainer}>
                  <p className={classes.actionDescription}>
                    Ekspertiz randevusu tamamlandıktan sonra kalan{" "}
                    <strong>
                      {formatPrice(activeTransaction.remaining_amount)}
                    </strong>{" "}
                    bakiyeyi Güvenli Hesaba aktarabilirsiniz.
                  </p>

                  <div className={classes.buttonGroup}>
                    <button
                      className={classes.primaryBtn}
                      disabled={currentStep < 3}
                    >
                      Kalan Bakiyeyi Gönder
                    </button>
                    <button
                      className={classes.secondaryBtn}
                      disabled={currentStep < 5}
                    >
                      Noterde Satışı Aldım / Parayı Aktar
                    </button>
                  </div>
                </div>
              ) : (
                <div className={classes.actionContainer}>
                  <p className={classes.actionDescription}>
                    Alıcının sigorta teklifi alabilmesi için ruhsat yetkisini
                    yönetebilir ve güncel ekspertiz raporunu yükleyebilirsiniz.
                  </p>

                  <div className={classes.toggleRow}>
                    <span>Ruhsat Bilgilerini Alıcıya Göster:</span>
                    <button
                      className={`${classes.toggleBtn} ${ruhsatVisible ? classes.toggleActive : ""}`}
                      onClick={() => setRuhsatVisible(!ruhsatVisible)}
                    >
                      {ruhsatVisible ? "AÇIK" : "KAPALI"}
                    </button>
                  </div>

                  <div className={classes.buttonGroup}>
                    <button className={classes.outlineBtn}>
                      📄 Ekspertiz Raporu Yükle / Güncelle
                    </button>
                    <button
                      className={classes.secondaryBtn}
                      disabled={currentStep < 5}
                    >
                      Noterde Satışı Verdim / Onayla
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={classes.card}>
              <h3 className={classes.sectionTitle}>📄 Evraklar & Randevu</h3>

              <div className={classes.infoList}>
                <div className={classes.infoItem}>
                  <div>
                    <strong>Ekspertiz Randevusu</strong>
                    <p>{activeTransaction.location}</p>
                  </div>
                  <span className={classes.infoTag}>
                    {getExpertiseStatusText(currentStep)}
                  </span>
                </div>

                <div className={classes.infoItem}>
                  <div>
                    <strong>Araç Ruhsat Bilgileri</strong>
                    <p>
                      {ruhsatVisible
                        ? `Plaka: ${activeTransaction.plate || "Belirtilmedi"} (Şasi No Paylaşıldı)`
                        : "Satıcı tarafından gizlendi"}
                    </p>
                  </div>
                  {ruhsatVisible ? (
                    <button className={classes.linkBtn}>Kopyala</button>
                  ) : (
                    <span className={classes.infoTagAlert}>Kısıtlı</span>
                  )}
                </div>

                <div className={classes.infoItem}>
                  <div>
                    <strong>Ödeme Dekontu (Kapora)</strong>
                    <p>
                      {formatPrice(activeTransaction.deposit_amount)} Garanti
                      Bankası - Escrow
                    </p>
                  </div>
                  <button className={classes.linkBtn}>İndir (PDF)</button>
                </div>
              </div>
            </div>
          </div>

          <div className={classes.dangerCard}>
            <div>
              <h4>İşlem İptali veya Destek</h4>
              <p>
                Süreçte herhangi bir sorun yaşarsanız veya cayma hakkınızı
                kullanmak isterseniz başlatabilirsiniz.
              </p>
            </div>
            <div className={classes.dangerButtons}>
              <button className={classes.supportBtn}>Canlı Destek</button>
              <button className={classes.cancelBtn}>
                {role === "buyer"
                  ? "Süreci İptal Et (Cayma)"
                  : "Satıştan Vazgeç"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
