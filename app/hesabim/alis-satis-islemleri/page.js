"use client";

import { useEffect, useState, useMemo } from "react";
import classes from "./AlisSatisİslemleri.module.css";
import useGetTradingValues from "@/hooks/GET/useGetTradingValues";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import {
  capitalizeWords,
  engineCapacityFormat,
  formatAppointmentDateTime,
  formatBrandModel,
  formatDate,
  formatLpgStatus,
  formatPrice,
  formatTireCondition,
  formatTireType,
  getExpertiseStatusText,
  getStatusBadgeText,
  getStepFromStatus,
} from "@/app/utils/helpers";

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

  const currentStep = activeTransaction
    ? getStepFromStatus(activeTransaction.payment_status)
    : 1;

  const canViewRuhsat = role === "seller" || ruhsatVisible;

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
              <div className={classes.vehicleMainInfo}>
                {activeTransaction.image_url && (
                  <img
                    src={activeTransaction.image_url}
                    alt={`${activeTransaction.brand} ${activeTransaction.model}`}
                    className={classes.vehicleCoverImage}
                  />
                )}
                <div>
                  <div className={classes.badgeGroup}>
                    <span className={classes.badge}>
                      İşlem Ref: #
                      {activeTransaction.transaction_reference || "Bekleniyor"}
                    </span>
                    <span className={classes.subBadge}>
                      İlan ID: #{activeTransaction.advert_id}
                    </span>
                    <span className={classes.subBadge}>
                      Randevu ID: #{activeTransaction.appointment_id}
                    </span>
                  </div>
                  <h2 className={classes.vehicleTitle}>
                    {formatBrandModel(activeTransaction.brand)}{" "}
                    {formatBrandModel(activeTransaction.model)}{" "}
                    {activeTransaction.model_year}{" "}
                    {engineCapacityFormat(activeTransaction.engine_capacity)}L{" "}
                    {capitalizeWords(activeTransaction.trim_level)}
                  </h2>
                </div>
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
            <h3 className={classes.sectionTitle}>
              🚘 Araç Detayları & Geçmiş Bilgileri
            </h3>
            <div className={classes.detailsGrid}>
              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Tramer Kaydı</span>
                <span className={classes.detailsValue}>
                  {activeTransaction.tramer_record === 0
                    ? "Hasar Kaydı Yok"
                    : `${formatPrice(activeTransaction.tramer_record)} ₺`}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Muayene Geçerlilik</span>
                <span className={classes.detailsValue}>
                  {formatDate(activeTransaction.inspection_date)}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Rehin / Haciz</span>
                <span className={classes.detailsValue}>
                  {activeTransaction.has_pledge ? (
                    <span className={classes.badgeWarning}>Rehinli / Var</span>
                  ) : (
                    <span className={classes.badgeSuccess}>Temiz / Yok</span>
                  )}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Servis Bakımı</span>
                <span className={classes.detailsValue}>
                  {activeTransaction.has_service_maintenance === "yes" ||
                  activeTransaction.has_service_maintenance === true
                    ? "Yetkili Servis Bakımlı"
                    : "Özel Bakımlı"}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Garanti Durumu</span>
                <span className={classes.detailsValue}>
                  {activeTransaction.has_warranty ? (
                    <span className={classes.badgeSuccess}>
                      Garanti Devam Ediyor
                    </span>
                  ) : (
                    "Garanti Yok"
                  )}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Yedek Anahtar</span>
                <span className={classes.detailsValue}>
                  {activeTransaction.has_spare_key ? "Mevcut" : "Yok"}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Ruhsat Sahibi</span>
                <span className={classes.detailsValue}>
                  {activeTransaction.owner_count
                    ? `${activeTransaction.owner_count}. Sahibinden`
                    : "Belirtilmedi"}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>
                  Lastik Tipi / Durumu
                </span>
                <span className={classes.detailsValue}>
                  {formatTireType(activeTransaction.tire_type)}{" "}
                  {activeTransaction.tire_condition
                    ? `(${formatTireCondition(activeTransaction.tire_condition)})`
                    : ""}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>LPG Durumu</span>
                <span className={classes.detailsValue}>
                  {formatLpgStatus(activeTransaction.lpg_status)}
                </span>
              </div>

              <div className={classes.detailsBox}>
                <span className={classes.detailsLabel}>Şasi Numarası</span>
                <span className={classes.detailsValue}>
                  {canViewRuhsat
                    ? activeTransaction.chassis_number || "Belirtilmedi"
                    : "•••••••••••••••••"}
                </span>
              </div>
            </div>

            {activeTransaction.extras && (
              <div className={classes.extrasBox}>
                <span className={classes.detailsLabel}>
                  Ekstra Donanım & Açıklamalar
                </span>
                <p className={classes.extrasContent}>
                  {activeTransaction.extras}
                </p>
              </div>
            )}
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
                className={`${classes.stepLine} ${currentStep > 1 ? classes.completedLine : currentStep === 1 ? classes.activeLine : ""}`}
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
                className={`${classes.stepLine} ${currentStep > 2 ? classes.completedLine : currentStep === 2 ? classes.activeLine : ""}`}
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
                className={`${classes.stepLine} ${currentStep > 3 ? classes.completedLine : currentStep === 3 ? classes.activeLine : ""}`}
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
                className={`${classes.stepLine} ${currentStep > 4 ? classes.completedLine : currentStep === 4 ? classes.activeLine : ""}`}
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

                  <div className={classes.extrasBox}>
                    <span className={classes.detailsLabel}>
                      🛡️ Güvenli Havuz Hesap Bilgisi
                    </span>
                    <p className={classes.extrasContent}>
                      Yatırdığınız tüm tutarlar noter satışı resmi olarak
                      tamamlanana kadar Garanti Bankası Güvenli Escrow hesabında
                      bloke altında tutulur.
                    </p>
                  </div>

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
                    Alıcının sigorta ve kasko teklifi alabilmesi için ruhsat
                    yetkisini yönetebilir, noter satışı sonrası paranın
                    hesabınıza aktarılmasını onaylayabilirsiniz.
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

                  <div className={classes.extrasBox}>
                    <span className={classes.detailsLabel}>
                      💳 Bakiye Aktarım & Noter Süreci
                    </span>
                    <p className={classes.extrasContent}>
                      Noterde devir imzasını attıktan sonra satışı onaylayınız.
                      Alıcı onayı ile birlikte havuzda bekletilen tutar doğrudan
                      kayıtlı IBAN hesabınıza aktarılacaktır.
                    </p>
                  </div>

                  <div className={classes.buttonGroup}>
                    <button
                      className={classes.secondaryBtn}
                      disabled={currentStep < 5}
                    >
                      Noterde Satışı Verdim / Onayla
                    </button>
                    <button className={classes.outlineBtn}>
                      Banka & IBAN Bilgilerimi Düzenle
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
                    <strong>Ekspertiz Belgeleri</strong>
                    <p>
                      {activeTransaction.expertise_images?.length > 0
                        ? `${activeTransaction.expertise_images.length} Adet Belge Yüklendi`
                        : "Henüz Belge Yüklenmedi"}
                    </p>
                  </div>
                  {activeTransaction.expertise_images?.length > 0 && (
                    <div className={classes.documentLinks}>
                      {activeTransaction.expertise_images.map((imgUrl, idx) => (
                        <a
                          key={idx}
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={classes.linkBtn}
                        >
                          Rapor {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className={classes.infoItem}>
                  <div>
                    <strong>Araç Ruhsat Bilgileri</strong>
                    <p>
                      {canViewRuhsat
                        ? `Plaka: ${activeTransaction.plate || "Belirtilmedi"} (Şasi: ${activeTransaction.chassis_number || "Yok"})`
                        : "Satıcı tarafından gizlendi"}
                    </p>
                  </div>
                  {canViewRuhsat ? (
                    <div className={classes.documentLinks}>
                      {activeTransaction.permit_images?.length > 0 ? (
                        activeTransaction.permit_images.map((imgUrl, idx) => (
                          <a
                            key={idx}
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={classes.linkBtn}
                          >
                            Ruhsat {idx + 1}
                          </a>
                        ))
                      ) : (
                        <button className={classes.linkBtn}>Kopyala</button>
                      )}
                    </div>
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
