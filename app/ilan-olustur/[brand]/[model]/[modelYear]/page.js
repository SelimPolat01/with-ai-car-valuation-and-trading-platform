"use client";

import classes from "./TahminYap.module.css";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPrediction } from "@/store/predictionSlice";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import PrimaryButton from "@/app/components/PrimaryButton";
import { AnimatePresence, motion } from "framer-motion";
import { usePostCarValuePredict } from "@/hooks/POST/usePostCarValuePredict";
import {
  capitalizeWords,
  carGenerationsObject,
  carTypeMap,
  findIntervalFromYear,
  formatBrandLowerParser,
  formatModelForApi,
  getCarStockImageSrcFunc,
  getDbModelName,
} from "@/app/utils/helpers";
import {
  tahminYapDropdownVariants,
  tahminYapContainerVariants,
  tahminYapFormContainerVariants,
  tahminYapImageVariants,
  tahminYapItemVariants,
} from "@/app/utils/animations";

export default function TahminYap() {
  useCheckAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const predictionCarValues = useSelector(
    (state) => state.prediction.prediction,
  );
  const dispatch = useDispatch();
  const [token, setToken] = useState(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
      return;
    }
  }, [router]);

  const {
    mutate: carValuePredictMutate,
    isPending: carValuePredictMutateIsPending,
    isError: carValuePredictMutateIsError,
    error: carValuePredictMutateError,
    reset,
  } = usePostCarValuePredict();

  const isFromImage = searchParams.get("fromImage") === "true";
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
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
  });

  const [isKmFocused, setIsKmFocused] = useState(false);
  const [errors, setErrors] = useState({
    trimLevel: false,
    bodyType: false,
    engineCapacity: false,
    horsepower: false,
    transmission: false,
    fuelType: false,
  });

  const [shake, setShake] = useState({
    shakeTrimLevel: false,
    shakeBodyType: false,
    shakeEngineCapacity: false,
    shakeHorsepower: false,
    shakeTransmission: false,
    shakeFuelType: false,
  });

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
    };
    setErrors(newErrors);
    setShake({
      shakeTrimLevel: newErrors.trimLevel,
      shakeBodyType: newErrors.bodyType,
      shakeEngineCapacity: newErrors.engineCapacity,
      shakeHorsepower: newErrors.horsepower,
      shakeTransmission: newErrors.transmission,
      shakeFuelType: newErrors.fuelType,
    });
    setTimeout(() => {
      setShake({
        shakeTrimLevel: false,
        shakeBodyType: false,
        shakeEngineCapacity: false,
        shakeHorsepower: false,
        shakeTransmission: false,
        shakeFuelType: false,
      });
    }, 250);

    if (
      newErrors.trimLevel ||
      newErrors.bodyType ||
      newErrors.engineCapacity ||
      newErrors.horsepower ||
      newErrors.transmission ||
      newErrors.fuelType
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    const payload = {
      brand: params.brand.toLowerCase(),
      model: params.model.toLowerCase(),
      model_year: Number(params.modelYear),
      trim_level: value.trimLevel.toLowerCase(),
      body_type: value.bodyType.toLowerCase(),
      engine_capacity: Number(value.engineCapacity),
      horsepower: Number(value.horsepower),
      transmission: value.transmission.toLowerCase(),
      kilometer: Number(value.kilometer),
      fuel_type: value.fuelType.toLowerCase(),
    };

    carValuePredictMutate(
      { token, body: payload },
      {
        onSuccess: (data) => {
          const reduxData = {
            brand: params.brand,
            model: params.model,
            modelYear: Number(params.modelYear),
            trimLevel: payload.trim_level,
            bodyType: payload.body_type,
            engineCapacity: Number(payload.engine_capacity),
            horsepower: Number(payload.horsepower),
            transmission: payload.transmission,
            kilometer: Number(payload.kilometer),
            fuelType: payload.fuel_type,
            price: Number(data.result.price),
          };
          dispatch(setPrediction({ ...predictionCarValues, ...reduxData }));
          router.push(
            `/ilan-olustur/${params.brand.toLowerCase()}/${params.model.toLowerCase()}/${params.modelYear}/hasar-durumu`,
          );
          reset();
        },
      },
    );
  }

  useEffect(() => {
    async function fetchEngineCapacities(brand, model, modelYear) {
      if (!params || !params.brand || !params.model || !params.modelYear)
        return;

      try {
        const token = localStorage.getItem("token");
        const encodedBrand = encodeURIComponent(brand);
        const encodedModel = encodeURIComponent(model);

        let url = `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${encodedBrand}/${encodedModel}/${modelYear}`;
        if (predictionCarValues?.bodyType) {
          url += `?bodyType=${encodeURIComponent(predictionCarValues.bodyType.toLowerCase().trim())}`;
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
        const engines = data && data[0];
        setCarValues((prev) => ({
          ...prev,
          engineCapacities: engines.engine_capacities || [],
        }));
      } catch (err) {
        setError(err.message);
      } finally {
      }
    }
    fetchEngineCapacities(
      formatBrandLowerParser(params.brand),
      formatModelForApi(params.model.toLowerCase()),
      params.modelYear,
    );
  }, [params.brand, params.model, params.modelYear]);

  async function fetchFuelTypes(selectedEngineCapacity) {
    try {
      const token = localStorage.getItem("token");
      const brandEnc = encodeURIComponent(
        formatBrandLowerParser(params.brand.toLowerCase()),
      );
      const modelEnc = encodeURIComponent(
        formatModelForApi(params.model.toLowerCase()),
      );
      const engineEnc = encodeURIComponent(selectedEngineCapacity);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${brandEnc}/${modelEnc}/${params.modelYear}/${engineEnc}`,
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
      const fuels = data && data[0];
      setCarValues((prev) => ({
        ...prev,
        fuelTypes: fuels.fuel_types || [],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
    }
  }

  async function fetchHorsepowers(selectedEngineCapacity, selectedFuelType) {
    try {
      const token = localStorage.getItem("token");
      const brandEnc = encodeURIComponent(formatBrandLowerParser(params.brand));
      const modelEnc = encodeURIComponent(formatModelForApi(params.model));
      const engineEnc = encodeURIComponent(selectedEngineCapacity);
      const fuelEnc = encodeURIComponent(selectedFuelType);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${brandEnc}/${modelEnc}/${params.modelYear}/${engineEnc}/${fuelEnc}`,
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
      const hps = data && data[0];
      setCarValues((prev) => ({
        ...prev,
        horsepowers: hps.horsepowers || [],
      }));
    } catch (err) {
      setError(err.message);
    } finally {
    }
  }

  async function fetchTransmissions(
    selectedEngineCapacity,
    selectedFuelType,
    selectedHorsepower,
  ) {
    try {
      const token = localStorage.getItem("token");
      const brandEnc = encodeURIComponent(formatBrandLowerParser(params.brand));
      const modelEnc = encodeURIComponent(formatModelForApi(params.model));
      const engineEnc = encodeURIComponent(selectedEngineCapacity);
      const fuelEnc = encodeURIComponent(selectedFuelType);
      const hpEnc = encodeURIComponent(selectedHorsepower);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${brandEnc}/${modelEnc}/${params.modelYear}/${engineEnc}/${fuelEnc}/${hpEnc}`,
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
      const gears = data && data[0];
      setCarValues((prev) => ({
        ...prev,
        transmissions: gears.transmissions || [],
      }));
    } catch (err) {
      setError(err.message);
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
      const brandEnc = encodeURIComponent(formatBrandLowerParser(params.brand));
      const modelEnc = encodeURIComponent(formatModelForApi(params.model));
      const engineEnc = encodeURIComponent(selectedEngineCapacity);
      const fuelEnc = encodeURIComponent(selectedFuelType);
      const hpEnc = encodeURIComponent(selectedHorsepower);
      const transEnc = encodeURIComponent(selecedTransmission);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${brandEnc}/${modelEnc}/${params.modelYear}/${engineEnc}/${fuelEnc}/${hpEnc}/${transEnc}`,
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
      const bodies = data && data[0];
      setCarValues((prev) => ({
        ...prev,
        bodyTypes: bodies.body_types || [],
      }));
    } catch (err) {
      setError(err.message);
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
      const brandEnc = encodeURIComponent(formatBrandLowerParser(params.brand));
      const modelEnc = encodeURIComponent(formatModelForApi(params.model));
      const engineEnc = encodeURIComponent(selectedEngineCapacity);
      const fuelEnc = encodeURIComponent(selectedFuelType);
      const hpEnc = encodeURIComponent(selectedHorsepower);
      const transEnc = encodeURIComponent(selecedTransmission);
      const bodyEnc = encodeURIComponent(selectedBodyType);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/cars/car-value/${brandEnc}/${modelEnc}/${params.modelYear}/${engineEnc}/${fuelEnc}/${hpEnc}/${transEnc}/${bodyEnc}`,
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
      const trims = data && data[0];
      setCarValues((prev) => ({
        ...prev,
        trimLevels: trims.trim_levels || [],
      }));
    } catch (err) {
      setError(err.message);
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

  const brand = params?.brand;
  const model = params?.model;
  const bodyType = value?.bodyType;
  const modelYear = params?.modelYear;

  const stockImageSrc = getCarStockImageSrcFunc(
    brand,
    model,
    modelYear,
    bodyType,
  );

  if (error) return <p>{error}</p>;

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={tahminYapContainerVariants}
      className={classes.main}
    >
      <div className={classes.flex}>
        <motion.div variants={tahminYapItemVariants} className={classes.title}>
          <h1>Lütfen aracın bilgilerini gir</h1>
        </motion.div>
        <hr />
        <motion.div
          variants={tahminYapItemVariants}
          className={classes.flexContainer}
        >
          <div className={classes.flexContainer1}>
            <Image
              className={classes.carLogo}
              src={`/images/car_logos/${params.brand}.png`}
              alt={`${params.brand} logo`}
              width={70}
              height={70}
            />

            {stockImageSrc && (
              <motion.img
                variants={tahminYapImageVariants}
                initial="hidden"
                animate="visible"
                whileHover={{
                  scale: 1.2,
                  transition: { duration: 0.5, ease: "easeOut" },
                }}
                className={`${classes.carImg} ${classes.visible}`}
                src={stockImageSrc}
              />
            )}

            <p className={classes.carYear}>{params.modelYear}</p>
          </div>

          <div className={classes.flexContainer2}>
            <motion.form
              className={classes.form}
              onSubmit={submitHandler}
              variants={tahminYapFormContainerVariants}
            >
              <motion.div
                variants={tahminYapItemVariants}
                className={`${classes.engineCapacityWrapper} dropdownWrapper`}
              >
                <div
                  className={`dropdown ${errors.engineCapacity ? "notSelected" : ""} ${
                    value.engineCapacity !== "Motor Hacmi"
                      ? classes.selected
                      : ""
                  } ${shake.shakeEngineCapacity ? "notSelectedAnimation" : ""} ${
                    openDropdown === "engineCapacity" ? classes.boxShadow : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(
                      openDropdown === "engineCapacity"
                        ? null
                        : "engineCapacity",
                    );
                  }}
                >
                  <span>
                    {value.engineCapacity !== "Motor Hacmi"
                      ? `${value.engineCapacity} cc`
                      : value.engineCapacity}
                  </span>
                </div>

                <AnimatePresence>
                  {openDropdown === "engineCapacity" && (
                    <motion.ul
                      variants={tahminYapDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="dropdownList"
                    >
                      {carValues.engineCapacities.map(
                        (engineCapacity, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              fetchFuelTypes(engineCapacity);
                              setOpenDropdown(null);
                              setValue((prevValues) => ({
                                ...prevValues,
                                engineCapacity,
                                fuelType: "Yakıt Tipi",
                                horsepower: "Beygir Gücü",
                                transmission: "Vites Tipi",
                                trimLevel: "Paket",
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
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={tahminYapItemVariants}
                className="dropdownWrapper"
              >
                <div
                  className={`dropdown ${errors.fuelType ? "notSelected" : ""} ${
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
                        capitalizeWords(value.fuelType)}
                  </span>
                </div>

                <AnimatePresence>
                  {openDropdown === "fuelType" && (
                    <motion.ul
                      variants={tahminYapDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="dropdownList"
                    >
                      {carValues.fuelTypes.map((fuelType, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setValue((prevValues) => ({
                              ...prevValues,
                              fuelType,
                              horsepower: "Beygir Gücü",
                              transmission: "Vites Tipi",
                              trimLevel: "Paket",
                            }));
                            fetchHorsepowers(value.engineCapacity, fuelType);
                            setOpenDropdown(null);
                            setErrors((prevError) => ({
                              ...prevError,
                              fuelType: false,
                            }));
                          }}
                        >
                          {carTypeMap.fuelTypeMap[fuelType] ||
                            capitalizeWords(fuelType)}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={tahminYapItemVariants}
                className="dropdownWrapper"
              >
                <div
                  className={`dropdown ${errors.horsepower ? "notSelected" : ""} ${
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

                <AnimatePresence>
                  {openDropdown === "horsepower" && (
                    <motion.ul
                      variants={tahminYapDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="dropdownList"
                    >
                      {carValues.horsepowers.map((hp, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setValue((prev) => ({
                              ...prev,
                              horsepower: hp,
                              transmission: "Vites Tipi",
                              trimLevel: "Paket",
                            }));
                            fetchTransmissions(
                              value.engineCapacity,
                              value.fuelType,
                              hp,
                            );
                            setOpenDropdown(null);
                            setErrors((prev) => ({
                              ...prev,
                              horsepower: false,
                            }));
                          }}
                        >
                          {hp} hp
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={tahminYapItemVariants}
                className="dropdownWrapper"
              >
                <div
                  className={`dropdown ${errors.transmission ? "notSelected" : ""} ${
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
                        capitalizeWords(value.transmission)}
                  </span>
                </div>

                <AnimatePresence>
                  {openDropdown === "transmission" && (
                    <motion.ul
                      variants={tahminYapDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="dropdownList"
                    >
                      {carValues.transmissions.map((trans, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            setValue((prev) => ({
                              ...prev,
                              transmission: trans,
                              trimLevel: "Paket",
                            }));
                            fetchBodyTypes(
                              value.engineCapacity,
                              value.fuelType,
                              value.horsepower,
                              trans,
                            );
                            setOpenDropdown(null);
                            setErrors((prev) => ({
                              ...prev,
                              transmission: false,
                            }));
                          }}
                        >
                          {carTypeMap.transmissionTypeMap[trans] ||
                            capitalizeWords(trans)}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={tahminYapItemVariants}
                className="dropdownWrapper"
              >
                <div
                  className={`dropdown ${errors.bodyType ? "notSelected" : ""} ${
                    value.bodyType !== "Kasa Tipi" ? classes.selected : ""
                  } ${shake.shakeBodyType ? "notSelectedAnimation" : ""} ${
                    openDropdown === "bodyType" ? classes.boxShadow : ""
                  }`}
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
                      capitalizeWords(value.bodyType)}
                </div>

                <AnimatePresence>
                  {openDropdown === "bodyType" && !isFromImage && (
                    <motion.ul
                      variants={tahminYapDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="dropdownList"
                    >
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
                              bodyType,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              bodyType: false,
                            }));
                          }}
                        >
                          {carTypeMap.bodyTypeMap[bodyType] ||
                            capitalizeWords(bodyType)}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={tahminYapItemVariants}
                className="dropdownWrapper"
              >
                <div
                  className={`dropdown ${errors.trimLevel ? "notSelected" : ""} ${
                    value.trimLevel !== "Paket" ? classes.selected : ""
                  } ${shake.shakeTrimLevel ? "notSelectedAnimation" : ""} ${
                    openDropdown === "trimLevel" ? classes.boxShadow : ""
                  }`}
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === "trimLevel" ? null : "trimLevel",
                    )
                  }
                >
                  {value.trimLevel === "Paket"
                    ? "Paket"
                    : carTypeMap.trimLevelMap[value.trimLevel] ||
                      capitalizeWords(value.trimLevel)}
                </div>

                <AnimatePresence>
                  {openDropdown === "trimLevel" && (
                    <motion.ul
                      variants={tahminYapDropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="dropdownList"
                    >
                      {carValues.trimLevels.map((trimLevel) => (
                        <li
                          key={trimLevel}
                          onClick={() => {
                            setOpenDropdown(null);
                            setValue((prevValues) => ({
                              ...prevValues,
                              trimLevel,
                            }));
                            setErrors((prevError) => ({
                              ...prevError,
                              trimLevel: false,
                            }));
                          }}
                        >
                          {carTypeMap.trimLevelMap[trimLevel] ||
                            capitalizeWords(trimLevel)}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.input
                variants={tahminYapItemVariants}
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

              <motion.div
                variants={tahminYapItemVariants}
                style={{
                  gridColumn: "span 2",
                  width: "100%",
                }}
              >
                <PrimaryButton
                  text={
                    carValuePredictMutateIsPending
                      ? "Yükleniyor..."
                      : "Hasar Bilgilerini Gir"
                  }
                  disabled={carValuePredictMutateIsPending}
                  type="submit"
                  className={classes.button}
                />
              </motion.div>
              {carValuePredictMutateIsError && (
                <motion.div
                  variants={tahminYapItemVariants}
                  style={{
                    gridColumn: "span 2",
                    color: "#ff6363",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  {carValuePredictMutateError?.message ||
                    "Tahmin işlemi sırasında bir hata oluştu."}
                </motion.div>
              )}
            </motion.form>
          </div>
        </motion.div>
      </div>
    </motion.main>
  );
}
