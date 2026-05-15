"use client";

import { useCheckAuth } from "@/backend/utils/useCheckAuth";
import { initAuth } from "@/store/authSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  useCheckAuth();

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) {
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
          dispatch(initAuth({ isLogin: false, user: null }));
          setLoading(false);
          return;
        }

        const user = await res.json();
        dispatch(initAuth({ isLogin: true, user }));
      } catch (err) {
        console.error(err);
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
