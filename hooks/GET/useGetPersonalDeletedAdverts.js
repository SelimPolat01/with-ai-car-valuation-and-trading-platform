import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalDeletedAdverts() {
  return await Fetch("adverts", "deletedAdverts", "GET", null);
}

export function useGetPersonalDeletedAdverts(user) {
  return useQuery({
    queryKey: ["deletedAdverts", user?.id],
    queryFn: () => getPersonalDeletedAdverts(),
    enabled: !!user,
    retry: false,
    throwOnError: true,
  });
}
