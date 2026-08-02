"use client";

import { useRef, useState } from "react";
import classes from "./KaldirilanIlanlarim.module.css";
import AdvertItem from "../components/AdvertItem";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import ManagementNav from "../components/ManagementNav";
import ConfirmDialog from "../components/ConfirmDialog";
import { useGetPersonalDeletedAdverts } from "@/hooks/GET/useGetPersonalDeletedAdverts";
import { usePatchRecoverAdvert } from "@/hooks/PATCH/usePatchRecoverAdvert";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import Loading from "../loading";
import { useSelector } from "react-redux";

export default function KaldirilanIlanlarim() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const path = usePathname();
  const recoveryDialogRef = useRef(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);

  const {
    data: getDeletedAdvertsData,
    isLoading: getDeletedAdvertsIsLoading,
    isError: getDeletedAdvertsIsError,
    error: getDeletedAdvertsError,
  } = useGetPersonalDeletedAdverts(user);

  const {
    mutate: patchRecoverAdvertMutate,
    isPending: patchRecoverAdvertIsPending,
    isError: patchRecoverAdvertIsError,
    error: patchRecoverAdvertError,
  } = usePatchRecoverAdvert();

  function openRecoveryModal(id) {
    setSelectedAdvertId(id);
    recoveryDialogRef.current?.showModal();
  }

  function advertRecoveryHandler(id) {
    if (!id) return;
    patchRecoverAdvertMutate(id);
  }

  if (getDeletedAdvertsIsLoading) {
    return <Loading />;
  }

  if (getDeletedAdvertsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getDeletedAdvertsError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const advertsList = Array.isArray(getDeletedAdvertsData)
    ? getDeletedAdvertsData
    : getDeletedAdvertsData?.result || [];

  return (
    <div className={classes.container}>
      <ConfirmDialog
        ref={recoveryDialogRef}
        onConfirm={() => advertRecoveryHandler(selectedAdvertId)}
        title="Tekrar Yayınla"
        text={
          patchRecoverAdvertIsPending
            ? "İlanınız yayına alınıyor..."
            : patchRecoverAdvertIsError
              ? `Hata: ${patchRecoverAdvertError?.message || "İşlem başarısız oldu."}`
              : "Bu ilanı tekrar yayınlamak istediğinize emin misiniz?"
        }
        logo={<RotateCcw size={35} color="#10b981" />}
        cancelButtonText="Vazgeç"
        cancelRedirect={path}
        confirmRedirect="/mevcut-ilanlarim"
      />

      <ManagementNav className={classes.managementNav} />

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
                  showDeleteButton={false}
                  showEditButton={false}
                  showRecoveryButton={true}
                  onRecoveryDialog={() => openRecoveryModal(myAdvert.id)}
                />
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className={classes.noAdvertDiv}>
          <p>Kaldırılan İlanınız Bulunmamaktadır</p>
        </div>
      )}
    </div>
  );
}
