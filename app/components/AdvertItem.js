import { useRouter } from "next/navigation";
import classes from "./AdvertItem.module.css";
import { motion } from "framer-motion";
import {
  modelParser,
  brandParser,
  engineCapacityFormat,
  formatPrice,
} from "@/app/utils/helpers";
import { advertItemVariants } from "@/app/utils/animations";

export default function AdvertItem({
  id,
  onClick,
  imgSrc,
  brand,
  model,
  engineCapacity,
  modelYear,
  price,
  onDeleteDialog,
  onRecoveryDialog,
  showDeleteButton = false,
  showEditButton = false,
  showRecoveryButton = false,
}) {
  const router = useRouter();

  function editAdvertHandler() {
    router.replace(`/ilani-duzenle/${id}`);
  }

  return (
    <motion.div
      layout
      role="button"
      className={classes.advertWrapper}
      variants={advertItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={() => {
        if (onClick) {
          onClick();
        }
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
            {showRecoveryButton && (
              <button
                className={classes.recoveryAdvertButton}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onRecoveryDialog();
                }}
                title="İlanı Tekrar Yayınla"
              >
                <span className="material-icons">restore_page</span>
              </button>
            )}
          </>
          <img className={classes.img} src={imgSrc} alt="Araç Görseli" />
        </div>

        <div className={classes.content}>
          <div className={classes.titleRow}>
            <p className={classes.brandModel}>
              {decodeURIComponent(brandParser(brand))}{" "}
              {decodeURIComponent(modelParser(model))}
            </p>
            <p className={classes.modelYear}>{modelYear}</p>
          </div>

          <p className={classes.engineCapacity}>
            {engineCapacityFormat(engineCapacity)} TDI
          </p>

          <div className={classes.priceDiv}>
            <p className={classes.price}>{formatPrice(price)} ₺</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
