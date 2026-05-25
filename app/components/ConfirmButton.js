import classes from "./ConfirmButton.module.css";

export default function ConfirmButton({ className, type, onClick, text }) {
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
