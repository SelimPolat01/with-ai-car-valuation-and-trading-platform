import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalBoughtAdverts() {
  return await Fetch("adverts", "deletedAdverts", "GET", null);
}

export function useGetPersonalBoughtAdverts(user) {
  return useQuery({
    queryKey: ["boughtAdverts", user?.id],
    queryFn: () => getPersonalBoughtAdverts(),
    enabled: !!user,
    retry: false,
    throwOnError: true,
  });
}
