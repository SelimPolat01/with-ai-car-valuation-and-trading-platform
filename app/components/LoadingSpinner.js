import classes from "./LoadingSpinner.module.css";

export default function LoadingSpinner() {
  return (
    <div className={classes.loadingWrapper}>
      <div className={classes.loading}></div>
    </div>
  );
}
