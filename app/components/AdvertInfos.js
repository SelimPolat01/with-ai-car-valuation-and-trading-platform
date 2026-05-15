"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import { toggleFavorite } from "@/store/advertsSlice";
import { useParams, useRouter } from "next/navigation";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import classes from "./AdvertInfos.module.css";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

export default function AdvertInfos() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const [advert, setAdvert] = useState(null);
  const [showDescription, setShowDescription] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  useCheckAuth();

  useEffect(() => {
    async function fetchAdvertInfos() {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/adverts/${params.advertId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

        const advertData = await response.json();
        setAdvert(advertData);
        setIsFavorite(advertData.isFavorite);
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAdvertInfos();
  }, [params.advertId, router]);

  async function toggleFavoriteClick() {
    if (!advert || !advert.id) return;
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/adverts/favoriteAdverts/${advert.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
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
      setIsFavorite(data.isFavorite);

      dispatch(
        toggleFavorite({
          advert,
          isFavorite: data.isFavorite,
        })
      );
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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

  function engineCapacityFormat(engineCapacity) {
    if (!engineCapacity) return "";
    return (+engineCapacity / 1000).toFixed(1);
  }

  function capitalize(text) {
    if (typeof text !== "string") {
      return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

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

  const advertDetails = advert
    ? [
        {
          id: 1,
          label: "Fiyat",
          value: `${advert.price.toLocaleString("tr-TR")} ₺`,
          priceClassName: classes.price,
        },
        { id: 2, label: "Şehir", value: capitalize(advert.city) },
        {
          id: 3,
          label: "İlan No",
          value: advert.id,
          spanClassName: classes.advertNo,
        },
        {
          id: 4,
          label: "İlan Tarihi",
          value: new Date(advert.created_at).toLocaleDateString("tr-TR"),
        },
        { id: 5, label: "Marka", value: formatBrandModel(advert.brand) },
        { id: 6, label: "Seri", value: formatBrandModel(advert.model) },
        {
          id: 7,
          label: "Model",
          value: `${formatBrandModel(advert.model)} ${capitalize(
            advert.body_type
          )} ${engineCapacityFormat(advert.engine_capacity)}`,
        },
        { id: 8, label: "Yıl", value: advert.model_year },
        {
          id: 9,
          label: "Yakıt Tipi",
          value: carTypeMap.fuelTypeMap[advert.fuel_type],
        },
        {
          id: 10,
          label: "Vites Tipi",
          value: carTypeMap.transmissionTypeMap[advert.transmission],
        },
        { id: 11, label: "Araç Durumu", value: "İkinci El" },
        {
          id: 12,
          label: "Kilometre",
          value: advert.kilometer.toLocaleString("tr-Tr"),
        },
        { id: 13, label: "Kasa Tipi", value: capitalize(advert.body_type) },
        { id: 14, label: "Motor Gücü", value: `${advert.horsepower} hp` },
        {
          id: 15,
          label: "Motor Hacmi",
          value: engineCapacityFormat(advert.engine_capacity),
        },
        {
          id: 16,
          label: "Değişen",
          value: advert.changed_part_count > 0 ? "Var" : "Yok",
        },
      ]
    : [];

  // if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;
  if (!advert) return <p>İlan Bulunamadı</p>;

  return (
    <div className={classes.advertDiv}>
      <div className={classes.advertInfoDiv}>
        <div className={classes.titleFavoriteDiv}>
          <h2>{advert.title}</h2>
          {user && advert && Number(user.id) !== Number(advert.user_id) && (
            <Button
              className={classes.button}
              type="button"
              text={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
              onClick={toggleFavoriteClick}
              cancelButton
            />
          )}
        </div>
        <div className={classes.advertInfoWrapper1}>
          <div className={classes.imgDiv}>
            <img
              className={classes.img}
              src={advert.image_src}
              alt={advert.title}
            />
          </div>
          <div className={classes.advertInfoWrapper2}>
            <ul className={classes.ul}>
              {advertDetails.map((adv) => (
                <li key={adv.id} className={classes.li}>
                  <strong className={classes.strong}>{adv.label}</strong>
                  <span className={adv.priceClassName || adv.spanClassName}>
                    {adv.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={classes.userInfoDiv}>
            <div className={classes.userInfoWrapper}>
              <div className={classes.userNameCreatedDiv}>
                <div className={classes.userNameCreatedWrapper}>
                  <h3 className={classes.userName}>
                    {capitalize(advert.user_name)}{" "}
                    {capitalize(advert.user_surname.charAt(0))}.
                  </h3>
                  <p className={classes.userCreatedAt}>
                    Hesap açma tarihi:{" "}
                    <span>
                      {new Date(advert.user_created).toLocaleDateString(
                        "tr-TR",
                        {
                          year: "numeric",
                          month: "long",
                        }
                      )}
                    </span>
                  </p>
                </div>
                <div className={classes.userPicDiv}>
                  <img
                    src="/images/user-profile.png"
                    alt="user profile picture"
                  />
                </div>
              </div>
              <div className={classes.userTelDiv}>
                <div className={classes.userTelWrapper}>
                  <strong>Cep</strong>
                  <span className={classes.userTel}>{advert.user_tel}</span>
                </div>
              </div>
              {user && advert && Number(user.id) !== Number(advert.user_id) && (
                <div className={classes.messageLink}>
                  <Link href={`/mesajlarim/detay/${advert.id}`}>
                    Mesaj Gönder
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={classes.descriptionDiv}>
          <div
            onClick={() => setShowDescription((prevValue) => !prevValue)}
            className={`${classes.descriptionTextDiv} ${
              showDescription
                ? classes.semiBorderRadius
                : classes.fullBorderRadius
            }`}
          >
            Açıklama
          </div>
          {showDescription && (
            <div className={classes.descriptionDiv}>
              <div className={classes.descriptionWrapper}>
                <p className={classes.description}>{advert.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
