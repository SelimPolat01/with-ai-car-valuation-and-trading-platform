import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";

export function useCheckAuth() {
  const router = useRouter();
  const dispatch = useDispatch();
  const path = usePathname();

  useEffect(() => {
    const publicPaths = [
      "/",
      "/tum-ilanlar",
      "/hakkimizda",
      "/login",
      "/register",
      "/sikca-sorulan-sorular",
      "/iletisim",
      "/sifremi-unuttum",
    ];

    const isPublicPage =
      publicPaths.includes(path) || path.startsWith("/ilan/");

    const checkSession = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Oturum geçersiz veya süresi dolmuş.");
        }
      } catch (error) {
        dispatch(logout());

        if (!isPublicPage) {
          router.replace("/login");
        }
      }
    };

    checkSession();
  }, [path, dispatch, router]);
}
