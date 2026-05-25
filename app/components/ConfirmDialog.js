import { forwardRef } from "react";
import { createPortal } from "react-dom";
import classes from "./ConfirmDialog.module.css";
import CancelButton from "./CancelButton";
import ConfirmButton from "./ConfirmButton";
import { Trash2 } from "lucide-react";

const ConfirmDialog = forwardRef(({ onConfirm, text, title }, ref) => {
  function handleConfirm() {
    onConfirm();
    ref.current?.close();
  }

  function handleCancel(event) {
    event.preventDefault();
    ref.current?.close();
  }

  return createPortal(
    <dialog className={classes.dialog} ref={ref}>
      <div className={classes.modalContainer}>
        <div className={classes.trashContainer}>
          <Trash2 size={35} color="#ef4444" />
        </div>
        <h2 className={classes.title}>{title}</h2>
        <p className={classes.text}>{text}</p>
        <div className={classes.buttonWrapperDiv}>
          <CancelButton
            text="İptal Et"
            type="button"
            onClick={handleCancel}
            className={classes.cancelButton}
          />
          <ConfirmButton
            className={classes.confirmButton}
            text="Onayla"
            type="button"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </dialog>,
    document.body,
  );
});

export default ConfirmDialog;
