import { forwardRef } from "react";
import { createPortal } from "react-dom";
import Button from "./Button";
import classes from "./ConfirmDialog.module.css";

const ConfirmDialog = forwardRef(({ onConfirm, text }, ref) => {
  function handleConfirm() {
    onConfirm();
    ref.current?.close();
  }

  function handleCancel() {
    ref.current?.close();
  }

  return createPortal(
    <dialog className={classes.dialog} ref={ref}>
      <h3 className={classes.h3}>ONAY</h3>
      <p className={classes.p}>
        {text} istediğinize emin misiniz?
        <br />
        Bu işlem geri alınamaz.
      </p>
      <div className={classes.buttonWrapperDiv}>
        <Button
          text="İptal Et"
          type="button"
          onClick={handleCancel}
          cancelButton
        />
        <Button
          className={classes.confirmButton}
          text="Onayla"
          type="button"
          onClick={handleConfirm}
        />
      </div>
    </dialog>,
    document.body
  );
});

export default ConfirmDialog;
