"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function RandevuDetaylar() {
  const router = useRouter();
  const params = useParams();
  const [token, setToken] = useState(null);
  const cancelDialogRef = useRef(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
    }
  }, [router]);

  const {
    data: getPersonalAppointmentsData,
    isLoading: getPersonalAppointmentsIsLoading,
    isError: getPersonalAppointmentsIsError,
    error: getPersonalAppointmentsError,
  } = useGetPersonalAppointments(token);

  const {
    mutate: patchPersonalAppointmentCancelMutate,
    isPending: patchPersonalAppointmentCancelIsPending,
  } = usePatchPersonalAppointmentCancel();

  if (!token || getPersonalAppointmentsIsLoading) {
    return <Loading />;
  }

  if (getPersonalAppointmentsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getPersonalAppointmentsError?.message}</p>
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

  const handleCancelAppointment = () => {
    cancelDialogRef.current.showModal();
  };

  const carTypeMaps = carTypeMap;
  const statusData = getAppointmentStatusData(appointment.appointment_status);
  const locationString =
    appointment.appointment_location || "Sultanbeyli, İstanbul";
  const mapQuery = encodeURIComponent(locationString);
  const mapEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  const mapDirectionUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

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

      <div className={classes.contentWrapper}>
        <div className={classes.leftColumn}>
          <div className={`${classes.card} ${classes.flexGrow1}`}>
            <div className={classes.carHeaderSection}>
              <div className={classes.carImageContainer}>
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
              </div>
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
          </div>

          <div className={classes.alertsGrid}>
            <div className={classes.card}>
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
            </div>
          </div>
        </div>

        <div className={classes.rightColumn}>
          <div className={classes.card}>
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
          </div>

          <div className={`${classes.card} ${classes.flexGrow1}`}>
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

              <a
                href={mapDirectionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.directionBtn}
              >
                <Navigation size={18} />
                Yol Tarifi Al
              </a>
            </div>
          </div>

          <div className={classes.card}>
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
                  <strong>RND-2026-X89</strong>
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
          </div>

          <div className={classes.card}>
            <div className={classes.boxHeader}>
              <ShieldAlert className={classes.iconSecondary} size={20} />
              <h3>İşlemler</h3>
            </div>
            <p className={classes.policyText}>
              Randevunuzu, başlama saatine son 24 saat kalana kadar ücretsiz
              iptal edebilirsiniz.
            </p>

            <div className={classes.actionButtonsContainer}>
              {appointment.appointment_status === "pending" && (
                <button
                  onClick={handleCancelAppointment}
                  disabled={patchPersonalAppointmentCancelIsPending}
                  className={classes.cancelButton}
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
          </div>
        </div>
      </div>
    </div>
  );
}
