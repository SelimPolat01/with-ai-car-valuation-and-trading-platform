import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

export function useCheckAuth() {
  const router = useRouter();
  const dispatch = useDispatch();
  const path = usePathname();

  useEffect(() => {
    if (path == "/login" || path == "/register") return;

    const check = () => {
      const token = localStorage.getItem("token");
      const expire = localStorage.getItem("tokenExpire");

      if (!token || !expire || new Date().getTime() > Number(expire)) {
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpire");
        dispatch(logout());
        router.replace("/login");
      }
    };

    const intervalId = setInterval(check, 60 * 1000);

    check();

    return () => clearInterval(intervalId);
  }, [router, dispatch]);
}
