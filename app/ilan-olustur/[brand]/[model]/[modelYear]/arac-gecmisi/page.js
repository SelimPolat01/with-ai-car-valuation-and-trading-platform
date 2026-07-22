"use client";

import SecondaryButton from "@/app/components/SecondaryButton";
import Input from "@/app/components/Input";
import classes from "./AracGecmisi.module.css";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function AracGecmisi() {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({
    "expertise-1": null,
    "expertise-2": null,
    "ruhsat-1": null,
  });

  const [carDetails, setCarDetails] = useState({
    plaka: "",
    saseNo: "",
    tramer: "",
    muayeneTarihi: "",
    sahipSayisi: "",
    rehinDurumu: "Yok",
    servisBakimi: "Evet",
    garantiDurumu: "Hayır",
    yedekAnahtar: "Evet",
    lastikTipi: "Yazlık",
    lastikDurumu: "İyi",
    ekstralar: "",
    lpgDurumu: "Yok",
  });

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".dropdownWrapper")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function fileInputChangeHandler(event, viewId) {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [viewId]: file }));
  }

  function detailsChangeHandler(event) {
    const { name, value } = event.target;
    setCarDetails((prev) => ({ ...prev, [name]: value }));
  }

  function submitHandler() {
    const formData = new FormData();

    if (selectedFiles["expertise-1"]) {
      formData.append("expertiseFiles", selectedFiles["expertise-1"]);
    }
    if (selectedFiles["expertise-2"]) {
      formData.append("expertiseFiles", selectedFiles["expertise-2"]);
    }
    if (selectedFiles["ruhsat-1"]) {
      formData.append("ruhsatFile", selectedFiles["ruhsat-1"]);
    }

    Object.entries(carDetails).forEach(([key, value]) => {
      formData.append(key, value);

      router.push("detaylar");
    });
  }

  const views = [
    { id: "expertise-1", label: "Ekspertiz Sayfa 1" },
    { id: "expertise-2", label: "Ekspertiz Sayfa 2" },
    { id: "ruhsat-1", label: "Ruhsat Fotoğrafı (Gizli)" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const CustomDropdown = ({ label, name, options }) => {
    const isOpen = openDropdown === name;
    const currentValue = carDetails[name];
    const selectedOption =
      options.find((opt) => opt.value === currentValue) || options[0];

    return (
      <div className={`${classes.selectWrapper} dropdownWrapper`}>
        <label className={classes.selectLabel}>{label}</label>
        <div
          className={`${classes.dropdownHeader} ${isOpen ? classes.dropdownHeaderActive : ""}`}
          onClick={() => setOpenDropdown(isOpen ? null : name)}
        >
          <span className={classes.selectedText}>{selectedOption.label}</span>
          <svg
            className={isOpen ? classes.rotate : ""}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={classes.dropdownList}
            >
              {options.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => {
                    detailsChangeHandler({
                      target: { name, value: opt.value },
                    });
                    setOpenDropdown(null);
                  }}
                  className={classes.dropdownItem}
                >
                  {opt.label}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      className={classes.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className={classes.section}>
        <h3 className={classes.sectionTitle}>Resmi ve Temel Bilgiler</h3>
        <div className={classes.inputGrid}>
          <div className={classes.inputWrapper}>
            <Input
              label="Plaka No"
              name="plaka"
              type="text"
              value={carDetails.plaka}
              onChange={detailsChangeHandler}
              placeholder="Örn: 34ABC123"
            />
          </div>
          <div className={classes.inputWrapper}>
            <Input
              label="Şase No"
              name="saseNo"
              type="text"
              value={carDetails.saseNo}
              onChange={detailsChangeHandler}
              placeholder="Şase Numarası"
            />
          </div>
          <div className={classes.inputWrapper}>
            <Input
              label="Tramer Kaydı (TL)"
              name="tramer"
              type="number"
              value={carDetails.tramer}
              onChange={detailsChangeHandler}
              placeholder="Örn: 5000"
            />
          </div>
          <div className={classes.inputWrapper}>
            <Input
              label="Muayene Geçerlilik Tarihi"
              name="muayeneTarihi"
              type="date"
              value={carDetails.muayeneTarihi}
              onChange={detailsChangeHandler}
            />
          </div>
          <CustomDropdown
            label="Rehin / Hak Mahrumiyeti"
            name="rehinDurumu"
            options={[
              { label: "Yok", value: "Yok" },
              { label: "Var", value: "Var" },
            ]}
          />
          <CustomDropdown
            label="LPG Durumu"
            name="lpgDurumu"
            options={[
              { label: "Yok (Benzin/Dizel/Elektrik)", value: "Yok" },
              { label: "Var - Ruhsata İşli", value: "Ruhsata İşli" },
              {
                label: "Var - Ruhsata İşli Değil",
                value: "Ruhsata İşli Değil",
              },
            ]}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className={classes.section}>
        <h3 className={classes.sectionTitle}>Bakım ve Geçmiş Bilgileri</h3>
        <div className={classes.inputGrid}>
          <div className={classes.inputWrapper}>
            <Input
              label="Kaçıncı Sahibi"
              name="sahipSayisi"
              type="number"
              value={carDetails.sahipSayisi}
              onChange={detailsChangeHandler}
              placeholder="Örn: 2"
            />
          </div>
          <CustomDropdown
            label="Yetkili Servis Bakımlı Mı?"
            name="servisBakimi"
            options={[
              { label: "Evet", value: "Evet" },
              { label: "Hayır", value: "Hayır" },
              { label: "Kısmen", value: "Kısmen" },
            ]}
          />
          <CustomDropdown
            label="Garanti Durumu"
            name="garantiDurumu"
            options={[
              { label: "Devam Etmiyor", value: "Hayır" },
              { label: "Devam Ediyor", value: "Evet" },
            ]}
          />
          <CustomDropdown
            label="Yedek Anahtar"
            name="yedekAnahtar"
            options={[
              { label: "Var", value: "Evet" },
              { label: "Yok", value: "Hayır" },
            ]}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className={classes.section}>
        <h3 className={classes.sectionTitle}>Donanım ve Ekstralar</h3>
        <div className={classes.inputGrid}>
          <CustomDropdown
            label="Lastik Tipi"
            name="lastikTipi"
            options={[
              { label: "Yazlık", value: "Yazlık" },
              { label: "Kışlık", value: "Kışlık" },
              { label: "Dört Mevsim", value: "Dört Mevsim" },
            ]}
          />
          <CustomDropdown
            label="Lastik Durumu"
            name="lastikDurumu"
            options={[
              { label: "Sıfır Ayarında", value: "Sıfır Ayarında" },
              { label: "İyi", value: "İyi" },
              { label: "Değişim Vakti Gelmiş", value: "Değişim Vakti Gelmiş" },
            ]}
          />
          <div className={classes.inputWrapper}>
            <Input
              label="Ekstralar"
              name="ekstralar"
              type="text"
              value={carDetails.ekstralar}
              onChange={detailsChangeHandler}
              placeholder="Seramik kaplama, cam filmi vb."
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className={classes.section}>
        <h3 className={classes.sectionTitle}>Ekspertiz ve Ruhsat Belgeleri</h3>
        <div className={classes.fileContainer}>
          {views.map((view) => (
            <label htmlFor={view.id} key={view.id} className={classes.fileCard}>
              <input
                id={view.id}
                className={classes.fileInput}
                type="file"
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                onChange={(event) => fileInputChangeHandler(event, view.id)}
              />
              {selectedFiles[view.id] ? (
                <div className={classes.fileSuccessContent}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span className={classes.successText}>
                    {selectedFiles[view.id].name}
                  </span>
                </div>
              ) : (
                <div className={classes.fileUploadContent}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    ></path>
                  </svg>
                  <span className={classes.uploadText}>{view.label} Yükle</span>
                </div>
              )}
            </label>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className={classes.buttonContainer}>
        <SecondaryButton
          type="button"
          text="Fotoğraf ve Detaylar İçin Devam Et"
          onClick={submitHandler}
          className={classes.button}
        />
      </motion.div>
    </motion.div>
  );
}
