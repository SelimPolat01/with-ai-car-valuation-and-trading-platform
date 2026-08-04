"use client";

import { useState } from "react";
import { useGetPersonalAppointments } from "@/hooks/GET/useGetPersonalAppointments";
import classes from "./Randevular.module.css";
import { CalendarClock, MapPin, CarFront, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  formatBrandModel,
  formatDate,
  getAppointmentStatusData,
} from "@/app/utils/helpers";
import Loading from "@/app/loading";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  randevuContainerVariants,
  randevuItemVariants,
} from "@/app/utils/animations";

export default function RandevularPage() {
  const router = useRouter();
  const pathName = usePathname();
  const { user } = useSelector((state) => state.auth);
  const [roleTab, setRoleTab] = useState("buyer");
  const [activeTab, setActiveTab] = useState("active");

  const {
    data: getPersonalAppointmentsData,
    isLoading: getPersonalAppointmentsIsLoading,
  } = useGetPersonalAppointments(user);

  if (getPersonalAppointmentsIsLoading) {
    return <Loading />;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={classes.container}
    >
      <h1 className={classes.pageTitle}>Randevular</h1>

      <div className={classes.tabs}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${classes.tabButton} ${roleTab === "buyer" ? classes.activeTab : ""}`}
          onClick={() => setRoleTab("buyer")}
        >
          Alıcı Olduğum
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${classes.tabButton} ${roleTab === "seller" ? classes.activeTab : ""}`}
          onClick={() => setRoleTab("seller")}
        >
          Satıcı Olduğum
        </motion.button>
      </div>

      <div className={classes.tabs}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${classes.tabButton} ${activeTab === "active" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Aktif Randevular
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${classes.tabButton} ${activeTab === "past" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("past")}
        >
          Geçmiş Randevular
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${classes.tabButton} ${activeTab === "cancel" ? classes.activeTab : ""}`}
          onClick={() => setActiveTab("cancel")}
        >
          İptal Randevular
        </motion.button>
      </div>

      <motion.div
        variants={randevuContainerVariants}
        initial="hidden"
        animate="show"
        className={classes.listContainer}
        key={`${roleTab}-${activeTab}`}
      >
        {currentData.length === 0 ? (
          <motion.div
            variants={randevuItemVariants}
            className={classes.emptyState}
          >
            Bu kategoride randevunuz bulunmuyor.
          </motion.div>
        ) : (
          currentData.map((appointment) => (
            <motion.div
              variants={randevuItemVariants}
              key={appointment.appointment_id}
              className={classes.card}
            >
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
                  ${getAppointmentStatusData(appointment.appointment_status).className}
                  `}
                >
                  {
                    getAppointmentStatusData(appointment.appointment_status)
                      .icon
                  }
                  {
                    getAppointmentStatusData(appointment.appointment_status)
                      .text
                  }
                </div>
              </div>

              <div className={classes.cardBody}>
                <div className={classes.infoRow}>
                  <CarFront size={18} className={classes.iconSecondary} />
                  <span>
                    {formatBrandModel(appointment.brand)}{" "}
                    {formatBrandModel(appointment.model)} {appointment.year}
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

                {!appointment.is_deleted &&
                  appointment.appointment_status !== "canceled" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        router.push(`${pathName}/${appointment.appointment_id}`)
                      }
                      className={classes.actionButton}
                    >
                      {activeTab === "active"
                        ? "Detayları Gör"
                        : "Raporu İncele"}
                      <ChevronRight size={16} />
                    </motion.button>
                  )}
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
