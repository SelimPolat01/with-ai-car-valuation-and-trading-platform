"use client";

import SecondaryButton from "@/app/components/SecondaryButton";
import Input from "@/app/components/Input";
import classes from "./AracGecmisi.module.css";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setPrediction } from "@/store/predictionSlice";

export default function AracGecmisi() {
  const router = useRouter();
  const prediction = useSelector((state) => state.prediction.prediction);
  const dispatch = useDispatch();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({
    "expertise-1": null,
    "expertise-2": null,
    "permit-1": null,
  });
  const [clearedFiles, setClearedFiles] = useState({
    "expertise-1": false,
    "expertise-2": false,
    "permit-1": false,
  });

  const [carDetails, setCarDetails] = useState({
    plate: "",
    chassisNumber: "",
    tramerRecord: "",
    inspectionDate: "",
    ownerCount: "",
    hasPledge: false,
    hasServiceMaintence: "yes",
    hasWarrenty: false,
    hasSpareKey: true,
    tireType: "summery",
    tireCondition: "good",
    extras: "",
    lpgStatus: "none",
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
    setClearedFiles((prev) => ({ ...prev, [viewId]: false }));

    if (errors[viewId]) {
      setErrors((prev) => ({ ...prev, [viewId]: null }));
    }
  }

  function removeFileHandler(event, viewId) {
    event.preventDefault();
    setSelectedFiles((prev) => ({ ...prev, [viewId]: null }));
    setClearedFiles((prev) => ({ ...prev, [viewId]: true }));
  }

  function detailsChangeHandler(event) {
    const { name, value } = event.target;
    setCarDetails((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function getPreviewUrl(viewId) {
    if (selectedFiles[viewId]) {
      return URL.createObjectURL(selectedFiles[viewId]);
    }
    if (clearedFiles[viewId]) {
      return null;
    }
    const predictionKey = viewId.replace("-", "");
    return prediction?.files?.[predictionKey] || null;
  }

  function validateForm() {
    const newErrors = {};

    if (!carDetails.plate || carDetails.plate.trim() === "") {
      newErrors.plate = "Plaka alanı zorunludur.";
    }

    if (!carDetails.chassisNumber || carDetails.chassisNumber.trim() === "") {
      newErrors.chassisNumber = "Şase numarası zorunludur.";
    } else if (carDetails.chassisNumber.trim().length !== 17) {
      newErrors.chassisNumber = "Şase numarası 17 haneli olmalıdır.";
    }

    if (carDetails.tramerRecord === "" || carDetails.tramerRecord === null) {
      newErrors.tramerRecord = "Tramer kaydı alanı zorunludur.";
    } else if (Number(carDetails.tramerRecord) < 0) {
      newErrors.tramerRecord = "Tramer kaydı 0'dan küçük olamaz.";
    }

    if (!carDetails.inspectionDate) {
      newErrors.inspectionDate = "Muayene tarihi zorunludur.";
    }

    if (!carDetails.ownerCount || carDetails.ownerCount === "") {
      newErrors.ownerCount = "Sahip sayısı zorunludur.";
    } else if (Number(carDetails.ownerCount) < 1) {
      newErrors.ownerCount = "Sahip sayısı en az 1 olmalıdır.";
    }

    if (!getPreviewUrl("expertise-1")) {
      newErrors["expertise-1"] = "Ekspertiz Sayfa 1 yüklenmesi zorunludur.";
    }

    if (!getPreviewUrl("expertise-2")) {
      newErrors["expertise-2"] = "Ekspertiz Sayfa 2 yüklenmesi zorunludur.";
    }

    if (!getPreviewUrl("permit-1")) {
      newErrors["permit-1"] = "Ruhsat Fotoğrafı yüklenmesi zorunludur.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submitHandler() {
    if (!validateForm()) {
      return;
    }

    const files = {
      expertise1: getPreviewUrl("expertise-1"),
      expertise2: getPreviewUrl("expertise-2"),
      permit: getPreviewUrl("permit-1"),
    };

    dispatch(
      setPrediction({
        ...prediction,
        ...carDetails,
        files,
      }),
    );

    router.push("detaylar");
  }

  const views = [
    { id: "expertise-1", label: "Ekspertiz Sayfa 1" },
    { id: "expertise-2", label: "Ekspertiz Sayfa 2" },
    { id: "permit-1", label: "Ruhsat Fotoğrafı (Gizli)" },
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
              name="plate"
              type="text"
              value={carDetails.plate}
              onChange={detailsChangeHandler}
              placeholder="Örn: 34ABC123"
            />
            {errors.plate && (
              <span className={classes.errorText}>{errors.plate}</span>
            )}
          </div>
          <div className={classes.inputWrapper}>
            <Input
              label="Şase No"
              name="chassisNumber"
              type="text"
              value={carDetails.chassisNumber}
              onChange={detailsChangeHandler}
              placeholder="Şase Numarası"
            />
            {errors.chassisNumber && (
              <span className={classes.errorText}>{errors.chassisNumber}</span>
            )}
          </div>
          <div className={classes.inputWrapper}>
            <Input
              label="Tramer Kaydı (TL)"
              name="tramerRecord"
              type="number"
              value={carDetails.tramerRecord}
              onChange={detailsChangeHandler}
              placeholder="Örn: 5000"
            />
            {errors.tramerRecord && (
              <span className={classes.errorText}>{errors.tramerRecord}</span>
            )}
          </div>
          <div className={classes.inputWrapper}>
            <Input
              label="Muayene Geçerlilik Tarihi"
              name="inspectionDate"
              type="date"
              value={carDetails.inspectionDate}
              onChange={detailsChangeHandler}
            />
            {errors.inspectionDate && (
              <span className={classes.errorText}>{errors.inspectionDate}</span>
            )}
          </div>
          <CustomDropdown
            label="Rehin / Hak Mahrumiyeti"
            name="hasPledge"
            options={[
              { label: "Yok", value: false },
              { label: "Var", value: true },
            ]}
          />
          <CustomDropdown
            label="LPG Durumu"
            name="lpgStatus"
            options={[
              { label: "Yok (Benzin/Dizel/Elektrik)", value: "none" },
              { label: "Var - Ruhsata İşli", value: "registered license" },
              {
                label: "Var - Ruhsata İşli Değil",
                value: "not registered license",
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
              name="ownerCount"
              type="number"
              value={carDetails.ownerCount}
              onChange={detailsChangeHandler}
              placeholder="Örn: 2"
            />
            {errors.ownerCount && (
              <span className={classes.errorText}>{errors.ownerCount}</span>
            )}
          </div>
          <CustomDropdown
            label="Yetkili Servis Bakımlı Mı?"
            name="hasServiceMaintence"
            options={[
              { label: "Evet", value: "yes" },
              { label: "Hayır", value: "no" },
            ]}
          />
          <CustomDropdown
            label="Garanti Durumu"
            name="hasWarrenty"
            options={[
              { label: "Devam Etmiyor", value: false },
              { label: "Devam Ediyor", value: true },
            ]}
          />
          <CustomDropdown
            label="Yedek Anahtar"
            name="hasSpareKey"
            options={[
              { label: "Var", value: true },
              { label: "Yok", value: false },
            ]}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className={classes.section}>
        <h3 className={classes.sectionTitle}>Donanım ve Ekstralar</h3>
        <div className={classes.inputGrid}>
          <CustomDropdown
            label="Lastik Tipi"
            name="tireType"
            options={[
              { label: "Yazlık", value: "summery" },
              { label: "Kışlık", value: "winter" },
              { label: "Dört Mevsim", value: "four seasons" },
            ]}
          />
          <CustomDropdown
            label="Lastik Durumu"
            name="tireCondition"
            options={[
              { label: "Sıfır Ayarında", value: "like new" },
              { label: "İyi", value: "good" },
              { label: "Değişim Vakti Gelmiş", value: "change has come" },
            ]}
          />
          <div className={classes.inputWrapper}>
            <Input
              label="Ekstralar"
              name="extras"
              type="text"
              value={carDetails.extras}
              onChange={detailsChangeHandler}
              placeholder="Seramik kaplama, cam filmi vb."
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className={classes.section}>
        <h3 className={classes.sectionTitle}>Ekspertiz ve Ruhsat Belgeleri</h3>
        <div className={classes.fileContainer}>
          {views.map((view) => {
            const previewUrl = getPreviewUrl(view.id);

            return (
              <div key={view.id} className={classes.fileWrapper}>
                <span className={classes.fileTitle}>{view.label}</span>
                <label
                  htmlFor={view.id}
                  className={`${classes.fileCard} ${previewUrl ? classes.hasPreview : ""}`}
                >
                  <input
                    id={view.id}
                    className={classes.fileInput}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(event) => fileInputChangeHandler(event, view.id)}
                  />
                  {previewUrl ? (
                    <div className={classes.previewContainer}>
                      <img
                        src={previewUrl}
                        alt={view.label}
                        className={classes.previewImage}
                      />
                      <button
                        className={classes.removeButton}
                        onClick={(e) => removeFileHandler(e, view.id)}
                        title="Kaldır"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
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
                      <span className={classes.uploadText}>
                        Yüklemek için tıklayın
                      </span>
                    </div>
                  )}
                </label>
                {errors[view.id] && (
                  <span className={classes.errorText}>{errors[view.id]}</span>
                )}
              </div>
            );
          })}
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
