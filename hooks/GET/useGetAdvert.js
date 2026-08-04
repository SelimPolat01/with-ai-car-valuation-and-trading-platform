import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdvert(advertId) {
  return await Fetch("adverts", `${advertId}`, "GET", null);
}

export function useGetAdvert(advertId) {
  return useQuery({
    queryKey: ["advert", advertId],
    queryFn: () => getAdvert(advertId),
    enabled: !!advertId && advertId !== "undefined" && advertId !== "null",
    retry: false,
    throwOnError: true,
  });
}
