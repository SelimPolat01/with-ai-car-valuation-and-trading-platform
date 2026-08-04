import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalSoldAdverts() {
  return await Fetch("adverts", "soldAdverts", "GET", null);
}

export function useGetPersonalSoldAdverts(user) {
  return useQuery({
    queryKey: ["soldAdverts", user?.id],
    queryFn: () => getPersonalSoldAdverts(),
    enabled: !!user,
    retry: false,
    throwOnError: true,
  });
}
