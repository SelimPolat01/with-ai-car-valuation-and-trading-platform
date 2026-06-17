import { useRouter } from "next/navigation";
import classes from "./AdvertItem.module.css";
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

  function modelParser(model) {
    if (!model) return;
    if (model === "1 series") return "1 Series";
    if (model === "3 series") return "3 Series";
    if (model === "5 series") return "5 Series";
    if (model === "c series") return "C Series";
    if (model === "e series") return "E Series";
    return model.charAt(0).toUpperCase() + model.slice(1).toLowerCase();
  }

  function capitalizeText(text) {
    if (!text) return;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  function brandParser(brand) {
    if (!brand) return;
    if (brand === "bmw") return "BMW";
    return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
  }

  function engineCapacityFormat(engineCapacity) {
    if (!engineCapacity) return;
    return (+engineCapacity / 1000).toFixed(1);
  }

  function priceFormat(price) {
    if (!price) return;
    return Number(price).toLocaleString("tr-TR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
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
          <p className={classes.city}>{capitalizeText(city)}</p>
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
          <p className={classes.price}>{priceFormat(price)} ₺</p>
        </div>
      </div>
    </motion.div>
  );
}
