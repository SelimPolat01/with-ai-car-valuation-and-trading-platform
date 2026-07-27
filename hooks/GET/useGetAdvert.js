import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdvert(token, advertId) {
  const safeToken =
    !token || token === "null" || token === "undefined" || token === ""
      ? null
      : token;

  return await Fetch(safeToken, "adverts", `${advertId}`, "GET", null);
}

export function useGetAdvert(token, advertId, isTokenLoaded = true) {
  return useQuery({
    queryKey: ["advert", advertId, token],
    queryFn: () => getAdvert(token, advertId),
    enabled: isTokenLoaded && !!advertId,
    retry: false,
  });
}
