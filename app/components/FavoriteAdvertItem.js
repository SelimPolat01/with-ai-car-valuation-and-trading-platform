import Link from "next/link";
import classes from "./FavoriteAdvertItem.module.css";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  engineCapacityFormat,
  formatBrandModel,
  formatPrice,
} from "../utils/helpers";

export default function FavoriteAdvertItem({
  advert,
  onDeleteDialog,
  showDeleteButton,
}) {
  const advertImage =
    advert?.images && advert.images.length > 0
      ? advert.images[0].image_data || "/images/no-image.png"
      : advert?.image_data || "/images/no-image.png";

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
          {formatBrandModel(advert.brand)}{" "}
          <i className="bi bi-caret-right-fill"></i>{" "}
          {formatBrandModel(advert.model)}{" "}
          <i className="bi bi-caret-right-fill"></i>
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
