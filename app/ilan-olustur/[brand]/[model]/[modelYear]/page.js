"use client";

import Button from "@/app/components/Button";
import classes from "./TahminYap.module.css";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPrediction } from "@/store/predictionSlice";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";

export default function TahminYap() {
  const params = useParams();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dispatch = useDispatch();
  const [carValues, setCarValues] = useState({
    bodyTypes: [],
    engineCapacities: [],
    horsepowers: [],
    transmissions: [],
    fuelTypes: [],
  });
  const [value, setValue] = useState({
    bodyType: "Kasa Tipi",
    engineCapacity: "Motor Hacmi",
    horsepower: "Beygir Gücü",
    transmission: "Vites Tipi",
    kilometer: "",
    fuelType: "Yakıt Tipi",
    changedPartCount: "Değişen Sayısı",
  });
  const [isKmFocused, setIsKmFocused] = useState(false);
  const [errors, setErrors] = useState({
    bodyType: false,
    engineCapacity: false,
    horsepower: false,
    transmission: false,
    fuelType: false,
    changedPartCount: false,
  });
  const [shake, setShake] = useState({
    shakeBodyType: false,
    shakeEngineCapacity: false,
    shakeHorsepower: false,
    shakeTransmission: false,
    shakeFuelType: false,
    shakeChangedPartCount: false,
  });
  const brandLogos = {
    audi: classes.audiLogo,
    bmw: classes.bmwLogo,
    ford: classes.fordLogo,
    mercedes: classes.mercedesLogo,
    renault: classes.renaultLogo,
    toyota: classes.toyotaLogo,
    togg: classes.toggLogo,
    volkswagen: classes.volkswagenLogo,
  };

  const carTypeMap = {
    bodyTypeMap: {
      sedan: "Sedan",
      suv: "SUV",
      hatchback: "Hatchback",
    },
    fuelTypeMap: {
      gasoline: "Benzin",
      diesel: "Dizel",
      electric: "Elektrik",
      hybrid: "Hibrit",
    },
    transmissionTypeMap: {
      automatic: "Otomatik",
      manual: "Manuel",
    },
  };
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useCheckAuth();

  async function submitHandler(event) {
    event.preventDefault();
    const newErrors = {
      bodyType: value.bodyType === "Kasa Tipi",
      engineCapacity: value.engineCapacity === "Motor Hacmi",
      horsepower: value.horsepower === "Beygir Gücü",
      transmission: value.transmission === "Vites Tipi",
      fuelType: value.fuelType === "Yakıt Tipi",
      changedPartCount: value.changedPartCount === "Değişen Sayısı",
    };
    setErrors(newErrors);
    setShake({
      shakeBodyType: newErrors.bodyType,
      shakeEngineCapacity: newErrors.engineCapacity,
      shakeHorsepower: newErrors.horsepower,
      shakeTransmission: newErrors.transmission,
      shakeFuelType: newErrors.fuelType,
      shakeChangedPartCount: newErrors.changedPartCount,
    });
    setTimeout(() => {
      setShake({
        shakeBodyType: false,
        shakeEngineCapacity: false,
        shakeHorsepower: false,
        shakeTransmission: false,
        shakeFuelType: false,
        shakeChangedPartCount: false,
      });
    }, 250);

    if (
      newErrors.bodyType ||
      newErrors.engineCapacity ||
      newErrors.horsepower ||
      newErrors.transmission ||
      newErrors.fuelType ||
      newErrors.changedPartCount
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      bodyType: value.bodyType,
      engineCapacity: Number(value.engineCapacity),
      horsepower: Number(value.horsepower),
      transmission: value.transmission,
      kilometer: Number(value.kilometer),
      fuelType: value.fuelType,
      changedPartCount: Number(value.changedPartCount),
    };

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/predict`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

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
      const reduxData = {
        brand: params.brand,
        model: params.model,
        modelYear: Number(params.modelYear),
        bodyType: payload.bodyType,
        engineCapacity: Number(payload.engineCapacity),
        horsepower: Number(payload.horsepower),
        transmission: payload.transmission,
        kilometer: Number(payload.kilometer),
        fuelType: payload.fuelType,
        changedPartCount: Number(payload.changedPartCount),
        price: Number(data.price),
      };
      dispatch(setPrediction(reduxData));
      router.replace("/fiyat-teklifi");
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!params || !params.brand || !params.model || !params.modelYear) return;

    async function fetchCarValue(brand, model, modelYear) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${brand}/${model}/${modelYear}`
        );
        if (!response.ok) {
          throw new Error("Otomobil bilgileri getirilemedi!");
        }
        const data = await response.json();
        const car = data[0];
        setCarValues({
          bodyTypes: Array.isArray(car.body_types)
            ? car.body_types
            : [car.body_types],
          engineCapacities: Array.isArray(car.engine_capacities)
            ? car.engine_capacities
            : [car.engine_capacities],
          horsepowers: Array.isArray(car.horsepowers)
            ? car.horsepowers
            : [car.horsepowers],
          transmissions: Array.isArray(car.transmissions)
            ? car.transmissions
            : [car.transmissions],
          fuelTypes: Array.isArray(car.fuel_types)
            ? car.fuel_types
            : [car.fuel_types],
        });
      } catch (err) {
        console.log("Sunucu Hatası: ", err);
      }
    }
    fetchCarValue(
      params.brand.toLowerCase(),
      params.model.toLowerCase(),
      params.modelYear
    );
  }, [params.brand, params.model, params.modelYear]);

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

  function capitalize(text) {
    if (typeof text !== "string") {
      return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  if (error) return <p>{error}</p>;

  return (
    <main className={classes.main}>
      <div className={classes.flex}>
        <div className={classes.title}>
          <h1>Lütfen aracın bilgilerini gir</h1>
        </div>
        <hr />
        <div className={classes.flexContainer}>
          <div className={classes.flexContainer1}>
            <Image
              className={`${classes.carLogo} ${brandLogos[params.brand] || ""}`}
              src={`/images/car_logos/${params.brand}.png`}
              alt={`${params.brand} logo`}
              width={56}
              height={50}
            />

            {value.bodyType !== "Kasa Tipi" && (
              <Image
                className={`${classes.carImg} ${classes.visible}`}
                src={`/images/cars/${params.brand.toLowerCase()}/${params.brand.toLowerCase()}-${params.model.toLowerCase()}-${
                  value.bodyType
                }.png`}
                alt={`${params.brand.toLowerCase()} ${params.model.toLowerCase()} ${
                  value.bodyType
                } image`}
                width={300}
                height={200}
              />
            )}

            <p className={classes.carYear}>{params.modelYear}</p>
          </div>
          <div className={classes.flexContainer2}>
            <form className={classes.form} onSubmit={submitHandler}>
              <div className={`${classes.bodyTypeWrapper}  dropdownWrapper`}>
                <div
                  className={`dropdown ${
                    errors.bodyType ? "notSelected" : ""
                  } ${value.bodyType !== "Kasa Tipi" ? classes.selected : ""} ${
                    shake.shakeBodyType ? "notSelectedAnimation" : ""
                  } ${openDropdown === "bodyType" ? classes.boxShadow : ""}`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "bodyType" ? null : "bodyType"
                    )
                  }
                >
                  {value.bodyType === "Kasa Tipi"
                    ? "Kasa Tipi"
                    : carTypeMap.bodyTypeMap[value.bodyType] ||
                      capitalize(value.bodyType)}
                </div>
                {openDropdown === "bodyType" && (
                  <>
                    <ul className="dropdownList">
                      {carValues.bodyTypes.map((bodyType) => (
                        <li
                          key={bodyType}
                          onClick={() => {
                            setOpenDropdown(null);
                            setValue((prevValues) => ({
                              ...prevValues,
                              bodyType: bodyType,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              bodyType: false,
                            }));
                          }}
                        >
                          {carTypeMap.bodyTypeMap[bodyType] ||
                            capitalize(bodyType)}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="dropdownWrapper">
                <div
                  className={`dropdown ${
                    errors.engineCapacity ? "notSelected" : ""
                  } ${
                    value.engineCapacity !== "Motor Hacmi"
                      ? classes.selected
                      : ""
                  } ${
                    shake.shakeEngineCapacity ? "notSelectedAnimation" : ""
                  } ${
                    openDropdown === "engineCapacity" ? classes.boxShadow : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "engineCapacity"
                        ? null
                        : "engineCapacity"
                    )
                  }
                >
                  <span>
                    {value.engineCapacity !== "Motor Hacmi"
                      ? `${value.engineCapacity} cc`
                      : value.engineCapacity}
                  </span>
                </div>
                {openDropdown === "engineCapacity" && (
                  <>
                    <ul className="dropdownList">
                      {carValues.engineCapacities.map(
                        (engineCapacity, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setOpenDropdown(null);
                              setValue((prevValues) => ({
                                ...prevValues,
                                engineCapacity: engineCapacity,
                              }));
                              setErrors((prevError) => ({
                                ...prevError,
                                engineCapacity: false,
                              }));
                            }}
                          >
                            {engineCapacity} cc
                          </li>
                        )
                      )}
                    </ul>
                  </>
                )}
              </div>
              <div className="dropdownWrapper">
                <div
                  className={`dropdown ${
                    errors.horsepower ? "notSelected" : ""
                  } ${
                    value.horsepower !== "Beygir Gücü" ? classes.selected : ""
                  } ${shake.shakeHorsepower ? "notSelectedAnimation" : ""} ${
                    openDropdown === "horsepower" ? classes.boxShadow : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "horsepower" ? null : "horsepower"
                    )
                  }
                >
                  <span>
                    {value.horsepower !== "Beygir Gücü"
                      ? `${value.horsepower} hp`
                      : value.horsepower}
                  </span>
                </div>
                {openDropdown === "horsepower" && (
                  <>
                    <ul className="dropdownList">
                      {carValues.horsepowers.map((horsepower, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setOpenDropdown(null);
                            setValue((prevValues) => ({
                              ...prevValues,
                              horsepower: horsepower,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              horsepower: false,
                            }));
                          }}
                        >
                          {horsepower} hp
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="dropdownWrapper">
                <div
                  className={`dropdown ${
                    errors.transmission ? "notSelected" : ""
                  } ${
                    value.transmission !== "Vites Tipi" ? classes.selected : ""
                  } ${shake.shakeTransmission ? "notSelectedAnimation" : ""} ${
                    openDropdown === "transmission" ? classes.boxShadow : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "transmission" ? null : "transmission"
                    )
                  }
                >
                  <span>
                    {value.transmission === "Vites Tipi"
                      ? "Vites Tipi"
                      : carTypeMap.transmissionTypeMap[value.transmission] ||
                        capitalize(value.transmission)}
                  </span>
                </div>
                {openDropdown === "transmission" && (
                  <>
                    <ul className="dropdownList">
                      {carValues.transmissions.map((transmission, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setOpenDropdown(null);
                            setValue((prevValues) => ({
                              ...prevValues,
                              transmission: transmission,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              transmission: false,
                            }));
                          }}
                        >
                          {carTypeMap.transmissionTypeMap[transmission] ||
                            capitalize(transmission)}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <input
                className={classes.kmInput}
                type="text"
                name="kilometer"
                placeholder="Kilometre"
                value={
                  isKmFocused
                    ? value.kilometer
                    : value.kilometer
                    ? `${Number(value.kilometer).toLocaleString()} km`
                    : ""
                }
                onFocus={() => setIsKmFocused(true)}
                onBlur={() => setIsKmFocused(false)}
                onChange={(event) => {
                  const numericValue = event.target.value.replace(/\D/g, "");
                  setValue((prev) => ({ ...prev, kilometer: numericValue }));
                }}
              />
              <div className="dropdownWrapper">
                <div
                  className={`dropdown ${
                    errors.fuelType ? "notSelected" : ""
                  } ${
                    value.fuelType !== "Yakıt Tipi" ? classes.selected : ""
                  } ${shake.shakeFuelType ? "notSelectedAnimation" : ""} ${
                    openDropdown === "fuelType" ? classes.boxShadow : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "fuelType" ? null : "fuelType"
                    )
                  }
                >
                  <span>
                    {value.fuelType === "Yakıt Tipi"
                      ? "Yakıt Tipi"
                      : carTypeMap.fuelTypeMap[value.fuelType] ||
                        capitalize(value.fuelType)}
                  </span>
                </div>
                {openDropdown === "fuelType" && (
                  <>
                    <ul className="dropdownList">
                      {carValues.fuelTypes.map((fuelType, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setOpenDropdown(null);
                            setValue((prevValues) => ({
                              ...prevValues,
                              fuelType: fuelType,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              fuelType: false,
                            }));
                          }}
                        >
                          {carTypeMap.fuelTypeMap[fuelType] ||
                            capitalize(fuelType)}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <div className="dropdownWrapper">
                <div
                  className={`dropdown ${
                    errors.changedPartCount ? "notSelected" : ""
                  } ${
                    value.changedPartCount !== "Değişen Sayısı"
                      ? classes.selected
                      : ""
                  } ${
                    shake.shakeChangedPartCount ? "notSelectedAnimation" : ""
                  } ${
                    openDropdown === "changedPartCount" ? classes.boxShadow : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "changedPartCount"
                        ? null
                        : "changedPartCount"
                    )
                  }
                >
                  <span>
                    {value.changedPartCount === 0
                      ? "Değişen Yok"
                      : value.changedPartCount === "Değişen Sayısı"
                      ? "Değişen Sayısı"
                      : `${value.changedPartCount} Değişen`}
                  </span>
                </div>
                {openDropdown === "changedPartCount" && (
                  <>
                    <ul className="dropdownList">
                      <li
                        onClick={() => {
                          setOpenDropdown(null);
                          setValue((prevValues) => ({
                            ...prevValues,
                            changedPartCount: 0,
                          }));
                          setErrors((prevError) => ({
                            ...prevError,
                            changedPartCount: false,
                          }));
                        }}
                      >
                        Değişen Yok
                      </li>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <li
                          key={num}
                          onClick={() => {
                            setOpenDropdown(null);
                            setValue((prevValues) => ({
                              ...prevValues,
                              changedPartCount: num,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              changedPartCount: false,
                            }));
                          }}
                        >
                          {num} Değişen
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
              <Button
                className={classes.button}
                type="submit"
                text="Fiyat teklifi al"
              />
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
