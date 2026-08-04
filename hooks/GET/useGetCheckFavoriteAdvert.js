import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getCheckFavoriteAdvert(advertId) {
  return await Fetch("adverts", `check-favorite/${advertId}`, "GET", null);
}

export function useGetCheckFavoriteAdvert(advertId) {
  return useQuery({
    queryKey: ["checkFavorite", advertId],
    queryFn: () => getCheckFavoriteAdvert(advertId),
    enabled: !!advertId,
    retry: false,
    throwOnError: true,
  });
}
