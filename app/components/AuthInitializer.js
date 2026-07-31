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
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          dispatch(initAuth({ isLogin: false, user: null }));
          return;
        }

        const user = await res.json();
        dispatch(initAuth({ isLogin: true, user }));
      } catch (err) {
        console.error("Auth Error:", err);
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
