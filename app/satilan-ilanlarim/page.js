"use client";

import classes from "./SatilanIlanlarim.module.css";
import AdvertItem from "../components/AdvertItem";
import { AnimatePresence } from "framer-motion";
import ManagementNav from "../components/ManagementNav";
import { useGetPersonalSoldAdverts } from "@/hooks/GET/useGetPersonalSoldAdverts";
import Loading from "../loading";
import { useSelector } from "react-redux";

export default function SatilanIlanlarim() {
  const { user } = useSelector((state) => state.auth);

  const { data: getSoldAdvertsData, isLoading: getSoldAdvertsIsLoading } =
    useGetPersonalSoldAdverts(user);

  if (getSoldAdvertsIsLoading) {
    return <Loading />;
  }

  const advertsList = Array.isArray(getSoldAdvertsData)
    ? getSoldAdvertsData
    : getSoldAdvertsData?.result || [];

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
                  notClick
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
