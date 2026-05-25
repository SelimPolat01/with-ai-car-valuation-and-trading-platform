import classes from "./PrimaryButton.module.css";

export default function PrimaryButton({ className, type, onClick, text }) {
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
