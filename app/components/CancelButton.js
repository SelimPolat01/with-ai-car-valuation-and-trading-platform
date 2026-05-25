import classes from "./CancelButton.module.css";

export default function CancelButton({ text, type, onClick, className }) {
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
