import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdvertView(advertId) {
  return await Fetch("adverts", `${advertId}/view`, "GET", null);
}

export function useGetAdvertView(advertId) {
  return useQuery({
    queryKey: ["advertView", advertId],
    queryFn: () => getAdvertView(advertId),
    enabled: !!advertId,
    retry: false,
    throwOnError: true,
  });
}
