import classes from "./Loading.module.css";

export default function Loading({ className }) {
  return (
    <div
      className={`${classes.loadingContainer} ${className ? className : ""}`}
    >
      <div className={classes.spinner}></div>
    </div>
  );
}
