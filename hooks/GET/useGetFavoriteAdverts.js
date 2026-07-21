import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getFavoriteAdverts(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "adverts", "favoriteAdverts", "GET", null);
}

export function useGetFavoriteAdverts(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["favoriteAdverts", token],
    queryFn: () => getFavoriteAdverts(token),
    enabled: isValidToken,
    retry: false,
  });
}
