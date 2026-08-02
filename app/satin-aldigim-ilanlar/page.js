"use client";

import classes from "./SatinAldigimIlanlar.module.css";
import AdvertItem from "../components/AdvertItem";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import ManagementNav from "../components/ManagementNav";
import { useGetPersonalBoughtAdverts } from "@/hooks/GET/useGetPersonalBoughtAdverts";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Loading from "../loading";
import { useSelector } from "react-redux";

export default function SatinAldigimIlanlar() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const {
    data: getPersonalBoughtAdvertsData,
    isLoading: getPersonalBoughtAdvertsIsLoading,
    isError: getPersonalBoughtAdvertsIsError,
    error: getPersonalBoughtAdvertsError,
  } = useGetPersonalBoughtAdverts(user);

  if (getPersonalBoughtAdvertsIsLoading) {
    return <Loading />;
  }

  if (getPersonalBoughtAdvertsIsError) {
    return (
      <div className="errorContainer">
        <AlertCircle size={48} className="iconSecondary" />
        <h2>Bir Hata Oluştu</h2>
        <p>{getPersonalBoughtAdvertsError?.message}</p>
        <button onClick={() => router.back()} className="backButton">
          <ArrowLeft size={20} /> Geri Dön
        </button>
      </div>
    );
  }

  const advertsList = Array.isArray(getPersonalBoughtAdvertsData)
    ? getPersonalBoughtAdvertsData
    : getPersonalBoughtAdvertsData?.result || [];

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
          <p>Satın Aldığınız İlan Bulunmamaktadır</p>
        </div>
      )}
    </div>
  );
}
