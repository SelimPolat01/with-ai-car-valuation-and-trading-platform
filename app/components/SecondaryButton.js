import classes from "./SecondaryButton.module.css";

export default function SecondaryButton({ className, type, onClick, text }) {
  return (
    <button
      className={`${classes.button} ${className ? className : ""}`}
      type={type}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
