"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./Ilanlarim.module.css";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import AdvertItem from "../components/AdvertItem";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../components/ConfirmDialog";
import { AnimatePresence } from "framer-motion";
import ManagementNav from "../components/ManagementNav";

export default function MyAdverts() {
  const [myAdverts, setMyAdverts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const deleteDialogRef = useRef(null);
  const editDialogRef = useRef(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);
  useCheckAuth();

  useEffect(() => {
    async function fetchMyAdverts() {
      const token = localStorage.getItem("token");
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/adverts/myAdverts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.log(errorData.message);
          setError(errorData.message);
          return;
        }

        const data = await response.json();
        setMyAdverts(data);
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMyAdverts();
  }, [router]);

  async function advertDeleteHandler(id) {
    const token = localStorage.getItem("token");
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/adverts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
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

      setMyAdverts((prevAdverts) =>
        prevAdverts.filter((prevAdvert) => prevAdvert.id !== id),
      );
    } catch (err) {
      console.log("Error: " + err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function editAdvertHandler(id) {
    router.replace(`/ilani-duzenle/${id}`);
  }

  function openDeleteModal(id) {
    setSelectedAdvertId(id);
    deleteDialogRef.current.showModal();
  }

  function openEditModal(id) {
    setSelectedAdvertId(id);
    editDialogRef.current.showModal();
  }

  if (error) return <p>{error}</p>;

  return (
    <div className={classes.mainDiv}>
      <ConfirmDialog
        ref={deleteDialogRef}
        onConfirm={() => advertDeleteHandler(selectedAdvertId)}
        text="Bunu yapmak istediğinizden emin misiniz?"
        title="Kaldır"
      />
      <ConfirmDialog
        ref={editDialogRef}
        onConfirm={() => editAdvertHandler(selectedAdvertId)}
        text="Bu ilanı düzenlemek"
      />
      <ManagementNav className={classes.managementNav} />
      {myAdverts && myAdverts.length > 0 ? (
        <div className={classes.div}>
          <AnimatePresence>
            {myAdverts.map((myAdvert) => {
              const mainImgObj = myAdvert.images
                ? myAdvert.images.find((img) => img.is_main) ||
                  myAdvert.images[0]
                : null;

              const coverImage = mainImgObj
                ? mainImgObj.image_data || mainImgObj.image_url
                : myAdvert.image_data || myAdvert.image_src;

              return (
                <AdvertItem
                  id={myAdvert.id}
                  key={myAdvert.id}
                  userId={myAdvert.user_id}
                  imgSrc={coverImage}
                  brand={myAdvert.brand}
                  model={myAdvert.model}
                  engineCapacity={myAdvert.engine_capacity}
                  modelYear={myAdvert.model_year}
                  price={myAdvert.price}
                  city={myAdvert.city}
                  onDeleteDialog={() => openDeleteModal(myAdvert.id)}
                  onEditDialog={() => openEditModal(myAdvert.id)}
                  showDeleteButton={true}
                  showEditButton={true}
                />
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className={classes.noAdvertDiv}>
          <p>İlanınız Bulunmamaktadır</p>
        </div>
      )}
    </div>
  );
}
