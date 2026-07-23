import classes from "./Loading.module.css";

export default function Loading() {
  return (
    <div className={classes.loadingContainer}>
      <div className={classes.spinner}></div>
    </div>
  );
}
