import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAvailableSlots(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(token, "slots", "available-slots", "GET", null);
}

export function useGetAvailableSlots(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["available-slots", token],
    queryFn: () => getAvailableSlots(token),
    enabled: isValidToken,
    retry: false,
  });
}
