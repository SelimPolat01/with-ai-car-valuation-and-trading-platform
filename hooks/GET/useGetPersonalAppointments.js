import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAppointments() {
  return await Fetch("appointments", "personal-appointments", "GET", null);
}

export function useGetPersonalAppointments(user) {
  return useQuery({
    queryKey: ["personalAppointments", user?.id],
    queryFn: () => getPersonalAppointments(),
    enabled: !!user,
    retry: false,
    throwOnError: true,
  });
}
