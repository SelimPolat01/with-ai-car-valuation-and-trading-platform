"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import classes from "./Dropdown.module.css";
import PrimaryButton from "./PrimaryButton";
import { AnimatePresence, motion } from "framer-motion";
import { formatAndCleanBrand, formatBrandModel } from "../utils/helpers";
import {
  dropdownItemVariants,
  dropdownVariants,
  formContainerVariants,
} from "../utils/animations";

export default function Dropdown() {
  const [value, setValue] = useState({
    brandValue: "Marka",
    modelValue: "Model",
    modelYearValue: "Yıl",
  });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errors, setErrors] = useState({
    brand: false,
    model: false,
    modelYear: false,
  });
  const [options, setOptions] = useState({
    brandOptions: [],
    modelOptions: [],
    modelYearOptions: [],
  });
  const [shake, setShake] = useState({
    shakeBrand: false,
    shakeModel: false,
    shakeModelYear: false,
  });
  const router = useRouter();

  function submitHandler(event) {
    event.preventDefault();
    const newErrors = {
      brand: value.brandValue === "Marka",
      model: value.modelValue === "Model",
      modelYear: value.modelYearValue === "Yıl",
    };
    setErrors(newErrors);
    setShake({
      shakeBrand: newErrors.brand,
      shakeModel: newErrors.model,
      shakeModelYear: newErrors.modelYear,
    });
    setTimeout(() => {
      setShake({
        shakeBrand: false,
        shakeModel: false,
        shakeModelYear: false,
      });
    }, 250);
    if (newErrors.brand || newErrors.model || newErrors.modelYear) {
      return;
    }
    router.push(
      `/ilan-olustur/${encodeURIComponent(
        formatAndCleanBrand(value.brandValue),
      ).toLowerCase()}/${encodeURIComponent(
        value.modelValue,
      ).toLowerCase()}/${value.modelYearValue}`,
    );
  }

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/cars/brands`,
        );

        if (!response.ok) {
          throw new Error("Markalar getirilemedi!");
        }
        const data = await response.json();
        setOptions((prevOptions) => ({ ...prevOptions, brandOptions: data }));
      } catch (err) {
        console.log("Sunucu hatası: ", err.message);
      }
    }

    fetchBrands();
  }, []);

  async function fetchModels(brand) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/models/${brand}`,
      );
      if (!response.ok) {
        throw new Error("Modeller getirilemedi!");
      }
      const data = await response.json();
      setOptions((prevOptions) => ({ ...prevOptions, modelOptions: data }));
    } catch (err) {
      console.log("Sunucu hatası: ", err.message);
    }
  }

  async function fetchModelYears(brand, model) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/model_years/${brand}/${model}`,
      );
      if (!response.ok) {
        throw new Error("Yıllar getirilemedi!");
      }
      const data = await response.json();
      setOptions((prevOptions) => ({ ...prevOptions, modelYearOptions: data }));
    } catch (err) {
      console.log("Sunucu hatası: ", err.message);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", function handleOutsideClick(event) {
      if (!event.target.closest(".dropdownWrapper")) {
        setOpenDropdown(null);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    });
  }, []);

  return (
    <motion.form
      variants={formContainerVariants}
      initial="hidden"
      animate="visible"
      className={classes.form}
      onSubmit={submitHandler}
    >
      <motion.div
        variants={dropdownItemVariants}
        className={`${classes.brandWrapper} dropdownWrapper `}
      >
        <div
          onClick={() => {
            setOpenDropdown(openDropdown === "brand" ? null : "brand");
          }}
          className={`dropdown ${errors.brand ? "notSelected" : ""} ${
            value.brandValue !== "Marka" ? classes.selected : ""
          } ${shake.shakeBrand ? "notSelectedAnimation" : ""} ${
            openDropdown === "brand" ? classes.boxShadow : ""
          }`}
        >
          {value.brandValue}
        </div>
        {openDropdown === "brand" && (
          <AnimatePresence>
            <motion.ul
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="dropdownList"
            >
              {options.brandOptions.map((brandOption) => (
                <li
                  key={brandOption.brand}
                  onClick={() => {
                    setOpenDropdown(null);
                    setValue((prevValue) => ({
                      ...prevValue,
                      brandValue: formatBrandModel(brandOption.brand),
                      modelValue: "Model",
                      modelYearValue: "Yıl",
                    }));
                    setErrors((prevError) => ({ ...prevError, brand: false }));

                    fetchModels(encodeURIComponent(brandOption.brand));
                  }}
                >
                  {formatBrandModel(brandOption.brand)}
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        )}
        <input type="hidden" name="brand" value={value.brandValue} />
      </motion.div>
      <motion.div variants={dropdownItemVariants} className="dropdownWrapper">
        <div
          onClick={() => {
            setOpenDropdown(openDropdown === "model" ? null : "model");
          }}
          className={`dropdown ${errors.model ? "notSelected" : ""} ${
            value.modelValue !== "Model" ? classes.selected : ""
          } ${shake.shakeModel ? "notSelectedAnimation" : ""} ${
            openDropdown === "model" ? classes.boxShadow : ""
          }`}
        >
          {value.modelValue}
        </div>
        {openDropdown === "model" && (
          <AnimatePresence>
            <motion.ul
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="dropdownList"
            >
              {options.modelOptions.map((modelOption) => (
                <li
                  key={modelOption.model}
                  onClick={() => {
                    setOpenDropdown(null);
                    setValue((prevValue) => ({
                      ...prevValue,
                      modelValue: formatBrandModel(modelOption.model),
                      modelYearValue: "Yıl",
                    }));

                    fetchModelYears(
                      encodeURIComponent(value.brandValue.toLowerCase()),
                      encodeURIComponent(modelOption.model.toLowerCase()),
                    );
                  }}
                >
                  {formatBrandModel(modelOption.model)}
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        )}
        <input type="hidden" name="modelYear" value={value.modelValue} />
      </motion.div>
      <motion.div variants={dropdownItemVariants} className="dropdownWrapper">
        <div
          onClick={() => {
            setOpenDropdown(openDropdown === "modelYear" ? null : "modelYear");
          }}
          className={`dropdown ${errors.modelYear ? "notSelected" : ""} ${
            value.modelYearValue !== "Yıl" ? classes.selected : ""
          } ${shake.shakeModelYear ? "notSelectedAnimation" : ""} ${
            openDropdown === "modelYear" ? classes.boxShadow : ""
          }`}
        >
          {value.modelYearValue}
        </div>
        {openDropdown === "modelYear" && (
          <AnimatePresence>
            <motion.ul
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="dropdownList"
            >
              {options.modelYearOptions.map((modelYearOption) => (
                <li
                  key={modelYearOption.model_year}
                  onClick={() => {
                    setOpenDropdown(null);
                    setValue((prevValue) => ({
                      ...prevValue,
                      modelYearValue: modelYearOption.model_year,
                    }));
                    setErrors((prevError) => ({
                      ...prevError,
                      modelYear: false,
                    }));
                  }}
                >
                  {modelYearOption.model_year}
                </li>
              ))}
            </motion.ul>
          </AnimatePresence>
        )}
        <input type="hidden" name="modelYear" value={value.modelYearValue} />
      </motion.div>
      <PrimaryButton type="submit" text="Hemen Sat" />
    </motion.form>
  );
}
