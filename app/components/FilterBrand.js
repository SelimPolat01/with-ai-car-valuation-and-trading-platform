import { useDispatch, useSelector } from "react-redux";
import classes from "./FilterBrand.module.css";
import { setFilterAdverts } from "@/store/advertsSlice";
import { formatBrandModel } from "../utils/helpers";

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

  return (
    <li className={classes.li}>
      <button
        className={`${classes.button} ${isActive ? classes.active : ""}`}
        onClick={() => filterBrandHandler()}
      >
        {formatBrandModel(decodeURIComponent(brand))} ({count})
      </button>
    </li>
  );
}
