import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalNotifications(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(
    token,
    "notifications",
    "personal-notifications",
    "GET",
    null,
  );
}

export function useGetPersonalNotifications(token) {
  return useQuery({
    queryKey: ["personalNotifications", token],
    queryFn: () => getPersonalNotifications(token),
    enabled: !!token,
    retry: false,
  });
}
