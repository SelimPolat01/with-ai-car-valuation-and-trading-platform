import Link from "next/link";
import classes from "./FavoriteAdvertItem.module.css";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function FavoriteAdvertItem({
  advert,
  onDeleteDialog,
  showDeleteButton,
}) {
  const advertImage =
    advert?.images && advert.images.length > 0
      ? advert.images[0].image_data || "/images/no-image.png"
      : advert?.image_data || "/images/no-image.png";

  const formatPrice = (price) => {
    if (!price) return "";
    return Number(price).toLocaleString("tr-TR") + " ₺";
  };

  const formatBrand = (brand) => {
    if (!brand) return "";
    const b = brand.trim().toLowerCase();
    const specialBrands = {
      bmw: "BMW",
      "mercedes-benz": "Mercedes-Benz",
    };
    if (specialBrands[b]) return specialBrands[b];
    return b
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatModel = (model) => {
    if (!model) return "";
    const m = model.trim().toLowerCase();
    const specialModels = {
      "a series": "A Serisi",
      "e series": "E Serisi",
      "1 series": "1 Series",
      "3 series": "3 Series",
      "5 series": "5 Series",
      "c-elysee": "C-Elysee",
      i20: "i20",
      "t-roc": "T-Roc",
    };
    if (specialModels[m]) return specialModels[m];
    return m
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  function engineCapacityFormat(engineCapacity) {
    if (!engineCapacity) return "";
    return (+engineCapacity / 1000).toFixed(1);
  }

  const carTypeMap = {
    bodyTypeMap: {
      sedan: "Sedan",
      suv: "SUV",
      hatchback: "Hatchback",
      station_wagon: "Station Wagon",
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

  if (!advert) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      className={classes.advertDiv}
    >
      <div className={classes.imageDiv}>
        <Link
          href={`/ilan/${advert.brand}-${advert.model}-${advert.model_year}/${advert.id}`}
        >
          <img src={advertImage} alt={advert.title} />
        </Link>
      </div>

      <div className={classes.titleBrandModelDiv}>
        <Link
          href={`/ilan/${advert.brand}-${advert.model}-${advert.model_year}/${advert.id}`}
          className={classes.titleLink}
        >
          {advert.title}
        </Link>
        <p className={classes.carDetails}>
          {formatBrand(advert.brand)} <i className="bi bi-caret-right-fill"></i>{" "}
          {formatModel(advert.model)} <i className="bi bi-caret-right-fill"></i>
          {engineCapacityFormat(advert.engine_capacity)}
        </p>
      </div>

      <div className={classes.priceDiv}>
        <p>{formatPrice(advert.price)}</p>
      </div>

      {showDeleteButton && (
        <button
          className={classes.deleteAdvertButton}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onDeleteDialog();
          }}
          title="İlanı Kaldır"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      )}
    </motion.div>
  );
}
