"use client";

import { useRef, useState } from "react";
import classes from "./SatilanIlanlarim.module.css";
import AdvertItem from "../components/AdvertItem";
import { useRouter } from "next/navigation";
import ConfirmDialog from "../components/ConfirmDialog";
import { AnimatePresence } from "framer-motion";
import ManagementNav from "../components/ManagementNav";
import { useGetPersonalSoldAdverts } from "@/hooks/GET/useGetPersonalSoldAdverts";
import { useDeleteAdvert } from "@/hooks/DELETE/useDeleteAdvert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Loading from "../loading";
import { useSelector } from "react-redux";

export default function SatilanIlanlarim() {
  const router = useRouter();
  const deleteDialogRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);

  const {
    data: getSoldAdvertsData,
    isLoading: getSoldAdvertsIsLoading,
    isError: getSoldAdvertsIsError,
    error: getSoldAdvertsError,
  } = useGetPersonalSoldAdverts(user);

  const {
    mutate: deleteAdvertMutate,
    isPending: deleteAdvertIsPending,
    isError: deleteAdvertIsError,
    error: deleteAdvertError,
    reset: resetDeleteMutation,
  } = useDeleteAdvert();

  function advertDeleteHandler(id) {
    deleteAdvertMutate(
      { advertId: id },
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

  function openDeleteModal(id) {
    resetDeleteMutation();
    setSelectedAdvertId(id);
    deleteDialogRef.current.showModal();
  }

  if (getSoldAdvertsIsLoading) {
    return <Loading />;
  }

  if (getSoldAdvertsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getSoldAdvertsError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const advertsList = Array.isArray(getSoldAdvertsData)
    ? getSoldAdvertsData
    : getSoldAdvertsData?.result || [];

  return (
    <div className={classes.container}>
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
                  onDeleteDialog={() => openDeleteModal(myAdvert.id)}
                  showDeleteButton={true}
                  showEditButton={false}
                />
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className={classes.noAdvertDiv}>
          <p>Satılan İlanınız Bulunmamaktadır</p>
        </div>
      )}
    </div>
  );
}
