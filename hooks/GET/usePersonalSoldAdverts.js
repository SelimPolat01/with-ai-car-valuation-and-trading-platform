import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalSoldAdverts(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "infos", "soldAdverts", "GET", null);
}

export function useGetPersonalSoldAdverts(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";
  s;
  return useQuery({
    queryKey: ["soldAdverts", token],
    queryFn: () => getPersonalSoldAdverts(token),
    enabled: isValidToken,
    retry: false,
  });
}
