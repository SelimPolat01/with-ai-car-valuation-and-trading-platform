"use client";

import classes from "./KaldirilanIlanlarim.module.css";
import AdvertItem from "../components/AdvertItem";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import ManagementNav from "../components/ManagementNav";
import { useGetPersonalDeletedAdverts } from "@/hooks/GET/useGetPersonalDeletedAdverts";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Loading from "../loading";
import { useSelector } from "react-redux";

export default function KaldirilanIlanlarim() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const {
    data: getDeletedAdvertsData,
    isLoading: getDeletedAdvertsIsLoading,
    isError: getDeletedAdvertsIsError,
    error: getDeletedAdvertsError,
  } = useGetPersonalDeletedAdverts(user);

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
