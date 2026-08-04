"use client";

import { useRef, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import classes from "./Favorilerim.module.css";
import ConfirmDialog from "../components/ConfirmDialog";
import FavoriteAdvertItem from "../components/FavoriteAdvertItem";
import ManagementNav from "../components/ManagementNav";
import { AnimatePresence } from "framer-motion";
import { useGetFavoriteAdverts } from "@/hooks/GET/useGetFavoriteAdverts";
import { usePostFavoriteAdvert } from "@/hooks/POST/usePostFavoriteAdvert";
import Loading from "../loading";

export default function Favorilerim() {
  const router = useRouter();
  const path = usePathname();
  const deleteDialogRef = useRef(null);
  const [selectedAdvertId, setSelectedAdvertId] = useState(null);
  const { user, isInitialized, isLogin } = useSelector((state) => state.auth);

  const {
    data: getFavoriteAdvertsData,
    isLoading: getFavoriteAdvertsIsLoading,
  } = useGetFavoriteAdverts(user);

  const {
    mutate: deleteFavoriteAdvertMutate,
    isPending: deleteFavoriteAdvertMutateIsPending,
    isError: deleteFavoriteAdvertMutateIsError,
    error: deleteFavoriteAdvertMutateError,
    reset: resetRemoveMutation,
  } = usePostFavoriteAdvert();

  useEffect(() => {
    if (isInitialized && !isLogin) {
      router.replace("/login");
    }
  }, [isInitialized, isLogin, router]);

  function removeFavoriteAdvertHandler(id) {
    if (!user) {
      router.replace("/login");
      return;
    }

    deleteFavoriteAdvertMutate(
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
    if (!user) {
      router.replace("/login");
      return;
    }

    resetRemoveMutation();
    setSelectedAdvertId(id);
    deleteDialogRef.current?.showModal();
  }

  if (!isInitialized || getFavoriteAdvertsIsLoading) {
    return <Loading />;
  }

  if (!isLogin) {
    return null;
  }

  const favoriteAdverts = Array.isArray(getFavoriteAdvertsData)
    ? getFavoriteAdvertsData
    : getFavoriteAdvertsData?.result || getFavoriteAdvertsData?.data || [];

  return (
    <div className={classes.div}>
      <ConfirmDialog
        ref={deleteDialogRef}
        onConfirm={() => removeFavoriteAdvertHandler(selectedAdvertId)}
        text={
          deleteFavoriteAdvertMutateIsPending
            ? "Kaldırılıyor..."
            : "Bunu yapmak istediğinizden emin misiniz?"
        }
        title="Kaldır"
        cancelRedirect={path}
        confirmRedirect={path}
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
              <p>Favori ilanınız bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
