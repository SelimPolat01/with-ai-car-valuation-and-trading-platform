import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAdverts(token) {
  const safeToken =
    !token || token === "null" || token === "undefined" || token === ""
      ? null
      : token;

  return await Fetch(safeToken, "adverts", null, "GET", null);
}

export function useGetAdverts(token, isTokenLoaded = true) {
  return useQuery({
    queryKey: ["adverts", token],
    queryFn: () => getAdverts(token),
    enabled: isTokenLoaded,
    retry: false,
  });
}
