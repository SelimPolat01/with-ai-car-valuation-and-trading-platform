"use client";
import { useState } from "react";
import styles from "./HasarDurumu.module.css";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/app/components/PrimaryButton";

export default function HasarDurumu() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [images, setImages] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });
  const [cardErrors, setCardErrors] = useState({
    front: null,
    back: null,
    right: null,
    left: null,
  });

  const sideLabelsTr = {
    front: "ön",
    back: "arka",
    left: "sol",
    right: "sağ",
  };

  const handleImageChange = async (side, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        "http://127.0.0.1:8000/car-direction-detection-upload",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.log(errorData);
        setError(errorData.message);
        return;
      }

      const data = await response.json();
      if (data.prediction != side) {
        setCardErrors((prev) => ({
          ...prev,
          [side]: `⚠️ Lütfen ${sideLabelsTr[side]} açıdan çekilmiş görüntü yükleyiniz.`,
        }));
        event.target.value = "";
        return;
      } else if (data.prediction_percent >= 96) {
        setImages((prev) => ({ ...prev, [side]: URL.createObjectURL(file) }));
        setCardErrors((prev) => ({ ...prev, [side]: null }));
      } else {
        setCardErrors((prev) => ({
          ...prev,
          [side]:
            "⚠️ Doğru bir ekspertiz raporu için aracın tam karşısına geçip, kamerayı dik tutarak tekrar çekim yapıp yükleyiniz.",
        }));
        event.target.value = "";
        return;
      }
      setPredictions((prev) => ({
        ...prev,
        [side]: {
          label: data.prediction,
          percent: data.prediction_percent,
        },
      }));
      console.log(data.prediction_percent);
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = (side, event) => {
    event.preventDefault();
    setImages((prev) => ({ ...prev, [side]: null }));
    setPredictions((prev) => ({ ...prev, [side]: null }));
  };

  const views = [
    {
      id: "front",
      label: "Ön",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z'/%3E%3C/svg%3E",
    },
    {
      id: "back",
      label: "Arka",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a0aec0'%3E%3Cpath d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM5 11l1.5-4.5h11L19 11H5zm0 2.5h3v2H5v-2zm11 0h3v2h-3v-2zm-6.5 1h5v1.5h-5v-1.5z'/%3E%3C/svg%3E",
    },
    {
      id: "right",
      label: "Sağ Yan",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='%23a0aec0'%3E%3Cg transform='translate(256, 0) scale(-1, 1)'%3E%3Cpath d='M240,112H227.2l-13.43-40.29A24,24,0,0,0,191,56H88a24,24,0,0,0-21.78,14.07L46.88,112H16a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8H30.86a32,32,0,0,0,62.28,0H162.86a32,32,0,0,0,62.28,0H240a8,8,0,0,0,8-8V120A8,8,0,0,0,240,112ZM88,72h103l13.33,40H49.11ZM62,184a16,16,0,1,1,16-16A16,16,0,0,1,62,184Zm132,0a16,16,0,1,1,16-16A16,16,0,0,1,194,184Zm38-24H217.14a32,32,0,0,0-46.28,0H85.14a32,32,0,0,0-46.28,0H24V128H232Z'/%3E%3C/g%3E%3C/svg%3E",
    },
    {
      id: "left",
      label: "Sol Yan",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256' fill='%23a0aec0'%3E%3Cpath d='M240,112H227.2l-13.43-40.29A24,24,0,0,0,191,56H88a24,24,0,0,0-21.78,14.07L46.88,112H16a8,8,0,0,0-8,8v48a8,8,0,0,0,8,8H30.86a32,32,0,0,0,62.28,0H162.86a32,32,0,0,0,62.28,0H240a8,8,0,0,0,8-8V120A8,8,0,0,0,240,112ZM88,72h103l13.33,40H49.11ZM62,184a16,16,0,1,1,16-16A16,16,0,0,1,62,184Zm132,0a16,16,0,1,1,16-16A16,16,0,0,1,194,184Zm38-24H217.14a32,32,0,0,0-46.28,0H85.14a32,32,0,0,0-46.28,0H24V128H232Z'/%3E%3C/svg%3E",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {views.map((view) => (
          <label key={view.id} className={styles.card}>
            {images[view.id] ? (
              <>
                <img
                  src={images[view.id]}
                  className={styles.imagePreview}
                  alt="Araç"
                />
                <button
                  className={styles.removeBtn}
                  onClick={(event) => handleRemoveImage(view.id, event)}
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                {cardErrors[view.id] ? (
                  <div className={styles.overlayMask}>
                    <div className={styles.targetCross}>+</div>
                    <p className={styles.overlayMessage}>
                      {cardErrors[view.id]}
                    </p>
                    <span className={styles.clickToTry}>
                      Yeniden denemek için tıklayın
                    </span>
                  </div>
                ) : (
                  <>
                    <img
                      src={view.icon}
                      className={styles.icon}
                      alt={view.label}
                    />
                    <span className={styles.label}>{view.label}</span>
                  </>
                )}

                <input
                  type="file"
                  className={styles.fileInput}
                  accept="image/*"
                  disabled={loading}
                  onChange={(event) => handleImageChange(view.id, event)}
                />
              </>
            )}
          </label>
        ))}
        {images.front && images.back && images.right && images.left && (
          <PrimaryButton
            type="submit"
            text="Fiyat teklifi al"
            onClick={() => router.push("/fiyat-teklifi")}
          />
        )}
      </div>
    </div>
  );
}
