import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAdverts() {
  return await Fetch("adverts", "myAdverts", "GET", null);
}

export function useGetPersonalAdverts(user) {
  return useQuery({
    queryKey: ["personalAdverts", user?.id],
    queryFn: () => getPersonalAdverts(),
    enabled: !!user,
    retry: false,
  });
}
