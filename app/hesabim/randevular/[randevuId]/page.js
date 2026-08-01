"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useGetPersonalAppointments } from "@/hooks/GET/useGetPersonalAppointments";
import Image from "next/image";
import classes from "./Randevu.module.css";
import {
  ArrowLeft,
  AlertCircle,
  ShieldAlert,
  CarFront,
  CalendarClock,
  Ban,
  Info,
  Printer,
  Hash,
  Clock,
  QrCode,
  MapPin,
  Navigation,
  CheckCircle2,
  CalendarX,
  FileText,
} from "lucide-react";
import { usePatchPersonalAppointmentCancel } from "@/hooks/PATCH/usePatchPersonalAppointmentCancel";
import ConfirmDialog from "../../../components/ConfirmDialog.js";
import {
  capitalizeWords,
  carTypeMap,
  engineCapacityFormat,
  formatBrandModel,
  formatDate,
  formatPrice,
  getAppointmentStatusData,
} from "@/app/utils/helpers";
import Loading from "@/app/loading";
import { motion } from "framer-motion";
import {
  randevuContainerVariants,
  randevuItemVariants,
} from "@/app/utils/animations";

export default function RandevuDetaylar() {
  const router = useRouter();
  const params = useParams();
  const cancelDialogRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

  const {
    data: getPersonalAppointmentsData,
    isLoading: getPersonalAppointmentsIsLoading,
    isError: getPersonalAppointmentsIsError,
    error: getPersonalAppointmentsError,
  } = useGetPersonalAppointments(user);

  const {
    mutate: patchPersonalAppointmentCancelMutate,
    isPending: patchPersonalAppointmentCancelIsPending,
    isError: patchPersonalAppointmentCancelIsError,
    error: patchPersonalAppointmentCancelError,
  } = usePatchPersonalAppointmentCancel();

  if (getPersonalAppointmentsIsLoading) {
    return <Loading />;
  }

  if (getPersonalAppointmentsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={30} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>
          {getPersonalAppointmentsError?.message ||
            "Randevular yüklenirken bir sorun oluştu."}
        </p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const appointmentsList = Array.isArray(getPersonalAppointmentsData)
    ? getPersonalAppointmentsData
    : getPersonalAppointmentsData?.result || [];

  const appointment = appointmentsList.find(
    (app) => String(app.appointment_id) === String(params.randevuId),
  );

  // 1. KONTROL: Randevu Veritabanında Yoksa
  if (!appointment) {
    return (
      <div className={classes.errorContainer}>
        <Ban size={48} className={classes.iconSecondary} />
        <h2>Randevu Bulunamadı</h2>
        <p>Randevu bulunamadı veya bu randevuyu görüntüleme yetkiniz yok.</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  if (appointment.is_deleted) {
    return (
      <div className={classes.errorContainer}>
        <CalendarX size={48} style={{ color: "#ef4444" }} />
        <h2>İlan Silinmiş</h2>
        <p>
          Bu randevuya ait ilan yayından kaldırıldığı veya silindiği için
          detaylar görüntülenemiyor.
        </p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const cancelAppointmentHandler = () => {
    cancelDialogRef.current.showModal();
  };

  function cancelAppointmentConfirmHandler(appointmentId) {
    patchPersonalAppointmentCancelMutate(
      { appointmentId: appointmentId },
      {
        onSuccess: (data) => {
          console.log(data?.message);
        },
        onError: (err) => {
          console.log(err?.message);
        },
      },
    );
  }

  const carTypeMaps = carTypeMap;
  const statusData = getAppointmentStatusData(appointment.appointment_status);
  const locationString =
    appointment.appointment_location || "Sultanbeyli, İstanbul";
  const mapQuery = encodeURIComponent(locationString);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={classes.container}
    >
      <ConfirmDialog
        ref={cancelDialogRef}
        onConfirm={() =>
          cancelAppointmentConfirmHandler(appointment.appointment_id)
        }
        text="Bu randevuyu iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        title="Randevu İptali"
        confirmRedirect={"/hesabim/randevular"}
        logo={<CalendarX size={35} />}
      />

      <div className={classes.header}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.back()}
          className="backButton"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </motion.button>
        <div className={classes.titleContainer}>
          <h1 className={classes.title}>
            Randevu Detayı{" "}
            <span className={classes.hashId}>
              #{appointment.appointment_id}
            </span>
          </h1>
          <span className={`${classes.badge} ${statusData.className}`}>
            {statusData.text}
          </span>
        </div>
      </div>

      <motion.div
        variants={randevuContainerVariants}
        initial="hidden"
        animate="show"
        className={classes.contentWrapper}
      >
        <div className={classes.leftColumn}>
          <motion.div
            variants={randevuItemVariants}
            className={`${classes.card} ${classes.flexGrow1}`}
          >
            <div className={classes.carHeaderSection}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={classes.carImageContainer}
              >
                {appointment.image_url ? (
                  <Image
                    src={appointment.image_url}
                    alt={`${appointment.brand} ${appointment.model}`}
                    fill
                    className={classes.realCarImage}
                  />
                ) : (
                  <div className={classes.carImagePlaceholder}>
                    <CarFront size={64} opacity={0.3} />
                  </div>
                )}
              </motion.div>
              <div className={classes.carMainInfo}>
                <h2 className={classes.carName}>
                  {formatBrandModel(appointment.brand)}{" "}
                  {formatBrandModel(appointment.model)}
                </h2>
                <div className={classes.carPrice}>
                  {formatPrice(appointment.price)}
                </div>
                {appointment.summary && (
                  <p className={classes.carSummaryText}>
                    {appointment.summary}
                  </p>
                )}
              </div>
            </div>

            <hr className={classes.divider} />

            <h3 className={classes.sectionTitle}>Araç Teknik Özellikleri</h3>
            <div className={classes.techGrid}>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Model Yılı</span>
                <span className={classes.techValue}>
                  {appointment.year || "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Paket Tipi</span>
                <span className={classes.techValue}>
                  {capitalizeWords(appointment.trim_level) || "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Kilometre</span>
                <span className={classes.techValue}>
                  {appointment.kilometer
                    ? `${appointment.kilometer.toLocaleString("tr-TR")} km`
                    : "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Kasa Tipi</span>
                <span className={classes.techValue}>
                  {carTypeMaps.bodyTypeMap[appointment.body_type] ||
                    capitalizeWords(appointment.body_type) ||
                    "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Yakıt Tipi</span>
                <span className={classes.techValue}>
                  {carTypeMaps.fuelTypeMap[appointment.fuel_type] ||
                    capitalizeWords(appointment.fuel_type) ||
                    "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Vites Tipi</span>
                <span className={classes.techValue}>
                  {carTypeMaps.transmissionTypeMap[appointment.transmission] ||
                    capitalizeWords(appointment.transmission) ||
                    "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Motor Hacmi</span>
                <span className={classes.techValue}>
                  {appointment.engine_capacity
                    ? `${engineCapacityFormat(appointment.engine_capacity)} L`
                    : "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Motor Gücü</span>
                <span className={classes.techValue}>
                  {appointment.horsepower
                    ? `${appointment.horsepower} HP`
                    : "Belirtilmemiş"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Kaporta Çizik</span>
                <span className={classes.techValue}>
                  {appointment.has_scratch ? "Mevcut" : "Yok"}
                </span>
              </div>
              <div className={classes.techItem}>
                <span className={classes.techLabel}>Kaporta Göçük</span>
                <span className={classes.techValue}>
                  {appointment.has_dent ? "Mevcut" : "Yok"}
                </span>
              </div>
            </div>
          </motion.div>

          <div className={classes.alertsGrid}>
            <motion.div variants={randevuItemVariants} className={classes.card}>
              <div className={classes.boxHeader}>
                <AlertCircle className={classes.iconWarning} size={20} />
                <h3>Önemli Hatırlatmalar</h3>
              </div>
              <ul className={classes.list}>
                <li>
                  Lütfen randevu saatinden <strong>15 dakika önce</strong>{" "}
                  merkezimizde bulunun.
                </li>
                <li>
                  Alıcı ve satıcının güvenlik gereği iletişim bilgileri gizli
                  tutulmaktadır. Görüşme yetkili ekspertiz noktasında
                  sağlanacaktır.
                </li>
                <li>
                  Kimlik belgenizi ve aracın ruhsatını yanınızda bulundurmayı
                  unutmayın.
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        <div className={classes.rightColumn}>
          <motion.div variants={randevuItemVariants} className={classes.card}>
            <div className={classes.boxHeader}>
              <Info className={classes.iconPrimary} size={20} />
              <h3>Sizin Rolünüz</h3>
            </div>
            <div className={classes.roleContent}>
              <CheckCircle2 className={classes.iconSuccess} size={24} />
              <p className={classes.roleText}>
                Bu işlemde{" "}
                <strong>
                  {appointment.role === "buyer" ? "Alıcı" : "Satıcı"}
                </strong>{" "}
                rolündesiniz.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={randevuItemVariants}
            className={`${classes.card} ${classes.flexGrow1}`}
          >
            <div className={classes.boxHeader}>
              <CalendarClock className={classes.iconPrimary} size={20} />
              <h3>Zaman ve Konum</h3>
            </div>
            <div className={classes.combinedInfo}>
              <div className={classes.dateTimeBox}>
                <p className={classes.dateHighlight}>
                  {formatDate(appointment.appointment_date)}
                </p>
                <p className={classes.timeHighlight}>
                  {appointment.appointment_time?.slice(0, 5)}
                </p>
              </div>

              <div className={classes.addressContainer}>
                <MapPin size={18} className={classes.iconSubtle} />
                <p className={classes.addressText}>{locationString}</p>
              </div>

              <iframe
                src={mapEmbedUrl}
                className={classes.mapIframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={mapDirectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.directionBtn}
              >
                <Navigation size={18} />
                Yol Tarifi Al
              </motion.a>
            </div>
          </motion.div>

          <motion.div variants={randevuItemVariants} className={classes.card}>
            <div className={classes.qrWrapper}>
              <div className={classes.qrBox}>
                <QrCode size={48} className={classes.qrIcon} />
              </div>
              <div className={classes.qrText}>
                <h4>Hızlı Giriş (Check-in)</h4>
                <p>Girişte bu kodu danışmaya okutun.</p>
              </div>
            </div>

            <hr className={classes.dividerSmall} />

            <div className={classes.statusGrid}>
              <div className={classes.statusItem}>
                <Hash size={18} className={classes.iconSubtle} />
                <div className={classes.statusItemText}>
                  <span>Referans / PNR No</span>
                  <strong>RND-2026-{appointment.appointment_id}</strong>
                </div>
              </div>
              <div className={classes.statusItem}>
                <Clock size={18} className={classes.iconSubtle} />
                <div className={classes.statusItemText}>
                  <span>Hizmet Süresi</span>
                  <strong>Tahmini 45 Dakika</strong>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={randevuItemVariants} className={classes.card}>
            <div className={classes.boxHeader}>
              <ShieldAlert className={classes.iconSecondary} size={20} />
              <h3>İşlemler</h3>
            </div>
            <p className={classes.policyText}>
              Randevunuzu, başlama saatine son 24 saat kalana kadar ücretsiz
              iptal edebilirsiniz.
            </p>

            {patchPersonalAppointmentCancelIsError && (
              <div
                style={{
                  color: "#ef4444",
                  backgroundColor: "#fef2f2",
                  padding: "10px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "15px",
                  fontSize: "14px",
                }}
              >
                <AlertCircle size={18} />
                <span>
                  {patchPersonalAppointmentCancelError?.message ||
                    "İptal işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."}
                </span>
              </div>
            )}

            <div className={classes.actionButtonsContainer}>
              {appointment.appointment_status === "pending" && (
                <button
                  onClick={cancelAppointmentHandler}
                  disabled={patchPersonalAppointmentCancelIsPending}
                  className={classes.cancelButton}
                  type="button"
                >
                  <Ban size={18} />
                  {patchPersonalAppointmentCancelIsPending
                    ? "İptal Ediliyor..."
                    : "Randevuyu İptal Et"}
                </button>
              )}
              <button
                onClick={() => window.print()}
                className={classes.printButton}
              >
                <Printer size={18} />
                Yazdır / PDF İndir
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
