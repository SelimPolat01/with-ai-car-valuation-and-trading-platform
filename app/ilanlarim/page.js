"use client";

import { useEffect, useRef, useState } from "react";
import classes from "./Ilanlarim.module.css";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import AdvertItem from "../components/AdvertItem";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../components/ConfirmDialog";
import { AnimatePresence } from "framer-motion";
import ManagementNav from "../components/ManagementNav";
import { useGetPersonalAdverts } from "@/hooks/GET/useGetPersonalAdverts";
import useDeleteAdvert from "@/hooks/DELETE/useDeleteAdvert";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function MyAdverts() {
  const router = useRouter();
  const deleteDialogRef = useRef(null);
  const editDialogRef = useRef(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);
  const [token, setToken] = useState(null);

  useCheckAuth();

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);
    if (!currentToken) {
      router.replace("/login");
      return;
    }
  }, [router]);

  const {
    data: getPersonalAdvertsData,
    isLoading: getPersonalAdvertsIsLoading,
    isError: getPersonalAdvertsIsError,
    error: getPersonalAdvertsError,
  } = useGetPersonalAdverts(token);

  const {
    mutate: deleteAdvertMutate,
    isPending: deleteAdvertIsPending,
    isError: deleteAdvertIsError,
    error: deleteAdvertError,
    reset: resetDeleteMutation,
  } = useDeleteAdvert();

  function advertDeleteHandler(id) {
    if (!token) return;

    deleteAdvertMutate(
      { token, advertId: id },
      {
        onSuccess: () => {
          setSelectedAdvertId(null);
          deleteDialogRef.current?.close();
        },
        onError: () => {
          setSelectedAdvertId(null);
          deleteDialogRef.current?.close();
        },
      },
    );
  }

  function editAdvertHandler(id) {
    router.replace(`/ilani-duzenle/${id}`);
  }

  function openDeleteModal(id) {
    resetDeleteMutation();
    setSelectedAdvertId(id);
    deleteDialogRef.current.showModal();
  }

  function openEditModal(id) {
    setSelectedAdvertId(id);
    editDialogRef.current.showModal();
  }

  if (!token || getPersonalAdvertsIsLoading) {
    return (
      <div className="loadingContainer">
        <div className="spinner"></div>
      </div>
    );
  }

  if (getPersonalAdvertsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getPersonalAdvertsError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const advertsList = Array.isArray(getPersonalAdvertsData)
    ? getPersonalAdvertsData
    : getPersonalAdvertsData?.result || [];

  return (
    <div className={classes.mainDiv}>
      <ConfirmDialog
        ref={deleteDialogRef}
        onConfirm={() => advertDeleteHandler(selectedAdvertId)}
        text={
          deleteAdvertIsPending
            ? "Siliniyor..."
            : "Bunu yapmak istediğinizden emin misiniz?"
        }
        title="Kaldır"
      />
      <ConfirmDialog
        ref={editDialogRef}
        onConfirm={() => editAdvertHandler(selectedAdvertId)}
        text="Bu ilanı düzenlemek"
      />
      <ManagementNav className={classes.managementNav} />

      {deleteAdvertIsError && (
        <p className={classes.errorText}>
          {deleteAdvertError?.message || "İlan silinirken bir hata oluştu."}
        </p>
      )}

      {advertsList && advertsList.length > 0 ? (
        <div className={classes.div}>
          <AnimatePresence>
            {advertsList.map((myAdvert) => {
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
