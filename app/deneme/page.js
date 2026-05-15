"use client";

import { useRef, useState } from "react";
import classes from "./Deneme.module.css";
import Button from "../components/Button";
import { useRouter } from "next/navigation";

export default function Deneme() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  function handleClick() {
    fileInputRef.current.click();
  }

  function handleChange(event) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

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
      setPrediction(data);
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (error) return <p>{error}</p>;

  return (
    <div className={classes.div}>
      <input
        type="file"
        className="fileInput"
        hidden
        ref={fileInputRef}
        onChange={handleChange}
      />
      <div className={classes.photoDiv} onClick={handleClick}>
        <span
          onClick={(event) => event.stopPropagation()}
          className="customUpload"
        >
          Fotoğraf Yükle 📷
        </span>
        {preview ? (
          <img src={preview} alt="preview" className={classes.preview} />
        ) : (
          <div className={classes.emptyBox}></div>
        )}
      </div>
      <Button
        type="button"
        title="Gönder"
        text="Gönder"
        className={classes.button}
        onClick={handleUpload}
      />
      {prediction && (
        <span>
          {prediction.prediction} and {prediction.prediction_percent}%
        </span>
      )}
    </div>
  );
}
