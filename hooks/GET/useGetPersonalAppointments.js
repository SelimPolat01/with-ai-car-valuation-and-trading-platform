import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAppointments() {
  return await Fetch("appointments", "personal-appointments", "GET", null);
}

export function useGetPersonalAppointments() {
  return useQuery({
    queryKey: ["personalAppointments"],
    queryFn: () => getPersonalAppointments(),
    retry: false,
  });
}
