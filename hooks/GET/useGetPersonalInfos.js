import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalInfos() {
  return await Fetch("infos", "personal-infos", "GET", null);
}

export function useGetPersonalInfos(user) {
  return useQuery({
    queryKey: ["personalInfos"],
    queryFn: () => getPersonalInfos(),
    enabled: !!user,
    retry: false,
  });
}
