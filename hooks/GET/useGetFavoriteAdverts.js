import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getFavoriteAdverts() {
  return await Fetch("adverts", "favoriteAdverts", "GET", null);
}

export function useGetFavoriteAdverts() {
  return useQuery({
    queryKey: ["favoriteAdverts"],
    queryFn: () => getFavoriteAdverts(),
    retry: false,
  });
}
