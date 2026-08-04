import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdvertFavoriteCount(advertId) {
  return await Fetch("adverts", `favoriteCount/${advertId}`, "GET", null);
}

export default function useGetAdvertFavoriteCount(advertId) {
  return useQuery({
    queryFn: () => getAdvertFavoriteCount(advertId),
    queryKey: ["favoriteCount", advertId],
    enabled: !!advertId && advertId !== "undefined" && advertId !== "null",
    retry: false,
    throwOnError: true,
  });
}
