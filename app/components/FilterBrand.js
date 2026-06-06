import { useDispatch, useSelector } from "react-redux";
import classes from "./FilterBrand.module.css";
import { setFilterAdverts } from "@/store/advertsSlice";

export default function FilterBrand({ brand, count }) {
  const dispatch = useDispatch();
  const selectedBrand = useSelector((state) => state.adverts.selectedBrand);
  const isActive = selectedBrand === brand;

  function filterBrandHandler() {
    if (isActive) {
      dispatch(setFilterAdverts(null));
    } else {
      dispatch(setFilterAdverts(brand));
    }
  }

  function capitalize(text) {
    if (typeof text !== "string") {
      return "";
    }
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  return (
    <li className={classes.li}>
      <button
        className={`${classes.button} ${isActive ? classes.active : ""}`}
        onClick={() => filterBrandHandler()}
      >
        {capitalize(decodeURIComponent(brand))} ({count})
      </button>
    </li>
  );
}
