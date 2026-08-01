import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalNotifications() {
  return await Fetch("notifications", "personal-notifications", "GET", null);
}

export function useGetPersonalNotifications(user) {
  return useQuery({
    queryKey: ["personalNotifications", user?.id],
    queryFn: () => getPersonalNotifications(),
    enabled: !!user,
    retry: false,
  });
}
