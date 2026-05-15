"use client";

import Chat from "@/app/components/Chat";
import classes from "./IlanMesajlarim.module.css";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCheckAuth } from "@/backend/utils/useCheckAuth";

export default function MyMessages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetUserId, setTargetUserId] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const router = useRouter();
  const params = useParams();
  useCheckAuth();

  useEffect(() => {
    async function fetchTargetUserInfos() {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/adverts/${params.advertId}`,
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

        const userData = await response.json();
        setTargetUserId(userData.user_id);
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTargetUserInfos();
  }, [params.advertId, router]);

  return (
    <div className={classes.div}>
      {user?.id && targetUserId && (
        <Chat
          currentUserId={user.id}
          initialTargetUserId={targetUserId}
          advertId={params.advertId}
        />
      )}
    </div>
  );
}
