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
  const [loading, setLoading] = useState(false);
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

  const brandLogos = {
    audi: classes.audiLogo,
    bmw: classes.bmwLogo,
    chevrolet: classes.chevroletLogo,
    citroen: classes.citroenLogo,
    dacia: classes.daciaLogo,
    fiat: classes.fiatLogo,
    ford: classes.fordLogo,
    honda: classes.hondaLogo,
    hyundai: classes.hyundaiLogo,
    mercedes: classes.mercedesLogo,
    renault: classes.renaultLogo,
    toyota: classes.toyotaLogo,
    volkswagen: classes.volkswagenLogo,
  };

  const carTypeMap = {
    trimLevelMap: { ambition: "Ambition" },
    bodyTypeMap: { sedan: "Sedan", suv: "SUV", hatchback: "Hatchback" },
    fuelTypeMap: { gasoline: "Benzin", diesel: "Dizel", hybrid: "Hibrit" },
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

  function formatModelForApi(modelParam) {
    if (!modelParam) return "";
    let model = decodeURIComponent(modelParam).toLowerCase().trim();
    model = model.replace(/\s+/g, " ");
    return model;
  }

  function brandParser(brand) {
    if (!brand) return;
    if (brand == "mercedes") return "mercedes-benz";
    return brand.toLowerCase();
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
        setLoading(false);
      }
    }
    fetchEngineCapacities(
      brandParser(params.brand),
      formatModelForApi(params.model.toLowerCase()),
      params.modelYear,
    );
  }, [params.brand, params.model, params.modelYear]);

  async function fetchFuelTypes(selectedEngineCapacity) {
    try {
      const token = localStorage.getItem("token");
      const brandEnc = encodeURIComponent(brandParser(params.brand));
      const modelEnc = encodeURIComponent(formatModelForApi(params.model));
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
      setLoading(false);
    }
  }

  async function fetchHorsepowers(selectedEngineCapacity, selectedFuelType) {
    try {
      const token = localStorage.getItem("token");
      const brandEnc = encodeURIComponent(brandParser(params.brand));
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
      const brandEnc = encodeURIComponent(brandParser(params.brand));
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
      const brandEnc = encodeURIComponent(brandParser(params.brand));
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
      const brandEnc = encodeURIComponent(brandParser(params.brand));
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

  function capitalizeWords(text) {
    if (typeof text !== "string") {
      return "";
    }
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  const carGenerations = {
    audi: {
      a3: {
        hatchback: [
          { start: 2004, end: 2012, interval: "2004-2012" },
          { start: 2012, end: 2016, interval: "2012-2016" },
          { start: 2016, end: 2020, interval: "2016-2020" },
          { start: 2020, end: 2024, interval: "2020-2024" },
          { start: 2024, end: 2025, interval: "2024-2025" },
        ],
        sedan: [
          { start: 2013, end: 2016, interval: "2013-2016" },
          { start: 2016, end: 2020, interval: "2016-2020" },
          { start: 2020, end: 2025, interval: "2020-2025" },
        ],
      },
      a4: {
        sedan: [
          { start: 2012, end: 2015, interval: "2012-2015" },
          { start: 2015, end: 2019, interval: "2015-2019" },
          { start: 2019, end: 2024, interval: "2019-2024" },
        ],
      },
    },
    bmw: {
      "1series": {
        hatchback: [
          { start: 2004, end: 2011, interval: "2004-2011" },
          { start: 2011, end: 2014, interval: "2011-2014" },
          { start: 2015, end: 2019, interval: "2015-2019" },
          { start: 2019, end: 2025, interval: "2019-2025" },
        ],
      },
      "3series": {
        sedan: [
          { start: 2012, end: 2015, interval: "2012-2015" },
          { start: 2015, end: 2019, interval: "2015-2019" },
          { start: 2019, end: 2023, interval: "2019-2023" },
          { start: 2023, end: 2025, interval: "2023-2025" },
        ],
      },
      "5series": {
        sedan: [
          { start: 2007, end: 2010, interval: "2007-2010" },
          { start: 2011, end: 2016, interval: "2011-2016" },
          { start: 2017, end: 2023, interval: "2017-2023" },
          { start: 2024, end: 2025, interval: "2024-2025" },
        ],
      },
    },
    chevrolet: {
      cruze: {
        sedan: [
          { start: 2009, end: 2012, interval: "2009-2012" },
          { start: 2012, end: 2013, interval: "2012-2013" },
        ],
        hatchback: [{ start: 2011, end: 2013, interval: "2011-2013" }],
      },
    },
    citroen: {
      c3: {
        hatchback: [
          { start: 2002, end: 2009, interval: "2002-2009" },
          { start: 2010, end: 2016, interval: "2010-2016" },
          { start: 2016, end: 2020, interval: "2016-2020" },
          { start: 2020, end: 2024, interval: "2020-2024" },
        ],
      },
      c4: {
        hatchback: [
          { start: 2014, end: 2020, interval: "2014-2020" },
          { start: 2020, end: 2024, interval: "2020-2024" },
          { start: 2024, end: 2025, interval: "2024-2025" },
        ],
      },
      celysee: {
        sedan: [
          { start: 2012, end: 2017, interval: "2012-2017" },
          { start: 2017, end: 2023, interval: "2017-2023" },
        ],
      },
    },
    dacia: {
      duster: {
        suv: [
          { start: 2010, end: 2017, interval: "2010-2017" },
          { start: 2018, end: 2023, interval: "2018-2023" },
          { start: 2024, end: 2024, interval: "2024-2024" },
        ],
      },
    },
    fiat: {
      egea: {
        sedan: [
          { start: 2015, end: 2021, interval: "2015-2021" },
          { start: 2021, end: 2026, interval: "2021-2026" },
        ],
        hatchback: [
          { start: 2016, end: 2021, interval: "2016-2021" },
          { start: 2021, end: 2024, interval: "2021-2024" },
        ],
      },
    },
    ford: {
      fiesta: {
        hatchback: [
          { start: 2008, end: 2013, interval: "2008-2013" },
          { start: 2013, end: 2017, interval: "2013-2017" },
          { start: 2017, end: 2020, interval: "2017-2020" },
        ],
      },
      focus: {
        sedan: [
          { start: 2011, end: 2014, interval: "2011-2014" },
          { start: 2014, end: 2018, interval: "2014-2018" },
          { start: 2018, end: 2022, interval: "2018-2022" },
          { start: 2022, end: 2025, interval: "2022-2025" },
        ],
        hatchback: [
          { start: 2011, end: 2014, interval: "2011-2014" },
          { start: 2014, end: 2018, interval: "2014-2018" },
          { start: 2018, end: 2022, interval: "2018-2022" },
          { start: 2022, end: 2025, interval: "2022-2025" },
        ],
      },
    },
    honda: {
      civ: {
        sedan: [
          { start: 2006, end: 2011, interval: "2006-2011" },
          { start: 2011, end: 2016, interval: "2011-2016" },
          { start: 2016, end: 2021, interval: "2016-2021" },
          { start: 2021, end: 2025, interval: "2021-2025" },
        ],
      },
    },
    hyundai: {
      i20: {
        hatchback: [
          { start: 2014, end: 2020, interval: "2014-2020" },
          { start: 2020, end: 2025, interval: "2020-2025" },
        ],
      },
    },
    mercedes: {
      cseries: {
        sedan: [
          { start: 2007, end: 2011, interval: "2007-2011" },
          { start: 2011, end: 2014, interval: "2011-2014" },
          { start: 2014, end: 2021, interval: "2014-2021" },
          { start: 2021, end: 2025, interval: "2021-2025" },
        ],
      },
      eseries: {
        sedan: [
          { start: 2009, end: 2013, interval: "2009-2013" },
          { start: 2014, end: 2016, interval: "2014-2016" },
          { start: 2016, end: 2020, interval: "2016-2020" },
          { start: 2020, end: 2023, interval: "2020-2023" },
          { start: 2023, end: 2025, interval: "2023-2025" },
        ],
      },
    },
    renault: {
      clio: {
        hatchback: [
          { start: 2012, end: 2019, interval: "2012-2019" },
          { start: 2019, end: 2023, interval: "2019-2023" },
          { start: 2023, end: 2025, interval: "2019-2025" },
        ],
      },
      megane: {
        sedan: [
          { start: 2016, end: 2020, interval: "2016-2020" },
          { start: 2020, end: 2025, interval: "2020-2025" },
        ],
        hatchback: [
          { start: 2011, end: 2014, interval: "2011-2014" },
          { start: 2014, end: 2016, interval: "2014-2016" },
          { start: 2016, end: 2020, interval: "2016-2020" },
        ],
      },
    },
    toyota: {
      corolla: {
        sedan: [
          { start: 2013, end: 2018, interval: "2013-2018" },
          { start: 2019, end: 2026, interval: "2019-2026" },
        ],
      },
    },
    volkswagen: {
      golf: {
        hatchback: [
          { start: 2012, end: 2017, interval: "2012-2017" },
          { start: 2017, end: 2020, interval: "2017-2020" },
          { start: 2020, end: 2024, interval: "2020-2024" },
          { start: 2024, end: 2025, interval: "2024-2025" },
        ],
      },
      jetta: {
        sedan: [
          { start: 2011, end: 2014, interval: "2011-2014" },
          { start: 2014, end: 2017, interval: "2014-2017" },
        ],
      },
      passat: {
        sedan: [
          { start: 2011, end: 2014, interval: "2011-2014" },
          { start: 2014, end: 2019, interval: "2014-2019" },
          { start: 2019, end: 2022, interval: "2019-2022" },
        ],
      },
      polo: {
        hatchback: [
          { start: 2010, end: 2017, interval: "2010-2017" },
          { start: 2018, end: 2021, interval: "2018-2021" },
          { start: 2021, end: 2025, interval: "2021-2025" },
        ],
      },
      tiguan: {
        suv: [
          { start: 2011, end: 2016, interval: "2011-2016" },
          { start: 2016, end: 2020, interval: "2016-2020" },
          { start: 2020, end: 2024, interval: "2020-2024" },
          { start: 2024, end: 2025, interval: "2024-2025" },
        ],
      },
      troc: {
        suv: [
          { start: 2019, end: 2021, interval: "2019-2021" },
          { start: 2022, end: 2025, interval: "2022-2025" },
        ],
      },
    },
  };

  function findIntervalFromYear(
    brandParam,
    modelParam,
    bodyType,
    selectedYear,
  ) {
    if (!brandParam || !modelParam || !bodyType || !selectedYear) return null;
    const brandKey = brandParam.toLowerCase().trim();
    let decodedModel = decodeURIComponent(modelParam);
    let modelKey = decodedModel
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "")
      .replace(/-/g, "");
    if (modelKey.includes("serisi")) {
      modelKey = modelKey.replace("serisi", "series");
    }
    const body = bodyType.toLowerCase().trim();
    const year = Number(selectedYear);
    const generations = carGenerations[brandKey]?.[modelKey]?.[body];
    if (!generations) {
      return null;
    }
    const foundGen = generations.find(
      (gen) => year >= gen.start && year <= gen.end,
    );
    return foundGen ? foundGen.interval : null;
  }

  const getDbModelName = (modelParam) => {
    if (!modelParam) return "";
    let name = decodeURIComponent(modelParam).toLowerCase().trim();
    name = name.replace("serisi", "series");
    return name.replace(/[\s-]/g, "");
  };

  const getCarStockImageSrc = () => {
    const brand = params?.brand;
    const model = params?.model;
    const bodyType = value?.bodyType;
    const selectedYear = params?.modelYear;
    if (!brand || !model || !bodyType || !selectedYear) return null;
    const modelStr = getDbModelName(model);
    const brandStr = brand.toLowerCase().trim();
    const bodyStr = bodyType.toLowerCase().trim();
    const finalYearInterval = findIntervalFromYear(
      brand,
      model,
      bodyType,
      selectedYear,
    );
    if (!finalYearInterval) return null;
    const [startYear, endYear] = finalYearInterval.split("-");
    const shortYearInterval = `${startYear.slice(-2)}-${endYear.slice(-2)}`;
    return `/images/cars/${brand}/${brandStr}-${modelStr}-${bodyStr}-${shortYearInterval}.png`;
  };

  const stockImageSrc = getCarStockImageSrc();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.25,
        when: "beforeChildren",
        staggerChildren: 0.03,
      },
    },
  };

  const formContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18 } },
    exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15 } },
  };

  if (error) return <p>{error}</p>;

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={classes.main}
    >
      <div className={classes.flex}>
        <motion.div variants={itemVariants} className={classes.title}>
          <h1>Lütfen aracın bilgilerini gir</h1>
        </motion.div>
        <hr />
        <motion.div variants={itemVariants} className={classes.flexContainer}>
          <div className={classes.flexContainer1}>
            <Image
              className={`${classes.carLogo} ${brandLogos[params.brand] || ""}`}
              src={`/images/car_logos/${params.brand}.png`}
              alt={`${params.brand} logo`}
              width={70}
              height={70}
            />

            {stockImageSrc && (
              <motion.img
                variants={imageVariants}
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
              variants={formContainerVariants}
            >
              <motion.div
                variants={itemVariants}
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
                      variants={dropdownVariants}
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

              <motion.div variants={itemVariants} className="dropdownWrapper">
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
                      variants={dropdownVariants}
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

              <motion.div variants={itemVariants} className="dropdownWrapper">
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
                      variants={dropdownVariants}
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

              <motion.div variants={itemVariants} className="dropdownWrapper">
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
                      variants={dropdownVariants}
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

              <motion.div variants={itemVariants} className="dropdownWrapper">
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
                      variants={dropdownVariants}
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

              <motion.div variants={itemVariants} className="dropdownWrapper">
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
                      variants={dropdownVariants}
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
                variants={itemVariants}
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
                variants={itemVariants}
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
                />
              </motion.div>
              {carValuePredictMutateIsError && (
                <motion.div
                  variants={itemVariants}
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
