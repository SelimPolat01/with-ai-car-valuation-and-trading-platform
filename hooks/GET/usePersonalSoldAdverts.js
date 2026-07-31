import { useQuery } from "@tanstack/react-query";
import { Fetch } from "@/backend/lib/fetch";

export async function getPersonalSoldAdverts() {
  return await Fetch("infos", "soldAdverts", "GET", null);
}

export function useGetPersonalSoldAdverts() {
  return useQuery({
    queryKey: ["soldAdverts"],
    queryFn: () => getPersonalSoldAdverts(),
    retry: false,
  });
}
