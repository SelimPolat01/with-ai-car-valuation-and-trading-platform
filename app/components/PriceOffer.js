"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./PriceOffer.module.css";
import { useRouter } from "next/navigation";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import { useSelector } from "react-redux";
import Input from "@/app/components/Input";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Camera, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PriceOffer({ advertId }) {
  const isEdit = !!advertId;
  const [inputTextareValue, setInputTextareaValue] = useState({
    title: "",
    description: "",
    city: "",
  });
  const [images, setImages] = useState(Array(10).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const reduxData = useSelector((state) => state.prediction.prediction);
  const fileInputRefs = useRef([]);

  useCheckAuth();

  function inputTextareaChangeHandler(event) {
    const { name, value } = event.target;
    setInputTextareaValue((prevValue) => ({ ...prevValue, [name]: value }));
  }

  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = {
            file: file,
            preview: reader.result,
          };
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index, event) => {
    event.stopPropagation();
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = null;
      return newImages;
    });
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
  };

  async function formSubmitHandler(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const uploadedFiles = images.filter((img) => img !== null);

    if (uploadedFiles.length === 0) {
      setError("Lütfen en az bir (Kapak) fotoğrafı yükleyin.");
      return;
    }

    const formData = new FormData();

    formData.append("city", inputTextareValue.city);
    formData.append("title", inputTextareValue.title);
    formData.append("description", inputTextareValue.description);

    if (isEdit) {
      formData.append("id", advertId);
    } else {
      formData.append("brand", reduxData.brand);
      formData.append("model", decodeURIComponent(reduxData.model || ""));
      formData.append("modelYear", reduxData.modelYear);
      formData.append("bodyType", reduxData.bodyType);
      formData.append("engineCapacity", reduxData.engineCapacity);
      formData.append("horsepower", reduxData.horsepower);
      formData.append("transmission", reduxData.transmission);
      formData.append("kilometer", reduxData.kilometer);
      formData.append("fuelType", reduxData.fuelType);
      formData.append("trimLevel", reduxData.trimLevel);
      formData.append("price", reduxData.price);
      const hasScratch = reduxData.hasScratch || reduxData.has_scratch || false;
      const hasDent = reduxData.hasDent || reduxData.has_dent || false;
      formData.append("hasScratch", hasScratch);
      formData.append("hasDent", hasDent);
    }

    const existingImageUrls = [];

    uploadedFiles.forEach((img) => {
      if (img.file) {
        formData.append("images", img.file);
      } else if (img.preview) {
        existingImageUrls.push(img.preview);
      }
    });

    formData.append("existingImages", JSON.stringify(existingImageUrls));

    try {
      setLoading(true);
      setError(null);
      const URL = isEdit
        ? `${process.env.NEXT_PUBLIC_URL}/adverts/edit`
        : `${process.env.NEXT_PUBLIC_URL}/adverts/post`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(URL, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          setError(errorData.message);
        } else {
          setError(`Sunucu hatası oluştu. Durum kodu: ${response.status}`);
        }
        return;
      }

      router.replace("/ilanlarim");
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem("token");
      async function fetchAdvertData() {
        try {
          setLoading(true);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/adverts/${advertId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.status === 401) {
            localStorage.removeItem("token");
            router.replace("/login");
            return;
          }

          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.message);
            return;
          }

          const data = await response.json();
          console.log("Gelen veri:", data);
          console.log("Resimler:", data.images);
          setInputTextareaValue({
            title: data.title || "",
            description: data.description || "",
            city: data.city || "",
          });

          const loadedImages = Array(10).fill(null);

          if (data.images && Array.isArray(data.images)) {
            data.images.forEach((imgObj, idx) => {
              if (idx < 10) {
                loadedImages[idx] = {
                  file: null,
                  preview: imgObj.image_data,
                };
              }
            });
            setImages(loadedImages);
          } else if (data.image_src) {
            const loadedImages = Array(10).fill(null);
            loadedImages[0] = { file: null, preview: data.image_src };
            setImages(loadedImages);
          }
        } catch (err) {
          console.log("Error: " + err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchAdvertData();
    }
  }, [advertId]);

  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  const imageGridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const imageBoxVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const innerStateVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <main className={classes.main}>
      <motion.form
        onSubmit={formSubmitHandler}
        className={classes.form}
        variants={formContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={classes.errorText}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants}>
          <Input
            className={classes.input}
            type="text"
            identifier="title"
            label="İlan Başlığı"
            value={inputTextareValue.title}
            onChange={inputTextareaChangeHandler}
            autoFocus
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Input
            className={classes.input}
            type="text"
            identifier="city"
            label="Şehir"
            value={inputTextareValue.city}
            onChange={inputTextareaChangeHandler}
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
        >
          <label className={classes.label} htmlFor="description">
            İlan Açıklaması
          </label>
          <textarea
            className={classes.textarea}
            id="description"
            name="description"
            value={inputTextareValue.description}
            onChange={inputTextareaChangeHandler}
            rows={6}
          />
        </motion.div>

        <motion.div variants={itemVariants} className={classes.imageSection}>
          <label className={classes.label}>
            Fotoğraflar (En fazla 10 adet)
          </label>
          <motion.div
            className={classes.imageGrid}
            variants={imageGridVariants}
            initial="hidden"
            animate="visible"
          >
            {images.map((img, index) => (
              <motion.div
                key={index}
                variants={imageBoxVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`${classes.imageBox} ${
                  index === 0 ? classes.mainImageBox : ""
                }`}
                onClick={() => fileInputRefs.current[index].click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={(el) => (fileInputRefs.current[index] = el)}
                  onChange={(e) => handleImageChange(index, e)}
                />

                <AnimatePresence mode="wait">
                  {img ? (
                    <motion.div
                      key="preview"
                      variants={innerStateVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={classes.previewWrapper}
                      style={{ width: "100%", height: "100%" }}
                    >
                      <img
                        src={img.preview}
                        alt={`Araç Fotoğrafı ${index + 1}`}
                        className={classes.previewImg}
                      />
                      <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: "#ff4d4d" }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        className={classes.removeBtn}
                        onClick={(e) => handleRemoveImage(index, e)}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                      {index === 0 && (
                        <span className={classes.mainBadge}>
                          Kapak Fotoğrafı
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      variants={innerStateVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className={classes.uploadPlaceholder}
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                    >
                      <Camera size={24} />
                      <span style={{ textAlign: "center" }}>
                        {index === 0 ? "Kapak Ekle" : `${index + 1}. Fotoğraf`}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <PrimaryButton
            type="submit"
            text={loading ? "Yükleniyor..." : "İlanı yayınla"}
            className={classes.button}
            disabled={loading}
          />
        </motion.div>
      </motion.form>
    </main>
  );
}
