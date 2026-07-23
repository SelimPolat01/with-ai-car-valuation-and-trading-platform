import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdverts(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "adverts", null, "GET", null);
}

export function useGetAdverts(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["adverts", token],
    queryFn: () => getAdverts(token),
    enabled: isValidToken,
    retry: false,
  });
}
