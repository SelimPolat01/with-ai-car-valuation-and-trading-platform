"use client";

import useGetTradingValues from "@/hooks/GET/useGetTradingValues";
import { AlertCircle, ArrowLeft, Ban } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import classes from "./İslem.module.css";
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
  getTransactionStatusData,
  getStepFromStatus,
} from "@/app/utils/helpers";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import Loading from "@/app/loading";

export default function IslemDetaylar() {
  const router = useRouter();
  const params = useParams();
  const cancelDialogRef = useRef(null);
  const [token, setToken] = useState(null);
  const [ruhsatVisible, setRuhsatVisible] = useState(true);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
    }
  }, [router]);

  const {
    data: getTradingValuesData,
    isLoading: getTradingValuesIsLoading,
    isError: getTradingValuesIsError,
    error: getTradingValuesError,
  } = useGetTradingValues(token);

  const transactionList = Array.isArray(getTradingValuesData)
    ? getTradingValuesData
    : getTradingValuesData?.result || [];

  const transaction = transactionList.find(
    (transaction) => String(transaction.payment_id) === String(params.islemId),
  );

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

  if (!transaction) {
    return (
      <div className={classes.errorContainer}>
        <Ban size={48} className={classes.iconSecondary} />
        <h2>İşlem Bulunamadı</h2>
        <p>İşlem bulunamadı veya bu işlem görüntüleme yetkiniz yok.</p>
        <button onClick={() => router.back()} className={classes.backButton}>
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const currentStep = getStepFromStatus(transaction.payment_status);
  const canViewPermit = transaction.role === "seller" || ruhsatVisible;
  const statusData = getTransactionStatusData(transaction.payment_status);

  return (
    <div className={classes.container}>
      <ConfirmDialog
        ref={cancelDialogRef}
        onConfirm={() => {
          const token = localStorage.getItem("token");
          patchPersonalAppointmentCancelMutate(
            {
              token: token,
              appointmentId: appointment.appointment_id,
            },
            {
              onSuccess: () => {
                cancelDialogRef.current?.close();
                router.back();
              },
              onError: (error) => {
                console.error(error);
              },
            },
          );
        }}
        text="Randevuyu iptal etmek istediğinize emin misiniz?"
        title="Randevuyu İptal Et"
      />
      <div className={classes.header}>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} />
          Geri Dön
        </button>
        <div className={classes.titleContainer}>
          <h1 className={classes.title}>
            İşlem Detayı{" "}
            <span className={classes.hashId}>#{transaction.payment_id}</span>
          </h1>
          <span className={`${classes.badge} ${statusData.className}`}>
            {statusData.text}
          </span>
        </div>
      </div>
      <div className={classes.carContainer}>
        <div className={classes.card}>
          <div className={classes.vehicleHeader}>
            <div className={classes.vehicleMainInfo}>
              {transaction.image_url && (
                <img
                  src={transaction.image_url}
                  alt={`${transaction.brand} ${transaction.model}`}
                  className={classes.vehicleCoverImage}
                />
              )}
              <div>
                <div className={classes.badgeGroup}>
                  <span className={classes.badge}>
                    İşlem Ref: #
                    {transaction.transaction_reference || "Bekleniyor"}
                  </span>
                  <span className={classes.subBadge}>
                    İlan ID: #{transaction.advert_id}
                  </span>
                  <span className={classes.subBadge}>
                    Randevu ID: #{transaction.appointment_id}
                  </span>
                </div>
                <h2 className={classes.vehicleTitle}>
                  {formatBrandModel(transaction.brand)}{" "}
                  {formatBrandModel(transaction.model)} {transaction.model_year}{" "}
                  {engineCapacityFormat(transaction.engine_capacity)}L{" "}
                  {capitalizeWords(transaction.trim_level)}
                </h2>
              </div>
            </div>
          </div>

          <div className={classes.financialGrid}>
            <div className={classes.financialBox}>
              <span className={classes.financialLabel}>Toplam Araç Bedeli</span>
              <span className={classes.financialValue}>
                {formatPrice(transaction.total_price)}
              </span>
            </div>

            <div className={`${classes.financialBox} ${classes.highlightBox}`}>
              <span className={classes.financialLabel}>Yatırılan Kapora</span>
              <span className={classes.financialValueCyan}>
                {formatPrice(transaction.deposit_amount)}{" "}
                <span className={classes.checkIcon}>✓</span>
              </span>
              <span className={classes.subInfo}>
                {transaction.role === "buyer"
                  ? "Güvenli Havuzda"
                  : "Alıcı Tarafından Ödendi"}
              </span>
            </div>

            <div className={classes.financialBox}>
              <span className={classes.financialLabel}>
                Kalan Ödenecek Bakiye
              </span>
              <span className={classes.financialValuePurple}>
                {formatPrice(transaction.remaining_amount)}
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
                {transaction.tramer_record === 0
                  ? "Hasar Kaydı Yok"
                  : `${formatPrice(transaction.tramer_record)} ₺`}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>Muayene Geçerlilik</span>
              <span className={classes.detailsValue}>
                {formatDate(transaction.inspection_date)}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>Rehin / Haciz</span>
              <span className={classes.detailsValue}>
                {transaction.has_pledge ? (
                  <span className={classes.detailsValue}>Rehinli / Var</span>
                ) : (
                  <span className={classes.detailsValue}>Temiz / Yok</span>
                )}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>Servis Bakımı</span>
              <span className={classes.detailsValue}>
                {transaction.has_service_maintenance === "yes" ||
                transaction.has_service_maintenance === true
                  ? "Yetkili Servis Bakımlı"
                  : "Özel Bakımlı"}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>Garanti Durumu</span>
              <span className={classes.detailsValue}>
                {transaction.has_warranty ? (
                  <span className={classes.detailsValue}>
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
                {transaction.has_spare_key ? "Mevcut" : "Yok"}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>Ruhsat Sahibi</span>
              <span className={classes.detailsValue}>
                {transaction.owner_count
                  ? `${transaction.owner_count}. Sahibinden`
                  : "Belirtilmedi"}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>Lastik Tipi / Durumu</span>
              <span className={classes.detailsValue}>
                {formatTireType(transaction.tire_type)}{" "}
                {transaction.tire_condition
                  ? `(${formatTireCondition(transaction.tire_condition)})`
                  : ""}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>LPG Durumu</span>
              <span className={classes.detailsValue}>
                {formatLpgStatus(transaction.lpg_status)}
              </span>
            </div>

            <div className={classes.detailsBox}>
              <span className={classes.detailsLabel}>Şasi Numarası</span>
              <span className={classes.detailsValue}>
                {canViewPermit
                  ? transaction.chassis_number || "Belirtilmedi"
                  : "•••••••••••••••••"}
              </span>
            </div>
          </div>

          {transaction.extras && (
            <div className={classes.extrasBox}>
              <span className={classes.detailsLabel}>
                Ekstra Donanım & Açıklamalar
              </span>
              <p className={classes.extrasContent}>{transaction.extras}</p>
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
                  transaction.slot_date,
                  transaction.slot_time,
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
              {transaction.role === "buyer"
                ? "🛒 Alıcı Paneli & Aksiyonlar"
                : "🏷️ Satıcı Paneli & Aksiyonlar"}
            </h3>

            {transaction.role === "buyer" ? (
              <div className={classes.actionContainer}>
                <p className={classes.actionDescription}>
                  Ekspertiz randevusu tamamlandıktan sonra kalan{" "}
                  <strong>{formatPrice(transaction.remaining_amount)}</strong>{" "}
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
                  yetkisini yönetebilir, noter satışı sonrası paranın hesabınıza
                  aktarılmasını onaylayabilirsiniz.
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
                  <p>{transaction.location}</p>
                </div>
                <span className={classes.infoTag}>
                  {getExpertiseStatusText(currentStep)}
                </span>
              </div>

              <div className={classes.infoItem}>
                <div>
                  <strong>Ekspertiz Belgeleri</strong>
                  <p>
                    {transaction.expertise_images?.length > 0
                      ? `${transaction.expertise_images.length} Adet Belge Yüklendi`
                      : "Henüz Belge Yüklenmedi"}
                  </p>
                </div>
                {transaction.expertise_images?.length > 0 && (
                  <div className={classes.documentLinks}>
                    {transaction.expertise_images.map((imgUrl, idx) => (
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
                    {canViewPermit
                      ? `Plaka: ${transaction.plate || "Belirtilmedi"} (Şasi: ${transaction.chassis_number || "Yok"})`
                      : "Satıcı tarafından gizlendi"}
                  </p>
                </div>
                {canViewPermit ? (
                  <div className={classes.documentLinks}>
                    {transaction.permit_images?.length > 0 ? (
                      transaction.permit_images.map((imgUrl, idx) => (
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
                    {formatPrice(transaction.deposit_amount)} Garanti Bankası -
                    Escrow
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
              {transaction.role === "buyer"
                ? "Süreci İptal Et (Cayma)"
                : "Satıştan Vazgeç"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
