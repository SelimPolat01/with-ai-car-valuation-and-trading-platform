"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import classes from "./Dropdown.module.css";
import Button from "./Button";

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
        value.brandValue
      ).toLocaleLowerCase()}/${encodeURIComponent(
        value.modelValue
      ).toLowerCase()}/${value.modelYearValue}`
    );
  }

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/cars/brands`
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
        `${process.env.NEXT_PUBLIC_URL}/cars/models/${brand}`
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
        `${process.env.NEXT_PUBLIC_URL}/cars/model_years/${brand}/${model}`
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

  function formatBrandModel(text) {
    if (!text) return "";
    if (text === "bmw") return "BMW";
    if (text === "i10") return "i10";
    if (text === "i20") return "i20";
    if (text === "i30") return "i30";
    if (text === "ix35") return "ix35";
    if (text === "gla 180") return "GLA 180";
    if (text === "glb 200") return "GLB 200";
    if (text === "glc 180") return "GLC 180";
    if (text === "c-hr") return "C-HR";
    if (text === "xc40") return "XC40";
    if (text === "xc60") return "XC60";

    return text
      .split(" ")
      .map((word) =>
        word
          .split("-")
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
          )
          .join("-")
      )
      .join(" ");
  }

  return (
    <form className={classes.form} onSubmit={submitHandler}>
      <div className={`${classes.brandWrapper} dropdownWrapper `}>
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
          <>
            <ul className="dropdownList">
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
            </ul>
          </>
        )}
        <input type="hidden" name="brand" value={value.brandValue} />
      </div>
      <div className="dropdownWrapper">
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
          <ul className="dropdownList">
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
                    encodeURIComponent(modelOption.model.toLowerCase())
                  );
                }}
              >
                {formatBrandModel(modelOption.model)}
              </li>
            ))}
          </ul>
        )}
        <input type="hidden" name="modelYear" value={value.modelValue} />
      </div>
      <div className="dropdownWrapper">
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
          <ul className="dropdownList">
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
          </ul>
        )}
        <input type="hidden" name="modelYear" value={value.modelYearValue} />
      </div>
      <Button className={classes.button} type="submit" text="Hemen Sat" />
    </form>
  );
}
