import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAdvertsInfos(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "infos", "adverts", "GET", null);
}

export function useGetPersonalAdvertsInfos(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["personalAdvertsInfos", token],
    queryFn: () => getPersonalAdvertsInfos(token),
    enabled: isValidToken,
    retry: false,
  });
}
