import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAppointments(token) {
  if (!token || token === "null" || token === "undefined" || token === "") {
    return null;
  }
  return await Fetch(
    token,
    "appointments",
    "personal-appointments",
    "GET",
    null,
  );
}

export function useGetPersonalAppointments(token) {
  const isValidToken = !!token && token !== "null" && token !== "undefined";

  return useQuery({
    queryKey: ["personalAppointments", token],
    queryFn: () => getPersonalAppointments(token),
    enabled: isValidToken,
    retry: false,
  });
}
