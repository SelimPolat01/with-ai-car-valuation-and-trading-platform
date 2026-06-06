import { forwardRef } from "react";
import { createPortal } from "react-dom";
import classes from "./ConfirmDialog.module.css";
import CancelButton from "./CancelButton";
import ConfirmButton from "./ConfirmButton";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const ConfirmDialog = forwardRef(
  (
    {
      onConfirm,
      text,
      title,
      cancelRedirect,
      confirmRedirect,
      cancelButtonText,
      logo,
    },
    ref,
  ) => {
    const router = useRouter();
    function handleConfirm() {
      onConfirm();
      ref.current?.close();
      if (confirmRedirect) router.replace(confirmRedirect);
    }

    function handleCancel(event) {
      event.preventDefault();
      ref.current?.close();
      if (cancelRedirect) router.replace(cancelRedirect);
    }

    return createPortal(
      <dialog className={classes.dialog} ref={ref}>
        <div className={classes.modalContainer}>
          <div className={classes.trashContainer}>
            {logo ? logo : <Trash2 size={35} color="#ef4444" />}
          </div>
          <h2 className={classes.title}>{title}</h2>
          <p className={classes.text}>{text}</p>
          <div className={classes.buttonWrapperDiv}>
            <CancelButton
              text={cancelButtonText ? cancelButtonText : "İptal Et"}
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
  },
);

export default ConfirmDialog;
