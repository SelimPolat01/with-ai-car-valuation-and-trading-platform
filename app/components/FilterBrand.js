import { useDispatch } from "react-redux";
import classes from "./FilterBrand.module.css";
import { setFilterAdverts } from "@/store/advertsSlice";

export default function FilterBrand({ brand }) {
  const dispatch = useDispatch();
  function filterBrandHandler(brand) {
    dispatch(setFilterAdverts(brand));
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
        className={classes.button}
        onClick={() => filterBrandHandler(brand)}
      >
        {capitalize(decodeURIComponent(brand))}
      </button>
    </li>
  );
}
