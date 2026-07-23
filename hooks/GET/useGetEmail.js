import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getEmail(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "infos", "email", "GET", null);
}

export function useGetEmail(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["email", token],
    queryFn: () => getEmail(token),
    enabled: !!isValidToken,
    retry: false,
  });
}
