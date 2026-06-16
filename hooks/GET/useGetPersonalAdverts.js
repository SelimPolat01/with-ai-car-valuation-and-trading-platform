import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAdverts(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "infos", "adverts", "GET", null);
}

export function useGetPersonalAdverts(token) {
  return useQuery({
    queryKey: ["personalAdverts", token],
    queryFn: () => getPersonalAdverts(token),
    enabled: !!token,
    retry: false,
  });
}
