"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MyMessageAdvertItem from "../components/MyMessageAdvertItem";
import ManagementNav from "../components/ManagementNav";
import classes from "./Mesajlarim.module.css";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";

export default function MyMessageAdverts() {
  const [myMessageAdverts, setMyMessageAdverts] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useCheckAuth();

  useEffect(() => {
    async function fetchMyAdvertMessages() {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/adverts/myMessageAdverts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
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

        const messageAdvertsData = await response.json();
        setMyMessageAdverts(messageAdvertsData);
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMyAdvertMessages();
  }, [router]);

  return (
    <div className={classes.div}>
      <ManagementNav className={classes.managementNav} />
      {myMessageAdverts.map((myMessageAdvert) => (
        <MyMessageAdvertItem
          key={myMessageAdvert.advert_id}
          advert={myMessageAdvert}
        />
      ))}
    </div>
  );
}
