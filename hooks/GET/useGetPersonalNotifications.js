import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalNotifications() {
  return await Fetch("notifications", "personal-notifications", "GET", null);
}

export function useGetPersonalNotifications(enabled = true) {
  return useQuery({
    queryKey: ["personalNotifications"],
    queryFn: () => getPersonalNotifications(),
    enabled: !!enabled,
  });
}
