import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getAvailableSlots() {
  return await Fetch("slots", "available-slots", "GET", null);
}

export function useGetAvailableSlots(user) {
  return useQuery({
    queryKey: ["available-slots"],
    queryFn: () => getAvailableSlots(),
    enabled: !!user,
    retry: false,
  });
}
