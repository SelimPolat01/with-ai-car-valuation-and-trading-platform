"use client";

import { initAuth } from "@/store/authSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinner from "./Loading";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");

      if (!token || token === "null" || token === "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpire");
        dispatch(initAuth({ isLogin: false, user: null }));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpire");
          dispatch(initAuth({ isLogin: false, user: null }));
          setLoading(false);
          return;
        }

        const user = await res.json();
        dispatch(initAuth({ isLogin: true, user }));
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpire");
        dispatch(initAuth({ isLogin: false, user: null }));
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  return <>{children}</>;
}
