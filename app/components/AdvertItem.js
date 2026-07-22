import { useRouter } from "next/navigation";
import classes from "./AdvertItem.module.css";
import { motion } from "framer-motion";
import {
  modelParser,
  brandParser,
  engineCapacityFormat,
  formatPrice,
  capitalizeWords,
} from "@/app/utils/helpers";
import { advertItemVariants } from "@/app/utils/animations";

export default function AdvertItem({
  id,
  imgSrc,
  brand,
  model,
  engineCapacity,
  modelYear,
  price,
  city,
  onDeleteDialog,
  showDeleteButton = false,
  showEditButton = false,
}) {
  const router = useRouter();

  function editAdvertHandler() {
    router.replace(`/ilani-duzenle/${id}`);
  }

  return (
    <motion.div
      layout
      className={classes.advertWrapper}
      initial={advertItemVariants.initial}
      animate={advertItemVariants.animate}
      exit={advertItemVariants.exit}
      transition={advertItemVariants.transition}
      onClick={() => {
        router.push(`/ilan/${brand}-${model}-${modelYear}/${id}`);
      }}
    >
      <div className={classes.advert}>
        <div className={classes.overlay}></div>
        <div className={classes.imgDiv}>
          <>
            {showEditButton && (
              <button
                className={classes.editAdvertButton}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  editAdvertHandler();
                }}
                title="İlanı Düzenle"
              >
                <span className="material-icons">edit</span>
              </button>
            )}
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
              ></button>
            )}
          </>
          <img className={classes.img} src={imgSrc} />
        </div>
        <div className={classes.modelYearDiv}>
          <p className={classes.city}>{capitalizeWords(city)}</p>
          <p className={classes.modelYear}>{modelYear}</p>
        </div>
        <div className={classes.brandModelEngineCapacityDiv}>
          <p className={classes.brandModel}>
            {decodeURIComponent(brandParser(brand))}{" "}
            {decodeURIComponent(modelParser(model))}
          </p>
          <p className={classes.engineCapacity}>
            {engineCapacityFormat(engineCapacity)} TDI
          </p>
        </div>

        <div className={classes.priceDiv}>
          <p className={classes.price}>{formatPrice(price)} ₺</p>
        </div>
      </div>
    </motion.div>
  );
}
