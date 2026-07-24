"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import { useSelector } from "react-redux";
import classes from "./FavoriIlanlar.module.css";
import ConfirmDialog from "../components/ConfirmDialog";
import FavoriteAdvertItem from "../components/FavoriteAdvertItem";
import ManagementNav from "../components/ManagementNav";
import { AnimatePresence } from "framer-motion";
import { useGetFavoriteAdverts } from "@/hooks/GET/useGetFavoriteAdverts";
import { usePostFavoriteAdvert } from "@/hooks/POST/usePostFavoriteAdvert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Loading from "../loading";

export default function FavoriIlanlar() {
  const router = useRouter();
  const deleteDialogRef = useRef(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);
  const [token, setToken] = useState(null);

  const user = useSelector((state) => state.auth.user);
  useCheckAuth();

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      router.replace("/login");
      return;
    }
    setToken(currentToken);
  }, [router]);

  const {
    data: getFavoriteAdvertsData,
    isLoading: getFavoriteAdvertsIsLoading,
    isError: getFavoriteAdvertsIsError,
    error: getFavoriteAdvertsError,
  } = useGetFavoriteAdverts(token);

  const {
    mutate: deleteFavoriteAdvertMutate,
    isPending: deleteFavoriteAdvertMutateIsPending,
    isError: deleteFavoriteAdvertMutateIsError,
    error: deleteFavoriteAdvertMutateError,
    reset: resetRemoveMutation,
  } = usePostFavoriteAdvert();

  function removeFavoriteAdvertHandler(id) {
    if (!token) return;

    deleteFavoriteAdvertMutate(
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

  function openDeleteModal(id) {
    resetRemoveMutation();
    setSelectedAdvertId(id);
    deleteDialogRef.current.showModal();
  }

  if (!token || getFavoriteAdvertsIsLoading) {
    return <Loading />;
  }

  if (getFavoriteAdvertsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getFavoriteAdvertsError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const favoriteAdverts = Array.isArray(getFavoriteAdvertsData)
    ? getFavoriteAdvertsData
    : getFavoriteAdvertsData?.result || getFavoriteAdvertsData?.data || [];

  return (
    <main className={classes.main}>
      <ConfirmDialog
        ref={deleteDialogRef}
        onConfirm={() => removeFavoriteAdvertHandler(selectedAdvertId)}
        text={
          deleteFavoriteAdvertMutateIsPending
            ? "Kaldırılıyor..."
            : "Bunu yapmak istediğinizden emin misiniz?"
        }
        title="Kaldır"
      />
      <ManagementNav className={classes.managementNav} />

      <div className={classes.container}>
        <div className={classes.myFavoriteAdvertsTextDiv}>
          <h3>Favori İlanlarım</h3>
          <hr />
        </div>

        <div className={classes.listWrapper}>
          {deleteFavoriteAdvertMutateIsError && (
            <p style={{ color: "#ff6363", marginBottom: "1rem" }}>
              {deleteFavoriteAdvertMutateError?.message ||
                "İlan favorilerden kaldırılırken bir hata oluştu."}
            </p>
          )}

          {favoriteAdverts.length > 0 && (
            <div className={classes.listHeader}>
              <span>Fotoğraf</span>
              <span>İlan Başlığı</span>
              <span>Fiyat</span>
            </div>
          )}

          <AnimatePresence>
            {favoriteAdverts &&
              favoriteAdverts.map((favoriteAdvert) => (
                <FavoriteAdvertItem
                  key={favoriteAdvert.id}
                  advert={favoriteAdvert}
                  onDeleteDialog={() => openDeleteModal(favoriteAdvert.id)}
                  showDeleteButton={user && user.id !== favoriteAdvert.user_id}
                />
              ))}
          </AnimatePresence>

          {favoriteAdverts.length === 0 && (
            <div className={classes.noFavoriteAdvertDiv}>
              <p>Favori ilanınız Bulunmamaktadır</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
