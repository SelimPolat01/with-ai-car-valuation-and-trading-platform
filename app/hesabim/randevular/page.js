"use client";

import { useEffect, useState } from "react";
import {
  useGetAppointments,
  useGetPersonalAppointments,
} from "@/hooks/GET/useGetPersonalAppointments";
import classes from "./Randevular.module.css";
import {
  CalendarClock,
  MapPin,
  CarFront,
  CheckCircle2,
  XCircle,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function RandevularPage() {
  const router = useRouter();
  const pathName = usePathname();
  const [token, setToken] = useState(null);
  const [roleTab, setRoleTab] = useState("buyer");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/admin/login");
      return;
    }
  }, [router]);

  const {
    data: getPersonalAppointmentsData,
    isLoading: getPersonalAppointmentsIsLoading,
    isError: getPersonalAppointmentsIsError,
    error: getPersonalAppointmentsError,
  } = useGetPersonalAppointments(token);

  if (!token || getPersonalAppointmentsIsLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
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

  const appointments = Array.isArray(getPersonalAppointmentsData)
    ? getPersonalAppointmentsData
    : getPersonalAppointmentsData?.result || [];

  const roleFilteredData = appointments.filter((appointment) =>
    roleTab === "buyer"
      ? appointment.role === "buyer"
      : appointment.role === "seller",
  );

  const currentData = roleFilteredData.filter((appointment) => {
    if (activeTab === "active") {
      return appointment.appointment_status === "pending";
    } else if (activeTab === "past") {
      return appointment.appointment_status === "completed";
    } else {
      return appointment.appointment_status === "canceled";
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatBrand = (brand) => {
    if (!brand) return "";
    const b = brand.trim().toLowerCase();

    const specialBrands = {
      bmw: "BMW",
      "mercedes-benz": "Mercedes-Benz",
    };

    if (specialBrands[b]) {
      return specialBrands[b];
    }

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

    if (specialModels[m]) {
      return specialModels[m];
    }

    return m
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className={classes.container}>
      <h1 className={classes.pageTitle}>Randevular</h1>

      <div className={classes.tabs} style={{ marginBottom: "0.5rem" }}>
        <button
          className={`${classes.tabButton} ${roleTab === "buyer" ? classes.activeTab : ""}`}
          onClick={() => setRoleTab("buyer")}
        >
          Alıcı Olduğum
        </button>
        <button
          className={`${classes.tabButton} ${roleTab === "seller" ? classes.activeTab : ""}`}
          onClick={() => setRoleTab("seller")}
        >
          Satıcı Olduğum
        </button>
      </div>

      <div className={classes.tabs}>
        <button
          className={`${classes.tabButton} ${activeTab === "active" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Aktif Randevularım
        </button>
        <button
          className={`${classes.tabButton} ${activeTab === "past" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Geçmiş Randevularım
        </button>
        <button
          className={`${classes.tabButton} ${activeTab === "cancel" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("cancel")}
        >
          İptal Edilen Randevularım
        </button>
      </div>

      <div className={classes.listContainer}>
        {currentData.length === 0 ? (
          <div className={classes.emptyState}>
            Bu kategoride randevunuz bulunmuyor.
          </div>
        ) : (
          currentData.map((appointment) => (
            <div key={appointment.appointment_id} className={classes.card}>
              <div className={classes.cardHeader}>
                <div className={classes.dateTime}>
                  <CalendarClock size={20} className={classes.iconPrimary} />
                  <span>
                    {formatDate(appointment.appointment_date)} •{" "}
                    <strong>{appointment.appointment_time?.slice(0, 5)}</strong>
                  </span>
                </div>
                <div
                  className={`
                  ${classes.badge} 
                  ${appointment.appointment_status === "completed" ? classes.badgeSuccess : ""}
                  ${appointment.appointment_status === "pending" ? classes.badgeWarning : ""}
                  ${appointment.appointment_status === "canceled" ? classes.badgeDanger : ""}
                  `}
                >
                  {appointment.appointment_status === "pending" && (
                    <CheckCircle2 size={14} />
                  )}
                  {appointment.appointment_status === "canceled" && (
                    <XCircle size={14} />
                  )}
                  {appointment.appointment_status === "completed" && (
                    <CheckCircle2 size={14} />
                  )}
                  {appointment.appointment_status === "pending"
                    ? "Bekliyor"
                    : appointment.appointment_status === "completed"
                      ? "Tamamlandı"
                      : appointment.appointment_status === "canceled"
                        ? "İptal Edildi"
                        : appointment.appointment_status}
                </div>
              </div>

              <div className={classes.cardBody}>
                <div className={classes.infoRow}>
                  <CarFront size={18} className={classes.iconSecondary} />
                  <span>
                    {formatBrand(appointment.brand)}{" "}
                    {formatModel(appointment.model)} {appointment.year}
                  </span>
                </div>
                <div className={classes.infoRow}>
                  <MapPin size={18} className={classes.iconSecondary} />
                  <span>{appointment.appointment_location}</span>
                </div>
              </div>

              <div className={classes.cardFooter}>
                <span className={classes.appointmentId}>
                  #{appointment.appointment_id}
                </span>

                {appointment.appointment_status !== "canceled" && (
                  <button
                    onClick={() =>
                      router.push(`${pathName}/${appointment.appointment_id}`)
                    }
                    className={classes.actionButton}
                  >
                    {activeTab === "active" ? "Detayları Gör" : "Raporu İncele"}
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
