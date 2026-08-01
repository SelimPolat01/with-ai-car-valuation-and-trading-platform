import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalAdvertsInfos() {
  return await Fetch("infos", "adverts", "GET", null);
}

export function useGetPersonalAdvertsInfos(user) {
  return useQuery({
    queryKey: ["personalAdvertsInfos", user?.id],
    queryFn: () => getPersonalAdvertsInfos(),
    enabled: !!user,
    retry: false,
  });
}
