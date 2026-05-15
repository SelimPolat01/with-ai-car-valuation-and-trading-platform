"use client";

import Button from "@/app/components/Button";
import { useEffect, useState } from "react";
import classes from "./PriceOffer.module.css";
import { useRouter } from "next/navigation";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import { useSelector } from "react-redux";
import Input from "@/app/components/Input";

export default function PriceOffer({ advertId }) {
  const isEdit = !!advertId;

  const [inputTextareValue, setInputTextareaValue] = useState({
    title: "",
    description: "",
    city: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const reduxData = useSelector((state) => state.prediction.prediction);
  useCheckAuth();

  function inputTextareaChangeHandler(event) {
    const { name, value } = event.target;

    setInputTextareaValue((prevValue) => ({ ...prevValue, [name]: value }));
  }
  async function formSubmitHandler(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const data = isEdit
      ? {
          id: advertId,
          city: inputTextareValue.city,
          imageSrc: inputTextareValue.image,
          title: inputTextareValue.title,
          description: inputTextareValue.description,
        }
      : {
          brand: reduxData.brand,
          model: reduxData.model,
          modelYear: reduxData.modelYear,
          bodyType: reduxData.bodyType,
          engineCapacity: reduxData.engineCapacity,
          horsepower: reduxData.horsepower,
          transmission: reduxData.transmission,
          kilometer: reduxData.kilometer,
          fuelType: reduxData.fuelType,
          changedPartCount: reduxData.changedPartCount,
          price: reduxData.price,
          city: inputTextareValue.city,
          imageSrc: inputTextareValue.image,
          title: inputTextareValue.title,
          description: inputTextareValue.description,
        };

    try {
      setLoading(true);
      const URL = isEdit
        ? `${process.env.NEXT_PUBLIC_URL}/adverts/edit`
        : `${process.env.NEXT_PUBLIC_URL}/adverts/post`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(URL, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message);
        return;
      }

      router.replace("/ilanlarim");
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem("token");
      async function fetchAdvertData() {
        try {
          setLoading(true);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_URL}/adverts/${advertId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 401) {
            localStorage.removeItem("token");
            router.replace("/login");
            return;
          }

          if (!response.ok) {
            const errorData = await response.json();
            setError(errorData.message);
            return;
          }

          const data = await response.json();
          setInputTextareaValue({
            title: data.title || "",
            description: data.description || "",
            city: data.city || "",
            image: data.image_src || "",
          });
        } catch (err) {
          console.log("Error: " + err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }

      fetchAdvertData();
    }
  }, [advertId]);

  if (error) return <p>{error}</p>;

  return (
    <main className={classes.main}>
      <form onSubmit={formSubmitHandler} className={classes.form}>
        <Input
          className={classes.input}
          type="text"
          identifier="title"
          label="İlan Başlığı"
          value={inputTextareValue.title}
          onChange={inputTextareaChangeHandler}
          autoFocus
        />
        <label className={classes.label} htmlFor="description">
          İlan Açıklaması
        </label>
        <textarea
          className={classes.textarea}
          id="description"
          name="description"
          value={inputTextareValue.description}
          onChange={inputTextareaChangeHandler}
          rows={11}
        />
        <Input
          className={classes.input}
          type="text"
          identifier="city"
          label="Şehir"
          value={inputTextareValue.city}
          onChange={inputTextareaChangeHandler}
        />
        <Input
          className={classes.input}
          type="text"
          identifier="image"
          label="Resim URL"
          value={inputTextareValue.image}
          onChange={inputTextareaChangeHandler}
        />
        <Button type="submit" className={classes.button} text="İlanı yayınla" />
      </form>
    </main>
  );
}
