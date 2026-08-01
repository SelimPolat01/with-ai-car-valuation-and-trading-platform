import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getFavoriteAdverts() {
  return await Fetch("adverts", "favoriteAdverts", "GET", null);
}

export function useGetFavoriteAdverts(user) {
  return useQuery({
    queryKey: ["favoriteAdverts"],
    queryFn: () => getFavoriteAdverts(),
    enabled: !!user,
    retry: false,
  });
}
