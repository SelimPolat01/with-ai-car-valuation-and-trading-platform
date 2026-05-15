import { useDispatch } from "react-redux";
import Button from "./Button";
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
      <Button
        className={classes.button}
        onClick={() => filterBrandHandler(brand)}
      >
        {capitalize(decodeURIComponent(brand))}
      </Button>
    </li>
  );
}
