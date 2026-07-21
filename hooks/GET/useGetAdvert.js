import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdvert(token, advertId) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "adverts", `${advertId}`, "GET", null);
}

export function useGetAdvert(token, advertId) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["advert", advertId, token],
    queryFn: () => getAdvert(token, advertId),
    enabled: isValidToken && !!advertId,
    retry: false,
  });
}
