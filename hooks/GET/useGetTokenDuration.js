import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getTokenDuration(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "infos", "token-duration", "GET", null);
}

export function useGetTokenDuration(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["tokenDuration", token],
    queryFn: () => getTokenDuration(token),
    enabled: isValidToken,
    retry: false,
  });
}
