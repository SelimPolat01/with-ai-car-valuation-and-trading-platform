import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAdverts(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "adverts", "myAdverts", "GET", null);
}

export function useGetPersonalAdverts(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["personalAdverts", token],
    queryFn: () => getPersonalAdverts(token),
    enabled: isValidToken,
    retry: false,
  });
}
