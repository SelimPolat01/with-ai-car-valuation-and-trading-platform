"use client";

import Link from "next/link";
import classes from "./MyMessageAdvertItem.module.css";
import Chat from "./Chat";
import { useSelector } from "react-redux";
import { useState } from "react";
import Button from "./Button";

export default function MyMessageAdvertItem({ advert }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  if (!user || !advert) return null;
  const targetUserId =
    user.id === advert.advert_owner_id ? null : advert.advert_owner_id;

  function capitalizeText(text) {
    if (typeof text !== "string") {
      return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  function engineCapacityFormat(engineCapacity) {
    if (!engineCapacity) return "";
    return (+engineCapacity / 1000).toFixed(1);
  }

  return (
    <div className={classes.div}>
      <div className={classes.advertDiv}>
        <div className={classes.imageDiv}>
          <Link
            href={`/ilan/${advert.brand}-${advert.model}-${advert.model_year}/${advert.advert_id}`}
          >
            <img src={advert.image_src} alt={advert.title} />
          </Link>
        </div>
        <div className={classes.titleBrandModelDiv}>
          <Link
            href={`/ilan/${advert.brand}-${advert.model}-${advert.model_year}/${advert.advert_id}`}
          >
            {advert.title}
          </Link>
          <p>
            {capitalizeText(advert.brand)}{" "}
            <i className="bi bi-caret-right-fill"></i>{" "}
            {capitalizeText(advert.model)}{" "}
            <i className="bi bi-caret-right-fill"></i>
            {engineCapacityFormat(advert.engine_capacity)}
          </p>
        </div>
        <div className={classes.priceDiv}>
          <p>{Number(advert.price).toLocaleString("tr-TR")} ₺</p>
        </div>
        <div className={classes.chatToggleButtonDiv}>
          <Button
            type="button"
            onClick={() => setIsChatOpen((prev) => !prev)}
            text={isChatOpen ? "Mesajları Kapat" : "Mesajları Aç"}
            cancelButton
          />
        </div>
      </div>
      {isChatOpen && (
        <div className={classes.messageDiv}>
          <Chat
            currentUserId={user.id}
            initialTargetUserId={targetUserId}
            advertId={advert.advert_id}
          />
        </div>
      )}
    </div>
  );
}
