import Link from "next/link";
import Button from "./Button";
import classes from "./FavoriteAdvertItem.module.css";
import { motion } from "framer-motion";

export default function FavoriteAdvertItem({
  advert,
  onDeleteDialog,
  showDeleteButton,
}) {
  function capitalizeText(text) {
    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
  function engineCapacityFormat(engineCapacity) {
    if (!engineCapacity) return "";
    return (+engineCapacity / 1000).toFixed(1);
  }

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
          <img src={advert.image_src} alt={advert.title} />
        </Link>
      </div>
      <div className={classes.titleBrandModelDiv}>
        <Link
          href={`/ilan/${advert.brand}-${advert.model}-${advert.model_year}/${advert.id}`}
        >
          {advert.title}
        </Link>
        <p>
          {capitalizeText(advert.brand)}{" "}
          <i className="bi bi-caret-right-fill"></i>{" "}
          {capitalizeText(advert.model)}{" "}
          <i className="bi bi-caret-right-fill"></i>
          {engineCapacityFormat(advert.engine_capacity)}
        </p>
      </div>
      <div className={classes.priceDiv}>
        <p>{Number(advert.price).toLocaleString("tr-TR")} ₺</p>
      </div>
      {showDeleteButton && (
        <Button
          className={classes.deleteAdvertButton}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onDeleteDialog();
          }}
          title="İlanı Kaldır"
        />
      )}
    </motion.div>
  );
}
