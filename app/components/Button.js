export default function Button({
  className = "",
  type,
  text,
  onClick,
  cancelButton,
  title,
  children,
}) {
  const combainedClassName = `${className} ${
    cancelButton ? "cancelButton" : ""
  }`;
  return (
    <button
      className={combainedClassName}
      type={type}
      onClick={onClick}
      title={title}
    >
      {children || text}
    </button>
  );
}
