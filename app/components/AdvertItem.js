import { useRouter } from "next/navigation";
import classes from "./AdvertItem.module.css";
import Button from "./Button";
import { motion } from "framer-motion";

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

  function capitalizeText(text) {
    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  function engineCapacityFormat(engineCapacity) {
    if (!engineCapacity) return "";
    return (+engineCapacity / 1000).toFixed(1);
  }

  function editAdvertHandler() {
    router.replace(`/ilani-duzenle/${id}`);
  }

  return (
    <motion.div
      layout
      className={classes.advertWrapper}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
      onClick={() => {
        router.replace(`/ilan/${brand}-${model}-${modelYear}/${id}`);
      }}
    >
      <div className={classes.advert}>
        <div className={classes.overlay}></div>
        <div className={classes.imgDiv}>
          <>
            {showEditButton && (
              <Button
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
              </Button>
            )}
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
          </>
          <img className={classes.img} src={imgSrc} />
        </div>
        <div className={classes.modelYearDiv}>
          <p className={classes.city}>{capitalizeText(city)}</p>
          <p className={classes.modelYear}>{modelYear}</p>
        </div>
        <div className={classes.brandModelEngineCapacityDiv}>
          <p className={classes.brandModel}>
            {decodeURIComponent(capitalizeText(brand))}{" "}
            {decodeURIComponent(capitalizeText(model))}
          </p>
          <p className={classes.engineCapacity}>
            {engineCapacityFormat(engineCapacity)} TDI
          </p>
        </div>

        <div className={classes.priceDiv}>
          <p className={classes.price}>{price.toLocaleString("tr-TR")} ₺</p>
        </div>
      </div>
    </motion.div>
  );
}
