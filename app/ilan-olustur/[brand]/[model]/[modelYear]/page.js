"use client";

import classes from "./TahminYap.module.css";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPrediction } from "@/store/predictionSlice";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import PrimaryButton from "@/app/components/PrimaryButton";

export default function TahminYap() {
  useCheckAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const isFromImage = searchParams.get("fromImage") === "true";
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(null);
  const predictionCarValues = useSelector(
    (state) => state.prediction.prediction,
  );
  const dispatch = useDispatch();
  const [carValues, setCarValues] = useState({
    trimLevels: [],
    bodyTypes: [],
    engineCapacities: [],
    horsepowers: [],
    transmissions: [],
    fuelTypes: [],
  });
  const [value, setValue] = useState({
    trimLevel: "Paket",
    bodyType: predictionCarValues?.bodyType || "Kasa Tipi",
    engineCapacity: "Motor Hacmi",
    horsepower: "Beygir Gücü",
    transmission: "Vites Tipi",
    kilometer: "",
    fuelType: "Yakıt Tipi",
    // changedPartCount: "Değişen Sayısı",
  });
  const [isKmFocused, setIsKmFocused] = useState(false);
  const [errors, setErrors] = useState({
    trimLevel: false,
    bodyType: false,
    engineCapacity: false,
    horsepower: false,
    transmission: false,
    fuelType: false,
    // changedPartCount: false,
  });
  const [shake, setShake] = useState({
    shakeTrimLevel: false,
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
    trimLevelMap: {
      ambition: "Ambition",
    },
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
      "semi automatic": "Yarı Otomatik",
      manual: "Manuel",
    },
  };

  useEffect(() => {
    const { engineCapacity, fuelType, horsepower, transmission, bodyType } =
      value;

    const isValid =
      engineCapacity &&
      engineCapacity !== "Motor Hacmi" &&
      fuelType &&
      fuelType !== "Yakıt Tipi" &&
      horsepower &&
      horsepower !== "Beygir Gücü" &&
      transmission &&
      transmission !== "Vites Tipi" &&
      bodyType &&
      bodyType !== "Kasa Tipi";

    if (isValid) {
      fetchTrimLevels(
        engineCapacity,
        fuelType,
        horsepower,
        transmission,
        bodyType,
      );
    }
  }, [
    value.engineCapacity,
    value.fuelType,
    value.horsepower,
    value.transmission,
    value.bodyType,
  ]);

  async function submitHandler(event) {
    event.preventDefault();
    const newErrors = {
      trimLevel: value.trimLevel === "Paket",
      bodyType: value.bodyType === "Kasa Tipi",
      engineCapacity: value.engineCapacity === "Motor Hacmi",
      horsepower: value.horsepower === "Beygir Gücü",
      transmission: value.transmission === "Vites Tipi",
      fuelType: value.fuelType === "Yakıt Tipi",
      // changedPartCount: value.changedPartCount === "Değişen Sayısı",
    };
    setErrors(newErrors);
    setShake({
      shakeTrimLevel: newErrors.trimLevel,
      shakeBodyType: newErrors.bodyType,
      shakeEngineCapacity: newErrors.engineCapacity,
      shakeHorsepower: newErrors.horsepower,
      shakeTransmission: newErrors.transmission,
      shakeFuelType: newErrors.fuelType,
      // shakeChangedPartCount: newErrors.changedPartCount,
    });
    setTimeout(() => {
      setShake({
        shakeTrimLevel: false,
        shakeBodyType: false,
        shakeEngineCapacity: false,
        shakeHorsepower: false,
        shakeTransmission: false,
        shakeFuelType: false,
        shakeChangedPartCount: false,
      });
    }, 250);

    if (
      newErrors.trimLevel ||
      newErrors.bodyType ||
      newErrors.engineCapacity ||
      newErrors.horsepower ||
      newErrors.transmission ||
      newErrors.fuelType
      // newErrors.changedPartCount
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      trimLevel: value.trimLevel,
      bodyType: value.bodyType,
      engineCapacity: Number(value.engineCapacity),
      horsepower: Number(value.horsepower),
      transmission: value.transmission,
      kilometer: Number(value.kilometer),
      fuelType: value.fuelType,
      // changedPartCount: Number(value.changedPartCount),
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
      console.log("Backend'den gelen veri:", data);
      const reduxData = {
        brand: params.brand,
        model: params.model,
        modelYear: Number(params.modelYear),
        trimLevel: payload.trimLevel,
        bodyType: payload.bodyType,
        engineCapacity: Number(payload.engineCapacity),
        horsepower: Number(payload.horsepower),
        transmission: payload.transmission,
        kilometer: Number(payload.kilometer),
        fuelType: payload.fuelType,
        price: Number(data.price),
        // changedPartCount: Number(payload.changedPartCount),
      };
      dispatch(setPrediction(reduxData));
      router.push(
        `/ilan-olustur/${params.brand.toLowerCase()}/${params.model.toLowerCase()}/${params.modelYear}/hasar-durumu`,
      );
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchEngineCapacities(brand, model, modelYear) {
      if (!params || !params.brand || !params.model || !params.modelYear)
        return;

      try {
        const token = localStorage.getItem("token");
        let url = `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${brand}/${model}/${modelYear}`;
        console.log(predictionCarValues?.bodyType);
        if (predictionCarValues?.bodyType) {
          url += `?bodyType=${predictionCarValues.bodyType.toLowerCase().trim()}`;
        }
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
        const engines = data[0];
        console.log(engines);
        setCarValues((prev) => ({
          ...prev,
          engineCapacities: engines.engine_capacities,
        }));
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEngineCapacities(
      params.brand.toLowerCase(),
      params.model.toLowerCase(),
      params.modelYear,
    );
  }, [params.brand, params.model, params.modelYear]);

  async function fetchFuelTypes(selectedEngineCapacity) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${params.brand.toLowerCase()}/${params.model.toLowerCase()}/${params.modelYear}/${selectedEngineCapacity}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      const fuels = data[0];
      setCarValues((prev) => ({
        ...prev,
        fuelTypes: fuels.fuel_types,
      }));
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchHorsepowers(selectedEngineCapacity, selectedFuelType) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${params.brand.toLowerCase()}/${params.model.toLowerCase()}/${params.modelYear}/${selectedEngineCapacity}/${selectedFuelType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      const hps = data[0];
      setCarValues((prev) => ({
        ...prev,
        horsepowers: hps.horsepowers,
      }));
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransmissions(
    selectedEngineCapacity,
    selectedFuelType,
    selectedHorsepower,
  ) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${params.brand.toLowerCase()}/${params.model.toLowerCase()}/${params.modelYear}/${selectedEngineCapacity}/${selectedFuelType}/${selectedHorsepower}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      const gears = data[0];
      setCarValues((prev) => ({
        ...prev,
        transmissions: gears.transmissions,
      }));
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBodyTypes(
    selectedEngineCapacity,
    selectedFuelType,
    selectedHorsepower,
    selecedTransmission,
  ) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${params.brand.toLowerCase()}/${params.model.toLowerCase()}/${params.modelYear}/${selectedEngineCapacity}/${selectedFuelType}/${selectedHorsepower}/${selecedTransmission}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      const bodies = data[0];
      setCarValues((prev) => ({
        ...prev,
        bodyTypes: bodies.body_types,
      }));
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTrimLevels(
    selectedEngineCapacity,
    selectedFuelType,
    selectedHorsepower,
    selecedTransmission,
    selectedBodyType,
  ) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${params.brand.toLowerCase()}/${params.model.toLowerCase()}/${params.modelYear}/${selectedEngineCapacity}/${selectedFuelType}/${selectedHorsepower}/${selecedTransmission}/${selectedBodyType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
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
      const trims = data[0];
      setCarValues((prev) => ({
        ...prev,
        trimLevels: trims.trim_levels,
      }));
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
              <div
                className={`${classes.engineCapacityWrapper}  dropdownWrapper`}
              >
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
                        : "engineCapacity",
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
                              fetchFuelTypes(engineCapacity);
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
                        ),
                      )}
                    </ul>
                  </>
                )}
              </div>

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
                      openDropdown === "fuelType" ? null : "fuelType",
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
                            fetchHorsepowers(value.engineCapacity, fuelType);
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
                    errors.horsepower ? "notSelected" : ""
                  } ${
                    value.horsepower !== "Beygir Gücü" ? classes.selected : ""
                  } ${shake.shakeHorsepower ? "notSelectedAnimation" : ""} ${
                    openDropdown === "horsepower" ? classes.boxShadow : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "horsepower" ? null : "horsepower",
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
                            fetchTransmissions(
                              value.engineCapacity,
                              value.fuelType,
                              horsepower,
                            );
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
                      openDropdown === "transmission" ? null : "transmission",
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
                            fetchBodyTypes(
                              value.engineCapacity,
                              value.fuelType,
                              value.horsepower,
                              transmission,
                            );
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
              <div className="dropdownWrapper">
                <div
                  className={`dropdown ${
                    errors.bodyType ? "notSelected" : ""
                  } ${value.bodyType !== "Kasa Tipi" ? classes.selected : ""} ${
                    shake.shakeBodyType ? "notSelectedAnimation" : ""
                  } ${openDropdown === "bodyType" ? classes.boxShadow : ""}`}
                  onClick={() => {
                    if (isFromImage) return;
                    setOpenDropdown(
                      openDropdown === "bodyType" ? null : "bodyType",
                    );
                  }}
                >
                  {value.bodyType === "Kasa Tipi"
                    ? "Kasa Tipi"
                    : carTypeMap.bodyTypeMap[value.bodyType] ||
                      capitalize(value.bodyType)}
                </div>
                {openDropdown === "bodyType" && !isFromImage && (
                  <>
                    <ul className="dropdownList">
                      {carValues.bodyTypes.map((bodyType) => (
                        <li
                          key={bodyType}
                          onClick={() => {
                            fetchTrimLevels(
                              value.engineCapacity,
                              value.fuelType,
                              value.horsepower,
                              value.transmission,
                              bodyType,
                            );
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
                    errors.trimLevel ? "notSelected" : ""
                  } ${value.trimLevel !== "Paket" ? classes.selected : ""} ${
                    shake.shakeTrimLevel ? "notSelectedAnimation" : ""
                  } ${openDropdown === "trimLevel" ? classes.boxShadow : ""}`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "trimLevel" ? null : "trimLevel",
                    )
                  }
                >
                  {value.trimLevel === "Paket"
                    ? "Paket"
                    : carTypeMap.trimLevelMap[value.trimLevel] ||
                      capitalize(value.trimLevel)}
                </div>
                {openDropdown === "trimLevel" && (
                  <>
                    <ul className="dropdownList">
                      {carValues.trimLevels.map((trimLevel) => (
                        <li
                          key={trimLevel}
                          onClick={() => {
                            setOpenDropdown(null);
                            setValue((prevValues) => ({
                              ...prevValues,
                              trimLevel: trimLevel,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              trimLevel: false,
                            }));
                          }}
                        >
                          {carTypeMap.trimLevelMap[trimLevel] ||
                            capitalize(trimLevel)}
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
              {/* <div className="dropdownWrapper">
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
                        : "changedPartCount",
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
              </div> */}
              <PrimaryButton text="Hasar bilgilerini ekle" type="submit" />
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
